import React, { useEffect } from 'react';
import { getChecklistTemplate, ChecklistItemCondition } from '../../../../lib/constants/checklist-presets';
import { BusinessType } from '../../../../lib/terminology';
import { ChecklistItemRow } from './ChecklistItemRow';
import { ClipboardCheck } from 'lucide-react';

interface ChecklistWizardProps {
    businessType: BusinessType;
    value: any[];
    onChange: (items: any[]) => void;
}

export const ChecklistWizard: React.FC<ChecklistWizardProps> = ({
    businessType,
    value,
    onChange
}) => {
    // Hidratar checklist inicial si está vacío
    useEffect(() => {
        if (!value || value.length === 0) {
            const template = getChecklistTemplate(businessType);
            const initialItems = template.categories.flatMap(cat =>
                cat.items.map(item => ({
                    id: `${cat.id}-${item.replace(/\s+/g, '-').toLowerCase()}`,
                    category: cat.label,
                    item: item,
                    condition: 'good' as ChecklistItemCondition,
                    notes: '',
                    checked: true
                }))
            );
            onChange(initialItems);
        }
    }, [businessType, value.length, onChange]);

    const handleConditionChange = (id: string, condition: ChecklistItemCondition) => {
        const updated = value.map(item =>
            item.id === id ? { ...item, condition } : item
        );
        onChange(updated);
    };

    const handleNoteChange = (id: string, notes: string) => {
        const updated = value.map(item =>
            item.id === id ? { ...item, notes } : item
        );
        onChange(updated);
    };

    // Agrupar items por categoría para el renderizado
    const template = getChecklistTemplate(businessType);

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                    <ClipboardCheck size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Protocolo de Recepción</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inspección rápida: Marca el estado de cada punto.</p>
                </div>
            </div>

            {template.categories.map(cat => {
                const categoryItems = value.filter(v => v.category === cat.label);

                return (
                    <div key={cat.id} className="space-y-4">
                        <div className="flex items-center space-x-2 px-1">
                            <div className="h-4 w-1 bg-primary-500 rounded-full"></div>
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{cat.label}</h5>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {categoryItems.map(item => (
                                <ChecklistItemRow
                                    key={item.id}
                                    label={item.item}
                                    condition={item.condition}
                                    notes={item.notes}
                                    onConditionChange={(c) => handleConditionChange(item.id, c)}
                                    onNoteChange={(n) => handleNoteChange(item.id, n)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
