import React from 'react';
import { Package, Wrench, Hash } from 'lucide-react';
import { formatCurrency } from '../../../../lib/finance';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../../lib/terminology';

interface OrderItemsTableProps {
    items: any[];
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items }) => {
    const { organization } = useAuthStore();
    const country = organization?.country || 'VE';
    const currency = organization?.primaryCurrency || 'USD';

    const term = getEffectiveTerminology(
        organization?.businessType || 'OTHER',
        organization?.customTerminology as any
    );

    if (!items || items.length === 0) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                    <Package className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 font-medium italic">No hay servicios o {term.partPlural.toLowerCase()} registrados aún.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-[32px] bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción del Item</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Cant.</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Precio Unit.</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-5">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-xl border ${item.type === 'service' || item.type === 'SERVICE'
                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-500'
                                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-500'
                                        }`}>
                                        {item.type === 'service' || item.type === 'SERVICE' ? <Wrench size={16} /> : <Package size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-0.5">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
                                            {item.type === 'service' || item.type === 'SERVICE' ? 'Mano de Obra / Servicio' : `${term.partLabel} / Producto`}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black font-mono">
                                    <Hash size={10} className="mr-1 opacity-50" /> {item.quantity}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-right font-mono text-xs text-slate-500 dark:text-slate-400">
                                {formatCurrency(Number(item.price), currency, country)}
                            </td>
                            <td className="px-6 py-5 text-right font-black font-mono text-sm text-slate-900 dark:text-white">
                                {formatCurrency(Number(item.price) * item.quantity, currency, country)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
