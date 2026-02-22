import React, { useState } from 'react';
import {
    Tag,
    Plus,
    Trash2,
    Edit2,
    Palette,
    ChevronRight,
    Search,
    Package,
    Wrench,
    Receipt,
    Loader2
} from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useApi';

interface CategoryType {
    id: string;
    label: string;
    icon: any;
    color: string;
    description: string;
}

export const CategoriesTab = ({ formData, setFormData }: any) => {
    const [activeType, setActiveType] = useState<'product' | 'service' | 'expense'>('product');
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [showForm, setShowForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('');

    const { data: categories, isLoading } = useCategories(activeType);
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const categoryTypes: CategoryType[] = [
        {
            id: 'product',
            label: 'Artículos / Productos',
            icon: Package,
            color: formData.customTerminology?.categoryTypeColors?.product || '#6366F1',
            description: 'Categorías para el inventario y stock'
        },
        {
            id: 'service',
            label: 'Servicios / Mano de Obra',
            icon: Wrench,
            color: formData.customTerminology?.categoryTypeColors?.service || '#10B981',
            description: 'Categorías para trabajos y mano de obra'
        },
        {
            id: 'expense',
            label: 'Gastos / Egresos',
            icon: Receipt,
            color: formData.customTerminology?.categoryTypeColors?.expense || '#F59E0B',
            description: 'Categorías para gastos operativos'
        }
    ];

    const currentType = categoryTypes.find(t => t.id === activeType)!;

    const handleUpdateTypeColor = (color: string) => {
        setFormData((prev: any) => ({
            ...prev,
            customTerminology: {
                ...prev.customTerminology,
                categoryTypeColors: {
                    ...prev.customTerminology?.categoryTypeColors,
                    [activeType]: color
                }
            }
        }));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;
        await createMutation.mutateAsync({
            name: newCategoryName,
            type: activeType,
            color: newCategoryColor || currentType.color
        });
        setNewCategoryName('');
        setNewCategoryColor('');
        setShowForm(false);
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name) return;
        await updateMutation.mutateAsync({
            id: editingCategory.id,
            name: editingCategory.name,
            color: editingCategory.color
        });
        setEditingCategory(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Selector de Tipo de Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categoryTypes.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setActiveType(type.id as any)}
                        className={`
                            relative group p-6 rounded-[2.5rem] border-2 transition-all text-left overflow-hidden
                            ${activeType === type.id
                                ? 'bg-white dark:bg-slate-900 shadow-xl ring-4 ring-primary-500/5'
                                : 'bg-slate-50/50 dark:bg-slate-950/50 border-transparent hover:bg-white dark:hover:bg-slate-900 hover:shadow-lg'}
                        `}
                        style={{ borderColor: activeType === type.id ? type.color : 'transparent' }}
                    >
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-3 rounded-2xl text-white shadow-lg"
                                style={{ backgroundColor: type.color }}
                            >
                                <type.icon size={22} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">{type.label}</h3>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{type.description}</p>
                            </div>
                        </div>
                        {activeType === type.id && (
                            <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                <ChevronRight size={16} className="text-slate-300" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <div
                            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:scale-110"
                            style={{ backgroundColor: currentType.color }}
                        >
                            <currentType.icon size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                {currentType.label}
                            </h2>
                            <div className="flex items-center mt-3 space-x-3">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    {categories?.length || 0} Registradas
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Color Base:</span>
                                    <input
                                        type="color"
                                        value={currentType.color}
                                        onChange={(e) => handleUpdateTypeColor(e.target.value)}
                                        className="w-6 h-6 rounded-full border-none cursor-pointer bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setNewCategoryColor(currentType.color);
                            setShowForm(true);
                        }}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-black uppercase text-[10px] tracking-widest py-4 px-8 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                    >
                        <Plus size={18} />
                        <span>Nueva Categoría</span>
                    </button>
                </div>

                <div className="p-10">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="animate-spin text-primary-600" size={40} />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cargando categorías...</span>
                        </div>
                    ) : categories && categories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map((cat: any) => (
                                <div
                                    key={cat.id}
                                    className="group relative bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                                            style={{ backgroundColor: cat.color }}
                                        >
                                            <Tag size={18} />
                                        </div>
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingCategory(cat)}
                                                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteMutation.mutate(cat.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight mb-1">{cat.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                        {activeType === 'product' ? 'Inventario' : activeType === 'service' ? 'Mano de Obra' : 'Gastos'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Tag size={40} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Sin Categorías</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Empieza creando una categoría para tus {currentType.label.toLowerCase()}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            {(showForm || editingCategory) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center space-x-4 mb-8">
                            <div
                                className="p-3 rounded-2xl text-white"
                                style={{ backgroundColor: editingCategory ? editingCategory.color : newCategoryColor }}
                            >
                                <Tag size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">
                                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    En la sección de {currentType.label}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={editingCategory ? editingCategory.name : newCategoryName}
                                    onChange={e => editingCategory
                                        ? setEditingCategory({ ...editingCategory, name: e.target.value })
                                        : setNewCategoryName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                                    placeholder="Ej: Motores, Pintura, Papelería..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Color Identificador</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="color"
                                        value={editingCategory ? editingCategory.color : newCategoryColor}
                                        onChange={e => editingCategory
                                            ? setEditingCategory({ ...editingCategory, color: e.target.value })
                                            : setNewCategoryColor(e.target.value)}
                                        className="w-12 h-12 rounded-xl border-none cursor-pointer bg-transparent"
                                    />
                                    <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-[10px] font-mono font-bold text-slate-400">
                                        {editingCategory ? editingCategory.color : newCategoryColor}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-10">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingCategory(null);
                                }}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                                className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl shadow-lg shadow-primary-600/20 transition-all"
                            >
                                {editingCategory ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
