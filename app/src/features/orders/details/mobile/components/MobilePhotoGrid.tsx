import React, { useRef } from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { useUpdateOrder, usePresignUpload } from '../../../../../hooks/useApi';

interface MobilePhotoGridProps {
    orderId: string;
    photos: any[];
}

export const MobilePhotoGrid = ({ orderId, photos }: MobilePhotoGridProps) => {
    const updateOrder = useUpdateOrder();
    const presignUpload = usePresignUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    const MAX_PHOTOS = 6;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (photos.length >= MAX_PHOTOS) {
            alert(`Límite de ${MAX_PHOTOS} fotos alcanzado.`);
            return;
        }

        try {
            setIsUploading(true);
            const { url, publicUrl } = await presignUpload.mutateAsync({
                fileName: file.name,
                fileType: file.type
            });

            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error();

            const newPhoto = {
                url: publicUrl,
                type: 'process',
                order: photos.length + 1
            };

            updateOrder.mutate({
                id: orderId,
                photos: [...photos, newPhoto]
            });

        } catch (error) {
            console.error(error);
            alert('Error al subir foto');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        if (!confirm('¿Eliminar foto?')) return;
        updateOrder.mutate({
            id: orderId,
            photos: photos.filter((p: any) => p.id !== id)
        });
    };

    return (
        <div className="grid grid-cols-2 gap-4 pb-20">
            {/* Add Button */}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || photos.length >= MAX_PHOTOS}
                className="aspect-square bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-500 transition-all active:scale-95 disabled:opacity-50"
            >
                {isUploading ? (
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                ) : (
                    <>
                        <Camera size={32} />
                        <span className="text-[10px] font-black mt-2 uppercase tracking-widest text-slate-500">
                            {photos.length} / {MAX_PHOTOS} FOTOS
                        </span>
                    </>
                )}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* Photos */}
            {photos?.map((photo: any) => (
                <div key={photo.id} className="aspect-square relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg group">
                    <img src={photo.url} alt={`Evidence`} className="w-full h-full object-cover" />
                    <button
                        onClick={() => handleDelete(photo.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg active:scale-90"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}

            {(!photos || photos.length === 0) && !isUploading && (
                <div className="col-span-2 text-center py-10 text-slate-400 italic text-xs">
                    No hay fotos de evidencia aún.
                </div>
            )}
        </div>
    );
};
