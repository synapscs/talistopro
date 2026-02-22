import { create } from 'zustand';

export type AppView = 'dashboard' | 'customers' | 'orders' | 'checklist' | 'inventory' | 'services' | 'appointments' | 'billing' | 'expenses' | 'integrations' | 'style' | 'settings';

interface NavigationState {
    currentView: AppView;
    setView: (view: AppView) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    currentView: 'dashboard',
    setView: (view) => set({ currentView: view }),
}));
