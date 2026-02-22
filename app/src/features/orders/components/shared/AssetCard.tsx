import React from 'react';
import { HardDrive, Edit3, Camera } from 'lucide-react';
import { useAuthStore } from '../../../../stores/useAuthStore';

interface AssetCardProps {
    asset: any;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
    const { organization } = useAuthStore();
    const settings = (organization as any)?.settings;
    const terminology = settings?.customTerminology || {};

    const assetLabel = terminology.item || 'Equipo';
    const field1Label = terminology.field1 || 'Marca';
    const field2Label = terminology.field2 || 'Modelo';
    const field3Label = terminology.field3 || 'Año';
    const field4Label = terminology.field4 || 'Serial';

    if (!asset) return null;

    return (
        <div className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Identificación del {assetLabel}</p>
                <div className="p-2 bg-primary-100 dark:bg-primary-500/10 text-primary-600 rounded-xl group-hover:rotate-12 transition-transform">
                    <HardDrive size={16} />
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-8">
                {asset.photoUrl ? (
                    <img
                        src={asset.photoUrl}
                        alt={asset.field1}
                        className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-slate-800 group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200 dark:border-slate-700 shadow-inner group-hover:scale-105 transition-transform">
                        <Camera size={24} />
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight truncate">
                        {asset.field1} {asset.field2}
                    </h3>
                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mt-0.5">
                        {asset.field4 || 'Sin Identificador'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-auto">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:border-primary-100 dark:group-hover:border-primary-900/30">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{field3Label}</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{asset.field3 || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:border-primary-100 dark:group-hover:border-primary-900/30">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{field1Label}</p>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 truncate">{asset.field1}</p>
                </div>
                <div className="col-span-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:border-primary-100 dark:group-hover:border-primary-900/30">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Notas Técnicas</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                        {asset.notes || 'No se registran observaciones adicionales del equipo.'}
                    </p>
                </div>
            </div>
        </div>
    );
};
