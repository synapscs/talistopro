import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, AlertTriangle, XCircle, MinusCircle, MessageSquare, Lock } from 'lucide-react';

interface ChecklistItem {
    id: string;
    item: string;
    category?: string;
    condition: 'good' | 'regular' | 'bad' | 'na';
    notes?: string;
    checked?: boolean;
}

interface DesktopChecklistProps {
    items: ChecklistItem[];
    onUpdateItem: (id: string, updates: Partial<ChecklistItem>) => void;
    readOnly?: boolean;
}

const conditions = [
    { value: 'good', label: 'Bien', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-500/20', activeColor: 'bg-green-500 text-white' },
    { value: 'regular', label: 'Regular', icon: AlertTriangle, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-500/20', activeColor: 'bg-amber-500 text-white' },
    { value: 'bad', label: 'Mal', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-500/20', activeColor: 'bg-red-500 text-white' },
    { value: 'na', label: 'N/A', icon: MinusCircle, color: 'text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800', activeColor: 'bg-slate-500 text-white' },
] as const;

export const DesktopChecklist: React.FC<DesktopChecklistProps> = ({ items, onUpdateItem, readOnly = false }) => {
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState('');

    const handleConditionChange = (itemId: string, condition: string) => {
        if (readOnly) return;
        onUpdateItem(itemId, { condition: condition as any });
    };

    const handleStartEditNote = (item: ChecklistItem) => {
        setEditingNoteId(item.id);
        setTempNote(item.notes || '');
    };

    const handleSaveNote = (itemId: string) => {
        onUpdateItem(itemId, { notes: tempNote });
        setEditingNoteId(null);
        setTempNote('');
    };

    const handleCancelNote = () => {
        setEditingNoteId(null);
        setTempNote('');
    };

    const groupedItems = items?.reduce((acc: Record<string, ChecklistItem[]>, item) => {
        const category = item.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {}) || {};

    if (!items || items.length === 0) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-100 dark:border-slate-700">
                    <CheckSquare className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-500 font-medium text-sm">No hay items en el checklist.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category}>
                    {Object.keys(groupedItems).length > 1 && (
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                            {category}
                        </h4>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {categoryItems.map((item) => {
                            const currentCondition = conditions.find(c => c.value === item.condition) || conditions[3];
                            const showNoteInput = editingNoteId === item.id;
                            const hasNote = item.notes && item.notes.trim().length > 0;
                            const needsAttention = item.condition === 'bad' || item.condition === 'regular';

                            return (
                                <div
                                    key={item.id}
                                    className={`
                                        bg-white dark:bg-slate-900 border rounded-xl p-4 transition-all
                                        ${needsAttention && !readOnly 
                                            ? 'border-amber-200 dark:border-amber-500/30 shadow-sm shadow-amber-500/5' 
                                            : 'border-slate-200 dark:border-slate-800'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight pr-2">
                                            {item.item}
                                        </span>
                                        {hasNote && (
                                            <MessageSquare size={14} className={`${needsAttention ? 'text-amber-500' : 'text-slate-400'} shrink-0`} />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {conditions.map((cond) => {
                                            const Icon = cond.icon;
                                            const isActive = item.condition === cond.value;
                                            
                                            return (
                                                <button
                                                    key={cond.value}
                                                    onClick={() => handleConditionChange(item.id, cond.value)}
                                                    disabled={readOnly}
                                                    className={`
                                                        py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1.5
                                                        ${isActive 
                                                            ? cond.activeColor 
                                                            : `${cond.bgColor} ${cond.color} hover:opacity-80`
                                                        }
                                                        ${readOnly ? 'cursor-default opacity-60' : 'cursor-pointer hover:scale-105 active:scale-95'}
                                                    `}
                                                >
                                                    <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                                                    <span className="text-[10px] font-bold uppercase">{cond.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {needsAttention && !readOnly && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            {showNoteInput ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={tempNote}
                                                        onChange={(e) => setTempNote(e.target.value)}
                                                        placeholder="Añadir observación..."
                                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={handleCancelNote}
                                                            className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveNote(item.id)}
                                                            className="px-2 py-1 text-[10px] font-bold text-white bg-primary-500 hover:bg-primary-600 rounded"
                                                        >
                                                            Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartEditNote(item)}
                                                    className="flex items-center space-x-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                                                >
                                                    <MessageSquare size={12} />
                                                    <span>{hasNote ? 'Editar observación' : 'Añadir observación'}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {hasNote && !showNoteInput && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                                                "{item.notes}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
