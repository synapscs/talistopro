interface Props {
  icon?: string;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = '📂', title = 'No hay datos', message = 'No se encontraron elementos para mostrar', action }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12">
      <div className="flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">{icon}</div>
        <p className="text-gray-600 font-medium mb-2">{title}</p>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        {action && action}
      </div>
    </div>
  );
}