import { create } from 'zustand';

interface PlatformAuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  token: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const usePlatformAuthStore = create<PlatformAuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: async (email: string, password: string) => {
    const response = await fetch('/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Error en login');
    }
    
    set({ 
      isAuthenticated: true, 
      user: data.user, 
      token: data.token 
    });
    
    // Guardar token en localStorage
    localStorage.setItem('platform_token', data.token);
  },

  logout: async () => {
    await fetch('/api/platform/auth/logout', { 
      method: 'POST'
    });
    set({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('platform_token');
  },

  me: async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) return;
    
    const response = await fetch('/api/platform/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (!data.success) {
      localStorage.removeItem('platform_token');
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    set({ 
      isAuthenticated: true, 
      user: data.user, 
      token 
    });
  },

  initialize: async () => {
    await get().me();
  }
}));