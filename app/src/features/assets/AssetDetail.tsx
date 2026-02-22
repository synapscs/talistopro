import React from 'react';
import { Asset } from '../../types/api';
import { useUpdateAsset } from '../../hooks/useApi';

type Props = {
  asset: Asset;
  onClose: () => void;
};

export const AssetDetail: React.FC<Props> = ({ asset, onClose }) => {
  const [localValue, setLocalValue] = React.useState<string>(asset.nextAppointmentAt ? new Date(asset.nextAppointmentAt).toISOString().slice(0,16) : '');
  const updateAsset = useUpdateAsset();

  const handleSave = async () => {
    await updateAsset.mutateAsync({ id: asset.id, nextAppointmentAt: localValue ? new Date(localValue).toISOString() : null } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">{asset.field1} • {asset.field2}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Cerrar</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">{`Próxima cita (${/* assetPlural no necesaria aquí */ ''})`}</label>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2 text-sm"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-primary-600 text-white">Guardar</button>
        </div>
      </div>
    </div>
  );
};
