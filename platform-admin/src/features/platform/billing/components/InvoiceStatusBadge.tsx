export default function InvoiceStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    void: 'bg-gray-100 text-gray-800',
    past_due: 'bg-red-100 text-red-800',
  };

  const labels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagada',
    void: 'Anulada',
    past_due: 'Vencida',
  };

  const icons: Record<string, string> = {
    pending: '⏳',
    paid: '✅',
    void: '🚫',
    past_due: '⚠️',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
      colors[status] || 'bg-gray-100 text-gray-800'
    }`}>
      <span>{icons[status]}</span>
      {labels[status] || status}
    </span>
  );
}