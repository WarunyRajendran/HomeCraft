import { lazy, Suspense } from "react";
import { Toaster } from './components/ui/toaster'
import { Toaster as Sonner } from "./components/ui/sonner"
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthListener } from "./components/auth/AuthListener";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Lazy load admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminFurniture = lazy(() => import("./pages/admin/AdminFurniture"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));

const AdminLoader = () => (
  <div className="h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/editor/:projectId" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense>} />
            <Route path="furniture" element={<Suspense fallback={<AdminLoader />}><AdminFurniture /></Suspense>} />
            <Route path="partners" element={<Suspense fallback={<AdminLoader />}><AdminPartners /></Suspense>} />
            <Route path="categories" element={<Suspense fallback={<AdminLoader />}><AdminCategories /></Suspense>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;