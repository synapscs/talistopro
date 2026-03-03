import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore - Hono client types
import { client } from '../../../lib/api-client';

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    plan: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscriptions();
  }, [filters]);

  const loadSubscriptions = async () => {
    setLoading(true);
    const token = localStorage.getItem('platform_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.organizations.$get(
        undefined,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      const data = await res.json();
      const orgs = data.data || [];

      const subscriptionsData = orgs.map((org: any) => ({
        ...org,
        subscriptionId: org.id,
        organizationId: org.id
      }));

      let filtered = subscriptionsData;

      if (filters.status) {
        filtered = filtered.filter((sub: any) => sub.subscriptionStatus === filters.status);
      }

      if (filters.plan) {
        filtered = filtered.filter((sub: any) => sub.plan?.name === filters.plan);
      }

      setSubscriptions(filtered);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      trial: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    const labels: Record<string, string> = {
      trial: 'Trial',
      active: 'Activa',
      suspended: 'Suspendida',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {labels[status] || status || 'N/A'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suscripciones</h1>
          <p className="text-gray-600">Gestión de suscripciones del SaaS</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Cargando suscripciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Suscripciones</h1>
        <p className="text-gray-600">Gestión de suscripciones del SaaS</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="trial">Trial</option>
              <option value="active">Activas</option>
              <option value="suspended">Suspendidas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="Básico">Básico</option>
              <option value="Pro">Pro</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Organización</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Miembros</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Órdenes/Mes</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscriptions.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{sub.name}</div>
                    <div className="text-sm text-gray-500">{sub.slug}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {sub.plan?.name || 'Sin plan'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(sub.subscriptionStatus)}
                </td>
                <td className="px-6 py-4 text-gray-900">{sub.memberCount || 0}</td>
                <td className="px-6 py-4 text-gray-900">{sub.usage?.ordersThisMonth || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                    >
                      Ver detalle
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscriptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {filters.status || filters.plan
                ? 'No se encontraron suscripciones con los filtros actuales'
                : 'No hay suscripciones activas aún'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}