import React, { useState } from 'react';
import { CreditCard, Printer, Save, DollarSign, Calculator, Receipt, Loader2, Search, FileText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useOrder, useOrders, useCreateInvoice, useCreatePayment, useInvoiceByOrder } from '../../hooks/useApi';
import { Order, OrderFull } from '../../types/api';
import { calculateTotal, formatCurrency, formatDecimal, parseDecimal } from '../../lib/finance';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';

export const InvoicingModule = () => {
    const { organization } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    const { data: order, isLoading: loadingOrder } = useOrder(orderId || '');
    const { data: allOrders } = useOrders();
    const { data: existingInvoice } = useInvoiceByOrder(orderId || '');

    const createInvoice = useCreateInvoice();
    const createPayment = useCreatePayment();

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CASH');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentReference, setPaymentReference] = useState('');

    const subtotal = order?.subtotal || 0;
    const total = order?.total || 0;
    const taxAmount = order?.taxAmount || 0;

    const financeConfig = {
        primaryCurrency: organization?.primaryCurrency || 'USD',
        secondaryCurrency: organization?.secondaryCurrency || null,
        exchangeRate: organization?.exchangeRate || 1,
        taxRate: (organization?.taxRate || 16) / 100,
    };

    const totals = calculateTotal(subtotal, financeConfig);
    const primaryCurrency = financeConfig.primaryCurrency || 'USD';

    const hasItems = order?.items && order.items.length > 0;

    const handleGenerateInvoice = () => {
        if (!orderId) return;
        createInvoice.mutate({ orderId });
    };

    const handleRegisterPayment = () => {
        if (!orderId || !paymentAmount) return;

        createPayment.mutate({
            orderId,
            amount: parseFloat(paymentAmount),
            currency: primaryCurrency,
            exchangeRate: financeConfig.exchangeRate,
            method: selectedPaymentMethod,
            reference: paymentReference || undefined,
        }, {
            onSuccess: () => {
                setPaymentAmount('');
                setPaymentReference('');
            }
        });
    };

    if (loadingOrder) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Receipt size={40} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Seleccionar Orden para Facturar</h2>
                    <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Debes elegir una orden de servicio procesada para generar su comprobante.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {(allOrders as Order[])?.filter((o) => o.status === 'DELIVERED' || o.status === 'READY').map((o) => (
                        <button
                            key={o.id}
                            onClick={() => setSearchParams({ orderId: o.id })}
                            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-left hover:border-primary-500 transition-all group"
                        >
                            <span className="block text-[9px] font-black text-primary-600 uppercase tracking-widest mb-1">{o.orderNumber}</span>
                            <span className="block font-black text-slate-900 dark:text-white uppercase text-xs">{o.customer?.name}</span>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[10px] font-bold text-slate-500">{format(new Date(o.createdAt), 'dd MMM yyyy')}</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(Number(o.total), primaryCurrency, organization?.country)}</span>
                            </div>
                        </button>
                    ))}
                    {(!allOrders || allOrders.length === 0) && (
                        <div className="col-span-2 py-12 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No hay órdenes listas para facturar</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Facturación</h1>
                    <p className="text-slate-500 dark:text-slate-400">Genera comprobantes para {order.orderNumber}.</p>
                </div>
                <div className="flex space-x-2">
                    {!existingInvoice && (
                        <button
                            onClick={handleGenerateInvoice}
                            disabled={!hasItems || createInvoice.isPending}
                            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg"
                        >
                            <FileText size={18} />
                            <span>{createInvoice.isPending ? 'Generando...' : 'Generar Factura'}</span>
                        </button>
                    )}
                    <button className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-bold text-sm">
                        <Printer size={18} />
                        <span>Imprimir</span>
                    </button>
                </div>
            </div>

            {!hasItems && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle size={20} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">La orden no tiene items</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Debes agregar productos o servicios a la orden antes de generar una factura.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {existingInvoice ? (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Calculator size={120} />
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Factura Generada</h2>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{existingInvoice.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500">Fecha de Emisión</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{format(new Date(existingInvoice.createdAt), 'dd MMM, yyyy')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-12 gap-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <div className="col-span-8">Descripción del Servicio / Producto</div>
                                    <div className="col-span-2 text-right">Cant.</div>
                                    <div className="col-span-2 text-right">Total {primaryCurrency}</div>
                                </div>

                                {order.items && order.items.length > 0 ? (order.items as any[]).map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300 py-2">
                                        <div className="col-span-8">
                                            <p className="font-bold text-slate-900 dark:text-white">{item.name || item.description}</p>
                                        </div>
                                        <div className="col-span-2 text-right">{item.quantity}</div>
                                        <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(Number(item.total), primaryCurrency, organization?.country)}</div>
                                    </div>
                                )) : null}
                            </div>

                            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="flex justify-end text-sm">
                                    <span className="text-slate-500 mr-8">Subtotal:</span>
                                    <span className="font-bold text-slate-900 dark:text-white w-32 text-right">{formatCurrency(subtotal, primaryCurrency, organization?.country)}</span>
                                </div>
                                <div className="flex justify-end text-sm">
                                    <span className="text-slate-500 mr-8">{organization?.taxName || 'IVA'} ({(financeConfig.taxRate * 100).toFixed(0)}%):</span>
                                    <span className="font-bold text-slate-900 dark:text-white w-32 text-right">{formatCurrency(taxAmount, primaryCurrency, organization?.country)}</span>
                                </div>
                                <div className="flex justify-end text-lg pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="font-black text-slate-900 dark:text-white mr-8 uppercase italic">Total {primaryCurrency}:</span>
                                    <span className="font-black text-primary-600 w-32 text-right">{formatCurrency(total, primaryCurrency, organization?.country)}</span>
                                </div>

                                {existingInvoice.totalSecondary && (
                                    <div className="flex justify-end text-md opacity-80">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-8 uppercase italic">Total {existingInvoice.currencySecondary}:</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 w-32 text-right">
                                            {formatCurrency(Number(existingInvoice.totalSecondary), existingInvoice.currencySecondary, organization?.country)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Calculator size={120} />
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em]">Vista Previa de Factura</h2>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">#PREVIEW-{order.orderNumber.replace('OS-', '')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500">Fecha de Emisión</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{format(new Date(), 'dd MMM, yyyy')}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-12 gap-4 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <div className="col-span-8">Descripción del Servicio / Producto</div>
                                    <div className="col-span-2 text-right">Cant.</div>
                                    <div className="col-span-2 text-right">Total {primaryCurrency}</div>
                                </div>

                                {order.items && order.items.length > 0 ? (order.items as any[]).map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300 py-2">
                                        <div className="col-span-8">
                                            <p className="font-bold text-slate-900 dark:text-white">{item.name || item.description}</p>
                                        </div>
                                        <div className="col-span-2 text-right">{item.quantity}</div>
                                        <div className="col-span-2 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(Number(item.total), primaryCurrency, organization?.country)}</div>
                                    </div>
                                )) : null}
                            </div>

                            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <div className="flex justify-end text-sm">
                                    <span className="text-slate-500 mr-8">Subtotal:</span>
                                    <span className="font-bold text-slate-900 dark:text-white w-32 text-right">{formatCurrency(subtotal, primaryCurrency, organization?.country)}</span>
                                </div>
                                <div className="flex justify-end text-sm">
                                    <span className="text-slate-500 mr-8">{organization?.taxName || 'IVA'} ({(financeConfig.taxRate * 100).toFixed(0)}%):</span>
                                    <span className="font-bold text-slate-900 dark:text-white w-32 text-right">{formatCurrency(taxAmount, primaryCurrency, organization?.country)}</span>
                                </div>
                                <div className="flex justify-end text-lg pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="font-black text-slate-900 dark:text-white mr-8 uppercase italic">Total {primaryCurrency}:</span>
                                    <span className="font-black text-primary-600 w-32 text-right">{formatCurrency(total, primaryCurrency, organization?.country)}</span>
                                </div>

                                {totals.totalLocal && (
                                    <div className="flex justify-end text-md opacity-80">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-8 uppercase italic">Total {financeConfig.secondaryCurrency}:</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 w-32 text-right">
                                            {formatCurrency(totals.totalLocal, financeConfig.secondaryCurrency as string, organization?.country)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <CreditCard size={18} className="mr-2 text-primary-600" /> Registrar Pago
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'CASH', label: 'Efectivo' },
                                    { value: 'CARD', label: 'Tarjeta' },
                                    { value: 'TRANSFER', label: 'Transferencia' },
                                    { value: 'ZELLE', label: 'Zelle' },
                                    { value: 'MOBILE_PAYMENT', label: 'Pago Móvil' },
                                    { value: 'OTHER', label: 'Otro' }
                                ].map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setSelectedPaymentMethod(m.value)}
                                        className={`p-3 border rounded-xl text-[10px] font-bold transition-all ${
                                            selectedPaymentMethod === m.value
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                                : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2 mt-4">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Monto Recibido ({primaryCurrency})</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={paymentAmount}
                                        onChange={(e) => {
                                            e.target.value = e.target.value.replace(/[^0-9,.]/g, '');
                                            setPaymentAmount(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            const val = parseDecimal(e.target.value);
                                            setPaymentAmount(formatDecimal(val));
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/50 font-mono"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Referencia (opcional)</label>
                                <input
                                    type="text"
                                    value={paymentReference}
                                    onChange={(e) => setPaymentReference(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/50"
                                    placeholder="Número de referencia"
                                />
                            </div>

                            <button
                                onClick={handleRegisterPayment}
                                disabled={!paymentAmount || createPayment.isPending}
                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
                            >
                                <Receipt size={18} />
                                <span>{createPayment.isPending ? 'Registrando...' : 'Registrar Pago'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};