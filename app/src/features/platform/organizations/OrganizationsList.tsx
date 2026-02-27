import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    plan: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadOrganizations();
  }, [filters]);

  const loadOrganizations = async () => {
    setLoading(true);
    const token = localStorage.getItem('platform_token');
    if (!token) {
      navigate('/platform/login');
      return;
    }

    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.plan) params.set('plan', filters.plan);

    try {
      const response = await fetch(`/api/platform/organizations?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        navigate('/platform/login');
        return;
      }

      const data = await response.json();
      setOrganizations(data.data || []);
    } catch (error) {
      console.error('Error loading organizations:', error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handlePlanChange = (plan: string) => {
    setFilters(prev => ({ ...prev, plan }));
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organizaciones</h1>
        <p className="text-gray-600">Gestión de organizaciones del SaaS</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            placeholder="Nombre o slug..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              <option value="">Todos</option>
              <option value="trial">Trial</option>
              <option value="active">Activas</option>
              <option value="suspended">Suspendidas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <select
              value={filters.plan}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              <option value="">Todos</option>
              <option value="Básico">Básico</option>
              <option value="Pro">Pro</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
        </div>

        {filters.search || filters.status || filters.plan && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-600">Filtros activos</span>
            <button
              onClick={() => setFilters({ search: '', status: '', plan: '' })}
              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando organizaciones...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Miembros</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Órdenes</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {organizations.map((org: any) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {org.plan?.name || 'Sin plan'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={org.subscriptionStatus} />
                  </td>
                  <td className="px-6 py-4 text-gray-900">{org.memberCount || 0}</td>
                  <td className="px-6 py-4 text-gray-900">{org.stats?.orders || 0}</td>
                  <td className="px-6 py-4">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      onClick={() => navigate(`/platform/organizations/${org.id}`)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {filters.search || filters.status || filters.plan
                  ? 'No se encontraron organizaciones con los filtros actuales'
                  : 'No hay organizaciones creadas aún'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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
}