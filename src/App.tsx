import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { TelegramProvider } from "./providers/TelegramProvider";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import RegistrationScreen from "./components/RegistrationScreen";
import { shouldShowOnboarding, markOnboardingCompleted, shouldShowRegistration } from "./lib/onboardingUtils";
import Index from "./pages/Index";
import CreateTeam from "./pages/CreateTeam";
import TeamBuilder from "./pages/TeamBuilder";
import TeamManagement from "./pages/TeamManagement";
import League from "./pages/League";
import CreateLeague from "./pages/CreateLeague";
import TournamentTable from "./pages/TournamentTable";
import YourTeam from "./pages/YourTeam";
import DreamTeam from "./pages/DreamTeam";
import Transfers from "./pages/Transfers";
import ViewTeam from "./pages/ViewTeam";
import ViewLeague from "./pages/ViewLeague";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PROFILE_STORAGE_KEY = "fantasyUserProfile";

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isReferral, setIsReferral] = useState(false);
  const [isLeagueInvite, setIsLeagueInvite] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if this is a league invite link
    const leagueInviteParam = urlParams.get('leagueInvite');
    if (leagueInviteParam) {
      setIsLeagueInvite(true);
      // Store league invite info for later
      localStorage.setItem('fantasyLeagueInvite', JSON.stringify({
        leagueId: leagueInviteParam,
        leagueName: urlParams.get('leagueName') || 'Лига',
        inviter: urlParams.get('inviter') || 'user'
      }));
    }
    
    // Check if this is a regular referral link
    const refParam = urlParams.get('ref');
    if (refParam) {
      setIsReferral(true);
      localStorage.setItem('fantasyReferrer', refParam);
    }
  }, []);

  useEffect(() => {
    // Check screens after splash completes
    if (!showSplash) {
      // Check if user is registered
      const isRegistered = !shouldShowRegistration();
      
      // If league invite and user registered, skip onboarding
      if (isLeagueInvite && isRegistered) {
        // User already registered, will see league invite modal
        return;
      }
      
      // If referral and user already registered, skip onboarding/registration
      if (isReferral && isRegistered) {
        // User already registered, will be redirected to /create-team via Index
        return;
      }
      
      if (shouldShowOnboarding()) {
        setShowOnboarding(true);
      } else if (shouldShowRegistration()) {
        setShowRegistration(true);
      }
    }
  }, [showSplash, isReferral, isLeagueInvite]);

  const handleOnboardingComplete = () => {
    markOnboardingCompleted();
    setShowOnboarding(false);
    // After onboarding, check if registration is needed
    if (shouldShowRegistration()) {
      setShowRegistration(true);
    }
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
  };

  // Show splash, onboarding, or registration screens
  if (showSplash) {
    return (
      <TelegramProvider>
        <SplashScreen onComplete={() => setShowSplash(false)} minDuration={2500} />
      </TelegramProvider>
    );
  }

  if (showOnboarding) {
    return (
      <TelegramProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </TelegramProvider>
    );
  }

  if (showRegistration) {
    return (
      <TelegramProvider>
        <RegistrationScreen onComplete={handleRegistrationComplete} />
      </TelegramProvider>
    );
  }

  return (
    <TelegramProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create-team" element={<CreateTeam />} />
              <Route path="/team-builder" element={<TeamBuilder />} />
              <Route path="/team-management" element={<TeamManagement />} />
              <Route path="/league" element={<League />} />
              <Route path="/create-league" element={<CreateLeague />} />
              <Route path="/tournament-table" element={<TournamentTable />} />
              <Route path="/your-team" element={<YourTeam />} />
              <Route path="/dream-team" element={<DreamTeam />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/view-team" element={<ViewTeam />} />
              <Route path="/view-league" element={<ViewLeague />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </TelegramProvider>
  );
};

export default App;
