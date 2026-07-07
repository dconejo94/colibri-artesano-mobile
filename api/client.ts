import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

import { getTokens, setAccessToken, getInMemoryAccessToken, triggerLogout, triggerTokenRefresh } from "@/src/auth/tokenStorage";
import { SessionExpiredError } from "@/src/api/errors";
import { useConnectivityStore } from "@/src/store/connectivityStore";

// Android emulator → 10.0.2.2, iOS simulator → localhost
// Physical device → set EXPO_PUBLIC_API_URL in .env
const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:8000`;

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth endpoints never carry a bearer token and must not trigger refresh.
function isAuthEndpoint(url?: string): boolean {
  return !!url && url.includes("/auth/");
}

// Request: attach the in-memory access token to every authenticated call.
client.interceptors.request.use((config) => {
  const token = getInMemoryAccessToken();
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: on 401, refresh the access token once and retry the request.
// Concurrent 401s share a single in-flight refresh to avoid a stampede.
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const stored = await getTokens();
  if (!stored) throw new SessionExpiredError();
  try {
    // Inline the refresh call here using the raw axios instance to avoid
    // a circular dependency with api/auth.ts (which imports this client).
    const { data } = await axios.post<{ access_token: string; token_type: string }>(
      `${API_URL}/api/v1/auth/refresh`,
      { refresh_token: stored.refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    await setAccessToken(data.access_token);
    triggerTokenRefresh(data.access_token);
    return data.access_token;
  } catch (error) {
    // Only a 401 means the refresh token itself is invalid/expired. Transient
    // errors propagate as-is so the session is left intact for a retry.
    if (isAxiosError(error) && error.response?.status === 401) {
      throw new SessionExpiredError();
    }
    throw error;
  }
}

client.interceptors.response.use(
  (response) => {
    useConnectivityStore.getState().setOnline(true);
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    // Compute before branching so all paths below can reference them.
    const status = error.response?.status;
    const isNetworkError = !error.response;

    // Track connectivity for the home-screen offline banner.
    if (isNetworkError) {
      useConnectivityStore.getState().setOnline(false);
    }

    // Show toast for 5xx and network errors that are NOT screen data-loads.
    // Only fire for explicit mutations; GET (and undefined) are handled by ErrorBanner.
    const is5xx = status != null && status >= 500;
    const isMutation = original?.method != null &&
      ["post", "put", "patch", "delete"].includes(original.method.toLowerCase());
    if ((isNetworkError || is5xx) && isMutation) {
      Toast.show({
        type: "error",
        text1: isNetworkError ? "Error de red" : "Error del servidor",
        text2: isNetworkError
          ? "No se pudo conectar al servidor. Revisa tu conexión."
          : "Algo salió mal en el servidor. Intenta de nuevo más tarde.",
      });
    }

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthEndpoint(original.url)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return client(original);
    } catch (refreshError) {
      // Tear down the session only when it is genuinely dead, not on a blip.
      if (refreshError instanceof SessionExpiredError) {
        await triggerLogout();
      }
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default client;
