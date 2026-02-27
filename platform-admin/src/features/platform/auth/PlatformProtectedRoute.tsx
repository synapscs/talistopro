import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../../stores/usePlatformAuthStore';

interface Props {
  children: React.ReactNode;
}

export default function PlatformProtectedRoute({ children }: Props) {
  const { isAuthenticated, initialize } = usePlatformAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/platform/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}