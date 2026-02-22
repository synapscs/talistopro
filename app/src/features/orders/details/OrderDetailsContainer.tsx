import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrderDetail } from '../../../hooks/useApi';
import { useMediaQuery } from '../../../hooks/use-media-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { OrderDetailsDesktop } from './desktop/OrderDetailsDesktop';
import { OrderDetailsMobile } from './mobile/OrderDetailsMobile';

export const OrderDetailsContainer = () => {
    const { orderId } = useParams<{ orderId: string }>();

    const { data, isLoading, error } = useOrderDetail(orderId);
    const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg breakpoint

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (error || !data || !data.order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500">
                <AlertCircle size={48} className="mb-4 text-red-500" />
                <h2 className="text-xl font-bold">Error al cargar la orden</h2>
                <p>No se pudo encontrar la orden solicitada.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            {/* Dynamic Render based on Screen Size */}
            {isDesktop ? (
                <OrderDetailsDesktop
                    order={data.order}
                    workflowConfig={data.workflowConfig}
                    auditLogs={data.auditLogs}
                />
            ) : (
                <OrderDetailsMobile
                    order={data.order}
                    workflowConfig={data.workflowConfig}
                    auditLogs={data.auditLogs}
                />
            )}
        </div>
    );
};
