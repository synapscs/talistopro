import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

// Platform Admin Components moved from main app
import PlatformLoginPage from './features/platform/auth/PlatformLoginPage';
import PlatformProtectedRoute from './features/platform/auth/PlatformProtectedRoute';
import PlatformLayout from './features/platform/layout/PlatformLayout';
import PlatformDashboard from './features/platform/dashboard/PlatformDashboard';
import OrganizationsList from './features/platform/organizations/OrganizationsList';
import OrganizationDetailPage from './features/platform/organizations/OrganizationDetailPage';
import SubscriptionsList from './features/platform/subscriptions/SubscriptionsList';
import SubscriptionDetailPage from './features/platform/subscriptions/SubscriptionDetailPage';
import InvoicesList from './features/platform/billing/InvoicesList';
import InvoiceDetailPage from './features/platform/billing/InvoiceDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppWithRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PlatformLoginPage />} />
          <Route 
            path="/*" 
            element={
              <PlatformProtectedRoute>
                <PlatformLayout />
              </PlatformProtectedRoute>
            } 
          >
            <Route 
              index 
              element={
                <Navigate to="/dashboard" replace /> 
              } 
            />
            <Route path="dashboard" element={<PlatformDashboard />} />
            <Route path="organizations" element={<OrganizationsList />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="subscriptions" element={<SubscriptionsList />} />
            <Route path="subscriptions/:orgId" element={<SubscriptionDetailPage />} />
            <Route path="billing" element={<InvoicesList />} />
            <Route path="billing/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppWithRoutes />
    </React.StrictMode>
  );
}

// Export simple App for testing
export default App;