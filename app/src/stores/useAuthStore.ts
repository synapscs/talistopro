import { create } from 'zustand';
import { BusinessType } from '../lib/terminology';

interface AuthUser {
    name: string;
    email: string;
}

export interface AuthOrganization {
    id: string;
    slug: string;
    name: string;
    businessType: BusinessType;
    country: string;
    primaryCurrency: string;
    secondaryCurrency?: string;
    exchangeRate: number;
    taxRate: number;
    taxName: string;
    timezone: string;
    primaryColor: string;
    // Campos de OrganizationSettings
    taxId?: string;
    taxRegime?: string;
    address?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    email?: string;
    biCurrencyEnabled?: boolean;
    exchangeInverted?: boolean;
    exchangeRateSource?: string;
    autoUpdateRate?: boolean;
    whatsappEnabled?: boolean;
    customTerminology?: Record<string, string>;
    themeKey?: 'obsidian' | 'emerald' | 'industrial' | 'ruby';
}

interface AuthState {
    user: AuthUser | null;
    organization: AuthOrganization | null;
    setAuth: (user: AuthUser, organization: AuthOrganization) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    organization: null,
    setAuth: (user, organization) => set({ user, organization }),
}));

