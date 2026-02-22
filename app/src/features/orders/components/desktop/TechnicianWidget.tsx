import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

interface TechnicianWidgetProps {
    assignedTo: any;
}

export const TechnicianWidget: React.FC<TechnicianWidgetProps> = ({ assignedTo }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Responsable Técnico</p>

            <div className="flex items-center space-x-4">
                {assignedTo?.user?.image ? (
                    <img
                        src={assignedTo.user.image}
                        alt={assignedTo.user.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/10"
                    />
                ) : (
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                        <User size={20} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight truncate">
                        {assignedTo?.user?.name || 'Vendedor / Sin Asignar'}
                    </h3>
                    <div className="flex items-center mt-0.5">
                        <ShieldCheck size={12} className="text-indigo-500 mr-1" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Especialista</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
