import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams, useNavigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { TelegramProvider } from "./providers/TelegramProvider";
import SplashScreen from "./components/SplashScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import RegistrationScreen from "./components/RegistrationScreen";
import { shouldShowOnboarding, markOnboardingCompleted, shouldShowRegistration } from "./lib/onboardingUtils";
import { usersApi } from "./lib/api";
import Index from "./pages/Index";
import CreateTeam from "./pages/CreateTeam";
import TeamBuilder from "./pages/TeamBuilder";
import TeamManagement from "./pages/TeamManagement";
import League from "./pages/League";
import CreateLeague from "./pages/CreateLeague";
import TournamentTable from "./pages/TournamentTable";
import Transfers from "./pages/Transfers";
import ViewTeam from "./pages/ViewTeam";
import ViewLeague from "./pages/ViewLeague";
import ViewComLeague from "./pages/ViewComLeague";
import ViewUserLeague from "./pages/ViewUserLeague";
import Profile from "./pages/Profile";
import BackendTest from "./pages/BackendTest";
import NotFound from "./pages/NotFound";

// Wrapper to force re-render when team ID changes
const ViewTeamWrapper = () => {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("id") || "1";
  return <ViewTeam key={teamId} />;
};

// Backward-compatible wrapper: supports /view-user-league?id=123 by redirecting to /view-user-league/123
const ViewUserLeagueQueryWrapper = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      navigate("/league", { replace: true });
      return;
    }

    const rest = new URLSearchParams(searchParams);
    rest.delete("id");

    const nextUrl = `/view-user-league/${encodeURIComponent(id)}${rest.toString() ? `?${rest.toString()}` : ""}`;
    navigate(nextUrl, { replace: true });
  }, [navigate, searchParams]);

  return null;
};

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
    const decideScreens = async () => {
      // Ждём завершения заставки
      if (showSplash) return;

      let isRegisteredBackend: boolean | null = null;

      try {
        const response = await usersApi.getProtected();
        if (response.success && response.data) {
          const anyData = response.data as any;
          const user = anyData.user;
          const hasName = !!user?.username;
          const hasBirthDate = !!user?.birth_date;
          if (hasName && hasBirthDate) {
            isRegisteredBackend = true;
          } else {
            isRegisteredBackend = false;
          }
        }
      } catch {
        // Если запрос не удался (нет токена, dev-режим и т.п.) — fallback к локальной логике
      }

      const isRegistered =
        isRegisteredBackend !== null
          ? isRegisteredBackend
          : !shouldShowRegistration();

      // Если это инвайт в лигу и пользователь уже зарегистрирован — ничего не показываем
      if (isLeagueInvite && isRegistered) {
        return;
      }

      // Если это реферальная ссылка и пользователь зарегистрирован — тоже ничего не показываем
      if (isReferral && isRegistered) {
        return;
      }

      // Если по данным бэка пользователь уже заполнил имя и дату рождения,
      // не показываем онбординг/регистрацию даже на новом устройстве.
      if (isRegistered) {
        return;
      }

      // Пользователь ещё не завершил регистрацию
      if (shouldShowOnboarding()) {
        setShowOnboarding(true);
      } else {
        setShowRegistration(true);
      }
    };

    void decideScreens();
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

  const handleResetApp = () => {
    localStorage.clear();
    window.location.reload();
  };

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
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/view-team" element={<ViewTeamWrapper />} />
              <Route path="/view-league" element={<ViewLeague />} />
              <Route path="/view-com-league" element={<ViewComLeague />} />
              <Route path="/view-user-league" element={<ViewUserLeagueQueryWrapper />} />
              <Route path="/view-user-league/:id" element={<ViewUserLeague />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/backtest" element={<BackendTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </TelegramProvider>
  );
};

export default App;
