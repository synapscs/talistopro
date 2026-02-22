import React from 'react';
import { useNavigation } from '../../../hooks/use-navigation';
import { Sidebar } from '../Sidebar';
import { Navbar } from '../Navbar';

interface DesktopShellProps {
    children: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({ children }) => {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-inter">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
