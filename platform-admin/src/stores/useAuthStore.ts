import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${API_URL}/api/platform/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al iniciar sesión');
      }
      
      const { user } = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch (error: any) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },
  
  checkAuth: async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return false;
    }
    
    try {
      const user = JSON.parse(userStr);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      return false;
    }
  },
  
  clearError: () => set({ error: null }),
}));