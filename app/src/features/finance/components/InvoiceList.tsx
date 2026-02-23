import React, { useState } from 'react';
import { FileText, Search, Calendar, User, MoreVertical, Eye, Printer } from 'lucide-react';
import { useInvoices, useDeleteInvoice } from '../../../hooks/useApi';
import { format } from 'date-fns';
import { formatCurrency } from '../../../lib/finance';
import { Invoice } from '../../../types/api';
import { useAuthStore } from '../../../stores/useAuthStore';

export const InvoiceList = () => {
    const { organization } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: invoices, isLoading } = useInvoices(
        statusFilter !== 'all' ? { status: statusFilter } : undefined
    );
    const deleteInvoice = useDeleteInvoice();

    const filteredInvoices = invoices?.filter((invoice: Invoice) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
            invoice.customerName.toLowerCase().includes(searchLower)
        );
    }) || [];

    const handleDelete = (id: string, invoiceNumber: string) => {
        if (window.confirm(`¿Estás seguro de eliminar la factura ${invoiceNumber}?`)) {
            deleteInvoice.mutate(id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'PARTIAL':
                return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            case 'REFUNDED':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'Pagada';
            case 'PARTIAL':
                return 'Parcial';
            case 'REFUNDED':
                return 'Reembolsada';
            default:
                return 'Pendiente';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por número o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                    <option value="all">Todos los estados</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="PARTIAL">Parciales</option>
                    <option value="PAID">Pagadas</option>
                    <option value="REFUNDED">Reembolsadas</option>
                </select>
            </div>

            {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {searchTerm ? 'No se encontraron facturas' : 'No hay facturas registradas'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        Número
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredInvoices.map((invoice: Invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                                    {invoice.customerName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span>{format(new Date(invoice.createdAt), 'dd MMM yyyy')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getStatusColor(invoice.status)}`}>
                                                {getStatusLabel(invoice.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(Number(invoice.totalPrimary), invoice.currencyPrimary, organization?.country)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    title="Ver detalle"
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <Eye size={14} className="text-slate-500" />
                                                </button>
                                                <button
                                                    title="Imprimir"
                                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                >
                                                    <Printer size={14} className="text-slate-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id, invoice.invoiceNumber)}
                                                    title="Eliminar"
                                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={14} className="text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};