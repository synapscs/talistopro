import React from 'react';
import { CreditCard, Trash2, Edit2 } from 'lucide-react';
import { useDeletePayment } from '../../../../hooks/useApi';
import { formatDecimal } from '../../../../lib/finance';
import { Payment } from '../../../../types/api';

interface PaymentHistoryProps {
    payments: Payment[];
}

export const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
    const deletePayment = useDeletePayment();

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este pago?')) {
            deletePayment.mutate(id);
        }
    };

    const getMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            'CASH': 'Efectivo',
            'CARD': 'Tarjeta',
            'TRANSFER': 'Transferencia',
            'ZELLE': 'Zelle',
            'MOBILE_PAYMENT': 'Pago Móvil',
            'OTHER': 'Otro'
        };
        return labels[method] || method;
    };

    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={20} className="text-slate-400" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay pagos registrados</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {payments.map((payment) => (
                <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                            <CreditCard size={14} className="text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {getMethodLabel(payment.method)}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                {new Date(payment.createdAt).toLocaleDateString('es-VE', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <span className="block text-sm font-bold text-slate-900 dark:text-white">
                                ${formatDecimal(Number(payment.amountUsd))}
                            </span>
                            {payment.currency !== 'USD' && payment.amountUsd !== payment.amount && (
                                <span className="text-[10px] text-slate-500">
                                    {formatDecimal(Number(payment.amount))} {payment.currency}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(payment.id)}
                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} className="text-red-500" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};