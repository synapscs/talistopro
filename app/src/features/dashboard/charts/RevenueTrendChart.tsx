import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type RevenuePoint = { date: string; total: number };

export const RevenueTrendChart: React.FC<{ data: RevenuePoint[] }> = ({ data }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-bold mb-2">Ingresos (7 días)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} />
          <YAxis tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(value: any) => [`$${value}`, 'Ingreso']} />
          <Line type="monotone" dataKey="total" stroke="#3b82f6" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
