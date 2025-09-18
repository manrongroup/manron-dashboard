import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/contexts/AppProviders";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import BlogManagement from '@/pages/BlogManagement';
import RealEstateManagement from '@/pages/RealEstateManagement';
import ContactsManagement from '@/pages/ContactsManagement';
import SubscribersManagement from '@/pages/SubscribersManagement';
import EmailManagement from '@/pages/EmailManagement';
import WebsiteManagement from '@/pages/WebsiteManagement';
import UserManagement from '@/pages/UserManagement';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';
import AgentManagement from "./pages/AgentManagement";

// Enhanced QueryClient with better caching and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary
    showDetails={process.env.NODE_ENV === 'development'}
    enableReporting={process.env.NODE_ENV === 'production'}
    onError={(error, errorInfo) => {
      console.error('App Error:', error, errorInfo);
    }}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProviders>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blogs"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <BlogManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/real-estate"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <RealEstateManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ContactsManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscribers"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SubscribersManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emails"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <EmailManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/websites"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <WebsiteManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredPermission="manage_users">
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agents"
                element={
                  <ProtectedRoute requiredPermission="manage_users">
                    <DashboardLayout>
                      <AgentManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <div className="p-8 text-center">
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-muted-foreground mt-2">Coming soon...</p>
                      </div>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProviders>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
