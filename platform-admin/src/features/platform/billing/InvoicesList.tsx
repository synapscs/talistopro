import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore - Hono client types
import { client } from '../../../lib/api-client';
import GenerateInvoiceModal from './components/GenerateInvoiceModal';
import InvoiceStatusBadge from './components/InvoiceStatusBadge';

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const [showGenerate, setShowGenerate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('platform_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.billing.invoices.$get(
        {
          query: {
            status: filters.status || undefined,
            page: String(filters.page),
            limit: '20'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      const data = await res.json();
      setInvoices(data.data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (invoiceData: { year: number; month: number }) => {
    const token = localStorage.getItem('platform_token');
    if (!token) return;

    try {
      // @ts-expect-error - Hono client type inference issue
      const res = await client.api.platform.billing.invoices.$post(
        {
          json: invoiceData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      const data = await res.json();
      setInvoices([data, ...(invoices || [])]);
      setShowGenerate(false);
      await loadInvoices();
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
            <p className="text-gray-600">Gestión de facturas del SaaS</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Cargando facturas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-600">Gestión de facturas del SaaS</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Generar Factura
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="paid">Pagadas</option>
            <option value="past_due">Vencidas</option>
            <option value="void">Anuladas</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Número</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Organización</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Periodo</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Vencimiento</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice: any) => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{invoice.subscriptionId.substring(0, 8)}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {invoice.paidAt ? 'Pagado' : new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">${invoice.total}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
                      onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                    >
                      Ver detalle
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-600">
              {filters.status
                ? 'No se encontraron facturas con los filtros actuales'
                : 'No hay facturas generadas aún'}
            </p>
          </div>
        )}
      </div>

      {showGenerate && (
        <GenerateInvoiceModal
          isOpen={showGenerate}
          onClose={() => setShowGenerate(false)}
          onConfirm={handleGenerateInvoice}
        />
      )}
    </div>
  );
}