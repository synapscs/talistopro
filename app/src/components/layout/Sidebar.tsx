import React from 'react';
import {
    BarChart3,
    Users,
    Car,
    UserCircle,
    ClipboardList,
    Package,
    Settings,
    LogOut,
    Calendar,
    Receipt,
    CreditCard
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigationStore, AppView } from '../../stores/useNavigationStore';
import { getEffectiveTerminology } from '../../lib/terminology';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <div
        onClick={onClick}
        className={`
    flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
    ${active
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
  `}>
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-primary-500 transition-colors'} />
        <span className={`font-bold text-sm ${active ? 'text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white'}`}>{label}</span>
    </div>
);

import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../hooks/use-navigation';

export const Sidebar = () => {
    const navigate = useNavigate();
    const { menuItems, organization } = useNavigation();
    const { currentView } = useNavigationStore();

    const handleLogout = async () => {
        await authClient.signOut();
        navigate('/login');
    };

    const handleNavigation = (href: string) => {
        navigate(href);
    };

    return (
        <aside className="w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-6">
                <div className="flex flex-col space-y-2">
                    <div className="h-12 w-full flex items-center">
                        <img
                            src={`/assets/logos/logo-${organization?.themeKey || 'obsidian'}.png`}
                            alt="TaListoPro Logo"
                            className="h-full w-auto object-contain"
                            onLoad={(e) => {
                                // Ocultar el texto de respaldo si la imagen carga
                                const textLogo = e.currentTarget.closest('.flex-col')?.querySelector('.text-logo-fallback');
                                if (textLogo) (textLogo as HTMLElement).style.display = 'none';
                            }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>

                    <div className="text-logo-fallback">
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 tracking-tighter uppercase">
                            TaListoPro
                        </span>
                        <p className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase -mt-1">Luxury Edition</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1.5 mt-4">
                {menuItems.map(item => (
                    <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.title}
                        active={currentView === item.id}
                        onClick={() => handleNavigation(item.href)}
                    />
                ))}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5">

                <div
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                    <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Cerrar Sesión</span>
                </div>

                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                        <UserCircle className="text-primary-600" size={32} />
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {authClient.useSession().data?.user?.name || 'Usuario'}
                            </p>
                            <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest px-1.5 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-md">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
