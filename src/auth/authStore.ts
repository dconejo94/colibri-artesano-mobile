import { create } from 'zustand';

import * as authApi from '@/api/auth';
import type { AuthTokens, LoginPayload, RegisterPayload } from '@/api/auth';
import type { User } from '@/types/user';
import { clearTokens, getTokens, setTokens, setLogoutHandler, setTokenRefreshHandler } from './tokenStorage';

// Global auth state — the single source of truth for the logged-in user and
// tokens. Auth endpoints return tokens only, so we fetch GET /users/me after
// login/register to resolve the user.

type Status = 'loading' | 'authenticated' | 'anonymous';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: Status;
  isAuthenticated: boolean;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (accessToken: string) => void;
};

const anonymous = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'anonymous' as const,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>((set) => {
  // Persist tokens, then resolve the user from GET /users/me.
  const establishSession = async (tokens: AuthTokens) => {
    await setTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
    set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
    const user = await authApi.getMe();
    set({ user, status: 'authenticated', isAuthenticated: true });
  };

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'loading',
    isAuthenticated: false,

    // Load persisted tokens on app start and resolve the current user.
    bootstrap: async () => {
      const stored = await getTokens();
      if (!stored) {
        set(anonymous);
        return;
      }
      set({ accessToken: stored.accessToken, refreshToken: stored.refreshToken });
      try {
        const user = await authApi.getMe();
        set({ user, status: 'authenticated', isAuthenticated: true });
      } catch {
        await clearTokens();
        set(anonymous);
      }
    },

    login: async (payload) => {
      const tokens = await authApi.login(payload);
      await establishSession(tokens);
    },

    register: async (payload) => {
      const tokens = await authApi.register(payload);
      await establishSession(tokens);
    },

    logout: async () => {
      await clearTokens();
      set(anonymous);
    },

    // Called by the axios refresh interceptor after a successful token refresh.
    setAccessToken: (accessToken) => set({ accessToken }),
  };
});

setLogoutHandler(() => useAuthStore.getState().logout());
setTokenRefreshHandler((token) => useAuthStore.getState().setAccessToken(token));
