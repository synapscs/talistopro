import { useState } from 'react';

interface Props {
  currentPlanId: string | null;
  onClose: () => void;
  onConfirm: (newPlanId: string) => void;
}

const PLANS = [
  {
    id: '1',
    name: 'Básico',
    monthlyPrice: 9.99,
    maxMembers: 5,
    maxOrdersPerMonth: 100,
    maxPhotosPerOrder: 3,
    features: ['5 Miembros', '100 Órdenes/mes', '3 Fotos/orden', 'Soporte email']
  },
  {
    id: '2',
    name: 'Pro',
    monthlyPrice: 29.99,
    maxMembers: 20,
    maxOrdersPerMonth: 500,
    maxPhotosPerOrder: 6,
    features: ['20 Miembros', '500 Órdenes/mes', '6 Fotos/orden', 'API Access', 'Soporte prioritario']
  },
  {
    id: '3',
    name: 'Elite',
    monthlyPrice: 79.99,
    maxMembers: -1,
    maxOrdersPerMonth: -1,
    maxPhotosPerOrder: 12,
    features: ['Miembros ilimitados', 'Órdenes ilimitadas', '12 Fotos/orden', 'API Full', 'Soporte 24/7', 'Custom integrations']
  }
];

export default function ChangePlanModal({ currentPlanId, onClose, onConfirm }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(currentPlanId);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    await onConfirm(selectedPlan);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cambiar Plan</h2>
          <p className="text-gray-600 mt-1">Selecciona el nuevo plan para esta organización</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {currentPlanId === plan.id && (
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mb-3">
                    Plan actual
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-indigo-600 mb-4">
                  ${plan.monthlyPrice}
                  <span className="text-sm font-normal text-gray-600">/mes</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPlan || loading || selectedPlan === currentPlanId}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              !selectedPlan || loading || selectedPlan === currentPlanId
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Actualizando...' : selectedPlan === currentPlanId ? 'Plan actual sel.' : 'Confirmar Cambio'}
          </button>
        </div>
      </div>
    </div>
  );
}