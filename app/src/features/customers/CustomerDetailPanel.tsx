import React, { useState } from 'react';
import { X, Mail, MapPin, MessageSquare, Plus, Package, ChevronRight, User, ShieldCheck, Edit } from 'lucide-react';
import { useAssets } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { CustomerWhatsAppModal } from './CustomerWhatsAppModal';

interface CustomerDetailPanelProps {
    customer: any;
    onClose: () => void;
    onAddAsset: () => void;
    onEditAsset: (asset: any) => void;
    onCreateOrder: () => void;
}

export const CustomerDetailPanel = ({ customer, onClose, onAddAsset, onEditAsset, onCreateOrder }: CustomerDetailPanelProps) => {
    const { organization } = useAuthStore();
    const { data: assets, isLoading } = useAssets(undefined, customer.id);
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { assetLabel, assetPlural } = terminology;

    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

    return (
        <>
            <div className="h-full bg-white dark:bg-slate-950 flex flex-col shadow-2xl border-l border-slate-300/40 dark:border-slate-800 animate-in slide-in-from-right duration-300 w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-slate-300/30 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Detalles del Cliente</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master ID: {customer.id.substring(0, 8)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Profile Section */}
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-3xl uppercase mx-auto shadow-xl">
                            {customer.name.substring(0, 2)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{customer.name}</h1>
                            <div className="flex items-center justify-center space-x-2 mt-1">
                                {customer.documentNumber && (
                                    <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-300/50 dark:border-slate-700 uppercase tracking-widest">
                                        {customer.documentType || 'DNI'}: {customer.documentNumber}
                                    </span>
                                )}
                                <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                    <ShieldCheck size={10} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-600">Verificado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => setShowWhatsAppModal(true)}
                            className="flex items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 rounded-2xl hover:border-emerald-500/30 hover:shadow-lg transition-all group"
                        >
                            <MessageSquare size={20} className="text-emerald-600 mr-3 group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">WhatsApp</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{customer.whatsapp || customer.phone}</span>
                            </div>
                        </button>
                    </div>

                    {/* More Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Ubicación y Datos</h3>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-4"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="text-primary-500 shrink-0" size={16} />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dirección Principal</p>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed mt-0.5">
                                        {customer.address || 'No registrada'}
                                        <br />
                                        <span className="text-slate-500">{customer.city ? `${customer.city}, ${customer.state}` : ''}</span>
                                    </p>
                                </div>
                            </div>
                            {customer.email && (
                                <div className="flex items-start space-x-3">
                                    <Mail className="text-indigo-500 shrink-0" size={16} />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Corporativo</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{customer.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assets Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{assetPlural} Registrados</h3>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-4"></div>
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Plus size={24} className="animate-spin text-slate-300" />
                                </div>
                            ) : assets?.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <Package size={32} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sin {assetPlural.toLowerCase()}</p>
                                    <button
                                        onClick={onAddAsset}
                                        className="mt-4 text-[10px] font-black text-primary-600 uppercase tracking-tighter hover:underline"
                                    >
                                        + Registrar Primero
                                    </button>
                                </div>
                            ) : (
                                assets?.map((asset: any) => (
                                    <div key={asset.id} className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-300/40 dark:border-slate-800 rounded-2xl hover:border-primary-500/30 hover:shadow-md transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{asset.field1} {asset.field2}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{asset.field3 || 'Sin Identificador'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onEditAsset(asset)}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-primary-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            )}

                            <button
                                onClick={onAddAsset}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary-600 hover:border-primary-500/30 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest"
                            >
                                <Plus size={16} />
                                <span>Agregar {assetLabel}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 backdrop-blur-md">
                    <button
                        onClick={onCreateOrder}
                        className="w-full flex items-center justify-center space-x-3 bg-primary-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.1em] text-xs hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/10 group active:scale-[0.98]"
                    >
                        <Plus size={18} />
                        <span>Crear Nueva Orden</span>
                        <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {showWhatsAppModal && (
                <CustomerWhatsAppModal
                    customer={customer}
                    organizationName={organization?.name}
                    onClose={() => setShowWhatsAppModal(false)}
                />
            )}
        </>
    );
};
