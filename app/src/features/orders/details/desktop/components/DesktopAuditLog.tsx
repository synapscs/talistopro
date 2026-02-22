import React from 'react';
import { Clock, User } from 'lucide-react';

interface DesktopAuditLogProps {
    orderId: string;
    logs?: any[];
}

export const DesktopAuditLog = ({ orderId, logs = [] }: DesktopAuditLogProps) => {
    // Traducción de acciones
    const actionLabels: Record<string, string> = {
        'CREATE': 'CREADO',
        'UPDATE': 'ACTUALIZADO',
        'DELETE': 'ELIMINADO',
        'STATUS_CHANGE': 'CAMBIO DE ESTADO',
        'STAGE_CHANGE': 'CAMBIO DE ETAPA',
        'STOCK_ADJUSTMENT': 'AJUSTE DE STOCK',
        'PAYMENT_ADDED': 'PAGO REGISTRADO',
        'NOTES_UPDATE': 'NOTAS ACTUALIZADAS',
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center mb-6 shrink-0">
                <Clock size={14} className="mr-2" />
                Historial de Actividad
            </h3>

            <div className="relative space-y-6 pl-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>

                {logs.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-4">Sin registros de actividad aún.</p>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-4">
                            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                                {log.user?.image ? (
                                    <img src={log.user.image} alt={log.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={14} />
                                )}
                            </div>
                            <div className="flex-1 pt-1">
                                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">
                                    {actionLabels[log.action] || log.action.replace('_', ' ')}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                    {log.entity === 'ServiceOrder' && log.action === 'STAGE_CHANGE'
                                        ? `Cambio de etapa a: ${log.details?.stageName || 'Siguiente'}`
                                        : log.action === 'CREATE' ? 'Ingreso inicial al sistema'
                                            : log.action === 'NOTES_UPDATE' ? 'Se actualizaron las notas internas'
                                                : JSON.stringify(log.details || 'Detalle no disponible')}
                                </p>
                                <p className="text-[9px] text-slate-400 mt-1 font-bold">
                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.user?.name || 'Sistema'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
