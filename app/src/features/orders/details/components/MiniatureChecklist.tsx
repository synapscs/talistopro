import React from 'react';
import { CheckSquare, AlertCircle, Info, Check } from 'lucide-react';

interface ChecklistItem {
    id: string;
    item: string;
    condition: string;
    category?: string;
}

interface MiniatureChecklistProps {
    checklist: ChecklistItem[];
}

export const MiniatureChecklist = ({ checklist }: MiniatureChecklistProps) => {
    if (!checklist || checklist.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <CheckSquare size={14} className="mr-2" />
                    Checklist de Entrada
                </h3>
                <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    {checklist.length} ítems
                </span>
            </div>

            <div className="p-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                <div className="space-y-2">
                    {checklist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between group">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate mr-4">
                                {item.item}
                            </span>
                            <div className={`
                                w-5 h-5 rounded-md flex items-center justify-center shrink-0 border
                                ${item.condition === 'good' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                                    item.condition === 'bad' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                                        'bg-amber-500/10 border-amber-500/20 text-amber-600'}
                            `}>
                                {item.condition === 'good' ? <Check size={12} strokeWidth={3} /> :
                                    item.condition === 'bad' ? <AlertCircle size={12} strokeWidth={3} /> :
                                        <Info size={12} strokeWidth={3} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
