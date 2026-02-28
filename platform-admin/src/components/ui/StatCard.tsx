import { ReactNode } from 'react';

interface Props {
  title: string;
  value: ReactNode;
  icon: string;
  color?: 'indigo' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

export default function StatCard({ title, value, icon, color = 'indigo' }: Props) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}