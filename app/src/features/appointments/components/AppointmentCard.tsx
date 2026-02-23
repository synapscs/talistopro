import React from 'react';
import { User, Car, Clock, MessageSquare, CheckCircle, AlertCircle, XCircle, MinusCircle, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AppointmentCardProps {
    appointment: any;
    onClick: () => void;
    onWhatsApp?: () => void;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
    SCHEDULED: { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/20', icon: AlertCircle, label: 'Pendiente' },
    CONFIRMED: { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-500/20', icon: CheckCircle, label: 'Confirmada' },
    IN_PROGRESS: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20', icon: Clock, label: 'En curso' },
    COMPLETED: { color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', icon: CheckCircle, label: 'Completada' },
    CANCELLED: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/20', icon: XCircle, label: 'Cancelada' },
    NO_SHOW: { color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', icon: MinusCircle, label: 'No asistió' },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    onClick,
    onWhatsApp
}) => {
    const status = statusConfig[appointment.status] || statusConfig.SCHEDULED;
    const StatusIcon = status.icon;
    const scheduledAt = new Date(appointment.scheduledAt);

    const clientName = appointment.customer?.name || appointment.tempClientName || 'Cliente';
    const clientPhone = appointment.customer?.whatsapp || appointment.customer?.phone || appointment.tempClientPhone;
    const assetInfo = appointment.asset 
        ? `${appointment.asset.field1} ${appointment.asset.field2}`
        : appointment.tempAssetInfo;

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary-500/30 hover:shadow-md transition-all cursor-pointer"
        >
            <div className="flex items-center space-x-4">
                <div className="text-center min-w-[60px]">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                        {format(scheduledAt, 'HH:mm')}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">
                        {format(scheduledAt, 'dd MMM', { locale: es })}
                    </p>
                </div>

                <div className="h-10 w-[2px] bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-500/30 transition-colors" />

                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {clientName}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        {assetInfo && (
                            <>
                                <Car size={12} className="text-slate-400" />
                                <span>{assetInfo}</span>
                            </>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">
                        {appointment.title}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full uppercase tracking-tighter ${status.bg} ${status.color} flex items-center space-x-1`}>
                    <StatusIcon size={10} />
                    <span>{status.label}</span>
                </span>

                {clientPhone && onWhatsApp && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onWhatsApp();
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Enviar WhatsApp"
                    >
                        <MessageSquare size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};
