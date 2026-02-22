import React, { useState } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { TERMINOLOGY_PRESETS } from '../../../lib/terminology';
import { Laptop, Briefcase, Calendar, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAssets, useMembers } from '../../../hooks/useApi';
import { AssetForm } from '../../assets/AssetForm';

interface Step2Props {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
}

export const Step2Asset = ({ data, onUpdate, onNext }: Step2Props) => {
    const { organization } = useAuthStore();
    const preset = organization ? TERMINOLOGY_PRESETS[organization.businessType] : TERMINOLOGY_PRESETS.OTHER;
    const assetLabel = organization?.customTerminology?.assetLabel || preset.assetLabel;
    const technicianLabel = organization?.customTerminology?.technicianLabel || preset.technicianLabel;

    // Hooks
    const { data: assets, isLoading: loadingAssets } = useAssets(data.customer?.id);
    const { data: members, isLoading: loadingMembers } = useMembers();

    const [showNewAsset, setShowNewAsset] = useState(false);

    // Helpers
    const handleSelectAsset = (asset: any) => {
        onUpdate({ asset });
    };

    const handleSelectTechnician = (techId: string) => {
        onUpdate({ assignedToId: techId });
    };

    const priorities = [
        { value: 1, label: 'Baja', light: 'bg-green-100 text-green-700 border-green-200', dark: 'dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' },
        { value: 2, label: 'Normal', light: 'bg-blue-100 text-blue-700 border-blue-200', dark: 'dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
        { value: 3, label: 'Alta', light: 'bg-orange-100 text-orange-700 border-orange-200', dark: 'dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' },
        { value: 4, label: 'Urgente', light: 'bg-red-100 text-red-700 border-red-200', dark: 'dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' }
    ];

    const selectedAssetId = data.asset?.id;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Header */}
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Detalles de la Orden</h3>
                <p className="text-xs text-slate-500 font-medium">Asigna el {assetLabel}, {technicianLabel} y prioridad.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column: Asset Selection */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                            <Laptop size={14} className="mr-2 text-primary-600" />
                            {assetLabel} del Cliente
                        </label>
                        <button
                            onClick={() => setShowNewAsset(true)}
                            className="text-[10px] font-bold text-white bg-primary-600 px-3 py-1.5 rounded-lg border border-primary-500 shadow-md transition-all hover:bg-primary-500"
                        >
                            <Plus size={12} className="mr-1" /> Crear {assetLabel}
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {loadingAssets ? (
                            <Loader2 className="animate-spin mx-auto text-primary-500" />
                        ) : assets?.length > 0 ? (
                            assets.map((asset: any) => (
                                <div
                                    key={asset.id}
                                    onClick={() => handleSelectAsset(asset)}
                                    className={`
                                        p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between group
                                        ${selectedAssetId === asset.id
                                            ? 'border-primary-600 bg-primary-50/50 dark:bg-slate-800/50 shadow-lg shadow-primary-600/5'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary-200 dark:hover:border-primary-900 shadow-sm'}
                                    `}
                                >
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                            {asset.field1} {asset.field2}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">{asset.field3 || 'N/A'}</span>
                                            {asset.field4 && <span className="opacity-75">• {asset.field4}</span>}
                                            {asset.field5 && <span className="opacity-75">• {asset.field5}</span>}
                                            {asset.field6 && <span className="opacity-75">• {asset.field6}</span>}
                                        </p>
                                    </div>
                                    {selectedAssetId === asset.id && (
                                        <Check className="text-primary-600" size={18} strokeWidth={3} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-xs text-slate-500 mb-3">Este cliente no tiene activos registrados.</p>
                                <button
                                    onClick={() => setShowNewAsset(true)}
                                    className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary-600/20"
                                >
                                    Registrar Primer {assetLabel}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Staff & Priority */}
                <div className="space-y-6">

                    {/* Technician Assignment */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                            <Briefcase size={14} className="mr-2 text-primary-600" />
                            {technicianLabel} Asignado
                        </label>
                        <select
                            value={data.assignedToId || ''}
                            onChange={(e) => handleSelectTechnician(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-medium shadow-sm"
                        >
                            <option value="">-- Sin asignar --</option>
                            {members?.map((m: any) => (
                                <option key={m.id} value={m.id}>{m.user.name} ({m.role})</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                            <AlertCircle size={14} className="mr-2 text-primary-600" />
                            Prioridad
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {priorities.map((p) => (
                                <button
                                    key={p.value}
                                    onClick={() => onUpdate({ priority: p.value })}
                                    className={`
                                        py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-2
                                        ${data.priority === p.value
                                            ? `${p.light} ${p.dark} ring-2 ring-offset-2 ring-primary-500/20 scale-105 shadow-md`
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}
                                    `}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Estimated Date */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                            <Calendar size={14} className="mr-2 text-primary-600" />
                            Fecha Estimada de Entrega
                        </label>
                        <input
                            type="datetime-local"
                            value={data.estimatedDate || ''}
                            onChange={(e) => onUpdate({ estimatedDate: e.target.value })}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-mono font-medium shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Modal Nuevo Activo */}
            {showNewAsset && data.customer?.id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
                    <AssetForm
                        customerId={data.customer.id}
                        onClose={() => setShowNewAsset(false)}
                    />
                </div>
            )}
        </div>
    );
};
