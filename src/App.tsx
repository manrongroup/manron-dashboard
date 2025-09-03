import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

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
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Blog Management</h1>
                      <p className="text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/real-estate" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Real Estate Management</h1>
                      <p className="text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contacts" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Contact Management</h1>
                      <p className="text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscribers" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Subscriber Management</h1>
                      <p className="text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emails" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">Email Center</h1>
                      <p className="text-muted-foreground mt-2">Coming soon...</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredPermission="manage_users">
                  <DashboardLayout>
                    <div className="p-8 text-center">
                      <h1 className="text-2xl font-bold">User Management</h1>
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
