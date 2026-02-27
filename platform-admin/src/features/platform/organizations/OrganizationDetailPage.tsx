import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizationDetail();
  }, [id]);

  const loadOrganizationDetail = async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) {
      navigate('/platform/login');
      return;
    }

    try {
      const response = await fetch(`/api/platform/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 404) {
        setError('Organización no encontrada');
        setLoading(false);
        return;
      }

      if (response.status === 401) {
        navigate('/platform/login');
        return;
      }

      const data = await response.json();
      setOrganization(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setOrganization(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando organización...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/platform/organizations')}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Volver a organizaciones
        </button>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/platform/organizations')}
          className="text-indigo-600 hover:text-indigo-900 text-sm mb-4"
        >
          ← Volver a organizaciones
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
        <p className="text-gray-600">{organization.slug}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Miembros" 
          value={organization.stats?.members || 0} 
          icon="👥" 
        />
        <StatsCard 
          title="Órdenes Totales" 
          value={organization.stats?.orders || 0} 
          icon="📋" 
        />
        <StatsCard 
          title="Órdenes Este Mes" 
          value={organization.usage?.ordersThisMonth || 0} 
          icon="📊" 
        />
        <StatsCard 
          title="Estado" 
          value={organization.subscriptionStatus || 'N/A'} 
          icon="⚡" 
        />
      </div>

      {/* Plan Info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Plan Actual</h2>
        {organization.plan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Nombre</div>
                <div className="font-medium">{organization.plan.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Precio Mensual</div>
                <div className="font-medium">${organization.plan.monthlyPrice || 0}</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <button
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                Cambiar Plan
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Sin plan asignado</p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Acciones</h2>
        <div className="space-y-3">
          <ActionButton
            label="Vender Suscripción"
            icon="💳"
            onClick={() => {}}
          />
          <ActionButton
            label="Suspender Organización"
            icon="🔒"
            onClick={() => {}}
          />
          <ActionButton
            label="Ver Auditoría"
            icon="📝"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{icon}</div>
      </div>
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ActionButton({ label, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}