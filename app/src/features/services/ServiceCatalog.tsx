import React, { useState } from 'react';
import { Briefcase, Plus, Search, Clock, Tag, Loader2, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useServices, useDeleteService } from '../../hooks/useApi';
import { ServiceForm } from './ServiceForm';
import { formatCurrency } from '../../lib/finance';

export const ServiceCatalog = () => {
    const { organization } = useAuthStore();
    const { data: services, isLoading } = useServices();
    const deleteService = useDeleteService();
    const primaryCurrency = organization?.primaryCurrency || 'USD';
    const isBiCurrency = organization?.biCurrencyEnabled === true;

    const [showForm, setShowForm] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [search, setSearch] = useState('');

    const filteredServices = services?.filter((s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catálogo de Servicios</h1>
                    <p className="text-slate-500 dark:text-slate-400">Define tus servicios estándar para agilizar la creación de órdenes.</p>
                </div>
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar servicios..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                    />
                </div>
                <button
                    onClick={() => { setEditingService(null); setShowForm(true); }}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Configurar Servicio</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServices?.map((service: any) => (
                        <div key={service.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="p-3 bg-primary-100 dark:bg-primary-500/10 text-primary-600 rounded-2xl"
                                    style={{ color: service.category?.color, backgroundColor: `${service.category?.color}15` }}
                                >
                                    <Briefcase size={22} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                        {formatCurrency(Number(service.price), primaryCurrency, organization?.country)}
                                    </span>
                                    {isBiCurrency && organization?.secondaryCurrency && (
                                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold italic mt-1">
                                            {formatCurrency(Number(service.price) * Number(organization?.exchangeRate || 1), organization.secondaryCurrency, organization.country)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-2 line-clamp-1">
                                {service.name}
                            </h3>

                            <p className="text-[10px] text-slate-500 font-medium line-clamp-2 min-h-[2.5rem] mb-4">
                                {service.description || 'Sin descripción adicional.'}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    <div className="flex items-center">
                                        <Clock size={12} className="mr-1.5 text-primary-500" /> {service.estimatedTime || 60} min
                                    </div>
                                    <div className="flex items-center">
                                        <Tag size={12} className="mr-1.5" style={{ color: service.category?.color }} />
                                        {service.category?.name || 'General'}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => { setEditingService(service); setShowForm(true); }}
                                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                        title="Editar"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('¿Eliminar este servicio del catálogo?')) {
                                                await deleteService.mutateAsync(service.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div
                        onClick={() => { setEditingService(null); setShowForm(true); }}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-primary-500/50 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="opacity-30 group-hover:opacity-100 group-hover:text-primary-500 transition-all" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Añadir Nuevo Servicio</p>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <ServiceForm
                        onClose={() => {
                            setShowForm(false);
                            setEditingService(null);
                        }}
                        initialData={editingService}
                    />
                </div>
            )}
        </div>
    );
};
