import React, { useEffect } from 'react';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuthStore } from '../../stores/useAuthStore';

export const Navbar = () => {
    const { theme, toggleTheme } = useThemeStore();
    const { organization } = useAuthStore();



    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar clientes o servicios (Ctrl+K)..."
                        className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{organization?.name}</p>
                    <p className="text-[10px] text-slate-500">{organization?.businessType}</p>
                </div>

                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400 relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                </button>
            </div>
        </header>
    );
};
