import React, { useState } from 'react';
import { Camera, X, UploadCloud } from 'lucide-react';

interface PhotoUploadProps {
    maxPhotos?: number;
    label?: string;
}

export const PhotoUpload = ({ maxPhotos = 6, label = 'Fotos de la Orden' }: PhotoUploadProps) => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && photos.length < maxPhotos) {
            setUploading(true);
            // Simulamos subida
            setTimeout(() => {
                const newPhoto = URL.createObjectURL(e.target.files![0]);
                setPhotos([...photos, newPhoto]);
                setUploading(false);
            }, 1000);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label} ({photos.length}/{maxPhotos})</label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {photos.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-800">
                        <img src={src} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                        <button
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {photos.length < maxPhotos && (
                    <label className={`
            aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 
            flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all
            ${uploading ? 'animate-pulse opacity-50' : ''}
          `}>
                        <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} accept="image/*" />
                        {uploading ? <UploadCloud size={24} className="text-primary-500" /> : <Camera size={24} className="text-slate-400" />}
                        <span className="text-[10px] mt-1 text-slate-400 font-medium">{uploading ? 'Subiendo...' : 'Añadir'}</span>
                    </label>
                )}
            </div>
        </div>
    );
};
