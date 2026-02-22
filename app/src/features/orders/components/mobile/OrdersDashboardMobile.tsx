import React, { useState } from 'react';
import {
    Search,
    Clock,
    ChevronRight,
    AlertCircle,
    Loader2,
    User,
    Laptop,
    Plus
} from 'lucide-react';

interface OrdersDashboardMobileProps {
    orders: any[];
    isLoading: boolean;
    terminology: any;
    navigate: any;
    onShowForm: () => void;
}

export const OrdersDashboardMobile: React.FC<OrdersDashboardMobileProps> = ({
    orders,
    isLoading,
    terminology,
    navigate,
    onShowForm
}) => {
    const { orderLabel, orderPlural, assetLabel } = terminology;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredOrders = orders?.filter((order: any) => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    }) || [];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'bg-blue-500 text-white';
            case 'IN_PROGRESS': return 'bg-amber-500 text-white';
            case 'COMPLETED': return 'bg-emerald-500 text-white';
            case 'CANCELLED': return 'bg-slate-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'Recibido';
            case 'IN_PROGRESS': return 'En Proceso';
            case 'COMPLETED': return 'Completado';
            case 'CANCELLED': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <div className="flex flex-col space-y-4 px-4 pb-20">
            {/* 1. Mobile Search & Quick Filters */}
            <div className="sticky top-[72px] z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm py-2 -mx-4 px-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={`Buscar ${orderPlural.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['ALL', 'RECEIVED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`
                                whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all min-h-[44px]
                                ${filterStatus === status
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}
                            `}
                        >
                            {status === 'ALL' ? 'Todos' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Order List (Cards) */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-primary-600" size={40} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Cargando...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <AlertCircle className="mx-auto text-slate-300 mb-2" size={40} />
                    <p className="text-xs text-slate-500">No hay órdenes para mostrar.</p>
                </div>
            ) : (
                <div className="space-y-3 pb-8">
                    {filteredOrders.map((order: any) => (
                        <div
                            key={order.id}
                            onClick={() => navigate(order.id)}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        {order.priority === 'URGENT' && (
                                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                Urgente
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 tracking-tight">#{order.orderNumber}</h3>
                                </div>
                                <ChevronRight className="text-slate-300" size={20} />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <User size={16} className="text-primary-500 mr-2" />
                                    {order.customer?.name}
                                </div>
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                                    <Laptop size={16} className="text-slate-400 mr-2" />
                                    {order.asset?.field1} {order.asset?.field2} ({order.asset?.field4})
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                                <div className="flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                                <div className="font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                                    Ver más
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Action Button for Mobile */}
            <button
                onClick={onShowForm}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 transition-all z-40 border-4 border-white dark:border-slate-950"
            >
                <Plus size={28} />
            </button>
        </div>
    );
};
