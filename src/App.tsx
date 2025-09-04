import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
