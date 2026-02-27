import { ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../stores/usePlatformAuthStore';

export default function PlatformLayout() {
  const { logout, user } = usePlatformAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/platform/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-xl font-bold">Platform Admin</h1>
          <p className="text-indigo-300 text-sm">TaListoPro SaaS</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                window.location.pathname === item.path
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-300 hover:bg-indigo-800'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-800">
          <div className="text-sm text-indigo-300">
            <div className="font-medium">Admin User</div>
            <div className="text-xs">{user?.email || 'admin@talisto.pro'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full px-4 py-2 bg-indigo-800 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const menuItems = [
  { path: '/platform/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/platform/organizations', icon: '🏢', label: 'Organizaciones' },
  { path: '/platform/subscriptions', icon: '💳', label: 'Suscripciones' },
  { path: '/platform/billing', icon: '📄', label: 'Facturación' },
];