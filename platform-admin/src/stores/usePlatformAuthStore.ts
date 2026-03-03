import { create } from 'zustand';
// @ts-ignore - Hono client types
import { client } from '../lib/api-client';

interface PlatformAuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  token: string | null;

  // Actions
  loginWithToken: (token: string, user: any) => void;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const usePlatformAuthStore = create<PlatformAuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  loginWithToken: (token: string, user: any) => {
    set({
      isAuthenticated: true,
      user: user,
      token: token
    });
  },

  logout: async () => {
    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.auth.logout.$post(
        undefined,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      if (res.status !== 200) {
        console.error('Logout failed:', await res.text());
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('platform_token');
    localStorage.removeItem('platform_user');
  },

  me: async () => {
    console.log('[usePlatformAuthStore] me() called');
    const token = localStorage.getItem('platform_token');
    console.log('[usePlatformAuthStore] Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');

    if (!token) {
      console.log('[usePlatformAuthStore] No token found, clearing session');
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      console.log('[usePlatformAuthStore] Calling /api/platform/auth/me with token');
      console.log('[usePlatformAuthStore] Token starts with:', token.substring(0, 50) + '...');
      console.log('[usePlatformAuthStore] Token length:', token.length);

      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.auth.me.$get(
        undefined,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('[usePlatformAuthStore] Response status:', res.status);

      if (res.status !== 200) {
        console.warn('[usePlatformAuthStore] Token verification failed, clearing session');
        console.warn('[usePlatformAuthStore] Response text:', await res.text());
        localStorage.removeItem('platform_token');
        localStorage.removeItem('platform_user');
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

      const data = await res.json();
      console.log('[usePlatformAuthStore] Response data:', data);

      if (!data.success) {
        console.log('[usePlatformAuthStore] Success field false, clearing session');
        localStorage.removeItem('platform_token');
        localStorage.removeItem('platform_user');
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

      console.log('[usePlatformAuthStore] Setting user state');
      set({
        isAuthenticated: true,
        user: data.user,
        token
      });
    } catch (err) {
      console.error('me() error:', err);
      localStorage.removeItem('platform_token');
      localStorage.removeItem('platform_user');
      set({ isAuthenticated: false, user: null, token: null });
    }
  },

  initialize: async () => {
    await get().me();
  }
}));