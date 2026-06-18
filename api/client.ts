import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import { Platform } from "react-native";

import { useAuthStore } from "@/src/auth/authStore";
import { getTokens, setAccessToken } from "@/src/auth/tokenStorage";
import { SessionExpiredError } from "@/src/api/errors";
import { refresh } from "./auth";

// Android emulator → 10.0.2.2, iOS simulator → localhost
// Physical device → set EXPO_PUBLIC_API_URL in .env
const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:8000`;

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${DEV_AUTH_TOKEN}`,
  },
});

// Auth endpoints never carry a bearer token and must not trigger refresh.
function isAuthEndpoint(url?: string): boolean {
  return !!url && url.includes("/auth/");
}

// Request: attach the in-memory access token to every authenticated call.
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
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
    const { access_token } = await refresh(stored.refreshToken);
    await setAccessToken(access_token);
    useAuthStore.getState().setAccessToken(access_token);
    return access_token;
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
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

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
        await useAuthStore.getState().logout();
      }
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default client;
