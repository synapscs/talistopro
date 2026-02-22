import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { User, Search, Plus, Check, Loader2 } from 'lucide-react';
import { useCustomers } from '../../../hooks/useApi';
import { CustomerForm } from '../../customers/CustomerForm';

interface Step1Props {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
}

export const Step1Customer = ({ data, onUpdate, onNext }: Step1Props) => {
    const { organization } = useAuthStore();
    const { data: customers, isLoading } = useCustomers();
    const [search, setSearch] = useState('');
    const [showNewCustomer, setShowNewCustomer] = useState(false);

    // Filter customers
    const filteredCustomers = customers?.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.documentNumber?.includes(search)
    );

    const handleSelect = (customer: any) => {
        onUpdate({ customer });
    };

    const selectedId = data.customer?.id;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Selección de Cliente</h3>
                    <p className="text-xs text-slate-500 font-medium">Busca o registra el cliente para esta orden.</p>
                </div>
                <button
                    onClick={() => setShowNewCustomer(true)}
                    className="flex items-center space-x-2 bg-primary-600 dark:bg-primary-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-primary-500 dark:hover:bg-primary-400 transition-all shadow-lg shadow-primary-600/10"
                >
                    <Plus size={16} />
                    <span>Crear Cliente</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o documento..."
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium shadow-sm"
                    autoFocus
                />
            </div>

            {/* Customer List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                {isLoading ? (
                    <div className="col-span-full flex justify-center p-8">
                        <Loader2 className="animate-spin text-primary-600" />
                    </div>
                ) : filteredCustomers?.length > 0 ? (
                    filteredCustomers.map((customer: any) => (
                        <div
                            key={customer.id}
                            onClick={() => handleSelect(customer)}
                            className={`
                                relative cursor-pointer p-4 rounded-2xl border-2 transition-all group hover:scale-[1.02]
                                ${selectedId === customer.id
                                    ? 'border-primary-600 bg-primary-50/50 dark:bg-slate-800/50 shadow-xl shadow-primary-600/10'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200 dark:hover:border-primary-900 shadow-sm hover:shadow-md'}
                            `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-lg font-black uppercase
                                        ${selectedId === customer.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/10 group-hover:text-primary-600'}
                                    `}>
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${selectedId === customer.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {customer.name}
                                        </h4>
                                        <p className="text-xs text-slate-400 font-mono">{customer.documentNumber || 'S/D'}</p>
                                    </div>
                                </div>
                                {selectedId === customer.id && (
                                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-600/30">
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center">
                                    <User size={12} className="mr-1 opacity-50" />
                                    {customer.phone}
                                </span>
                                {customer.email && (
                                    <span className="truncate max-w-[120px] opacity-75">{customer.email}</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <User className="mx-auto mb-4 opacity-50" size={48} />
                        <p className="font-medium">No se encontraron clientes</p>
                        <button
                            onClick={() => setShowNewCustomer(true)}
                            className="mt-4 text-primary-600 hover:text-primary-700 font-bold text-sm hover:underline"
                        >
                            Crear nuevo cliente
                        </button>
                    </div>
                )}
            </div>

            {/* Modal Nuevo Cliente */}
            {showNewCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
                    <CustomerForm onClose={() => setShowNewCustomer(false)} />
                </div>
            )}
        </div>
    );
};
