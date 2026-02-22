import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

export const Fab: React.FC = () => {
    const navigate = useNavigate();
    const { organization } = useAuthStore();

    if (!organization?.slug) return null;

    return (
        <button
            onClick={() => navigate(`/${organization.slug}/dashboard/orders/new`)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-primary-600 dark:bg-primary-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-500/40 z-50 active:scale-90 transition-transform duration-200 ring-4 ring-white dark:ring-slate-900"
        >
            <Plus size={28} strokeWidth={3} />
        </button>
    );
};
