import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// @ts-ignore - Hono client types
import { client } from '../../../lib/api-client';
import ChangePlanModal from './components/ChangePlanModal';

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [showChangePlan, setShowChangePlan] = useState(false);

  useEffect(() => {
    loadSubscriptionDetail();
  }, [id]);

  const loadSubscriptionDetail = async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.organizations[':id'].$get(
        {
          param: { id }
        },
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
      setSubscription(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setLoading(false);
    }
  };

  const handlePlanChange = async (newPlanId: string) => {
    const token = localStorage.getItem('platform_token');
    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.subscriptions[':id'].change.$post(
        {
          json: { newPlanId }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.ok) {
        await loadSubscriptionDetail();
        setShowChangePlan(false);
      }
    } catch (error) {
      console.error('Error changing plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando suscripción...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No se encontró la suscripción</p>
        <button
          onClick={() => navigate('/subscriptions')}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Volver a suscripciones
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-indigo-600 hover:text-indigo-900 text-sm mb-4"
          >
            ← Volver a suscripciones
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{subscription.name}</h1>
          <p className="text-gray-600">{subscription.slug}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Estado" 
          value={subscription.subscriptionStatus || 'N/A'} 
          icon="⚡"
          color={subscription.subscriptionStatus === 'active' ? 'green' : subscription.subscriptionStatus === 'trial' ? 'orange' : 'gray'}
        />
        <StatsCard 
          title="Miembros" 
          value={subscription.stats?.members || 0} 
          icon="👥"
        />
        <StatsCard 
          title="Órdenes Totales" 
          value={subscription.stats?.orders || 0} 
          icon="📋"
        />
        <StatsCard 
          title="Órdenes Este Mes" 
          value={usage?.ordersThisMonth || 0} 
          icon="📊"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Plan Actual</h2>
          {subscription.plan && (
            <button
              onClick={() => setShowChangePlan(true)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Cambiar Plan
            </button>
          )}
        </div>
        
        {subscription.plan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Nombre</div>
                <div className="font-medium text-gray-900">{subscription.plan.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Precio Mensual</div>
                <div className="font-medium text-gray-900">${subscription.plan.monthlyPrice}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm text-gray-600">Max Miembros</div>
                <div className="font-medium text-gray-900">{subscription.plan.maxMembers}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Max Órdenes/Mes</div>
                <div className="font-medium text-gray-900">{subscription.plan.maxOrdersPerMonth}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Max Fotos/Orden</div>
                <div className="font-medium text-gray-900">{subscription.plan.maxPhotosPerOrder}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Sin plan asignado</p>
            <button
              onClick={() => setShowChangePlan(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Asignar Plan
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Acciones Rápidas</h2>
        <div className="space-y-3">
          {subscription.subscriptionStatus !== 'active' && (
            <ActionButton
              label="Activar Suscripción"
              icon="✅"
              onClick={() => {}}
            />
          )}
          {subscription.subscriptionStatus !== 'suspended' && (
            <ActionButton
              label="Suspender Organización"
              icon="🔒"
              onClick={() => {}}
            />
          )}
          <ActionButton
            label="Ver Límites de Plan"
            icon="📊"
            onClick={() => {}}
          />
          <ActionButton
            label="Ver Auditoría"
            icon="📝"
            onClick={() => {}}
          />
        </div>
      </div>

      {showChangePlan && (
        <ChangePlanModal
          currentPlanId={subscription.planId}
          onClose={() => setShowChangePlan(false)}
          onConfirm={(newPlanId) => handlePlanChange(newPlanId)}
        />
      )}
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    gray: 'bg-gray-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
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
      <span className="font-medium text-gray-900">{label}</span>
    </button>
  );
}

const { usage } = { usage: { ordersThisMonth: 0 } };