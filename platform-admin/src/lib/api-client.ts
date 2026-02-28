export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/platform/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error de conexión');
    }

    const data = await response.json();
    return data;
  },
};
