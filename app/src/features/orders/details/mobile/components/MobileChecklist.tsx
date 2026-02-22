import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

interface ChecklistItem {
    id: string;
    item: string;
    condition: 'good' | 'regular' | 'bad' | 'missing';
    checked: boolean;
}

interface MobileChecklistProps {
    items: ChecklistItem[];
    onUpdateItem: (id: string, updates: Partial<ChecklistItem>) => void;
    readOnly?: boolean;
}

export const MobileChecklist = ({ items, onUpdateItem, readOnly = false }: MobileChecklistProps) => {
    // Group items logic could go here if we had category data. 
    // For now, assuming flat list or simple implementation.

    const getConditionIcon = (condition: string) => {
        switch (condition) {
            case 'good': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'regular': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'bad': return <XCircle className="text-red-500" size={20} />;
            case 'missing': return <Trash2 className="text-slate-400" size={20} />;
            default: return <CheckCircle2 className="text-slate-300" size={20} />;
        }
    };

    return (
        <div className="space-y-4 pb-20">
            {items?.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.item}</span>
                        {getConditionIcon(item.condition)}
                    </div>

                    <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg">
                        {(['good', 'regular', 'bad', 'missing'] as const).map((cond) => (
                            <button
                                key={cond}
                                onClick={() => !readOnly && onUpdateItem(item.id, { condition: cond })}
                                disabled={readOnly}
                                className={`
                                    py-2 rounded-md flex justify-center items-center transition-all
                                    ${item.condition === cond
                                        ? cond === 'good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : cond === 'regular' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : cond === 'bad' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                        : 'bg-transparent text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }
                                    ${readOnly ? 'cursor-default opacity-70' : 'cursor-pointer'}
                                `}
                            >
                                <span className="text-[10px] font-bold uppercase">{cond.slice(0, 3)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
            {(!items || items.length === 0) && (
                <div className="text-center py-10 text-slate-400">
                    <p>No hay items en el checklist.</p>
                </div>
            )}
        </div>
    );
};
