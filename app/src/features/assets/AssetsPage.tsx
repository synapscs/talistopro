import React, { useState } from 'react';
import { Loader2, Search, Edit, Car } from 'lucide-react';
import { Asset } from '../../types/api';
import { useAssets, useCustomers } from '../../hooks/useApi';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useAuthStore } from '../../stores/useAuthStore';
import { AssetDetail } from './AssetDetail';

export const AssetsPage: React.FC = () => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { assetLabel, assetPlural } = terminology;

    const [selected, setSelected] = useState<Asset | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [search, setSearch] = useState('');
    const { data: assets, isLoading } = useAssets(undefined, selectedCustomerId || undefined);
    const { data: customers } = useCustomers();

    const filteredAssets = (assets as Asset[] | undefined)?.filter((a: Asset) => {
        const searchLower = search.toLowerCase();
        return (
            a.field1?.toLowerCase().includes(searchLower) ||
            a.field2?.toLowerCase().includes(searchLower) ||
            a.customer?.name?.toLowerCase().includes(searchLower)
        );
    }) || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-slate-500 font-bold">Cargando {assetPlural.toLowerCase()}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">{assetPlural}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona los {assetPlural.toLowerCase()} de tus clientes.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Buscar ${assetPlural.toLowerCase()}...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente:</span>
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm outline-none font-medium"
                        >
                            <option value="">Todos</option>
                            {customers?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                <th className="px-6 py-4">{terminology.assetFields?.field1?.label ?? 'Campo 1'}</th>
                                <th className="px-6 py-4">{terminology.assetFields?.field2?.label ?? 'Campo 2'}</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Próxima Cita</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No se encontraron {assetPlural.toLowerCase()}.
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((a: Asset) => (
                                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{a.field1 || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{a.field2 || '-'}</p>
                                            {a.field3 && <p className="text-[10px] text-slate-400">{a.field3}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{a.customer?.name || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {a.nextAppointmentAt ? (
                                                <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                                                    {new Date(a.nextAppointmentAt).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => setSelected(a)}
                                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <AssetDetail asset={selected} onClose={() => setSelected(null)} />
                </div>
            )}
        </div>
    );
};
