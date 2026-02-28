import { useEffect, useState } from 'react';
import { API_URL } from '../../../lib/api-client';

export default function PlatformDashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    monthlyRevenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar estadísticas
    loadStats();
  }, []);

  const loadStats = async () => {
    const token = localStorage.getItem('platform_token');
    
    if (!token) {
      setError('No hay sesión activa');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/platform/organizations?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load stats:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      setStats({
        totalOrganizations: data.total,
        activeSubscriptions: data.data.filter((org: any) => org.subscriptionStatus === 'active').length,
        trialSubscriptions: data.data.filter((org: any) => org.subscriptionStatus === 'trial').length,
        monthlyRevenue: data.data.reduce((sum: number, org: any) => {
          return sum + Number(org.plan?.monthlyPrice || 0);
        }, 0)
      });
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del SaaS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Organizaciones Totales"
          value={stats.totalOrganizations}
          icon="🏢"
          color="indigo"
        />
        <DashboardCard
          title="Suscripciones Activas"
          value={stats.activeSubscriptions}
          icon="✅"
          color="green"
        />
        <DashboardCard
          title="En Trial"
          value={stats.trialSubscriptions}
          icon="🔶"
          color="orange"
        />
        <DashboardCard
          title="Ingresos Mensuales"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-gray-600 text-sm">
          Últimas organizaciones creadas...
        </p>
      </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              label="Ver Organizaciones"
              href="/organizations"
              icon="🏢"
            />
            <ActionButton
              label="Ver Suscripciones"
              href="/subscriptions"
              icon="💳"
              disabled={true}
            />
            <ActionButton
              label="Ver Facturación"
              href="/billing"
              icon="📄"
              disabled={true}
            />
          </div>
        </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

function ActionButton({ label, href, icon, disabled }: any) {
  return (
    <button
      onClick={() => disabled || (window.location.href = href)}
      disabled={disabled}
      className={`p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-medium text-gray-900">{label}</div>
      {disabled && (
        <div className="text-xs text-gray-500 mt-1">Próximamente</div>
      )}
    </button>
  );
}