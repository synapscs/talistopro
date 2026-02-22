import React from 'react';
import { CreditCard, Receipt, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, formatDecimal } from '../../../../lib/finance';
import { useAuthStore } from '../../../../stores/useAuthStore';

interface OrderTotalsWidgetProps {
    order: any;
}

export const OrderTotalsWidget: React.FC<OrderTotalsWidgetProps> = ({ order }) => {
    const { organization } = useAuthStore();
    const country = organization?.country || 'VE';
    const currency = organization?.primaryCurrency || 'USD';

    const getPaymentStatusStyles = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PARTIAL': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'PENDING': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID': return 'Pagado';
            case 'PARTIAL': return 'Abono Parcial';
            case 'PENDING': return 'Pendiente de Pago';
            default: return status;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden transition-all">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Resumen de Cuenta</p>
                <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                    <Receipt size={16} className="text-slate-400" />
                </div>
            </div>

            <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-center group">
                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Subtotal</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
                        {formatCurrency(Number(order.subtotal), currency, country)}
                    </span>
                </div>

                <div className="flex justify-between items-center group">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Impuestos</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 font-bold border border-slate-200 dark:border-white/5">16%</span>
                    </div>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
                        {formatCurrency(Number(order.taxAmount), currency, country)}
                    </span>
                </div>

                {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 group">
                        <div className="flex items-center">
                            <TrendingDown size={14} className="mr-2" />
                            <span className="text-sm font-medium">Descuento Especial</span>
                        </div>
                        <span className="font-bold font-mono">
                            -{formatCurrency(Number(order.discountAmount), currency, country)}
                        </span>
                    </div>
                )}

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">Monto Total</p>
                        <p className="text-3xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                            {formatCurrency(Number(order.total), currency, country)}
                        </p>
                    </div>
                    <div className="pb-1">
                        <DollarSign size={24} className="text-slate-200 dark:text-white/10" />
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${getPaymentStatusStyles(order.paymentStatus)} shadow-lg shadow-current/5`}>
                    <div className="flex items-center space-x-3">
                        <CreditCard size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                    </div>
                    <p className="text-xs font-mono font-black">
                        {order.amountPaid ? formatDecimal(Number(order.amountPaid)) : '0,00'}
                    </p>
                </div>
            </div>
        </div>
    );
};
