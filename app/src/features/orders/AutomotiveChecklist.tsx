import React, { useState } from 'react';
import { CheckSquare, AlertTriangle, HelpCircle, Save } from 'lucide-react';

const CATEGORIES = [
    { id: 'EXT', label: 'Exterior', items: ['Parachoques', 'Luces', 'Espejos', 'Pintura', 'Vidrios', 'Rines/Cauchos'] },
    { id: 'INT', label: 'Interior', items: ['Tapicería', 'Aire Acond.', 'Radio/Pantalla', 'Tablero', 'Cinturones'] },
    { id: 'DOC', label: 'Documentos/Accesorios', items: ['Registro', 'Seguro', 'Llaves', 'Herramientas', 'Caucho Repuesto'] },
];

export const AutomotiveChecklist = () => {
    const [values, setValues] = useState<Record<string, 'good' | 'damaged' | 'missing'>>({});

    const toggleStatus = (item: string, status: 'good' | 'damaged' | 'missing') => {
        setValues(prev => ({ ...prev, [item]: status }));
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Checklist de Entrada</h2>
                <p className="text-xs text-slate-500">Inspección visual y estado del vehículo al ingresar.</p>
            </div>

            <div className="p-8 space-y-8">
                {CATEGORIES.map((cat) => (
                    <div key={cat.id} className="space-y-4">
                        <h3 className="text-sm font-bold text-primary-600 uppercase tracking-widest">{cat.label}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cat.items.map((item) => (
                                <div key={item} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-950/30">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => toggleStatus(item, 'good')}
                                            className={`p-1.5 rounded-lg transition-all ${values[item] === 'good' ? 'bg-green-100 text-green-600' : 'text-slate-300 hover:bg-slate-100'}`}
                                            title="Buen estado"
                                        >
                                            <CheckSquare size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(item, 'damaged')}
                                            className={`p-1.5 rounded-lg transition-all ${values[item] === 'damaged' ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:bg-slate-100'}`}
                                            title="Dañado / Rayado"
                                        >
                                            <AlertTriangle size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(item, 'missing')}
                                            className={`p-1.5 rounded-lg transition-all ${values[item] === 'missing' ? 'bg-red-100 text-red-600' : 'text-slate-300 hover:bg-slate-100'}`}
                                            title="Faltante"
                                        >
                                            <HelpCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-4 flex justify-end">
                    <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2">
                        <Save size={18} />
                        <span>Guardar Inspección</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
