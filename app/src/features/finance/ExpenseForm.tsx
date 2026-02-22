import React, { useState, useEffect } from 'react';
import { X, Save, TrendingDown, Info, Loader2, Tag, DollarSign, Calendar, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCategories, useSuppliers, useCreateExpense, useUpdateExpense } from '../../hooks/useApi';
import { formatDecimal, parseDecimal } from '../../lib/finance';
import { format } from 'date-fns';

interface ExpenseFormProps {
    onClose: () => void;
    initialData?: any;
}

export const ExpenseForm = ({ onClose, initialData }: ExpenseFormProps) => {
    const { organization } = useAuthStore();

    const [formData, setFormData] = useState({
        description: initialData?.description || '',
        amount: initialData?.amount || 0,
        amountLocal: initialData?.amountLocal || 0,
        categoryId: initialData?.categoryId || '',
        supplierId: initialData?.supplierId || '',
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });

    // Estado para manejo visual de input numérico
    const [displayAmount, setDisplayAmount] = useState(formatDecimal(initialData?.amount || 0));

    const { data: categories } = useCategories('expense');
    const { data: suppliers } = useSuppliers();
    const createExpense = useCreateExpense();
    const updateExpense = useUpdateExpense();
    const isEditing = !!initialData?.id;

    const formatAmountOnBlur = (value: string) => {
        const numericValue = parseDecimal(value);
        const formatted = formatDecimal(numericValue);
        setDisplayAmount(formatted);
        setFormData(prev => ({ ...prev, amount: numericValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                amount: Number(formData.amount),
                date: new Date(formData.date).toISOString(),
            };

            if (isEditing) {
                await updateExpense.mutateAsync({
                    id: initialData.id,
                    ...dataToSubmit,
                });
            } else {
                await createExpense.mutateAsync(dataToSubmit);
            }
            onClose();
        } catch (error) {
            console.error('Error saving expense:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {isEditing ? 'Editar' : 'Registrar'} Gasto
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {isEditing ? 'Actualiza los detalles del egreso' : 'Registra un nuevo egreso operativo'}.
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-500">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Info size={12} className="mr-1" /> Descripción / Concepto
                        </label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ej: Pago de Alquiler, Compra de Repuestos..."
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Calendar size={12} className="mr-1" /> Fecha
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Tag size={12} className="mr-1" /> Categoría
                        </label>
                        <div className="relative">
                            <select
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Sin Categoría</option>
                                {categories?.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {formData.categoryId && (
                                <div
                                    className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-sm"
                                    style={{ backgroundColor: categories?.find((c: any) => c.id === formData.categoryId)?.color }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Building2 size={12} className="mr-1" /> Proveedor (Opcional)
                        </label>
                        <select
                            value={formData.supplierId}
                            onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Seleccionar Proveedor...</option>
                            {suppliers?.map((sup: any) => (
                                <option key={sup.id} value={sup.id}>{sup.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Monto */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 flex items-center">
                            <DollarSign size={12} className="mr-1" /> Monto del Gasto ({organization?.primaryCurrency || 'USD'})
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500 font-bold">$</span>
                            <input
                                type="text"
                                value={displayAmount}
                                onChange={e => setDisplayAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                                onBlur={e => formatAmountOnBlur(e.target.value)}
                                required
                                className="w-full bg-white dark:bg-slate-900 border-primary-200 dark:border-primary-900/30 border rounded-2xl py-4 pl-10 pr-4 text-sm font-black text-primary-600 focus:ring-4 focus:ring-primary-500/10 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 py-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={createExpense.isPending || updateExpense.isPending}
                        className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {(createExpense.isPending || updateExpense.isPending) ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>
                            {(createExpense.isPending || updateExpense.isPending) ? 'Guardando...' : `Guardar Gasto`}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};
