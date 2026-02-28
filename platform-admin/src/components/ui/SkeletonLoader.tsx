interface Props {
  message?: string;
}

export default function SkeletonLoader({ message = 'Cargando...' }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}