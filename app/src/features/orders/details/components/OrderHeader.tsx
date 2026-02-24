import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ArrowRight,
    MessageSquare,
    Share2,
    Printer,
    Clock,
    User,
    Car,
    Loader2,
    Check,
    Circle,
} from 'lucide-react';
import { OrderFull } from '../../../../types/api';
import { useUpdateOrder } from '../../../../hooks/useApi';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../../lib/terminology';
import { WhatsAppMessageModal } from './WhatsAppMessageModal';
import { ConfirmAdvanceStage } from './ConfirmAdvanceStage';

interface WorkflowStage {
    id: string;
    name: string;
    order: number;
    notifyCustomer: boolean;
    notificationMsg?: string;
    isInitial: boolean;
    isFinal: boolean;
    color?: string;
}

interface OrderHeaderProps {
    order: OrderFull;
    workflowConfig: WorkflowStage[];
    auditLogs: any[];
    isMobile?: boolean;
}

function formatTimeInStage(logs: any[], currentStageId: string | undefined): string {
    if (!currentStageId || !logs) return '';
    
    const stageChange = logs.find(
        (log: any) => log.action === 'STAGE_CHANGE' && log.details?.to === currentStageId
    );
    
    const startDate = stageChange ? new Date(stageChange.createdAt) : null;
    
    if (!startDate) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
        return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
        return `${diffHours}h ${diffMins % 60}m`;
    } else if (diffMins > 0) {
        return `${diffMins}m`;
    }
    return 'Ahora';
}

function getTimeColor(timeStr: string): string {
    if (!timeStr) return 'text-slate-400';
    if (timeStr.includes('d')) {
        const days = parseInt(timeStr.split('d')[0]);
        if (days >= 2) return 'text-red-500';
        if (days >= 1) return 'text-amber-500';
    }
    return 'text-green-500';
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
    order,
    workflowConfig,
    auditLogs,
    isMobile = false,
}) => {
    const navigate = useNavigate();
    const { organization } = useAuthStore();
    const term = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const updateOrder = useUpdateOrder();
    
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [showConfirmAdvance, setShowConfirmAdvance] = useState(false);

    const sortedStages = useMemo(() => 
        [...workflowConfig].sort((a, b) => a.order - b.order),
        [workflowConfig]
    );

    const currentStage = workflowConfig.find((s) => s.id === order.currentStageId);
    const currentIndex = sortedStages.findIndex((s) => s.id === order.currentStageId);
    const nextStage = currentIndex < sortedStages.length - 1 ? sortedStages[currentIndex + 1] : null;

    const timeInStage = formatTimeInStage(auditLogs, order.currentStageId);
    const timeColor = getTimeColor(timeInStage);

    const handleAdvanceStage = () => {
        if (!nextStage) return;
        setShowConfirmAdvance(true);
    };
    
    const confirmAdvanceStage = async () => {
        if (!nextStage) return;
        
        await updateOrder.mutateAsync({
            id: order.id,
            currentStageId: nextStage.id,
        });
        
        setShowConfirmAdvance(false);
    };
    
    const assetInfo = `${order.asset?.field1 || ''} ${order.asset?.field2 || ''}`.trim();
    const assetField4 = order.asset?.field4 || '';

    if (isMobile) {
        return (
            <>
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        
                         <div className="text-center">
                            <h1 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                {order.orderNumber || `${term.orderLabel.toUpperCase()} SIN #`}
                            </h1>
                            <div
                                className="flex items-center space-x-1 mx-auto mt-1 cursor-default"
                            >
                                <span className="text-[10px] uppercase font-bold text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">
                                    {currentStage?.name || 'Sin etapa'}
                                </span>
                                <Circle size={4} className="text-slate-400 fill-current" />
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowWhatsAppModal(true)}
                            className="p-2 -mr-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-full"
                        >
                            <MessageSquare size={24} />
                        </button>
                    </div>

                    <div className="px-4 pb-3 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-4">
                             <span className="flex items-center">
                                <User size={12} className="mr-1" />
                                {order.customer?.name}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock size={12} className={timeColor} />
                            <span className={timeColor}>{timeInStage}</span>
                        </div>
                    </div>
                </header>

                {showWhatsAppModal && (
                    <WhatsAppMessageModal
                        order={order}
                        onClose={() => setShowWhatsAppModal(false)}
                    />
                )}

                {showConfirmAdvance && nextStage && (
                    <ConfirmAdvanceStage
                        order={order}
                        currentStage={currentStage}
                        nextStage={nextStage}
                        onConfirm={confirmAdvanceStage}
                        onClose={() => setShowConfirmAdvance(false)}
                        isLoading={updateOrder.isPending}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 sticky top-0 z-40">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 max-w-[1600px] mx-auto">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {order.orderNumber || `${term.orderLabel.toUpperCase()} SIN #`}
                                        </h1>
                                        
                                         <div className="relative">
                                            <div
                                                className="flex items-center space-x-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider cursor-default transition-all"
                                            >
                                                <Circle size={8} className="fill-current" />
                                                <span>{currentStage?.name || 'Sin etapa'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                {nextStage && (
                                    <button
                                        onClick={handleAdvanceStage}
                                        disabled={updateOrder.isPending}
                                        className="flex items-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {updateOrder.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <ArrowRight size={16} />
                                        )}
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {updateOrder.isPending ? 'Avanzando...' : `Avanzar a: ${nextStage.name}`}
                                        </span>
                                    </button>
                                )}
                                
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                                
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setShowWhatsAppModal(true)}
                                        className="p-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                                        title="Enviar WhatsApp"
                                    >
                                        <MessageSquare size={18} />
                                    </button>
                                    <button
                                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        title="Compartir"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                    <button
                                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        title="Imprimir"
                                    >
                                        <Printer size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-8">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{order.customer?.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{order.customer?.whatsapp || order.customer?.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                        <Car size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{assetInfo}</p>
                                        <p className="text-[10px] text-slate-400">{assetField4}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Clock size={14} className={timeColor} />
                                <span className={`text-xs font-bold ${timeColor}`}>
                                    {timeInStage ? `${timeInStage} en esta etapa` : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showWhatsAppModal && (
                <WhatsAppMessageModal
                    order={order}
                    onClose={() => setShowWhatsAppModal(false)}
                />
            )}

            {showConfirmAdvance && nextStage && (
                <ConfirmAdvanceStage
                    order={order}
                    currentStage={currentStage}
                    nextStage={nextStage}
                    onConfirm={confirmAdvanceStage}
                    onClose={() => setShowConfirmAdvance(false)}
                    isLoading={updateOrder.isPending}
                />
            )}
        </>
    );
};
