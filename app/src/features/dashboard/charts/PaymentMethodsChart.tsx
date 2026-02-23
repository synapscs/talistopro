import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type PaymentMethodData = { method: string; count: number; total: number };

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const METHOD_LABELS: Record<string, string> = {
    'CASH': 'Efectivo',
    'CARD': 'Tarjeta',
    'TRANSFER': 'Transferencia',
    'ZELLE': 'Zelle',
    'MOBILE_PAYMENT': 'Pago Móvil',
    'OTHER': 'Otro'
};

export const PaymentMethodsChart: React.FC<{ data: PaymentMethodData[] }> = ({ data }) => {
    const chartData = data.map(item => ({
        name: METHOD_LABELS[item.method] || item.method,
        value: item.total
    }));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Pagos por Método</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monto']} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};