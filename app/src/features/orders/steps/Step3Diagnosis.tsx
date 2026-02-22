import React, { useState } from 'react';
import { Camera, FileText, Stethoscope, Loader2, Maximize2, RefreshCw, Trash2 } from 'lucide-react';
import { client } from '../../../lib/api-client';
import { ChecklistWizard } from '../components/forms/ChecklistWizard';
import { useAuthStore } from '../../../stores/useAuthStore';

interface Step3Props {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
}

interface PhotoUploadSlotProps {
    index: number;
    url: string | null;
    onUploadFinish: (url: string) => void;
    onRemove: () => void;
}

const PhotoUploadSlot = ({ index, url, onUploadFinish, onRemove }: PhotoUploadSlotProps) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const objectUrl = URL.createObjectURL(file);
            onUploadFinish(objectUrl);

            const res = await client.api.upload.presign.$post({
                json: {
                    fileName: file.name,
                    fileType: file.type
                }
            });
            if (!res.ok) throw new Error('Error en presign');
            const data = await res.json() as { uploadUrl: string, publicUrl: string };
            const { uploadUrl, publicUrl } = data;

            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            onUploadFinish(publicUrl);
        } catch (error) {
            console.error(`[PhotoSlot ${index}] error:`, error);
            alert("Error subiendo imagen.");
            onRemove();
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="aspect-square relative group bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary-500/50 shadow-sm">
            {url ? (
                <>
                    <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                            onClick={() => window.open(url, '_blank')}
                            title="Maximizar"
                            className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            title="Cambiar Foto"
                            className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={onRemove}
                            title="Borrar"
                            className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {uploading ? (
                        <Loader2 className="animate-spin text-primary-500" size={20} />
                    ) : (
                        <>
                            <Camera size={20} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Foto {index + 1}</span>
                        </>
                    )}
                </>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer disabled:hidden"
                disabled={!!url && !uploading}
                onChange={handleUpload}
            />
            {!url && !uploading && (
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                />
            )}
        </div>
    );
};

export const Step3Diagnosis = ({ data, onUpdate, onNext }: Step3Props) => {
    const { organization } = useAuthStore();

    const handleUpdatePhoto = (index: number, url: string | null) => {
        const photos = [...(data.photos || [])];
        while (photos.length <= index) photos.push(null as any);
        photos[index] = url as any;
        onUpdate({ photos });
    };

    const handleChecklistChange = (checklist: any[]) => {
        onUpdate({ checklist });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Diagnóstico Inicial</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Documenta el estado de recepción y fallas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Description, Diagnosis and Visual Evidence */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                            <FileText size={14} className="mr-2 text-primary-600" />
                            Falla Reportada / Motivo
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            placeholder="Describe detalladamente el problema reportado por el cliente..."
                            className="w-full h-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium resize-none shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                            <Stethoscope size={14} className="mr-2 text-primary-600" />
                            Diagnóstico Preliminar (Técnico)
                        </label>
                        <textarea
                            value={data.diagnosis || ''}
                            onChange={(e) => onUpdate({ diagnosis: e.target.value })}
                            placeholder="Observaciones técnicas iniciales..."
                            className="w-full h-32 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium resize-none shadow-sm"
                        />
                    </div>

                    {/* Visual Evidence - Optimized layout placement */}
                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                            <Camera size={14} className="mr-2 text-primary-600" />
                            Evidencia Visual (Fotos de entrada)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[0, 1, 2].map((index) => (
                                <PhotoUploadSlot
                                    key={index}
                                    index={index}
                                    url={data.photos?.[index] || null}
                                    onUploadFinish={(url) => handleUpdatePhoto(index, url)}
                                    onRemove={() => handleUpdatePhoto(index, null)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Intelligent Checklist (Full Height) */}
                <div className="space-y-6">
                    <ChecklistWizard
                        businessType={organization?.businessType || 'OTHER'}
                        value={data.checklist || []}
                        onChange={handleChecklistChange}
                    />
                </div>
            </div>
        </div>
    );
};
