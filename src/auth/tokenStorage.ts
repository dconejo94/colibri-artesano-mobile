import * as SecureStore from 'expo-secure-store';

// Token persistence over expo-secure-store. Tokens never touch AsyncStorage.

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

let _inMemoryAccessToken: string | null = null;
export function getInMemoryAccessToken(): string | null { return _inMemoryAccessToken; }

type LogoutHandler = () => Promise<void>;
let _onLogout: LogoutHandler | null = null;
export function setLogoutHandler(handler: LogoutHandler) { _onLogout = handler; }
export async function triggerLogout() { if (_onLogout) await _onLogout(); }

type TokenRefreshHandler = (token: string) => void;
let _onTokenRefresh: TokenRefreshHandler | null = null;
export function setTokenRefreshHandler(handler: TokenRefreshHandler) { _onTokenRefresh = handler; }
export function triggerTokenRefresh(token: string) { if (_onTokenRefresh) _onTokenRefresh(token); }

export async function getTokens(): Promise<StoredTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync('auth.accessToken'),
    SecureStore.getItemAsync('auth.refreshToken'),
  ]);
  if (!accessToken || !refreshToken) return null;
  _inMemoryAccessToken = accessToken;
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: StoredTokens): Promise<void> {
  _inMemoryAccessToken = tokens.accessToken;
  await Promise.all([
    SecureStore.setItemAsync('auth.accessToken', tokens.accessToken),
    SecureStore.setItemAsync('auth.refreshToken', tokens.refreshToken),
  ]);
}

// Refresh returns a new access token only, so the refresh token is left as-is.
export async function setAccessToken(accessToken: string): Promise<void> {
  _inMemoryAccessToken = accessToken;
  await SecureStore.setItemAsync('auth.accessToken', accessToken);
}

export async function clearTokens(): Promise<void> {
  _inMemoryAccessToken = null;
  await Promise.all([
    SecureStore.deleteItemAsync('auth.accessToken'),
    SecureStore.deleteItemAsync('auth.refreshToken'),
  ]);
}
