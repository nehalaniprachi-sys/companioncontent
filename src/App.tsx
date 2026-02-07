import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CreatorProfileProvider, useCreatorProfile } from "@/contexts/CreatorProfileContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Ideas from "./pages/Ideas";
import Create from "./pages/Create";
import Optimize from "./pages/Optimize";
import Plan from "./pages/Plan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useCreatorProfile();
  if (!isOnboarded) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/ideas" element={<ProtectedRoute><Ideas /></ProtectedRoute>} />
    <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
    <Route path="/optimize" element={<ProtectedRoute><Optimize /></ProtectedRoute>} />
    <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CreatorProfileProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CreatorProfileProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
