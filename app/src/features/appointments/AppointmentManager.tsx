import React from 'react';
import { Calendar as CalendarIcon, Clock, User, Car, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { TERMINOLOGY_PRESETS } from '../../lib/terminology';
import { useAppointments } from '../../hooks/useApi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AppointmentManager = () => {
    const { organization } = useAuthStore();
    const preset = organization ? TERMINOLOGY_PRESETS[organization.businessType] : TERMINOLOGY_PRESETS.OTHER;

    const { data: appointments, isLoading } = useAppointments();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agenda de Citas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona las entradas programadas para optimizar el taller.</p>
                </div>
                <button className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm text-sm">
                    <Plus size={18} />
                    <span>Programar Cita</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <CalendarIcon size={16} className="mr-2 text-primary-600" /> Calendario
                        </h3>
                        {/* Mini Calendar (Visual Only for now) */}
                        <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-bold text-slate-400">
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d} className="py-1">{d}</div>)}
                            {Array.from({ length: 31 }).map((_, i) => (
                                <div key={i} className={`py-2 rounded-lg ${i + 1 === new Date().getDate() ? 'bg-primary-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Citas Programadas</h3>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary-600" /></div>
                        ) : appointments && appointments.length > 0 ? (
                            appointments.map((app: any) => (
                                <div key={app.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary-500/30 transition-all">
                                    <div className="flex items-center space-x-6">
                                        <div className="text-center min-w-[70px]">
                                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                                {format(new Date(app.scheduledAt), 'HH:mm')}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">
                                                {format(new Date(app.scheduledAt), 'dd MMM', { locale: es })}
                                            </p>
                                        </div>
                                        <div className="h-10 w-[2px] bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-500/30 transition-colors"></div>
                                        <div>
                                            <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white">
                                                <User size={14} className="mr-1.5 text-slate-400" /> {app.customer?.name}
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                                <Car size={14} className="mr-1.5 text-slate-400" /> {app.title}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span className={`
                        px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter
                        ${app.status === 'CONFIRMED' || app.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20'}
                      `}>
                                            {app.status}
                                        </span>
                                        <button className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-medium text-slate-500">No hay citas programadas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
