import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Loader2, List, Grid, X, MessageSquare, ChevronRight, User, Car, Bell, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from '../../hooks/useApi';
import { format, isSameDay, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentForm } from './components/AppointmentForm';
import { MiniCalendar } from './components/MiniCalendar';
import { AppointmentCard } from './components/AppointmentCard';

type ViewMode = 'day' | 'week' | 'list';

export const AppointmentManager = () => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const [showForm, setShowForm] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);

    const getDateRange = () => {
        switch (viewMode) {
            case 'day':
                return {
                    start: startOfDay(selectedDate).toISOString(),
                    end: endOfDay(selectedDate).toISOString()
                };
            case 'week':
                return {
                    start: startOfWeek(selectedDate, { weekStartsOn: 0 }).toISOString(),
                    end: endOfWeek(selectedDate, { weekStartsOn: 0 }).toISOString()
                };
            case 'list':
                return {
                    start: startOfDay(new Date()).toISOString(),
                    end: endOfDay(addDays(new Date(), 30)).toISOString()
                };
        }
    };

    const range = getDateRange();
    const { data: appointments, isLoading } = useAppointments(range.start, range.end);
    const updateAppointment = useUpdateAppointment();
    const deleteAppointment = useDeleteAppointment();

    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        if (viewMode === 'list') return appointments;
        return appointments.filter((apt: any) => isSameDay(new Date(apt.scheduledAt), selectedDate));
    }, [appointments, selectedDate, viewMode]);

    const handleNewAppointment = () => {
        setSelectedAppointment(null);
        setShowForm(true);
    };

    const handleEditAppointment = (apt: any) => {
        setSelectedAppointment(apt);
        setShowDetail(false);
        setShowForm(true);
    };

    const handleDeleteAppointment = async (apt: any) => {
        if (!confirm('¿Eliminar esta cita?')) return;
        await deleteAppointment.mutateAsync(apt.id);
        setShowDetail(false);
    };

    const handleConfirmAppointment = async (apt: any) => {
        await updateAppointment.mutateAsync({ id: apt.id, status: 'CONFIRMED' });
        setShowDetail(false);
    };

    const handleSelectAppointment = (apt: any) => {
        setSelectedAppointment(apt);
        setShowDetail(true);
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, string> = {
            SCHEDULED: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
            CONFIRMED: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
            COMPLETED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
        };
        return config[status] || config.SCHEDULED;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agenda de Citas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona las citas programadas del taller.</p>
                </div>
                <button
                    onClick={handleNewAppointment}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-600/20 text-sm"
                >
                    <Plus size={18} />
                    <span>Nueva Cita</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <MiniCalendar
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        appointments={appointments}
                    />

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Vista</p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('day')}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                Día
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                Lista
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            {viewMode === 'list' ? 'Próximas Citas' : isToday(selectedDate) ? 'Hoy' : format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                        </h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'cita' : 'citas'}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="animate-spin text-primary-600" size={32} />
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <CalendarIcon size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-500 mb-2">No hay citas programadas.</p>
                            <button
                                onClick={handleNewAppointment}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700"
                            >
                                + Crear primera cita
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredAppointments
                                .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                                .map((apt: any) => (
                                    <AppointmentCard
                                        key={apt.id}
                                        appointment={apt}
                                        onClick={() => handleSelectAppointment(apt)}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <AppointmentForm
                    onClose={() => setShowForm(false)}
                    initialData={selectedAppointment}
                    defaultDate={selectedDate}
                    onSuccess={() => {
                        setShowForm(false);
                        setSelectedAppointment(null);
                    }}
                />
            )}

            {showDetail && selectedAppointment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowDetail(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                                    <CalendarIcon size={20} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">Detalle de Cita</h2>
                                    <p className="text-[10px] text-slate-500">{format(new Date(selectedAppointment.scheduledAt), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1.5 text-[10px] font-bold rounded-full uppercase ${getStatusBadge(selectedAppointment.status)}`}>
                                    {selectedAppointment.status === 'SCHEDULED' ? 'Pendiente' : 
                                     selectedAppointment.status === 'CONFIRMED' ? 'Confirmada' :
                                     selectedAppointment.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                                </span>
                                <span className="text-xs text-slate-500 font-bold">{selectedAppointment.duration} min</span>
                            </div>

                            <div className="flex items-start space-x-3">
                                <User size={16} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {selectedAppointment.customer?.name || selectedAppointment.tempClientName || 'Cliente'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {selectedAppointment.customer?.phone || selectedAppointment.customer?.whatsapp || selectedAppointment.tempClientPhone}
                                    </p>
                                </div>
                            </div>

                            {(selectedAppointment.asset || selectedAppointment.tempAssetInfo) && (
                                <div className="flex items-start space-x-3">
                                    <Car size={16} className="text-slate-400 mt-0.5" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {selectedAppointment.asset 
                                            ? `${selectedAppointment.asset.field1} ${selectedAppointment.asset.field2} ${selectedAppointment.asset.field4 ? `| ${selectedAppointment.asset.field4}` : ''}`
                                            : selectedAppointment.tempAssetInfo}
                                    </p>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{selectedAppointment.title}</p>
                            </div>

                            {selectedAppointment.description && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notas</p>
                                    <p className="text-sm text-slate-500">{selectedAppointment.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                            {selectedAppointment.status === 'SCHEDULED' && (
                                <button
                                    onClick={() => handleConfirmAppointment(selectedAppointment)}
                                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-all"
                                >
                                    ✓ Confirmar Cita
                                </button>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleEditAppointment(selectedAppointment)}
                                    className="flex items-center justify-center space-x-2 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    <Edit size={16} />
                                    <span className="text-xs font-bold">Editar</span>
                                </button>
                                <button
                                    onClick={() => handleDeleteAppointment(selectedAppointment)}
                                    className="flex items-center justify-center space-x-2 py-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 size={16} />
                                    <span className="text-xs font-bold">Eliminar</span>
                                </button>
                                <button
                                    className="flex items-center justify-center space-x-2 py-2.5 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-all"
                                >
                                    <MessageSquare size={16} />
                                    <span className="text-xs font-bold">WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
