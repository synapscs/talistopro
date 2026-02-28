import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../../lib/api-client';
import InvoiceStatusBadge from './components/InvoiceStatusBadge';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    loadInvoiceDetail();
  }, [id]);

  const loadInvoiceDetail = async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/platform/billing/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      setInvoice(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading invoice:', error);
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/platform/billing/invoices/${id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadInvoiceDetail();
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No se encontró la factura</p>
        <button
          onClick={() => navigate('/billing')}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Volver a facturación
        </button>
      </div>
    );
  }

  const isPending = invoice.status === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/billing')}
            className="text-indigo-600 hover:text-indigo-900 text-sm mb-4"
          >
            ← Volver a facturación
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-gray-600">Detalle de factura</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Estado" 
          value={<InvoiceStatusBadge status={invoice.status} />}
          icon="📊"
        />
        <StatCard 
          title="Vencimiento" 
          value={invoice.paidAt ? 'Pagado' : new Date(invoice.dueDate).toLocaleDateString()} 
          icon="📅"
        />
        <StatCard 
          title="Subtotal" 
          value={`$${invoice.monthlyFee}`}
          icon="💰"
        />
        <StatCard 
          title="Total" 
          value={`$${invoice.total}`}
          icon="💵"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Detalle de Factura</h2>
          {isPending && (
            <button
              onClick={handleMarkPaid}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Marcar como Pagada
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Número de Factura</div>
              <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Organización</div>
              <div className="font-medium text-gray-900">{invoice.subscriptionId.substring(0, 8)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600">Periodo de Facturación</div>
              <div className="font-medium text-gray-900">
                {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Fecha de Vencimiento</div>
              <div className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Cuota Mensual</span>
              <span className="font-medium">${invoice.monthlyFee}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tarifas de Activación</span>
              <span className="font-medium">${invoice.activationFee || 0}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Impuestos (16%)</span>
              <span className="font-medium">${invoice.taxAmount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold text-lg">
              <span>Total</span>
              <span className="text-indigo-600">${invoice.total}</span>
            </div>
          </div>

          {invoice.paidAt && (
            <div className="pt-4 border-t bg-green-50 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-2xl">✅</span>
                <div>
                  <div className="font-medium text-green-800">Pagado</div>
                  <div className="text-sm text-green-600">
                    El {new Date(invoice.paidAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-2xl">
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-lg font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}