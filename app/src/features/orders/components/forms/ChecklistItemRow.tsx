import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, MessageSquare } from 'lucide-react';
import { ChecklistItemCondition } from '../../../../lib/constants/checklist-presets';

interface ChecklistItemRowProps {
    label: string;
    condition: ChecklistItemCondition;
    notes: string;
    onConditionChange: (condition: ChecklistItemCondition) => void;
    onNoteChange: (note: string) => void;
}

export const ChecklistItemRow: React.FC<ChecklistItemRowProps> = ({
    label,
    condition,
    notes,
    onConditionChange,
    onNoteChange
}) => {
    const isBadOrRegular = condition === 'bad' || condition === 'regular';

    return (
        <div className="flex flex-col space-y-3 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all hover:border-primary-500/30 shadow-sm group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => onConditionChange('good')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${condition === 'good'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                            }`}
                    >
                        <CheckCircle2 size={14} />
                        <span className="hidden sm:inline">Bueno</span>
                    </button>

                    <button
                        onClick={() => onConditionChange('regular')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${condition === 'regular'
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                            }`}
                    >
                        <AlertTriangle size={14} />
                        <span className="hidden sm:inline">Regular</span>
                    </button>

                    <button
                        onClick={() => onConditionChange('bad')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${condition === 'bad'
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                            }`}
                    >
                        <XCircle size={14} />
                        <span className="hidden sm:inline">Malo</span>
                    </button>

                    <button
                        onClick={() => onConditionChange('na')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${condition === 'na'
                                ? 'bg-slate-500 text-white shadow-lg shadow-slate-500/20'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                    >
                        <MinusCircle size={14} />
                        <span className="hidden sm:inline">N/A</span>
                    </button>
                </div>
            </div>

            {isBadOrRegular && (
                <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-primary-500">
                        <MessageSquare size={16} />
                    </div>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder={`Especificar detalle del estado ${condition === 'bad' ? 'malo' : 'regular'}...`}
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>
            )}
        </div>
    );
};
