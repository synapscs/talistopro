import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Platform Admin Components (moved from main app)
import PlatformLoginPage from './features/platform/auth/PlatformLoginPage';
import PlatformProtectedRoute from './features/platform/auth/PlatformProtectedRoute';
import PlatformLayout from './features/platform/layout/PlatformLayout';
import PlatformDashboard from './features/platform/dashboard/PlatformDashboard';
import OrganizationsList from './features/platform/organizations/OrganizationsList';
import OrganizationDetailPage from './features/platform/organizations/OrganizationDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
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
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<PlatformDashboard />} />
            <Route path="organizations" element={<OrganizationsList />} />
            <Route path="organizations/:id" element={<OrganizationDetailPage />} />
            <Route path="subscriptions" element={<div className="p-6">Subscriptions - Coming Soon</div>} />
            <Route path="billing" element={<div className="p-6">Billing - Coming Soon</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
