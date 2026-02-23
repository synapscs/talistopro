import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type RevenueByServiceData = { type: string; total: number };

const TYPE_LABELS: Record<string, string> = {
    'product': 'Productos',
    'service': 'Servicios'
};

const COLORS = {
    'product': '#6366F1',
    'service': '#10B981'
};

export const RevenueByServiceChart: React.FC<{ data: RevenueByServiceData[] }> = ({ data }) => {
    const chartData = data.map(item => ({
        name: TYPE_LABELS[item.type] || item.type,
        total: item.total
    }));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Ingresos por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B' }} />
                    <YAxis tick={{ fill: '#64748B' }} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingreso']}
                        contentStyle={{
                            backgroundColor: '#1E293B',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#F8FAFC'
                        }}
                    />
                    <Bar dataKey="total" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};