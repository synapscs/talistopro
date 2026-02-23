import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { InvoicingModule as CreateInvoice } from './InvoicingModule';
import { InvoiceList } from './components/InvoiceList';

type TabType = 'list' | 'create';

export const BillingModule = () => {
    const [activeTab, setActiveTab] = useState<TabType>('list');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Facturación</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona facturas y pagos.</p>
                </div>

                <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            activeTab === 'list'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <FileText size={18} />
                        <span>Facturas</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                            activeTab === 'create'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Plus size={18} />
                        <span>Generar Factura</span>
                    </button>
                </div>
            </div>

            {activeTab === 'list' && <InvoiceList />}
            {activeTab === 'create' && <CreateInvoice />}
        </div>
    );
};