import React, { useState } from 'react';
import { ClipboardList, Image as ImageIcon, Info, ChevronLeft, MoreVertical, ArrowRight, StickyNote, Save, Loader2, Camera, Trash2, Plus, Wrench, History } from 'lucide-react';
import { MobileChecklist } from './components/MobileChecklist';
import { MobilePhotoGrid } from './components/MobilePhotoGrid';
import { OrderFull } from '../../../../types/api';
import { useUpdateOrder, usePresignUpload } from '../../../../hooks/useApi';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../../lib/terminology';
import { DesktopAuditLog } from '../desktop/components/DesktopAuditLog';

interface OrderDetailsMobileProps {
    order: OrderFull;
    workflowConfig: any[];
    auditLogs: any[];
}

export const OrderDetailsMobile = ({ order, workflowConfig, auditLogs }: OrderDetailsMobileProps) => {
    const [activeTab, setActiveTab] = useState<'info' | 'checklist' | 'photos' | 'history'>('info');
    const updateOrder = useUpdateOrder();
    const presignUpload = usePresignUpload();
    const { organization } = useAuthStore();

    const term = getEffectiveTerminology(
        organization?.businessType || 'OTHER',
        organization?.customTerminology as any
    );

    const [notes, setNotes] = useState(order.internalNotes || '');
    const [diagnosis, setDiagnosis] = useState(order.diagnosis || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false);

    const sortedStages = [...workflowConfig].sort((a, b) => a.order - b.order);
    const currentStage = workflowConfig.find(s => s.id === order.currentStageId);

    const handleAdvanceStage = () => {
        const currentIndex = sortedStages.findIndex(s => s.id === order.currentStageId);

        if (currentIndex < sortedStages.length - 1) {
            const nextStage = sortedStages[currentIndex + 1];
            updateOrder.mutate({
                id: order.id,
                currentStageId: nextStage.id
            }, {
                onSuccess: () => console.log(`Avanzado a: ${nextStage.name}`),
                onError: () => console.error('Error al avanzar')
            });
        }
    };

    const handleSaveNotes = () => {
        setIsSavingNotes(true);
        updateOrder.mutate({
            id: order.id,
            internalNotes: notes
        }, {
            onSuccess: () => setIsSavingNotes(false),
            onError: () => setIsSavingNotes(false)
        });
    };

    const handleSaveDiagnosis = () => {
        setIsSavingDiagnosis(true);
        updateOrder.mutate({
            id: order.id,
            diagnosis: diagnosis
        }, {
            onSuccess: () => setIsSavingDiagnosis(false),
            onError: () => setIsSavingDiagnosis(false)
        });
    };

    // Safe accessors
    const checklistItems = Array.isArray(order.checklist) ? order.checklist : [];
    const photoUrls = Array.isArray(order.photos) ? order.photos : [];

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 pb-safe">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex justify-between items-center transition-all">
                <button className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                        {order.orderNumber || `${term.orderLabel.toUpperCase()} SIN #`}
                    </h1>
                    <span className="text-[10px] uppercase font-bold text-primary-600 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-full">
                        {currentStage?.name || order.status || 'Recibido'}
                    </span>
                </div>
                <button className="p-2 -mr-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <MoreVertical size={24} />
                </button>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-32">
                {activeTab === 'info' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Vehicle/Asset Card */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                    {order.asset?.field1} {order.asset?.field2}
                                </h2>
                                <span className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md font-bold">
                                    {order.asset?.field4 || 'N/A'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{term.assetLabel}</p>
                        </div>

                        {/* Problem Description */}
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <h3 className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center">
                                <Info size={14} className="mr-2" />
                                Motivo de {term.orderLabel}
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                "{order.description || 'Sin descripción detallada.'}"
                            </p>
                        </div>

                        {/* Technical Diagnosis */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                    <Wrench size={14} className="mr-2 text-primary-500" />
                                    Revisión Técnica
                                </h3>
                                <button
                                    onClick={handleSaveDiagnosis}
                                    disabled={isSavingDiagnosis}
                                    className="p-2 text-primary-600"
                                >
                                    {isSavingDiagnosis ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                </button>
                            </div>
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Escribe el diagnóstico técnico aquí..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[100px] outline-none resize-none"
                            />
                        </div>

                        {/* Internal Notes */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                    <StickyNote size={14} className="mr-2 text-primary-500" />
                                    Notas Internas
                                </h3>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isSavingNotes}
                                    className="p-2 text-primary-600"
                                >
                                    {isSavingNotes ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                </button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Escribe notas internas aquí..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[100px] outline-none resize-none"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'checklist' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <MobileChecklist
                            items={checklistItems}
                            onUpdateItem={(id, updates) => console.log('Update Item', id, updates)}
                        />
                    </div>
                )}

                {activeTab === 'photos' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <MobilePhotoGrid
                            orderId={order.id}
                            photos={photoUrls}
                        />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
                        <DesktopAuditLog orderId={order.id} logs={auditLogs} />
                    </div>
                )}
            </main>

            {/* Floating Action Button (FAB) - Contextual */}
            <div className="fixed bottom-24 right-4 z-40">
                <button
                    onClick={handleAdvanceStage}
                    disabled={updateOrder.isPending}
                    className="bg-primary-600 hover:bg-primary-500 text-white py-4 px-8 rounded-full shadow-2xl shadow-primary-600/40 active:scale-95 transition-all flex items-center space-x-3 disabled:opacity-50"
                >
                    <span className="font-black text-xs tracking-widest uppercase">
                        AVANZAR PROCESO
                    </span>
                    <ArrowRight size={18} />
                </button>
            </div>

            {/* Bottom Navigation Tabs */}
            <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe pt-2 px-6 flex justify-around z-50 h-[80px] pb-6">
                {[
                    { id: 'info', icon: Info, label: 'Info' },
                    { id: 'checklist', icon: ClipboardList, label: 'Check' },
                    { id: 'photos', icon: ImageIcon, label: 'Fotos' },
                    { id: 'history', icon: History, label: 'Audit' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center justify-center w-16 transition-all ${activeTab === tab.id
                            ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                            : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                            }`}
                    >
                        <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};
