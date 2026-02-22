import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../lib/terminology';
import { Camera, Save, X, Loader2, Maximize2, RefreshCw, Trash2 } from 'lucide-react';
import { useCreateAsset, useUpdateAsset, usePresignUpload } from '../../hooks/useApi';

interface AssetFormProps {
    onClose: () => void;
    customerId: string;
    initialData?: any;
}

export const AssetForm = ({ onClose, customerId, initialData }: AssetFormProps) => {
    const { organization } = useAuthStore();
    const preset = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);

    const [formData, setFormData] = useState<Record<string, string>>({
        field1: initialData?.field1 || '',
        field2: initialData?.field2 || '',
        field3: initialData?.field3 || '',
        field4: initialData?.field4 || '',
        field5: initialData?.field5 || '',
        field6: initialData?.field6 || '',
        notes: initialData?.notes || '',
        photoUrl: initialData?.photoUrl || ''
    });

    const createAsset = useCreateAsset();
    const updateAsset = useUpdateAsset();
    const presignMutation = usePresignUpload();
    const isEditing = !!initialData?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateAsset.mutateAsync({
                    id: initialData.id,
                    ...formData,
                    customerId,
                    organizationId: organization?.id
                });
            } else {
                await createAsset.mutateAsync({
                    ...formData,
                    customerId,
                    organizationId: organization?.id
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving asset:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {isEditing ? 'EDITAR' : 'CREAR'} {preset.assetLabel}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {isEditing ? 'Actualizando' : 'Registrando'} {preset.assetLabel} para el cliente.
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-500">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(preset.assetFields).map(([key, field]: [string, any]) => (
                        <div key={key} className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                value={formData[key] || ''}
                                onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium"
                                required={field.required}
                            />
                        </div>
                    ))}
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notas Adicionales</label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Estado del equipo, accesorios incluidos, observaciones visuales..."
                        className="w-full min-h-[80px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registro Visual</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all relative min-h-[160px]">
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                try {
                                    // 0. Instant Local Preview
                                    const objectUrl = URL.createObjectURL(file);
                                    setFormData(prev => ({ ...prev, photoUrl: objectUrl })); // Show local immediately

                                    // 1. Get Presigned URL
                                    const { uploadUrl, publicUrl } = await presignMutation.mutateAsync({
                                        fileName: file.name,
                                        fileType: file.type
                                    });

                                    // 2. Upload to R2
                                    await fetch(uploadUrl, {
                                        method: 'PUT',
                                        body: file,
                                        headers: {
                                            'Content-Type': file.type
                                        }
                                    });

                                    // 3. Update with Real Remote URL
                                    setFormData(prev => ({ ...prev, photoUrl: publicUrl }));
                                } catch (error) {
                                    console.error("Upload failed:", error);
                                    alert("Error subiendo imagen. Intenta de nuevo.");
                                }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 hidden"
                        />
                        {formData.photoUrl ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
                                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all space-x-3 backdrop-blur-[2px]">
                                    <button
                                        type="button"
                                        onClick={() => window.open(formData.photoUrl, '_blank')}
                                        className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors border border-white/20"
                                        title="Maximizar"
                                    >
                                        <Maximize2 size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('photo-upload')?.click()}
                                        className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors border border-white/20"
                                        title="Cambiar Foto"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                                        className="p-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors border border-red-500/20"
                                        title="Borrar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center cursor-pointer w-full h-full py-8"
                                onClick={() => document.getElementById('photo-upload')?.click()}
                            >
                                <Camera size={32} className="mb-2 text-slate-300 transition-transform group-hover:scale-110" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400">
                                    Toca para subir foto<br />
                                    <span className="text-[9px] font-normal opacity-70 italic lowercase">Soporta JPG, PNG</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={createAsset.isPending || updateAsset.isPending}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {(createAsset.isPending || updateAsset.isPending) ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>{(createAsset.isPending || updateAsset.isPending) ? 'Guardando...' : `Guardar ${preset.assetLabel}`}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
