import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TopServiceData = { name: string; count: number; total: number };

export const TopServicesChart: React.FC<{ data: TopServiceData[] }> = ({ data }) => {
    const chartData = data.slice(0, 5).map(item => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        count: item.count,
        total: item.total
    }));

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Top 5 Servicios</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fill: '#64748B' }} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <Tooltip
                        formatter={(value: number, name: string) => [
                            name === 'total' ? `$${value.toFixed(2)}` : value,
                            name === 'total' ? 'Ingreso Total' : 'Órdenes'
                        ]}
                        contentStyle={{
                            backgroundColor: '#1E293B',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#F8FAFC'
                        }}
                    />
                    <Bar dataKey="total" fill="#10B981" radius={[0, 8, 8, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};