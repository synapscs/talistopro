import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Loader2, MessageSquare, User, Car, CheckCircle, ArrowRight, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useAppointments, useUpdateAppointment } from '../../hooks/useApi';
import { format, isSameDay, startOfDay, endOfDay, addDays, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

type TabMode = 'today' | 'week' | 'all';

export const AppointmentManagerMobile = () => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabMode>('today');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    const getDateRange = () => {
        switch (activeTab) {
            case 'today':
                return {
                    start: startOfDay(new Date()).toISOString(),
                    end: endOfDay(new Date()).toISOString()
                };
            case 'week':
                return {
                    start: startOfDay(new Date()).toISOString(),
                    end: endOfDay(addDays(new Date(), 7)).toISOString()
                };
            case 'all':
                return {
                    start: startOfDay(new Date()).toISOString(),
                    end: endOfDay(addDays(new Date(), 30)).toISOString()
                };
        }
    };

    const range = getDateRange();
    const { data: appointments, isLoading, refetch } = useAppointments(range.start, range.end);
    const updateAppointment = useUpdateAppointment();

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleConfirm = async (apt: any) => {
        await updateAppointment.mutateAsync({ id: apt.id, status: 'CONFIRMED' });
        setSelectedAppointment(null);
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { bg: string; text: string; label: string }> = {
            SCHEDULED: { bg: 'bg-amber-500', text: 'text-white', label: 'Pendiente' },
            CONFIRMED: { bg: 'bg-green-500', text: 'text-white', label: 'Confirmada' },
            COMPLETED: { bg: 'bg-slate-400', text: 'text-white', label: 'Completada' },
            CANCELLED: { bg: 'bg-red-500', text: 'text-white', label: 'Cancelada' },
        };
        return configs[status] || configs.SCHEDULED;
    };

    const getTabLabel = (tab: TabMode) => {
        switch (tab) {
            case 'today': return 'Hoy';
            case 'week': return 'Semana';
            case 'all': return 'Todas';
        }
    };

    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        return appointments
            .filter((apt: any) => {
                if (activeTab === 'today') return isSameDay(new Date(apt.scheduledAt), new Date());
                return true;
            })
            .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }, [appointments, activeTab]);

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Hoy';
        if (isTomorrow(date)) return 'Mañana';
        return format(date, "EEEE d 'de' MMMM", { locale: es });
    };

    const groupedAppointments = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredAppointments.forEach((apt: any) => {
            const dateKey = format(new Date(apt.scheduledAt), 'yyyy-MM-dd');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(apt);
        });
        return groups;
    }, [filteredAppointments]);

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">Citas</h1>
                            <p className="text-xs text-slate-500 font-medium">
                                {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita' : 'citas'}
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl"
                        >
                            <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : ''} text-slate-500`} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-2">
                        {(['today', 'week', 'all'] as TabMode[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === tab
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                {getTabLabel(tab)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar pb-24">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary-600" size={32} />
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <CalendarIcon size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-center">
                            No hay citas programadas para {activeTab === 'today' ? 'hoy' : activeTab === 'week' ? 'esta semana' : 'mostrar'}.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        {Object.entries(groupedAppointments).map(([dateKey, dayAppointments]) => (
                            <div key={dateKey}>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                                    {getDateLabel(new Date(dateKey))}
                                </h3>
                                <div className="space-y-3">
                                    {dayAppointments.map((apt: any) => {
                                        const status = getStatusConfig(apt.status);
                                        const scheduledAt = new Date(apt.scheduledAt);
                                        const clientName = apt.customer?.name || apt.tempClientName || 'Cliente';
                                        const clientPhone = apt.customer?.whatsapp || apt.customer?.phone || apt.tempClientPhone;
                                        const assetInfo = apt.asset
                                            ? `${apt.asset.field1} ${apt.asset.field2}`
                                            : apt.tempAssetInfo;

                                        return (
                                            <div
                                                key={apt.id}
                                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                                            >
                                                {/* Status bar */}
                                                <div className={`${status.bg} ${status.text} px-4 py-2 flex items-center justify-between`}>
                                                    <span className="text-xs font-bold">{status.label}</span>
                                                    <span className="text-xs font-bold">
                                                        {format(scheduledAt, 'HH:mm')}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <User size={14} className="text-slate-400" />
                                                                <span className="font-bold text-slate-900 dark:text-white">
                                                                    {clientName}
                                                                </span>
                                                            </div>
                                                            {assetInfo && (
                                                                <div className="flex items-center space-x-2 text-sm text-slate-500">
                                                                    <Car size={14} className="text-slate-400" />
                                                                    <span>{assetInfo}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-slate-400 font-medium">
                                                            {apt.duration} min
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                        {apt.title}
                                                    </p>

                                                    {/* Actions */}
                                                    <div className="flex space-x-2">
                                                        {apt.status === 'SCHEDULED' && (
                                                            <button
                                                                onClick={() => handleConfirm(apt)}
                                                                className="flex-1 py-3 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl font-bold text-sm flex items-center justify-center space-x-2"
                                                            >
                                                                <CheckCircle size={18} />
                                                                <span>Confirmar</span>
                                                            </button>
                                                        )}

                                                        {!apt.serviceOrderId && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                                                            <button
                                                                onClick={() => navigate(`../appointments/${apt.id}/convert`)}
                                                                className="flex-1 py-3 bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-xl font-bold text-sm flex items-center justify-center space-x-2"
                                                            >
                                                                <ArrowRight size={18} />
                                                                <span>Convertir</span>
                                                            </button>
                                                        )}

                                                        {apt.serviceOrderId && (
                                                            <button
                                                                onClick={() => navigate(`../orders/${apt.serviceOrderId}`)}
                                                                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm flex items-center justify-center space-x-2"
                                                            >
                                                                <span>Ver Orden</span>
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        )}

                                                        {clientPhone && (
                                                            <button
                                                                onClick={() => {
                                                                    const message = `Hola ${clientName}, te escribimos desde ${organization?.name || 'el taller'} sobre tu cita programada.`;
                                                                    const url = `https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                                                                    window.open(url, '_blank');
                                                                }}
                                                                className="py-3 px-4 bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center"
                                                            >
                                                                <MessageSquare size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* FAB */}
            <button
                onClick={() => navigate(`../appointments/new`)}
                className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl shadow-lg shadow-primary-600/30 flex items-center justify-center transition-all active:scale-95"
            >
                <Plus size={24} />
            </button>
        </div>
    );
};
