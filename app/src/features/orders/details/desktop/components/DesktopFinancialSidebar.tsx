import React, { useState } from 'react';
import { DollarSign, CreditCard, Plus, Receipt } from 'lucide-react';
import { useOrderActions } from '../../hooks/useOrderActions';
import { formatDecimal } from '../../../../../lib/finance';
import { OrderFull } from '../../../../../types/api';
import { useAuthStore } from '../../../../../stores/useAuthStore';

interface DesktopFinancialSidebarProps {
    order: OrderFull;
}

export const DesktopFinancialSidebar = ({ order }: DesktopFinancialSidebarProps) => {
    const { addPayment } = useOrderActions();
    const { organization } = useAuthStore();
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');

    const handleAddPayment = () => {
        if (!amount) return;
        addPayment.mutate({
            orderId: order.id,
            amount: parseFloat(amount),
            currency: organization?.primaryCurrency || 'USD',
            exchangeRate: organization?.exchangeRate ? Number(organization.exchangeRate) : undefined,
            method,
            reference: reference || undefined,
            notes: notes || undefined
        }, {
            onSuccess: () => {
                setIsAddingPayment(false);
                setAmount('');
                setReference('');
                setNotes('');
            }
        });
    };

    const payments = order.payments || [];
    const totalPaid = (payments as any[]).reduce((sum: number, p) => sum + Number(p.amountUsd), 0);
    const balance = Number(order.total) - totalPaid;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-8">

            {/* Totals Summary */}
            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <DollarSign size={14} className="mr-2" />
                    Resumen Financiero
                </h3>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatDecimal(Number(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Impuestos</span>
                        <span className="font-mono">{formatDecimal(Number(order.taxAmount))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>Descuento</span>
                        <span className="font-mono text-red-500">-{formatDecimal(Number(order.discountAmount))}</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
                    <div className="flex justify-between text-xl font-black text-slate-900 dark:text-white">
                        <span>Total</span>
                        <span>${formatDecimal(Number(order.total))}</span>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            <div className={`p-4 rounded-xl border ${balance <= 0 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
                <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-black uppercase tracking-widest ${balance <= 0 ? 'text-green-600 dark:text-green-500' : 'text-amber-600 dark:text-amber-500'}`}>
                        {balance <= 0 ? 'PAGADO' : 'PENDIENTE'}
                    </span>
                    {balance > 0 && (
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                            ${formatDecimal(balance)}
                        </span>
                    )}
                </div>
                {balance > 0 && <div className="text-[10px] text-amber-500 dark:text-amber-400/70 font-medium">Restante por cobrar</div>}
            </div>

            {/* Payments List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                        <Receipt size={14} className="mr-2" />
                        Historial de Pagos
                    </h3>
                    <button
                        onClick={() => setIsAddingPayment(!isAddingPayment)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    >
                        <Plus size={16} className="text-indigo-500" />
                    </button>
                </div>

                {isAddingPayment && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <input
                            type="number"
                            placeholder="Monto"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value="CASH">Efectivo ($)</option>
                            <option value="CARD">Tarjeta / Punto</option>
                            <option value="TRANSFER">Transferencia</option>
                            <option value="ZELLE">Zelle</option>
                            <option value="MOBILE_PAYMENT">Pago Móvil</option>
                            <option value="OTHER">Otro</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Referencia (opcional)"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <input
                            type="text"
                            placeholder="Notas (opcional)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <button
                            onClick={handleAddPayment}
                            disabled={addPayment.isPending}
                            className="w-full bg-indigo-600 text-white text-xs font-bold py-2 rounded-md hover:bg-indigo-500 transition-colors"
                        >
                            {addPayment.isPending ? 'Registrando...' : 'Registrar Pago'}
                        </button>
                    </div>
                )}

                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {payments.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                            <div className="flex items-center space-x-3">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                    <CreditCard size={12} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                                        {payment.method === 'CASH' ? 'Efectivo' :
                                         payment.method === 'CARD' ? 'Tarjeta' :
                                         payment.method === 'TRANSFER' ? 'Transferencia' :
                                         payment.method === 'ZELLE' ? 'Zelle' :
                                         payment.method === 'MOBILE_PAYMENT' ? 'Pago Móvil' : 'Otro'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                ${formatDecimal(Number(payment.amountUsd))}
                            </span>
                        </div>
                    ))}
                    {payments.length === 0 && !isAddingPayment && (
                        <p className="text-center text-[10px] text-slate-400 italic py-2">No hay pagos registrados</p>
                    )}
                </div>
            </div>
        </div>
    );
};
