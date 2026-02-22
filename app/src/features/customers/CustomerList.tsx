import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Trash2, Phone, ShoppingBag, Loader2, UserX, MapPin, CheckCircle2, Edit, LayoutGrid, LayoutList, ChevronRight } from 'lucide-react';
import { useCustomers, useDeleteCustomer } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { CustomerForm } from './CustomerForm';
import { CustomerCard } from './CustomerCard';
import { CustomerDetailPanel } from './CustomerDetailPanel';
import { AssetForm } from '../assets/AssetForm';

export const CustomerList = () => {
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);
    const { organization } = useAuthStore();
    const navigate = useNavigate();

    // Conexión real con la API
    const { data: customers, isLoading } = useCustomers();
    const deleteCustomer = useDeleteCustomer();

    const filteredCustomers = customers?.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    ) || [];

    const confirmDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
            try {
                await deleteCustomer.mutateAsync(id);
                if (selectedCustomer?.id === id) setSelectedCustomer(null);
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    };

    const handleEdit = (customer: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingCustomer(customer);
        setShowForm(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Sincronizando clientes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">Clientes</h1>
                    <p className="text-slate-500 dark:text-slate-400">Base de datos maestra y gestión de activos.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-300/40 dark:border-slate-800 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-400'}`}
                        >
                            <LayoutList size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-400'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>

                    <button
                        onClick={() => { setEditingCustomer(null); setShowForm(true); }}
                        className="flex items-center justify-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>Nuevo Cliente</span>
                    </button>
                </div>
            </div>

            {/* Layout Principal con Panel Lateral */}
            <div className="flex flex-col lg:flex-row gap-6 items-start relative min-h-[600px]">

                {/* Contenedor de la Lista/Grid */}
                <div className={`flex-1 space-y-6 w-full transition-all duration-500 ${selectedCustomer ? 'lg:w-2/3' : 'w-full'}`}>

                    {/* Barra de Búsqueda */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-300/50 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 relative">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o teléfono..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-950 border border-slate-300/30 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                            />
                        </div>

                        {filteredCustomers.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-400">
                                    <UserX size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sin registros</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Comienza agregando tu primer cliente hoy.</p>
                            </div>
                        ) : viewMode === 'list' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-300/50 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-black bg-slate-50/30 dark:bg-slate-800/30">
                                            <th className="px-8 py-5 first:pl-10">Identidad</th>
                                            <th className="px-8 py-5 lg:table-cell hidden">Localización</th>
                                            <th className="px-8 py-5 sm:table-cell hidden">Canales</th>
                                            <th className="px-8 py-5 text-right last:pr-10">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {filteredCustomers.map((customer: any) => (
                                            <tr
                                                key={customer.id}
                                                onClick={() => setSelectedCustomer(customer)}
                                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''}`}
                                            >
                                                <td className="px-8 py-5 first:pl-10">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-sm uppercase shadow-sm group-hover:scale-105 transition-transform">
                                                            {customer.name.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <span className={`block font-black uppercase tracking-tight transition-colors text-sm ${selectedCustomer?.id === customer.id ? 'text-primary-600' : 'text-slate-900 dark:text-white'}`}>{customer.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-bold flex items-center mt-0.5">
                                                                <Phone size={10} className="mr-1" /> {customer.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 lg:table-cell hidden">
                                                    <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <MapPin size={12} className="mr-2 text-primary-500" />
                                                        {customer.city ? `${customer.city}, ${customer.state}` : 'Ubicación no registrada'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 sm:table-cell hidden">
                                                    <div className="flex items-center space-x-2">
                                                        {customer.notifyWhatsapp && (
                                                            <div className="flex items-center space-x-1 text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-lg border border-green-100 dark:border-green-900/30">
                                                                <CheckCircle2 size={10} />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter">WA</span>
                                                            </div>
                                                        )}
                                                        {customer.notifyEmail && (
                                                            <div className="flex items-center space-x-1 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                                                <CheckCircle2 size={10} />
                                                                <span className="text-[9px] font-black uppercase tracking-tighter">EM</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right last:pr-10">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={(e) => handleEdit(customer, e)}
                                                            className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-primary-600"
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => confirmDelete(customer.id, e)}
                                                            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-slate-400 hover:text-red-500"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <ChevronRight size={16} className={`text-slate-300 transition-all ${selectedCustomer?.id === customer.id ? 'translate-x-1 text-primary-500' : ''}`} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {filteredCustomers.map((customer: any) => (
                                    <CustomerCard
                                        key={customer.id}
                                        customer={customer}
                                        onClick={() => setSelectedCustomer(customer)}
                                        onEdit={(e) => handleEdit(customer, e)}
                                        onDelete={(e) => confirmDelete(customer.id, e)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel Lateral de Detalle */}
                {selectedCustomer && (
                    <div className="lg:sticky lg:top-0 fixed inset-0 z-40 lg:z-0 lg:w-1/3 w-full lg:h-[calc(100vh-120px)] h-full">
                        <div className="lg:hidden absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}></div>
                        <CustomerDetailPanel
                            customer={selectedCustomer}
                            onClose={() => setSelectedCustomer(null)}
                            onAddAsset={() => { setEditingAsset(null); setShowAssetForm(true); }}
                            onEditAsset={(asset) => { setEditingAsset(asset); setShowAssetForm(true); }}
                            onCreateOrder={() => navigate('/orders')}
                        />
                    </div>
                )}
            </div>

            {/* Modal de Formulario de Activo */}
            {showAssetForm && selectedCustomer && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                    <div className="w-full max-w-2xl">
                        <AssetForm
                            customerId={selectedCustomer.id}
                            initialData={editingAsset}
                            onClose={() => {
                                setShowAssetForm(false);
                                setEditingAsset(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Modal de Formulario de Cliente */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <CustomerForm
                        onClose={() => {
                            setShowForm(false);
                            setEditingCustomer(null);
                        }}
                        initialData={editingCustomer}
                    />
                </div>
            )}
        </div>
    );
};
