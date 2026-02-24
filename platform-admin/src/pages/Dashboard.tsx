import { Building2, Users, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';

const mockOrganizations = [
    {
        id: '1',
        name: 'Taller Central - Mecánica Valentina',
        slug: 'taller-central-mecanica-valencia',
        businessType: 'AUTOMOTIVE',
        country: 'VE',
        plan: { name: 'Pro' },
        subscriptionStatus: 'active',
        stats: { members: 3, orders: 25, revenue: 1125.00, activeOrders: 18 },
    },
    {
        id: '2',
        name: 'Mecánica Express',
        slug: 'mecanica-express',
        businessType: 'AUTOMOTIVE',
        country: 'MX',
        plan: { name: 'Básico' },
        subscriptionStatus: 'active',
        stats: { members: 8, orders: 67, revenue: 3420.00, activeOrders: 42 },
    },
];

const mockStats = {
    totalOrganizations: 3,
    totalUsers: 12,
    activeSubscriptions: 3,
    totalRevenue: 4545.00,
    activeOrders: 60,
    churnRate: 2.1,
};

export function Dashboard() {
    const { user } = useAuthStore();

    const { data: stats } = useQuery({
        queryKey: ['platform-stats'],
        queryFn: async () => {
            return new Promise(resolve => setTimeout(() => resolve(mockStats), 500));
        },
    });

    const { data: organizations } = useQuery({
        queryKey: ['platform-organizations'],
        queryFn: async () => {
            return new Promise(resolve => setTimeout(() => resolve(mockOrganizations), 500));
        },
    });

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        Bienvenido, <span className="font-semibold text-indigo-600">{user?.name || 'Admin'}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Building2} label="Organizaciones" value={stats?.totalOrganizations || 0} color="bg-blue-500" />
                    <StatCard icon={Users} label="Usuarios" value={stats?.totalUsers || 0} color="bg-purple-500" />
                    <StatCard icon={BarChart3} label="Ingresos" value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`} color="bg-green-500" />
                    <StatCard icon={Activity} label="Órdenes Activas" value={stats?.activeOrders || 0} color="bg-amber-500" />
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Organizaciones</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-slate-200">
                                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Usuarios</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Órdenes</th>
                                    <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Ingresos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(organizations || []).map((org: any) => (
                                    <tr key={org.id} className="border-b border-slate-100">
                                        <td className="py-3 text-sm font-medium text-slate-900">{org.name}</td>
                                        <td className="py-3 text-sm text-slate-600">{org.plan?.name || 'N/A'}</td>
                                        <td className="py-3 text-sm text-slate-600">{org.stats?.members || 0}</td>
                                        <td className="py-3 text-sm text-slate-600">{org.stats?.orders || 0}</td>
                                        <td className="py-3 text-sm text-slate-600">${org.stats?.revenue?.toLocaleString() || '0'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </div>
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
