import React, { useEffect } from 'react';
import { useAuthStore, type AuthOrganization } from './stores/useAuthStore';
import { useNavigationStore, AppView } from './stores/useNavigationStore';
import { authClient } from './lib/auth-client';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { AssetsPage } from './features/assets/AssetsPage';
import { CustomerList } from './features/customers/CustomerList';
import { OrdersDashboard } from './features/orders/OrdersDashboard';
import { AutomotiveChecklist } from './features/orders/AutomotiveChecklist';
import { InventoryManager } from './features/inventory/InventoryManager';
import { ServiceCatalog } from './features/services/ServiceCatalog';
import { AppointmentManager } from './features/appointments/AppointmentManager';
import { InvoicingModule } from './features/finance/InvoicingModule';
import { ExpenseManager } from './features/finance/ExpenseManager';
import { IntegrationSettings } from './features/settings/IntegrationSettings';
import { GeneralSettings } from './features/settings/GeneralSettings';
import { StyleGuide } from './pages/StyleGuide';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { OrderDetailsContainer as OrderDetailContainer } from './features/orders/details/OrderDetailsContainer';
import { Loader2 } from 'lucide-react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { client } from './lib/api-client';
import { ThemeInjector } from './components/ThemeInjector';

export const AuthenticatedApp = () => {
    const { setView } = useNavigationStore();
    const { setAuth } = useAuthStore();
    const location = useLocation();
    const { slug } = useParams();
    const { data: session } = authClient.useSession();
    const { data: activeOrg, isPending: pendingActive } = authClient.useActiveOrganization();
    const { data: listOrgs, isPending: pendingList } = authClient.useListOrganizations();

    // Sincronizar useAuthStore con datos COMPLETOS de la organización (Better-Auth + Prisma)
    // Better-Auth solo devuelve campos propios (id, name, slug, logo, metadata).
    // Los campos de negocio (businessType, country, etc.) vienen de /settings (Prisma).
    useEffect(() => {
        if (session?.user && activeOrg) {
            const fetchFullOrg = async () => {
                try {
                    const res = await client.api.settings.$get();
                    if (!res.ok) throw new Error('Error fetching settings');
                    const fullOrg = await res.json();

                    // fullOrg (Prisma) se aplica DESPUÉS para que sus campos prevalezcan sobre activeOrg
                    setAuth(session.user, { ...activeOrg, ...fullOrg } as AuthOrganization);
                } catch (error) {
                    console.error('[AuthApp] Error fetching settings:', error);
                    // CRÍTICO: NO sobrescribir con activeOrg sola (no tiene businessType)
                    // Solo actualizar user, preservar org existente en el store
                    const currentOrg = useAuthStore.getState().organization;
                    setAuth(session.user, (currentOrg || activeOrg) as AuthOrganization);
                }
            };
            fetchFullOrg();
        }
    }, [session, activeOrg, setAuth]);

    // Estado local para evitar que OnboardingWizard se desmonte prematuramente al crear la primera org
    const [isOnboarding, setIsOnboarding] = React.useState(false);

    useEffect(() => {
        if (!pendingList && (!listOrgs || listOrgs.length === 0)) {
            setIsOnboarding(true);
        }
    }, [listOrgs, pendingList]);

    // Lógica de Resolución de Tenant (Seguridad)
    // GUARD: No redirigir durante onboarding — el wizard maneja su propia navegación
    // Sin este guard, setActive() en el wizard dispara este useEffect que hace
    // window.location.href antes de que el setup POST se ejecute.
    useEffect(() => {
        if (pendingList || !listOrgs || isOnboarding) return;

        // Caso 1: Navegación sin slug (redirigir al primero o activo)
        if (!slug) {
            const defaultOrg = activeOrg || listOrgs[0];
            if (defaultOrg) {
                const subPath = location.pathname.replace(/^\/dashboard/, '');
                window.location.href = `/${defaultOrg.slug}/dashboard${subPath}`;
            }
            return;
        }

        const targetOrg = listOrgs.find(org => org.slug === slug);

        if (!targetOrg) {

            window.location.href = '/dashboard';
            return;
        }

        if (!activeOrg || activeOrg.slug !== slug) {
            const syncTenant = async () => {
                try {
                    await authClient.organization.setActive({
                        organizationId: targetOrg.id
                    });
                } catch (error) {
                    console.error("[TenantResolver] Error al sincronizar tenant:", error);
                }
            };
            syncTenant();
        }
    }, [slug, activeOrg, listOrgs, pendingList, isOnboarding]);

    // Sincronizar useNavigationStore con la URL
    useEffect(() => {
        const pathSegments = location.pathname.split('/');
        const path = pathSegments.pop() || 'dashboard';
        const validViews: AppView[] = ['dashboard', 'customers', 'orders', 'checklist', 'inventory', 'services', 'appointments', 'billing', 'expenses', 'integrations', 'style', 'settings', 'assets'];

        // Si el ultimo segmento es el slug o dashboard, asumimos view 'dashboard'
        const currentView = validViews.includes(path as AppView) ? path : 'dashboard';
        setView(currentView as AppView);
    }, [location.pathname, setView]);



    // Si estamos esperando datos base o la organización activa aún se está resolviendo, mostrar cargador
    const isSessionIncomplete = !isOnboarding && !activeOrg && listOrgs && listOrgs.length > 0;

    if ((pendingActive || pendingList || isSessionIncomplete) && !isOnboarding) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-primary-500 mx-auto" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Facturación...</p>
                </div>
            </div>
        );
    }

    // Si no hay organización, forzar Onboarding y mantenerlo aunque listOrgs cambie
    if (isOnboarding || (!activeOrg && (!listOrgs || listOrgs.length === 0))) {
        return <OnboardingWizard onComplete={() => setIsOnboarding(false)} />;
    }

    // Tenant Check: Si el slug en la URL no coincide con la organización activa, esperar sincronización
    if (slug && activeOrg && activeOrg.slug !== slug) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-primary-500 mx-auto" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cambiando de Taller...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ThemeInjector />
            <AppLayout>
                <div className="pb-8">
                    <Routes>
                        <Route path="" element={<Dashboard />} />
                        <Route path="customers" element={<CustomerList />} />
                        <Route path="orders" element={<OrdersDashboard />} />
                        <Route path="orders/:orderId" element={<OrderDetailContainer />} />
                        <Route path="checklist" element={<AutomotiveChecklist />} />
                        <Route path="inventory" element={<InventoryManager />} />
                        <Route path="assets" element={<AssetsPage />} />
                        <Route path="services" element={<ServiceCatalog />} />
                        <Route path="appointments" element={<AppointmentManager />} />
                        <Route path="billing" element={<InvoicingModule />} />
                        <Route path="expenses" element={<ExpenseManager />} />
                        {/* <Route path="integrations" element={<IntegrationSettings />} /> */}
                        <Route path="settings" element={<GeneralSettings />} />
                        {/* <Route path="style" element={<StyleGuide />} /> */}
                        <Route path="*" element={<Navigate to="" replace />} />
                    </Routes>
                </div>
            </AppLayout>
        </>
    );
};
