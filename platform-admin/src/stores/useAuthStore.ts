import { create } from 'zustand';
// @ts-ignore - Hono client types
import { client } from '../lib/api-client';

interface User {
  email: string;
  name: string;
  isPlatformAdmin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: localStorage.getItem('platform_token') || null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.auth.login.$post(
        undefined,
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('platform_token', data.token);
        set({ user: data.user, isAuthenticated: true, isLoading: false, error: null, token: data.token });
      }
    } catch (error: any) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
    }
  },

  logout: () => {
    localStorage.removeItem('platform_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, isLoading: false, error: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return false;
    }

    try {
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

      if (!res.ok) {
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        return false;
      }

      const data = await res.json();
      if (data.success) {
        set({ user: data.user, isAuthenticated: true, isLoading: false, error: null });
        return true;
      }

      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return false;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));