import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAssets } from '../../hooks/useApi';
import { getEffectiveTerminology } from '../../lib/terminology';
import { useAuthStore } from '../../stores/useAuthStore';
import { AssetDetail } from './AssetDetail';

export const AssetsPage: React.FC = () => {
  const { organization } = useAuthStore();
  const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
  const { assetPlural } = terminology;

  const { data: assets, isLoading } = useAssets();
  const [selected, setSelected] = React.useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{assetPlural || 'Activos'}</h1>
        <span className="text-sm text-slate-500">Listado de {assetPlural?.toLowerCase() ?? 'activos'}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full table-auto text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">#{'ID'.slice(0,6)}</th>
              <th className="px-4 py-3 text-left">{terminology.assetFields?.field1?.label ?? 'Field 1'}</th>
              <th className="px-4 py-3 text-left">{terminology.assetFields?.field2?.label ?? 'Field 2'}</th>
              <th className="px-4 py-3 text-left">Next Appointment</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(assets as any)?.length > 0 ? (
              assets.map((a: any) => (
                <tr key={a.id} className="border-b border-slate-200">
                  <td className="px-4 py-3">{a.id.substring(0,6)}</td>
                  <td className="px-4 py-3">{a.field1}</td>
                  <td className="px-4 py-3">{a.field2}</td>
                  <td className="px-4 py-3">{a.nextAppointmentAt ? new Date(a.nextAppointmentAt).toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-2 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200" onClick={() => setSelected(a)}>Editar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="p-4" colSpan={5}>No hay activos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <AssetDetail asset={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};
