import React, { useState } from 'react';
import {
    Users,
    ClipboardList,
    TrendingUp,
    AlertCircle,
    Clock,
    Loader2,
    BarChart3,
    LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { getEffectiveTerminology } from '../lib/terminology';
import { useOrders, useDashboardStats, useProducts } from '../hooks/useApi';
import { StatCardProps, Order, Product } from '../types/api';
import { AdvancedDashboard } from './AdvancedDashboard';

const StatCard = ({ icon: Icon, label, value, trend, color }: StatCardProps) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            {trend && (
                <span className="text-xs font-medium text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</h3>
        <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">{value}</span>
    </div>
);

export const Dashboard = () => {
    const { organization } = useAuthStore();
    const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { orderPlural, partPlural, assetLabel } = terminology;

    // Data Fetching (Aislamiento de seguridad manejado por el servidor)
    const { data: stats, isLoading: loadingStats } = useDashboardStats();
    const { data: orders, isLoading: loadingOrders } = useOrders();
    const { data: products } = useProducts();

    const activeOrders = (orders as Order[])?.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') || [];
    const lowStockAlerts = (products as Product[])?.filter((p) => p.stock <= p.minStock) || [];

    if (loadingStats || loadingOrders) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-slate-500 font-bold">Resumiendo actividad...</p>
            </div>
        );
    }

    if (viewMode === 'advanced') {
        return <AdvancedDashboard />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hola, Admin 👋</h1>
                    <p className="text-slate-500 dark:text-slate-400">Aquí tienes el resumen de hoy en {organization?.name || 'Tu Taller'}.</p>
                </div>
                <button
                    onClick={() => setViewMode('advanced')}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all"
                >
                    <BarChart3 size={16} />
                    <span>Dashboard Avanzado</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Clientes Totales"
                    value={stats?.totalCustomers || 0}
                    trend={stats?.totalCustomers > 0 ? "+1" : undefined}
                    color="bg-indigo-500"
                />
                <StatCard
                    icon={ClipboardList}
                    label={`${orderPlural} Activas`}
                    value={stats?.activeOrders || 0}
                    color="bg-primary-500"
                />
                <StatCard
                    icon={Clock}
                    label="Citas para Hoy"
                    value={stats?.appointmentsToday || 0}
                    color="bg-amber-500"
                />
                <StatCard
                    icon={TrendingUp}
                    label={`Ventas Totales (${organization?.primaryCurrency || 'USD'})`}
                    value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                    color="bg-emerald-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Últimas {orderPlural}</h2>
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Ver todas</button>
                    </div>
                    <div className="space-y-4">
                        {activeOrders.length === 0 ? (
                            <p className="text-center py-8 text-slate-500">No hay órdenes activas hoy.</p>
                        ) : activeOrders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                        {order.orderNumber.substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{order.orderNumber}</p>
                                        <p className="text-xs text-slate-500">{order.description || 'Sin descripción'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                        {order.status || 'PENDIENTE'}
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">Hoy</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Alertas de Inventario</h2>
                    <div className="space-y-4">
                        {lowStockAlerts.length === 0 ? (
                            <p className="text-center py-4 text-slate-500 text-sm">Todo en orden con el stock.</p>
                        ) : lowStockAlerts.slice(0, 4).map((item) => (
                            <div key={item.id} className={`flex items-start space-x-3 ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">{item.name} ({item.stock === 0 ? 'Sin Stock' : 'Bajo'})</p>
                                    <p className="text-xs text-slate-500">Quedan {item.stock} unidades.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Gestionar Stock
                    </button>
                </div>
            </div>
        </div>
    );
};
