import * as SecureStore from 'expo-secure-store';

// Token persistence over expo-secure-store. Tokens never touch AsyncStorage.

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function getTokens(): Promise<StoredTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync('auth.accessToken'),
    SecureStore.getItemAsync('auth.refreshToken'),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: StoredTokens): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync('auth.accessToken', tokens.accessToken),
    SecureStore.setItemAsync('auth.refreshToken', tokens.refreshToken),
  ]);
}

// Refresh returns a new access token only, so the refresh token is left as-is.
export async function setAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync('auth.accessToken', accessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync('auth.accessToken'),
    SecureStore.deleteItemAsync('auth.refreshToken'),
  ]);
}
