import React, { useState } from 'react';
import {
    LayoutList,
    LayoutGrid,
    Plus,
    Search,
    ChevronRight,
    Clock,
    AlertCircle,
    Loader2,
    Laptop,
    User
} from 'lucide-react';

interface OrdersDashboardDesktopProps {
    orders: any[];
    isLoading: boolean;
    terminology: any;
    navigate: any;
    onShowForm: () => void;
}

export const OrdersDashboardDesktop: React.FC<OrdersDashboardDesktopProps> = ({
    orders,
    isLoading,
    terminology,
    navigate,
    onShowForm
}) => {
    const { orderLabel, orderPlural, assetLabel } = terminology;
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = orders?.filter((order: any) => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.asset?.field1.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    }) || [];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'RECEIVED': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
            case 'CANCELLED': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Tablero de {orderPlural}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona y monitorea el estado de tus servicios activos.</p>
                </div>
                <button
                    onClick={onShowForm}
                    className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-6 rounded-2xl shadow-lg shadow-primary-600/20 transition-all flex items-center space-x-2 shrink-0"
                >
                    <Plus size={20} />
                    <span>Nueva {orderLabel}</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={`Buscar por número, cliente o ${assetLabel.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {['ALL', 'RECEIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`
                                whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold border transition-all
                                ${filterStatus === status
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-500/50'}
                            `}
                        >
                            {status === 'ALL' ? 'Todos' : getStatusLabel(status)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-400'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-400'}`}
                    >
                        <LayoutList size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="animate-spin text-primary-600" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Tablero...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <AlertCircle className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron {orderPlural.toLowerCase()} con estos criterios.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrders.map((order: any) => (
                        <div
                            key={order.id}
                            onClick={() => navigate(order.id)}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2 tracking-tight group-hover:text-primary-600 transition-colors">#{order.orderNumber}</h3>
                                </div>
                                <div className={`p-2 rounded-xl ${order.priority === 'URGENT' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'}`}>
                                    <AlertCircle size={20} />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 min-h-[40px]">
                                {order.description || 'Sin descripción técnica registrada.'}
                            </p>

                            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center text-xs">
                                    <User size={14} className="text-slate-400 mr-2" />
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{order.customer?.name}</span>
                                </div>
                                <div className="flex items-center text-xs">
                                    <Laptop size={14} className="text-slate-400 mr-2" />
                                    <span className="text-slate-500">{order.asset?.field1} {order.asset?.field2}</span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                        <Clock size={12} className="mr-1" />
                                        <span>Última actualización: {new Date(order.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <button className="text-primary-600 hover:text-primary-500 font-black text-xs uppercase tracking-widest flex items-center">
                                        Detalles <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Orden</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente / {assetLabel}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredOrders.map((order: any) => (
                                <tr
                                    key={order.id}
                                    onClick={() => navigate(order.id)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5 group-hover:text-primary-600 transition-colors tracking-tight">#{order.orderNumber}</p>
                                        <div className="flex items-center text-[10px] text-slate-400">
                                            <Clock size={10} className="mr-1" /> {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.customer?.name}</p>
                                        <p className="text-xs text-slate-500">{order.asset?.field1} {order.asset?.field2}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-primary-600">
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
