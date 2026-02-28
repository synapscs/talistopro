import { create } from 'zustand';
import { API_URL } from '../lib/api-client';

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
      await fetch(`${API_URL}/api/platform/auth/logout`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    set({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('platform_token');
    localStorage.removeItem('platform_user');
  },

  me: async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/platform/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        console.warn('Token verification failed, clearing session');
        localStorage.removeItem('platform_token');
        localStorage.removeItem('platform_user');
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const data = await response.json();
      if (!data.success) {
        localStorage.removeItem('platform_token');
        localStorage.removeItem('platform_user');
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

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