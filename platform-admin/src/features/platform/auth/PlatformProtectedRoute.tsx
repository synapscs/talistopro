import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../../stores/usePlatformAuthStore';

interface Props {
  children: React.ReactNode;
}

export default function PlatformProtectedRoute({ children }: Props) {
  const { isAuthenticated, initialize } = usePlatformAuthStore();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('platform_token');

      if (!token) {
        console.log('[PlatformProtectedRoute] No token found, redirecting to login');
        if (mounted) {
          setInitializing(false);
          navigate('/login');
        }
        return;
      }

      console.log('[PlatformProtectedRoute] Token found, verifying...');
      
      try {
        await initialize();
        
        if (mounted) {
          setInitializing(false);
        }
      } catch (err) {
        console.error('[PlatformProtectedRoute] Auth check failed:', err);
        if (mounted) {
          setInitializing(false);
          navigate('/login');
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [initialize, navigate]);

  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      console.log('[PlatformProtectedRoute] Not authenticated after check, redirecting to login');
      navigate('/login');
    }
  }, [initializing, isAuthenticated, navigate]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}