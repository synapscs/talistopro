import React from 'react';
import { X, Save, Car, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { Asset } from '../../types/api';
import { useUpdateAsset, useCustomers } from '../../hooks/useApi';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = {
    asset: Asset;
    onClose: () => void;
};

export const AssetDetail: React.FC<Props> = ({ asset, onClose }) => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { assetLabel } = terminology;
    const { data: customers } = useCustomers();
    const [form, setForm] = React.useState({
        field1: asset.field1 ?? '',
        field2: asset.field2 ?? '',
        field3: asset.field3 ?? '',
        field4: asset.field4 ?? '',
        field5: asset.field5 ?? '',
        field6: asset.field6 ?? '',
        notes: asset.notes ?? '',
        nextAppointmentAt: asset.nextAppointmentAt ? new Date(asset.nextAppointmentAt).toISOString().slice(0, 16) : '',
        customerId: asset.customerId ?? '',
    });
    const updateAsset = useUpdateAsset();

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const payload: any = {
            id: asset.id,
            field1: form.field1,
            field2: form.field2,
            field3: form.field3,
            field4: form.field4,
            field5: form.field5,
            field6: form.field6,
            notes: form.notes,
            customerId: form.customerId || asset.customerId,
            nextAppointmentAt: form.nextAppointmentAt ? new Date(form.nextAppointmentAt).toISOString() : undefined,
        };
        Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

        await updateAsset.mutateAsync(payload as any);
        onClose();
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <Car size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            Editar {assetLabel}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Actualiza los detalles del {assetLabel.toLowerCase()}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-500">
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {terminology.assetFields?.field1?.label ?? 'Campo 1'}
                        </label>
                        <input
                            type="text"
                            value={form.field1}
                            onChange={(e) => handleChange('field1', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {terminology.assetFields?.field2?.label ?? 'Campo 2'}
                        </label>
                        <input
                            type="text"
                            value={form.field2}
                            onChange={(e) => handleChange('field2', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {terminology.assetFields?.field3?.label ?? 'Campo 3'}
                        </label>
                        <input
                            type="text"
                            value={form.field3}
                            onChange={(e) => handleChange('field3', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {terminology.assetFields?.field4?.label ?? 'Campo 4'}
                        </label>
                        <input
                            type="text"
                            value={form.field4}
                            onChange={(e) => handleChange('field4', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {terminology.assetFields?.field5?.label ?? 'Campo 5'}
                        </label>
                        <input
                            type="text"
                            value={form.field5}
                            onChange={(e) => handleChange('field5', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {terminology.assetFields?.field6?.label ?? 'Campo 6'}
                        </label>
                        <input
                            type="text"
                            value={form.field6}
                            onChange={(e) => handleChange('field6', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <User size={12} className="mr-1" /> Cliente
                        </label>
                        <select
                            value={form.customerId}
                            onChange={(e) => handleChange('customerId', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-5 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Seleccionar cliente</option>
                            {customers?.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary-600 uppercase tracking-widest ml-1 flex items-center">
                            <Calendar size={12} className="mr-1" /> Próxima Cita
                        </label>
                        <input
                            type="datetime-local"
                            value={form.nextAppointmentAt}
                            onChange={(e) => handleChange('nextAppointmentAt', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-primary-200 dark:border-primary-900/30 rounded-xl py-3 px-5 text-sm font-black text-primary-600 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <FileText size={12} className="mr-1" /> Notas
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Observaciones adicionales..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-5 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 outline-none transition-all min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 py-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updateAsset.isPending}
                        className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {updateAsset.isPending ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>
                            {updateAsset.isPending ? 'Guardando...' : `Guardar ${assetLabel}`}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
