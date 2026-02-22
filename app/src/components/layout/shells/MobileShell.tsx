import React from 'react';
import { BottomNav } from '../mobile/BottomNav';
import { Fab } from '../../ui/Fab';
import { useAuthStore } from '../../../stores/useAuthStore';
import { UserCircle } from 'lucide-react';

interface MobileShellProps {
    children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
    const { organization } = useAuthStore();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-inter">
            {/* 1. Mobile Header (Sticky) */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-500/20">
                        T
                    </div>
                    <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 tracking-tighter uppercase">
                        TaListo
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{organization?.name}</span>
                    <button className="p-1 rounded-full border border-slate-200 dark:border-slate-800">
                        <UserCircle className="text-slate-400" size={20} />
                    </button>
                </div>
            </header>

            {/* 2. Main Content */}
            <main className="flex-1 pb-32 overflow-x-hidden">
                {children}
            </main>

            {/* 3. Floating Action Button */}
            <Fab />

            {/* 4. Bottom Navigation */}
            <BottomNav />
        </div>
    );
};
