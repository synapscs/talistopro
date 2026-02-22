import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail } from '../../../hooks/useApi';
import { useMediaQuery } from '../../../hooks/use-media-query';
import { DesktopOrderView } from './desktop/DesktopOrderView';
import { MobileOrderView } from './mobile/MobileOrderView';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export const OrderDetailContainer = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const { data, isLoading, error } = useOrderDetail(orderId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Cargando expediente técnico...</p>
                {/* Opcional: Podríamos poner un Skeleton real aquí según el plan del asesor */}
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-full mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">¡Ups! Algo salió mal</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                    No pudimos encontrar la orden solicitada o no tienes permisos para verla.
                </p>
                <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="flex items-center px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                >
                    <ArrowLeft className="mr-2" size={18} /> Volver al Tablero
                </button>
            </div>
        );
    }

    // El data contiene { order, workflowConfig }
    const { order, workflowConfig } = data;

    return isDesktop ? (
        <DesktopOrderView order={order} workflowConfig={workflowConfig} />
    ) : (
        <MobileOrderView order={order} workflowConfig={workflowConfig} />
    );
};
