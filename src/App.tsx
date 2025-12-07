import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TelegramProvider } from "./providers/TelegramProvider";
import Index from "./pages/Index";
import CreateTeam from "./pages/CreateTeam";
import TeamBuilder from "./pages/TeamBuilder";
import TeamManagement from "./pages/TeamManagement";
import League from "./pages/League";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <TelegramProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create-team" element={<CreateTeam />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/team-management" element={<TeamManagement />} />
            <Route path="/league" element={<League />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </TelegramProvider>
);

export default App;
