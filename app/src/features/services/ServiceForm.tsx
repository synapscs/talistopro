import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, Info, Loader2, Tag, DollarSign, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useCategories, useCreateService, useUpdateService } from '../../hooks/useApi';
import { formatDecimal, parseDecimal } from '../../lib/finance';

interface ServiceFormProps {
    onClose: () => void;
    initialData?: any;
}

export const ServiceForm = ({ onClose, initialData }: ServiceFormProps) => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { serviceLabel } = terminology as any;

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        categoryId: initialData?.categoryId || '',
        price: initialData?.price || 0,
        estimatedTime: initialData?.estimatedTime || 60,
    });

    const [displayPrice, setDisplayPrice] = useState(formatDecimal(initialData?.price || 0));

    const { data: categories, isLoading: loadingCats } = useCategories('service');
    const createService = useCreateService();
    const updateService = useUpdateService();
    const isEditing = !!initialData?.id;

    const formatPriceOnBlur = (value: string) => {
        const numericValue = parseDecimal(value);
        const formatted = formatDecimal(numericValue);
        setDisplayPrice(formatted);
        setFormData(prev => ({ ...prev, price: numericValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateService.mutateAsync({
                    id: initialData.id,
                    ...formData,
                    price: Number(formData.price),
                    estimatedTime: Number(formData.estimatedTime),
                });
            } else {
                await createService.mutateAsync({
                    ...formData,
                    price: Number(formData.price),
                    estimatedTime: Number(formData.estimatedTime),
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving service:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {isEditing ? 'Editar' : 'Nuevo'} {serviceLabel || 'Servicio'}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {isEditing ? 'Actualiza los detalles del servicio' : 'Define un nuevo servicio estándar'}.
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
                            <Info size={12} className="mr-1" /> Nombre del Servicio
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder={`Ej: Cambio de Aceite, Limpieza de Cabezales...`}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalles sobre lo que incluye el servicio..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 outline-none transition-all min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-1.5 flex flex-col relative">
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

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Clock size={12} className="mr-1" /> Duración Estimada (MIN)
                        </label>
                        <input
                            type="number"
                            value={formData.estimatedTime}
                            onChange={e => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                            placeholder="60"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Precio */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 flex items-center">
                            <DollarSign size={12} className="mr-1" /> Precio del Servicio ({organization?.primaryCurrency || 'USD'})
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500 font-bold">$</span>
                            <input
                                type="text"
                                value={displayPrice}
                                onChange={e => setDisplayPrice(e.target.value.replace(/[^0-9,.]/g, ''))}
                                onBlur={e => formatPriceOnBlur(e.target.value)}
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
                        disabled={createService.isPending || updateService.isPending}
                        className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {(createService.isPending || updateService.isPending) ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>
                            {(createService.isPending || updateService.isPending) ? 'Guardando...' : `Guardar Servicio`}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};
