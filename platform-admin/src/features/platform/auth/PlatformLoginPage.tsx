import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../../stores/usePlatformAuthStore';
// @ts-ignore - Hono client types
import { client } from '../../../lib/api-client';

export default function PlatformLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = usePlatformAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Limpiar tokens antiguos antes de login
    localStorage.removeItem('platform_token');
    localStorage.removeItem('platform_user');

    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.auth.login.$post(
        {
          json: { email, password }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        const { user, token } = data;
        localStorage.setItem('platform_token', token);
        localStorage.setItem('platform_user', JSON.stringify(user));
        loginWithToken(token, user);
        // Navigate to dashboard - PlatformProtectedRoute will verify authentication
        navigate('/dashboard');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Admin</h1>
          <p className="text-gray-600">TaListoPro SaaS Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              placeholder="admin@talisto.pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Acceso restringido al administrador de plataforma</p>
        </div>
      </div>
    </div>
  );
}