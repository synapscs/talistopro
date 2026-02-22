import {
    BarChart3,
    Users,
    ClipboardList,
    Package,
    Settings,
    Calendar,
    Receipt,
    Wrench,
    CreditCard,
    type LucideIcon
} from 'lucide-react';
import { TerminologyPreset } from '../lib/terminology';

export interface NavItem {
    id: string;
    title: string;
    href: string;
    icon: LucideIcon;
    platforms: ('desktop' | 'mobile')[];
    variant?: 'default' | 'ghost';
}

export const getNavigationConfig = (terminology: TerminologyPreset, orgSlug: string): NavItem[] => {
    const { partPlural, orderPlural } = terminology;

    return [
        {
            id: 'dashboard',
            title: 'Dashboard',
            href: `/${orgSlug}/dashboard`,
            icon: BarChart3,
            platforms: ['desktop', 'mobile']
        },
        {
            id: 'orders',
            title: orderPlural || 'Órdenes',
            href: `/${orgSlug}/dashboard/orders`,
            icon: ClipboardList,
            platforms: ['desktop', 'mobile']
        },
        {
            id: 'customers',
            title: 'Clientes',
            href: `/${orgSlug}/dashboard/customers`,
            icon: Users,
            platforms: ['desktop'] // Solo búsqueda/consulta rápida en mobile unificada en el futuro
        },
        {
            id: 'inventory',
            title: partPlural || 'Insumos',
            href: `/${orgSlug}/dashboard/inventory`,
            icon: Package,
            platforms: ['desktop', 'mobile']
        },
        {
            id: 'services',
            title: 'Servicios',
            href: `/${orgSlug}/dashboard/services`,
            icon: Wrench,
            platforms: ['desktop']
        },
        {
            id: 'appointments',
            title: 'Citas',
            href: `/${orgSlug}/dashboard/appointments`,
            icon: Calendar,
            platforms: ['desktop', 'mobile']
        },
        {
            id: 'expenses',
            title: 'Gastos',
            href: `/${orgSlug}/dashboard/expenses`,
            icon: CreditCard,
            platforms: ['desktop']
        },
        {
            id: 'billing',
            title: 'Facturación',
            href: `/${orgSlug}/dashboard/billing`,
            icon: Receipt,
            platforms: ['desktop']
        },
        {
            id: 'settings',
            title: 'Configuración',
            href: `/${orgSlug}/dashboard/settings`,
            icon: Settings,
            platforms: ['desktop'] // BLOQUEADO en mobile por diseño
        }
    ];
};
