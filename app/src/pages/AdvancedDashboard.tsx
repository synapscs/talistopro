import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    CreditCard,
    Users,
    FileText,
    Calendar,
    BarChart3,
    Download,
    LayoutDashboard,
    ArrowLeft
} from 'lucide-react';
import { useFinancialMetrics, useTopServices, useTopCustomers } from '../hooks/useApi';
import { formatCurrency } from '../lib/finance';
import { useAuthStore } from '../stores/useAuthStore';
import { RevenueTrendChart } from '../features/dashboard/charts/RevenueTrendChart';
import { PaymentMethodsChart } from '../features/dashboard/charts/PaymentMethodsChart';
import { RevenueByServiceChart } from '../features/dashboard/charts/RevenueByServiceChart';
import { TopServicesChart } from '../features/dashboard/charts/TopServicesChart';

type PeriodType = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const FinancialCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className={color.replace('bg-', 'text-')} size={20} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    trend >= 0 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-500' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-500'
                }`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</h3>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
);

const TopCustomerRow = ({ customer, index }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                {index + 1}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.customerName}</p>
                <p className="text-xs text-slate-500">{customer.orderCount} órdenes</p>
            </div>
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
            {formatCurrency(customer.totalSpent, 'USD', 'US')}
        </p>
    </div>
);

export const AdvancedDashboard = () => {
    const navigate = useNavigate();
    const { organization } = useAuthStore();
    const [period, setPeriod] = useState<PeriodType>('month');

    const { data: metrics, isLoading: loadingMetrics } = useFinancialMetrics(
        period !== 'custom' ? { period } : undefined
    );
    const { data: topServices } = useTopServices();
    const { data: topCustomers } = useTopCustomers();

    if (loadingMetrics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const { summary, invoices, revenueByService, paymentMethods, monthlyRevenue } = metrics || {};

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Financiero</h1>
                    <p className="text-slate-500 dark:text-slate-400">Métricas financieras y reportes</p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-bold text-sm transition-all"
                    >
                        <ArrowLeft size={16} />
                        <span>Dashboard Básico</span>
                    </button>
                </div>

                {/* Period Filter */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {([
                        { value: 'today', label: 'Hoy' },
                        { value: 'week', label: 'Semana' },
                        { value: 'month', label: 'Mes' },
                        { value: 'quarter', label: 'Trimestre' },
                        { value: 'year', label: 'Año' }
                    ] as const).map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setPeriod(option.value as PeriodType)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                period === option.value
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard
                    icon={DollarSign}
                    label="Ingresos Totales"
                    value={formatCurrency(summary?.totalRevenue || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                    color="bg-emerald-500"
                />
                <FinancialCard
                    icon={TrendingDown}
                    label="Gastos Totales"
                    value={formatCurrency(summary?.totalExpenses || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                    color="bg-red-500"
                />
                <FinancialCard
                    icon={BarChart3}
                    label="Utilidad"
                    value={formatCurrency(summary?.profit || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                    color="bg-blue-500"
                    trend={summary?.profitMargin || 0}
                />
                <FinancialCard
                    icon={FileText}
                    label="Facturas Emitidas"
                    value={summary?.totalInvoices || 0}
                    color="bg-purple-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ingresos Mensuales</h3>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <Download size={16} className="text-slate-500" />
                        </button>
                    </div>
                    <div className="h-[260px]">
                        <RevenueTrendChart
                            data={(monthlyRevenue || []).map((item: any) => ({
                                date: item.month,
                                total: item.total
                            }))}
                        />
                    </div>
                </div>

                {/* Revenue by Service Type */}
                <RevenueByServiceChart data={revenueByService || []} />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Methods */}
                <PaymentMethodsChart data={paymentMethods || []} />

                {/* Order Metrics */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Métricas de Órdenes</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Receipt size={16} className="text-slate-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Completadas</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{summary?.completedOrders || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Users size={16} className="text-slate-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Pendientes</span>
                            </div>
                            <span className="text-sm font-bold text-amber-600">{summary?.pendingOrders || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-slate-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Valor Promedio</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {formatCurrency(summary?.averageOrderValue || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Invoices Status */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Estado de Facturas</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Cobradas</span>
                            <span className="text-sm font-bold text-emerald-600">
                                {formatCurrency(invoices?.paid || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Pendientes</span>
                            <span className="text-sm font-bold text-amber-600">
                                {formatCurrency(invoices?.pending || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Parciales</span>
                            <span className="text-sm font-bold text-blue-600">
                                {formatCurrency(invoices?.partial || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Por Cobrar</span>
                            <span className="text-sm font-bold text-red-600">
                                {formatCurrency(invoices?.outstanding || 0, organization?.primaryCurrency || 'USD', organization?.country)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <TopServicesChart data={topServices || []} />

                {/* Top Customers */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Clientes</h3>
                        <button className="text-xs font-medium text-primary-600 hover:text-primary-700">Ver todos</button>
                    </div>
                    <div className="space-y-1">
                        {(topCustomers || []).slice(0, 5).map((customer: any, index: number) => (
                            <TopCustomerRow key={customer.customerId} customer={customer} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};