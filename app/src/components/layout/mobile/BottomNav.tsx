import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../../hooks/use-navigation';

export const BottomNav: React.FC = () => {
    const { menuItems } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 px-6 pb-2">
            <div className="flex items-center justify-around h-full max-w-md mx-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname.includes(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.href)}
                            className="flex flex-col items-center justify-center space-y-1 relative group w-full h-full min-h-[44px]"
                        >
                            <div className={`
                                p-2 rounded-2xl transition-all duration-300
                                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-110'
                                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}
                            `}>
                                <item.icon size={20} />
                            </div>
                            <span className={`
                                text-[10px] font-black uppercase tracking-tighter transition-colors
                                ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}
                            `}>
                                {item.title}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
