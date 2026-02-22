import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useOrders } from '../../hooks/useApi';
import { useNavigation } from '../../hooks/use-navigation';
import { OrdersDashboardDesktop } from './components/desktop/OrdersDashboardDesktop';
import { OrdersDashboardMobile } from './components/mobile/OrdersDashboardMobile';
import { ServiceOrderForm } from './ServiceOrderForm';
import { ChevronRight } from 'lucide-react';

export const OrdersDashboard = () => {
    const { organization } = useAuthStore();
    const navigate = useNavigate();
    const { isMobile } = useNavigation();
    const [showForm, setShowForm] = useState(false);

    // Compartir lógica de data y terminología
    const { data: orders, isLoading } = useOrders();
    const terminology = getEffectiveTerminology(
        organization?.businessType,
        organization?.customTerminology
    );

    if (showForm) {
        return (
            <div className="space-y-4 px-4 md:px-0">
                <button
                    onClick={() => setShowForm(false)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4 pt-4"
                >
                    <ChevronRight className="rotate-180" size={18} />
                    <span className="text-sm font-bold">Volver al Tablero</span>
                </button>
                <ServiceOrderForm onSuccess={() => setShowForm(false)} />
            </div>
        );
    }

    if (isMobile) {
        return (
            <OrdersDashboardMobile
                orders={orders || []}
                isLoading={isLoading}
                terminology={terminology}
                navigate={navigate}
                onShowForm={() => setShowForm(true)}
            />
        );
    }

    return (
        <OrdersDashboardDesktop
            orders={orders || []}
            isLoading={isLoading}
            terminology={terminology}
            navigate={navigate}
            onShowForm={() => setShowForm(true)}
        />
    );
};
