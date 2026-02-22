import React from 'react';
import { X, ArrowRight, AlertCircle, Loader2, Bell, BellOff, Check } from 'lucide-react';
import { OrderFull } from '../../../../types/api';

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

interface ConfirmAdvanceStageProps {
    order: OrderFull;
    currentStage: WorkflowStage | undefined;
    nextStage: WorkflowStage | undefined;
    onConfirm: () => void;
    onClose: () => void;
    isLoading: boolean;
}

export const ConfirmAdvanceStage: React.FC<ConfirmAdvanceStageProps> = ({
    order,
    currentStage,
    nextStage,
    onConfirm,
    onClose,
    isLoading,
}) => {
    if (!nextStage) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                            <ArrowRight size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Avanzar Proceso
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Confirmar cambio de etapa
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-center space-x-4">
                        <div className="flex-1 text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Etapa Actual</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{currentStage?.name || 'Sin etapa'}</p>
                        </div>
                        <ArrowRight className="text-slate-400" size={24} />
                        <div className="flex-1 text-center p-4 bg-primary-50 dark:bg-primary-500/10 rounded-2xl border-2 border-primary-200 dark:border-primary-500/30">
                            <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-1">Siguiente</p>
                            <p className="text-sm font-bold text-primary-700 dark:text-primary-300">{nextStage.name}</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                Esta acción quedará registrada en el historial de la orden.
                            </p>
                        </div>
                    </div>

                    {nextStage.notifyCustomer && (
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Bell className="text-green-500" size={18} />
                                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">
                                    Notificación Automática
                                </p>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-500">
                                Se enviará un mensaje de WhatsApp al cliente informando el cambio de etapa.
                            </p>
                            {nextStage.notificationMsg && (
                                <div className="mt-3 p-3 bg-white dark:bg-green-500/5 rounded-xl">
                                    <p className="text-[10px] text-slate-500 italic">
                                        "{nextStage.notificationMsg.substring(0, 100)}
                                        {nextStage.notificationMsg.length > 100 ? '...' : ''}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {!nextStage.notifyCustomer && (
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                            <div className="flex items-center space-x-3">
                                <BellOff className="text-slate-400" size={18} />
                                <p className="text-xs font-medium text-slate-500">
                                    No se enviará notificación al cliente en esta etapa.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Check size={16} />
                        )}
                        <span>{isLoading ? 'Avanzando...' : 'Confirmar Avance'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
