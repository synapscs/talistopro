import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

type DataItem = { status: string; count: number };

const COLORS: Record<string, string> = {
  RECEIVED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

export const OrdersByStatusChart: React.FC<{ data: DataItem[] }> = ({ data }) => {
  const chartData = data?.map((d) => ({ name: d.status, value: d.count })) ?? [];
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-bold mb-2">Órdenes por estado</h3>
      <PieChart width={280} height={240}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label
        />
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#93c5fd'} />
        ))}
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};
