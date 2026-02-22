import React from 'react';
import { Printer, Share2, MoreHorizontal, Car, Calendar, User, FileText, CheckSquare, Image as ImageIcon, ArrowRight, Save, StickyNote, Plus, Trash2, Camera, Loader2, Wrench } from 'lucide-react';
import { DesktopFinancialSidebar } from './components/DesktopFinancialSidebar';
import { DesktopAuditLog } from './components/DesktopAuditLog';
import { QuickAddItem } from './components/QuickAddItem';
import { OrderFull } from '../../../../types/api';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { OrderItemsTable } from '../../components/desktop/OrderItemsTable';
import { useUpdateOrder, usePresignUpload } from '../../../../hooks/useApi';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../../lib/terminology';

interface OrderDetailsDesktopProps {
    order: OrderFull;
    workflowConfig: any[];
    auditLogs: any[];
}

export const OrderDetailsDesktop = ({ order, workflowConfig, auditLogs }: OrderDetailsDesktopProps) => {
    const updateOrder = useUpdateOrder();
    const presignUpload = usePresignUpload();
    const { organization } = useAuthStore();

    // Obtener terminología efectiva según el rubro de la organización
    const term = getEffectiveTerminology(
        organization?.businessType || 'OTHER',
        organization?.customTerminology as any
    );

    const [notes, setNotes] = React.useState(order.internalNotes || '');
    const [diagnosis, setDiagnosis] = React.useState(order.diagnosis || '');
    const [isSavingNotes, setIsSavingNotes] = React.useState(false);
    const [isSavingDiagnosis, setIsSavingDiagnosis] = React.useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false);
    const [isAddingItem, setIsAddingItem] = React.useState(false);

    const sortedStages = [...workflowConfig].sort((a, b) => a.order - b.order);
    const currentStage = workflowConfig.find(s => s.id === order.currentStageId);
    const isInitialStage = currentStage?.isInitial || false;

    // Límite de fotos basado en el plan (simulado, asumiendo 3 para free, 6 para pro)
    const MAX_PHOTOS = 6;

    const handleAdvanceStage = () => {
        const currentIndex = sortedStages.findIndex(s => s.id === order.currentStageId);

        if (currentIndex < sortedStages.length - 1) {
            const nextStage = sortedStages[currentIndex + 1];
            updateOrder.mutate({
                id: order.id,
                currentStageId: nextStage.id
            }, {
                onSuccess: () => console.log(`Orden avanzada a: ${nextStage.name}`),
                onError: () => console.error('Error al avanzar la orden')
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

    const handleAddItem = (newItem: any) => {
        // En un escenario real, calculamos los totales nuevamente
        const currentItems = order.items || [];
        const updatedItems = [...currentItems, newItem];

        // Calcular nuevos totales básicos
        const subtotal = updatedItems.reduce((sum: number, i: any) => sum + (Number(i.price) * i.quantity), 0);
        const taxRate = Number(organization?.taxRate) || 16;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        updateOrder.mutate({
            id: order.id,
            items: updatedItems,
            subtotal,
            taxAmount,
            total
        }, {
            onSuccess: () => setIsAddingItem(false)
        });
    };

    const handleToggleChecklist = (item: any) => {
        if (!isInitialStage) return;

        const conditions = ['good', 'bad', 'regular'];
        const currentIndex = conditions.indexOf(item.condition || 'good');
        const nextCondition = conditions[(currentIndex + 1) % conditions.length];

        const updatedChecklist = (order.checklist || []).map((cl: any) =>
            cl.id === item.id ? { ...cl, condition: nextCondition } : cl
        );

        updateOrder.mutate({
            id: order.id,
            checklist: updatedChecklist
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if ((order.photos?.length || 0) >= MAX_PHOTOS) {
            alert(`Has alcanzado el límite de ${MAX_PHOTOS} fotos para este plan.`);
            return;
        }

        try {
            setIsUploadingPhoto(true);
            const { url, publicUrl, key } = await presignUpload.mutateAsync({
                fileName: file.name,
                fileType: file.type
            });

            // Subir el archivo a R2
            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error('Carga fallida');

            // Actualizar la orden con la nueva foto
            const newPhoto = {
                url: publicUrl,
                type: 'process',
                order: (order.photos?.length || 0) + 1
            };

            updateOrder.mutate({
                id: order.id,
                photos: [...(order.photos || []), newPhoto]
            });

        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Error al subir la fotografía');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = (photoId: string) => {
        if (!confirm('¿Eliminar esta fotografía?')) return;

        const updatedPhotos = order.photos.filter((p: any) => p.id !== photoId);
        updateOrder.mutate({
            id: order.id,
            photos: updatedPhotos
        });
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-6">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {order.orderNumber || `${term.orderLabel.toUpperCase()} SIN #`}
                            </h1>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wide">
                                {currentStage?.name || order.status}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="flex items-center"><User size={14} className="mr-1.5" /> {order.customer?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleAdvanceStage}
                        disabled={updateOrder.isPending}
                        className="flex items-center space-x-3 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        <span className="text-xs font-black uppercase tracking-widest">Avanzar Proceso</span>
                        <ArrowRight size={18} />
                    </button>

                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />

                    <div className="flex items-center space-x-2">
                        <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Share2 size={18} />
                        </button>
                        <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Printer size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Workflow Stepper */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] px-12 py-4 shadow-sm">
                <WorkflowStepper stages={workflowConfig} currentStageId={order.currentStageId} />
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 gap-8">

                {/* Left Column: Technical Context (8 cols) */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* Asset & Diagnosis Row */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* Asset Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center mb-4">
                                <Car size={14} className="mr-2" />
                                Datos del {term.assetLabel}
                            </h3>
                            <div className="space-y-1">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{term.assetFields.field1.label} / {term.assetFields.field2.label}</span>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                        {order.asset?.field1} {order.asset?.field2}
                                    </p>
                                </div>
                                <div className="flex flex-col pt-1.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">{term.assetFields.field4.label}</span>
                                    <p className="text-sm font-mono text-slate-500 font-bold">
                                        {order.asset?.field4} {order.asset?.field3 && <span className="text-slate-400 font-normal">({order.asset.field3})</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Problem Card */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FileText size={48} className="text-slate-500" />
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center mb-4 text-primary-500">
                                Motivo de {term.orderLabel}
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                "{order.description || 'Sin descripción detallada.'}"
                            </p>
                        </div>
                    </div>

                    {/* Technical Review Section (Diagnosis) */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <Wrench size={14} className="mr-2 text-primary-500" />
                                Revisión Técnica y Diagnóstico
                            </h3>
                            <button
                                onClick={handleSaveDiagnosis}
                                disabled={isSavingDiagnosis}
                                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSavingDiagnosis ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                <span>{isSavingDiagnosis ? 'Guardando...' : 'Guardar Revisión'}</span>
                            </button>
                        </div>
                        <textarea
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Ingrese el resultado de la revisión técnica, fallas detectadas y solución propuesta..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-sm font-medium text-slate-700 dark:text-slate-300 min-h-[160px] outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none shadow-inner"
                        />
                    </div>

                    {/* Table of Services & Parts */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">{term.partPlural} y Servicios</h2>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{order.items?.length || 0} ITEMS</span>
                            </div>
                            <button
                                onClick={() => setIsAddingItem(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95"
                            >
                                <Plus size={14} />
                                <span>Añadir Item</span>
                            </button>
                        </div>

                        {isAddingItem && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <QuickAddItem onAdd={handleAddItem} onClose={() => setIsAddingItem(false)} />
                            </div>
                        )}

                        <OrderItemsTable items={order.items || []} />
                    </div>

                    {/* Checklist Grid */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <CheckSquare size={14} className="mr-2" />
                                {term.checkLabel}
                            </h3>
                            {!isInitialStage && (
                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded border border-slate-100 dark:border-slate-800 uppercase tracking-tighter">Historial Bloqueado</span>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {order.checklist?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.item}</span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            disabled={!isInitialStage || updateOrder.isPending}
                                            onClick={() => handleToggleChecklist(item)}
                                            className={`
                                                text-[10px] font-black uppercase px-2 py-0.5 rounded-md transition-all
                                                ${item.condition === 'good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    item.condition === 'bad' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                                                ${isInitialStage ? 'cursor-pointer hover:ring-2 hover:ring-primary-500/30 active:scale-95' : 'cursor-default opacity-80'}
                                            `}
                                        >
                                            {item.condition === 'good' ? 'Bien' : item.condition === 'bad' ? 'Mal' : 'Regular'}
                                        </button>
                                        {isInitialStage && (
                                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                                                <MoreHorizontal size={14} className="text-slate-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!order.checklist || order.checklist.length === 0) && (
                                <p className="col-span-3 text-center text-sm text-slate-400 italic py-4">Sin elementos en el checklist.</p>
                            )}
                        </div>
                    </div>

                    {/* Evidence Grid & Upload */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <ImageIcon size={14} className="mr-2" />
                                Evidencia Fotográfica
                            </h3>
                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{order.photos?.length || 0} / {MAX_PHOTOS} Fotos</span>
                                <label className={`
                                    flex items-center space-x-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all active:scale-95
                                    ${(order.photos?.length || 0) >= MAX_PHOTOS || isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}
                                `}>
                                    {isUploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                                    <span>Subir Foto</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept="image/*"
                                        disabled={(order.photos?.length || 0) >= MAX_PHOTOS || isUploadingPhoto}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {order.photos?.map((photo: any) => (
                                <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative group shadow-sm">
                                    <img src={photo.url} alt={`Evidence`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={() => handleDeletePhoto(photo.id)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(order.photos?.length || 0) < MAX_PHOTOS && !isUploadingPhoto && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all cursor-pointer">
                                    <Plus size={24} className="group-hover:scale-110 transition-transform mb-1" />
                                    <span className="text-[9px] font-black uppercase">Añadir</span>
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                </label>
                            )}
                            {(!order.photos || order.photos.length === 0) && !isUploadingPhoto && (
                                <p className="col-span-4 text-center text-sm text-slate-400 italic py-8">No se han subido fotografías de evidencia.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Financial & History (4 cols) */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Internal Notes */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                <StickyNote size={14} className="mr-2 text-primary-500" />
                                Notas Internas
                            </h3>
                            <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-primary-600 transition-colors"
                            >
                                {isSavingNotes ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Escribe notas privadas para el equipo técnico..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-[11px] font-medium text-slate-700 dark:text-slate-300 min-h-[120px] outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                        />
                    </div>

                    <DesktopFinancialSidebar order={order} />
                    <DesktopAuditLog orderId={order.id} logs={auditLogs} />
                </div>

            </div>
        </div>
    );
};
