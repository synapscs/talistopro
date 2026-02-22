import React, { useState } from 'react';
import { ChevronLeft, Info, Wrench, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomerCard } from '../shared/CustomerCard';
import { AssetCard } from '../shared/AssetCard';

interface MobileOrderViewProps {
    order: any;
    workflowConfig: any[];
}

export const MobileOrderView: React.FC<MobileOrderViewProps> = ({ order, workflowConfig }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'general' | 'services' | 'evidence'>('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Info },
        { id: 'services', label: 'Servicios', icon: Wrench },
        { id: 'evidence', label: 'Evidencia', icon: ImageIcon },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-24">
            {/* 1. Header & Hero Section */}
            <div className="bg-slate-900 dark:bg-slate-900 text-white p-6 pb-12 rounded-b-[40px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        className="p-2 bg-white/10 rounded-xl backdrop-blur-md"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-right">
                        <span className="px-3 py-1 rounded-lg bg-indigo-500 text-[10px] font-black uppercase tracking-widest">
                            {order.status}
                        </span>
                        <p className="text-xl font-black mt-1 tracking-tight">#{order.orderNumber}</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Equipo / Vehículo</p>
                    <h2 className="text-3xl font-black tracking-tighter mb-4">{order.asset?.field1} {order.asset?.field2}</h2>

                    <div className="flex space-x-2">
                        <div className="px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-xs font-bold">
                            {order.asset?.field4 || 'Sin placa'}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Tabs Navigation */}
            <div className="px-6 -mt-6 relative z-20">
                <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 flex justify-between">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center py-3 rounded-xl transition-all space-x-2 ${activeTab === tab.id
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span className="text-xs font-black uppercase tracking-tighter">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Tab Content */}
            <div className="p-6">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <CustomerCard customer={order.customer} />

                        <AssetCard asset={order.asset} />

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Descripción del Fallo</h4>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[32px] shadow-sm">
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                    "{order.description}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm italic">Espacio para Items y Checklist...</p>
                    </div>
                )}

                {activeTab === 'evidence' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
                            <ImageIcon className="w-12 h-12 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm italic">Galería de fotos de evidencia...</p>
                    </div>
                )}
            </div>

            {/* 4. Smart FAB */}
            <div className="fixed bottom-8 left-6 right-6">
                <button className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-indigo-500/20 flex items-center justify-center space-x-3 active:scale-95 transition-transform">
                    <CheckCircle2 size={20} />
                    <span>Iniciar Diagnóstico</span>
                </button>
            </div>
        </div>
    );
};
