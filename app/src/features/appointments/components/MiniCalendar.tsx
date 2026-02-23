import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface MiniCalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    appointments?: any[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
    selectedDate,
    onDateSelect,
    appointments = []
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startDay = monthStart.getDay();

    const hasAppointment = (date: Date) => {
        return appointments.some((apt: any) => isSameDay(new Date(apt.scheduledAt), date));
    };

    const getAppointmentsCount = (date: Date) => {
        return appointments.filter((apt: any) => isSameDay(new Date(apt.scheduledAt), date)).length;
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ChevronLeft size={16} className="text-slate-500" />
                </button>
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ChevronRight size={16} className="text-slate-500" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                    <div key={i} className="text-[9px] font-bold text-slate-400 uppercase py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {days.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentDay = isToday(day);
                    const hasAppt = hasAppointment(day);
                    const apptCount = getAppointmentsCount(day);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDateSelect(day)}
                            className={`
                                aspect-square rounded-lg text-xs font-bold transition-all relative
                                ${isSelected
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : isCurrentDay
                                        ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }
                            `}
                        >
                            {format(day, 'd')}
                            {hasAppt && !isSelected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex space-x-0.5">
                                    {Array.from({ length: Math.min(apptCount, 3) }).map((_, i) => (
                                        <span key={i} className="w-1 h-1 bg-primary-500 rounded-full" />
                                    ))}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leyenda</p>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-[9px] text-slate-500">Confirmada</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        <span className="text-[9px] text-slate-500">Pendiente</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-[9px] text-slate-500">Cancelada</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-slate-400 rounded-full" />
                        <span className="text-[9px] text-slate-500">Completada</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
