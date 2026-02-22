import React, { useState, useEffect } from 'react';
import { X, Save, Box, Info, AlertCircle, Loader2, Tag, DollarSign, Package, Hash } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useCategories, useCreateProduct, useUpdateProduct } from '../../hooks/useApi';
import { formatDecimal, parseDecimal } from '../../lib/finance';
import { Product, CreateProductInput, UpdateProductInput, Category } from '../../types/api';

interface ProductFormProps {
    onClose: () => void;
    initialData?: Product | null;
}

export const ProductForm = ({ onClose, initialData }: ProductFormProps) => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { partLabel } = terminology;

    const [formData, setFormData] = useState({
        sku: initialData?.sku || '',
        name: initialData?.name || '',
        description: initialData?.description || '',
        categoryId: initialData?.categoryId || '',
        costPrice: initialData?.costPrice || 0,
        salePrice: initialData?.salePrice || 0,
        stock: initialData?.stock || 0,
        minStock: initialData?.minStock || 5,
        unit: initialData?.unit || 'unidad',
    });

    // Estados para manejo visual de inputs numéricos (evitar "010" y forzar ".00")
    const [displayCost, setDisplayCost] = useState(formatDecimal(initialData?.costPrice || 0));
    const [displaySale, setDisplaySale] = useState(formatDecimal(initialData?.salePrice || 0));

    const { data: categories, isLoading: loadingCats } = useCategories('product');
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const isEditing = !!initialData?.id;

    const formatPriceOnBlur = (value: string, field: 'costPrice' | 'salePrice') => {
        const numericValue = parseDecimal(value);
        const formatted = formatDecimal(numericValue);

        if (field === 'costPrice') setDisplayCost(formatted);
        else setDisplaySale(formatted);

        setFormData(prev => ({ ...prev, [field]: numericValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateProduct.mutateAsync({
                    id: initialData.id,
                    ...formData,
                    costPrice: Number(formData.costPrice),
                    salePrice: Number(formData.salePrice),
                    stock: Number(formData.stock),
                    minStock: Number(formData.minStock),
                });
            } else {
                await createProduct.mutateAsync({
                    ...formData,
                    costPrice: Number(formData.costPrice),
                    salePrice: Number(formData.salePrice),
                    stock: Number(formData.stock),
                    minStock: Number(formData.minStock),
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <Box size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {isEditing ? 'Editar' : 'Nuevo'} {partLabel}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {isEditing ? 'Actualiza los detalles del artículo' : 'Registra un nuevo artículo en tu inventario'}.
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
                            <Hash size={12} className="mr-1" /> SKU / Código de Barras
                        </label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Ej: REP-001, 750123456789"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Info size={12} className="mr-1" /> Nombre del {partLabel}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder={`Ej: Pastillas de Freno, Pantalla iPhone 13...`}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalles adicionales, compatibilidad, especificaciones..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 outline-none transition-all min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Tag size={12} className="mr-1" /> Categoría
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Sin Categoría</option>
                            {(categories as Category[])?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {formData.categoryId && categories && (
                            <div
                                className="absolute right-10 top-[60%] -translate-y-1/2 w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: categories.find((c: any) => c.id === formData.categoryId)?.color }}
                            />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unidad de Medida</label>
                        <select
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="unidad">Unidad</option>
                            <option value="litro">Litro</option>
                            <option value="metro">Metro</option>
                            <option value="kg">Kilogramo</option>
                            <option value="par">Par</option>
                            <option value="juego">Juego / Set</option>
                        </select>
                    </div>
                </div>

                {/* Precios y Stock */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <DollarSign size={12} className="mr-1" /> Precio de Costo ({organization?.primaryCurrency || 'USD'})
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="text"
                                value={displayCost}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9,.]/g, '');
                                    setDisplayCost(val);
                                }}
                                onBlur={e => formatPriceOnBlur(e.target.value, 'costPrice')}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-black focus:ring-4 focus:ring-primary-500/10 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 flex items-center justify-between">
                            <span className="flex items-center"><DollarSign size={12} className="mr-1" /> Precio de Venta ({organization?.primaryCurrency || 'USD'})</span>
                            {formData.salePrice > 0 && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full ${((formData.salePrice - formData.costPrice) / formData.salePrice * 100) > 20
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                    }`}>
                                    Margen: {((formData.salePrice - formData.costPrice) / formData.salePrice * 100).toFixed(1)}%
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500 font-bold">$</span>
                            <input
                                type="text"
                                value={displaySale}
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9,.]/g, '');
                                    setDisplaySale(val);
                                }}
                                onBlur={e => formatPriceOnBlur(e.target.value, 'salePrice')}
                                required
                                className="w-full bg-white dark:bg-slate-900 border-primary-200 dark:border-primary-900/30 border rounded-xl py-3 pl-10 pr-4 text-sm font-black text-primary-600 focus:ring-4 focus:ring-primary-500/10 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-6 mt-2 grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                                <Package size={12} className="mr-1" /> Stock Actual
                            </label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                required
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-5 text-sm font-black focus:ring-4 focus:ring-primary-500/10 outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1 flex items-center">
                                <AlertCircle size={12} className="mr-1" /> Stock Mínimo
                            </label>
                            <input
                                type="number"
                                value={formData.minStock}
                                onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                required
                                className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 border rounded-xl py-3 px-5 text-sm font-black text-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none"
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
                        disabled={createProduct.isPending || updateProduct.isPending}
                        className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {(createProduct.isPending || updateProduct.isPending) ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>
                            {(createProduct.isPending || updateProduct.isPending) ? 'Guardando...' : `Guardar ${partLabel}`}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};
