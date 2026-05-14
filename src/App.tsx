
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SNRD from "./pages/SNRD";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerTracking from "./pages/CustomerTracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SNRD />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<CustomerPortal />} />
          <Route path="/track/:token" element={<CustomerTracking />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;