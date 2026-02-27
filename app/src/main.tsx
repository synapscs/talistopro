import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authClient } from './lib/auth-client';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { AuthenticatedApp } from './AuthenticatedApp';
import { Loader2 } from 'lucide-react';
import { PlatformLoginPage } from './features/platform/auth/PlatformLoginPage';
import { PlatformProtectedRoute } from './features/platform/auth/PlatformProtectedRoute';
import { PlatformLayout } from './features/platform/layout/PlatformLayout';
import { PlatformDashboard } from './features/platform/dashboard/PlatformDashboard';
import { OrganizationsList } from './features/platform/organizations/OrganizationsList';
import { OrganizationDetailPage } from './features/platform/organizations/OrganizationDetailPage';
import { OrganizationsList } from './features/platform/organizations/OrganizationsList';

const queryClient = new QueryClient();

const App = () => {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-500" size={48} />
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route
                    path="/login"
                    element={!session ? <LoginPage onToggle={() => window.location.href = '/register'} /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/register"
                    element={!session ? <SignupPage onToggle={() => window.location.href = '/login'} /> : <Navigate to="/dashboard" />}
                />

                {/* Platform Admin Routes */}
                <Route path="/platform/login" element={<PlatformLoginPage />} />
                <Route 
                    path="/platform/*" 
                    element={
                        <PlatformProtectedRoute>
                            <PlatformLayout />
                        </PlatformProtectedRoute>
                    } 
                >
                    <Route path="dashboard" element={<PlatformDashboard />} />
                    <Route path="organizations" element={<OrganizationsList />} />
                    <Route path="organizations/:id" element={<OrganizationDetailPage />} />
                    <Route path="subscriptions" element={<div className="p-6">Subscriptions - Coming Soon</div>} />
                    <Route path="billing" element={<div className="p-6">Billing - Coming Soon</div>} />
                    <Route path="*" element={<Navigate to="/platform/dashboard" replace />} />
                </Route>

                {/* Rutas Protegidas Tenant (AuthenticatedApp maneja resolución de slug) */}
                <Route
                    path="/:slug/dashboard/*"
                    element={session ? <AuthenticatedApp /> : <Navigate to="/login" />}
                />
                <Route
                    path="/dashboard/*"
                    element={session ? <AuthenticatedApp /> : <Navigate to="/login" />}
                />

                <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </React.StrictMode>
    );
}

    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route
                    path="/login"
                    element={!session ? <LoginPage onToggle={() => window.location.href = '/register'} /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/register"
                    element={!session ? <SignupPage onToggle={() => window.location.href = '/login'} /> : <Navigate to="/dashboard" />}
                />

                {/* Rutas Protegidas (AuthenticatedApp maneja la resolución de slug y organización activa) */}
                <Route
                    path="/:slug/dashboard/*"
                    element={session ? <AuthenticatedApp /> : <Navigate to="/login" />}
                />

                <Route
                    path="/dashboard/*"
                    element={session ? <AuthenticatedApp /> : <Navigate to="/login" />}
                />

{/* Platform Admin Routes */}
                <Route path="/platform/login" element={<PlatformLoginPage />} />
                <Route 
                    path="/platform/*" 
                    element={
                        <PlatformProtectedRoute>
                            <Routes>
                                <Route path="dashboard" element={<PlatformDashboard />} />
                                <Route path="*" element={<Navigate to="/platform/dashboard" replace />} />
                            </Routes>
                        </PlatformProtectedRoute>
                    } 
                />

                {/* Catch-all para rutas huérfanas o antiguas */}
                <Route
                    path="*"
                    element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
                />
            </Routes>
        </BrowserRouter>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </React.StrictMode>
    );
}
