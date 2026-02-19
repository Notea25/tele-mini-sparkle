import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, ChevronDown, ChevronUp, User, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SportHeader from "@/components/SportHeader";
import EditTeamNameModal from "@/components/EditTeamNameModal";
import { useDeadline } from "@/hooks/useDeadline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { squadsApi, toursApi, customLeaguesApi, commercialLeaguesApi, Squad, LeaderboardEntry, CustomLeagueLeaderboardEntry, CommercialLeague, MySquadLeague } from "@/lib/api";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { useTeams } from "@/hooks/useTeams";

import RulesDrawer from "@/components/RulesDrawer";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";
import beteraLogo from "@/assets/betera-basketball-logo.png";
import eslLogo from "@/assets/esl-logo.png";
import leagueLogo from "@/assets/league-logo.png";
import aplLogo from "@/assets/apl-logo.png";
import btnTeamIcon from "@/assets/btn-team-icon.png";
import btnTransfersIcon from "@/assets/btn-transfers-icon.png";
import { getGoldenTourBackup, clearGoldenTourBackup, getBoostState, markBoostAsUsed } from "@/lib/boostState";
import { BoostId } from "@/constants/boosts";
import { restoreTeamFromBackup } from "@/lib/teamData";
import { safeGetItem } from "@/lib/safeStorage";
import { pluralizeDays } from "@/lib/pluralize";
import cupComingSoon from "@/assets/cup-coming-soon.png";

// Preload all page images at module level to start loading immediately
const ALL_PAGE_IMAGES = [
  arrowUpRed, arrowDownGreen, arrowSame, arrowDownBlack,
  trophyGold, trophySilver, trophyBronze,
  beteraLogo, eslLogo, leagueLogo, aplLogo,
  btnTeamIcon, btnTransfersIcon, cupComingSoon
];

const LEAGUE_TAB_KEY = "fantasyLeagueActiveTab";
const SELECTED_LEAGUE_ID_KEY = "fantasySelectedLeagueId";

const League = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Preload all images to prevent flickering when switching tabs
  const imagesLoaded = useImagePreloader(ALL_PAGE_IMAGES);
  
  // Get league ID from localStorage (default 116)
  const leagueId = parseInt(localStorage.getItem(SELECTED_LEAGUE_ID_KEY) || '116', 10);
  
  // Fetch user squads from API (or cache)
  const { data: mySquadsResponse } = useQuery({
    queryKey: ['mySquads'],
    queryFn: () => squadsApi.getMySquads(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
  
  // Fetch tours info from API (or cache)
  const { data: toursResponse } = useQuery({
    queryKey: ['tours', leagueId],
    queryFn: () => toursApi.getPreviousCurrentNextTour(leagueId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
 
  // Find the squad for current league (with safety check for API errors)
  const squadsData = Array.isArray(mySquadsResponse?.data) ? mySquadsResponse.data : [];
  const currentSquad: Squad | undefined = squadsData.find(
    (squad) => squad.league_id === leagueId
  );
  const mySquadId = currentSquad?.id;
  
  // Get tour info from API response
  // When a tour starts, we immediately show its number and leaderboard data,
  // even if matches haven't finished yet (leaderboard will show 0 points initially)
  const toursData = toursResponse?.data;
  
  // Check if season hasn't started (no previous and no current tour)
  const isSeasonNotStarted = !toursData?.previous_tour && !toursData?.current_tour;
  
  // For leaderboard and display: use current tour if it exists (tour has started)
  // Otherwise use next tour if season hasn't started
  const currentTourId = isSeasonNotStarted
    ? toursData?.next_tour?.id
    : (toursData?.current_tour?.id ?? toursData?.previous_tour?.id ?? null);
  
  const currentTourNumber = isSeasonNotStarted
    ? toursData?.next_tour?.number
    : (toursData?.current_tour?.number ?? toursData?.previous_tour?.number ?? 1);
  
  const nextTourNumber = toursData?.next_tour?.number ?? (toursData?.current_tour?.number ?? 1) + 1;
  
  // Fetch leaderboard data for tournament table preview
  const { data: leaderboardResponse, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', currentTourId],
    queryFn: () => currentTourId ? squadsApi.getLeaderboard(currentTourId) : Promise.resolve({ success: false, data: [] }),
    enabled: !!currentTourId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Get fav_team_id from current squad
  const favTeamId = currentSquad?.fav_team_id;
  
  // Club league data removed - using squad leaderboard by fav_team instead
  
  // Fetch club league leaderboard by fav_team_id
  const { data: clubLeaderboardResponse, isLoading: clubLeaderboardLoading } = useQuery({
    queryKey: ['clubLeaderboard', currentTourId, favTeamId],
    queryFn: () => (favTeamId && currentTourId) 
      ? customLeaguesApi.getClubLeaderboard(currentTourId, favTeamId) 
      : Promise.resolve({ success: false, data: undefined }),
    enabled: !!favTeamId && !!currentTourId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch commercial leagues from API
  const { data: commercialLeaguesResponse, isLoading: commercialLeaguesLoading } = useQuery({
    queryKey: ['commercialLeagues', leagueId],
    queryFn: () => commercialLeaguesApi.getByLeague(leagueId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch user's leagues from API
  const { data: mySquadLeaguesResponse, isLoading: myLeaguesLoading } = useQuery({
    queryKey: ['mySquadLeagues'],
    queryFn: () => customLeaguesApi.getMySquadLeagues(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const clubLeaderboardData = useMemo(() => {
    const rawData = clubLeaderboardResponse?.data;
    if (!Array.isArray(rawData) || rawData.length === 0) return [];
    
    // DEBUG: Log first entry to see backend data
    if (rawData.length > 0) {
      const firstEntry = rawData[0];
      console.log('🔍 Клубный лидерборд - первая запись:', {
        squad_name: firstEntry.squad_name,
        tour_points: firstEntry.tour_points,
        total_points: firstEntry.total_points,
        penalty_points: firstEntry.penalty_points,
        total_penalty_points: firstEntry.total_penalty_points
      });
    }
    
    return rawData.map((entry: CustomLeagueLeaderboardEntry) => {
      // TEMPORARY FIX: If total_points is positive but should be negative
      // (when total_penalty_points > total_points), negate it
      let totalPoints = entry.total_points;
      const totalPenalty = entry.total_penalty_points || 0;
      
      // Check if backend returned absolute value instead of net points
      if (totalPoints > 0 && totalPenalty > 0) {
        // If penalties are greater than points, it should be negative
        const netPoints = totalPoints - totalPenalty;
        if (netPoints < 0) {
          totalPoints = netPoints;
        }
      }
      
      return {
        id: entry.squad_id,
        position: entry.place,
        name: entry.squad_name,
        tourPoints: entry.tour_points,
        totalPoints,
        totalPenaltyPoints: totalPenalty,
        penaltyPoints: entry.penalty_points || 0,
        isUser: entry.squad_id === mySquadId,
        change: "same" as "up" | "down" | "same",
      };
    });
  }, [clubLeaderboardResponse?.data, mySquadId]);
  // Support ?tab=leagues query param for direct navigation to a specific tab
  const [searchParams] = useSearchParams();
  const initialTab = (() => {
    const t = searchParams.get("tab");
    if (t === "leagues" || t === "cup") return t;
    return "main";
  })();
  const [activeTab, setActiveTab] = useState<"main" | "leagues" | "cup">(initialTab);
  const [teamName, setTeamName] = useState(() => {
    return localStorage.getItem("fantasyTeamName") || "Lucky Team";
  });
  const [isEditTeamNameModalOpen, setIsEditTeamNameModalOpen] = useState(false);
  const [isRulesDrawerOpen, setIsRulesDrawerOpen] = useState(false);
  const [showAllCommercialLeagues, setShowAllCommercialLeagues] = useState(false);
  const [showPastLeagues, setShowPastLeagues] = useState(false);
  const [showAllClubLeague, setShowAllClubLeague] = useState(() => {
    return sessionStorage.getItem("leagueShowAllClubLeague") === "true";
  });
  const [showAllMyLeagues, setShowAllMyLeagues] = useState(() => {
    return sessionStorage.getItem("leagueShowAllMyLeagues") === "true";
  });
  const [clubLeaguePage, setClubLeaguePage] = useState(() => {
    const savedPage = sessionStorage.getItem("leagueClubLeaguePage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  // Save pagination state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("leagueClubLeaguePage", clubLeaguePage.toString());
  }, [clubLeaguePage]);

  useEffect(() => {
    sessionStorage.setItem("leagueShowAllClubLeague", showAllClubLeague.toString());
  }, [showAllClubLeague]);

  useEffect(() => {
    sessionStorage.setItem("leagueShowAllMyLeagues", showAllMyLeagues.toString());
  }, [showAllMyLeagues]);

  // First tour deadline - before this, show "pre-tournament" UI with zeroed stats
  const firstTourDeadline = new Date("2025-12-14T19:00:00");
  const [isTournamentStarted, setIsTournamentStarted] = useState(() => new Date() >= firstTourDeadline);

  // Current tour for determining finished leagues (simulated as tour 6 for demo)
  const currentTour = isTournamentStarted ? 6 : 1;

  // Check for Golden Tour restoration when tour changes
  useEffect(() => {
    const backup = getGoldenTourBackup();
    const boostState = getBoostState();
    
    // If there's a backup and the boost was used (tour has ended), restore the squad
    if (backup && backup.tour < currentTour) {
      // Restore the team to the pre-Golden Tour state
      restoreTeamFromBackup(
        backup.mainSquad,
        backup.bench,
        backup.captain,
        backup.viceCaptain
      );
      
      // Mark the boost as used and clear the backup
      markBoostAsUsed(BoostId.GOLDEN, backup.tour);
      clearGoldenTourBackup();
      
      toast.success("Тур завершён. Состав восстановлен после Золотого тура.");
    }
  }, [currentTour]);

  // Get Russian team name from teams API (same source as CreateTeam)
  const { teams: apiTeams } = useTeams(String(leagueId));
  
  const clubLeagueName = useMemo(() => {
    if (!favTeamId || !apiTeams.length) return "Лига клуба";
    const team = apiTeams.find(t => t.id === favTeamId);
    const teamName = team ? (team.name_rus || team.name) : null;
    return teamName ? `Лига «${teamName}»` : "Лига клуба";
  }, [favTeamId, apiTeams]);
  // Save team name - send to backend
  const [isRenamingSaving, setIsRenamingSaving] = useState(false);
  
  const handleSaveTeamName = async (newName: string) => {
    if (!currentSquad) {
      toast.error("Сквад не найден");
      return;
    }
    
    setIsRenamingSaving(true);
    try {
      const response = await squadsApi.rename(currentSquad.id, newName);
      if (response.success) {
        setTeamName(newName);
        localStorage.setItem("fantasyTeamName", newName);
        // Invalidate cache to refresh squad data
        queryClient.invalidateQueries({ queryKey: ['mySquads'] });
        toast.success("Название команды обновлено");
      } else {
        toast.error(response.error || "Ошибка при переименовании");
      }
    } catch (error) {
      toast.error("Ошибка при переименовании");
    } finally {
      setIsRenamingSaving(false);
    }
  };

  // Deadline countdown using shared hook
  const leagueIdForDeadline = localStorage.getItem('fantasySelectedLeagueId') || '116';
  const { deadlineDate, isLoading: deadlineLoading, timeLeft, formattedDeadline } = useDeadline(leagueIdForDeadline);

  // Restore scroll position when returning to this page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("leagueScrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  // Save scroll position before navigating away
  const handleNavigate = (path: string) => {
    console.log('[League] handleNavigate called', { path, currentPath: window.location.pathname });
    try {
      sessionStorage.setItem("leagueScrollPosition", window.scrollY.toString());
      navigate(path);
      console.log('[League] Navigation triggered successfully');
    } catch (error) {
      console.error('[League] Navigation error:', error);
    }
  };

  // Check if tournament has started
  useEffect(() => {
    const checkTournamentStarted = () => {
      const now = new Date();
      setIsTournamentStarted(now >= firstTourDeadline);
    };
    checkTournamentStarted();
    const timer = setInterval(checkTournamentStarted, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tournament table data from API - top 3 + user's position
  const tableData = useMemo(() => {
    const rawData = leaderboardResponse?.data;
    const leaderboard = Array.isArray(rawData) ? rawData : [];
    if (leaderboard.length === 0) return [];
    
    // DEBUG: Log first entry to see backend data
    if (leaderboard.length > 0) {
      const firstEntry = leaderboard[0];
      console.log('🔍 Главный лидерборд - первая запись:', {
        squad_name: firstEntry.squad_name,
        tour_points: firstEntry.tour_points,
        total_points: firstEntry.total_points,
        penalty_points: firstEntry.penalty_points,
        total_penalty_points: firstEntry.total_penalty_points
      });
    }
    
    const userEntry = leaderboard.find((entry: LeaderboardEntry) => entry.squad_id === mySquadId);
    
    const top3 = leaderboard.slice(0, 3).map((entry: LeaderboardEntry) => {
      // TEMPORARY FIX: If total_points is positive but should be negative
      let totalPoints = entry.total_points;
      const totalPenalty = entry.total_penalty_points || 0;
      
      // Check if backend returned absolute value or gross points
      if (totalPoints > 0 && totalPenalty > 0) {
        const netPoints = totalPoints - totalPenalty;
        if (netPoints < 0) {
          totalPoints = netPoints;
        }
      }
      
      return {
        id: entry.squad_id,
        position: entry.place,
        name: entry.squad_name,
        tourPoints: entry.tour_points,
        totalPoints,
        totalPenaltyPoints: totalPenalty,
        isUser: entry.squad_id === mySquadId,
        change: "same" as "up" | "down" | "same",
      };
    });
    
    // Find user's entry if not in top 3 (reuse userEntry from above)
    if (userEntry && userEntry.place > 3) {
      // Apply same fix for user entry
      let totalPoints = userEntry.total_points;
      const totalPenalty = userEntry.total_penalty_points || 0;
      
      if (totalPoints > 0 && totalPenalty > 0) {
        const netPoints = totalPoints - totalPenalty;
        if (netPoints < 0) {
          totalPoints = netPoints;
        }
      }
      
      top3.push({
        id: userEntry.squad_id,
        position: userEntry.place,
        name: userEntry.squad_name,
        tourPoints: userEntry.tour_points,
        totalPoints,
        totalPenaltyPoints: totalPenalty,
        isUser: true,
        change: "same" as "up" | "down" | "same",
      });
    }
    
    return top3;
  }, [leaderboardResponse?.data, mySquadId]);

  // Calculate tour statistics from leaderboard data
  const tourStats = useMemo(() => {
    const rawData = leaderboardResponse?.data;
    const leaderboard = Array.isArray(rawData) ? rawData : [];
    if (leaderboard.length === 0) {
      return { averagePoints: 0, myPoints: 0, bestPoints: 0, bestSquadId: undefined };
    }
    
    // Calculate average points (backend already returns net tour points)
    const totalPoints = leaderboard.reduce((sum: number, entry: LeaderboardEntry) => 
      sum + entry.tour_points, 0);
    const averagePoints = Math.round(totalPoints / leaderboard.length);
    
    // Find user's points (backend already returns net tour points)
    const userEntry = leaderboard.find((entry: LeaderboardEntry) => entry.squad_id === mySquadId);
    const myPoints = userEntry ? userEntry.tour_points : 0;
    
    // Find best result (max tour_points) and its squad_id
    const bestEntry = leaderboard.reduce((best: LeaderboardEntry | null, entry: LeaderboardEntry) => {
      return !best || entry.tour_points > best.tour_points ? entry : best;
    }, null);
    const bestPoints = bestEntry ? bestEntry.tour_points : 0;
    const bestSquadId = bestEntry?.squad_id;
    
    return { averagePoints, myPoints, bestPoints, bestSquadId };
  }, [leaderboardResponse?.data, mySquadId]);

  // Process commercial leagues from API
  const commercialLeagues = useMemo(() => {
    const rawData = commercialLeaguesResponse?.data;
    if (!Array.isArray(rawData) || rawData.length === 0) return [];
    
    return rawData.map((league: CommercialLeague) => {
      // Calculate tour period from tours array (with safety check)
      const tours = league.tours ?? [];
      const tourNumbers = tours.map(t => t.number).sort((a, b) => a - b);
      const startTour = tourNumbers[0] ?? 1;
      const endTour = tourNumbers[tourNumbers.length - 1] ?? startTour;
      const period = tourNumbers.length > 1 ? `${startTour}-${endTour} тур` : `${startTour} тур`;
      
      // Format dates (API returns ISO format, we need DD.MM.YYYY)
      const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      };
      
      return {
        id: league.id.toString(),
        name: league.name,
        logo: league.logo, // base64 image from API
        prize: league.prize,
        period,
        startTour,
        endTour,
        registrationStart: formatDate(league.registration_start),
        deadline: formatDate(league.registration_end),
        winnerName: league.winner_name,
        isFinished: league.winner_id !== null,
      };
    });
  }, [commercialLeaguesResponse?.data]);

  // Separate active and finished leagues
  const activeLeagues = commercialLeagues.filter(league => !league.isFinished);
  const finishedLeagues = commercialLeagues.filter(league => league.isFinished);

  // Split active leagues into open and upcoming
  const now = new Date();
  const openLeagues = useMemo(() => activeLeagues.filter(league => {
    const [startDay, startMonth, startYear] = league.registrationStart.split(".");
    const [endDay, endMonth, endYear] = league.deadline.split(".");
    const registrationStartDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
    const deadlineDateParsed = new Date(`${endYear}-${endMonth}-${endDay}T19:00:00`);
    return now >= registrationStartDate && now < deadlineDateParsed;
  }), [activeLeagues]);
  
  const upcomingLeagues = useMemo(() => activeLeagues.filter(league => {
    const [startDay, startMonth, startYear] = league.registrationStart.split(".");
    const registrationStartDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
    return now < registrationStartDate;
  }), [activeLeagues]);

  // Show 1 open + 1 upcoming by default, all on expand
  const displayedActiveLeagues = showAllCommercialLeagues 
    ? activeLeagues 
    : [...openLeagues.slice(0, 1), ...upcomingLeagues.slice(0, 1)];

  // My leagues data from API
  const myLeagues = useMemo(() => {
    const data = mySquadLeaguesResponse?.data;
    if (!Array.isArray(data) || data.length === 0) return [];
    
    return data.map((league: MySquadLeague) => ({
      id: league.user_league_id.toString(),
      place: `${league.squad_place} / ${league.total_players}`,
      name: league.user_league_name,
      hasIcon: true,
      change: "same" as const,
      isOwner: league.is_creator,
      participants: league.total_players,
      squadId: league.squad_id,
    }));
  }, [mySquadLeaguesResponse?.data]);

  // Count user-created leagues for limit check
  const userCreatedLeaguesCount = useMemo(() => {
    return myLeagues.filter(league => league.isOwner).length;
  }, [myLeagues]);

  const tabs = [
    { id: "main", label: "Главная" },
    { id: "leagues", label: "Лиги" },
    { id: "cup", label: "Кубок" },
  ];

  // Handle back button - if team was just created, go to home instead of team builder
  const handleBackClick = () => {
    const teamJustCreated = sessionStorage.getItem("fantasyTeamJustCreated");
    if (teamJustCreated) {
      sessionStorage.removeItem("fantasyTeamJustCreated");
      // Invalidate queries to refresh data on home page
      queryClient.invalidateQueries({ queryKey: ['mySquads'] });
      navigate("/");
      return true; // Prevent default navigation
    }
    return false; // Allow default navigation
  };

  // Show loading state until images are ready
  if (!imagesLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader onBackClick={handleBackClick} />

      <main className="flex-1 px-4 pb-6 overflow-x-hidden">

        {/* Tabs */}
        <div className="bg-secondary/50 rounded-lg p-1 flex mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                const newTab = tab.id as "main" | "leagues" | "cup";
                setActiveTab(newTab);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "main" && (
          <>
            {/* Team Name */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-2xl font-display text-foreground">{currentSquad?.name || teamName}</h1>
              <Pencil
                className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setIsEditTeamNameModalOpen(true)}
              />
            </div>

            {/* Current/First Tour Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <span className="text-muted-foreground text-sm whitespace-nowrap text-regular">
                {currentTourNumber} тур
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div
                className="bg-secondary rounded-xl py-3 flex flex-col items-center cursor-pointer hover:bg-secondary/80 transition-all"
                onClick={() => handleNavigate("/tournament-table")}
              >
                <span className="text-xl font-normal text-foreground font-display">
                  {leaderboardLoading ? "—" : (isTournamentStarted ? tourStats.averagePoints : 0)}
                </span>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap text-regular">Средний результат</span>
                <span className="text-muted-foreground text-xs text-regular">→</span>
              </div>
              <div
                className="bg-primary rounded-xl py-3 flex flex-col items-center cursor-pointer hover:bg-primary/90 transition-all"
                onClick={() => {
                  if (mySquadId) {
                    handleNavigate(`/view-team?id=${mySquadId}`);
                  }
                }}
              >
                <span className="text-2xl font-normal text-primary-foreground font-display">
                  {leaderboardLoading ? "—" : (isTournamentStarted ? tourStats.myPoints : 0)}
                </span>
                <span className="text-[10px] text-primary-foreground/70 whitespace-nowrap text-regular">Мои очки</span>
                <span className="text-primary-foreground text-xs text-regular">→</span>
              </div>
              <div
                className="bg-secondary rounded-xl py-3 flex flex-col items-center cursor-pointer hover:bg-secondary/80 transition-all"
                onClick={() => {
                  if (tourStats.bestSquadId) {
                    handleNavigate(`/view-team?id=${tourStats.bestSquadId}`);
                  }
                }}
              >
                <span className="text-xl font-normal text-foreground font-display">
                  {leaderboardLoading ? "—" : (isTournamentStarted ? tourStats.bestPoints : 0)}
                </span>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap text-regular">Лучший результат</span>
                <span className="text-muted-foreground text-xs text-regular">→</span>
              </div>
            </div>

            {/* Next Tour (only shown after tournament starts) */}
            {isTournamentStarted && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
                <span className="text-muted-foreground text-sm whitespace-nowrap">{nextTourNumber} тур</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
              </div>
            )}

            {/* Deadline */}
            <div className="flex justify-between items-center mb-2 text-regular">
              <span className="text-muted-foreground text-sm">
                Дедлайн: <span className="text-foreground font-medium">{deadlineLoading ? '...' : formattedDeadline || '—'}</span>
              </span>
              <span className="text-foreground text-sm">
                {timeLeft.days} {pluralizeDays(timeLeft.days)} {String(timeLeft.hours).padStart(2, "0")}:
                {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-secondary rounded-full mb-6">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${timeLeft.progress}%` }}
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                className="relative w-full h-[50px] bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all overflow-hidden"
                onClick={() => handleNavigate("/team-management")}
              >
                <span className="text-primary-foreground font-display tracking-tight text-base">Команда</span>
                <div className="absolute -bottom-[2px] -right-[2px] w-[36px] h-[36px] bg-secondary rounded-tl-xl flex items-center justify-center">
                  <img src={btnTeamIcon} alt="" className="w-4 h-4 brightness-0 invert" />
                </div>
              </button>
              <button
                className="relative w-full h-[50px] bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all overflow-hidden"
                onClick={() => handleNavigate("/transfers")}
              >
                <span className="text-primary-foreground font-display tracking-tight text-base">Трансферы</span>
                <div className="absolute -bottom-[2px] -right-[2px] w-[36px] h-[36px] bg-secondary rounded-tl-xl flex items-center justify-center">
                  <img src={btnTransfersIcon} alt="" className="w-4 h-4 brightness-0 invert" />
                </div>
              </button>
            </div>

            {/* Rules button */}
            <div
              className="w-full h-10 bg-secondary rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary/80 transition-opacity mb-8"
              onClick={() => setIsRulesDrawerOpen(true)}
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-display tracking-tight text-sm">Правила игры</span>
            </div>

            {/* Tournament Table */}
            <h2 className="text-2xl font-display text-foreground mb-4">Турнирная таблица</h2>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
              <span className="col-span-3 text-xs">Место</span>
              <span className="col-span-4 text-xs">Название</span>
              <span className="col-span-3 text-center">
                <span className="text-xs block whitespace-nowrap">{currentTourNumber}-й тур</span>
                <span className="text-[10px] italic block">(очки)</span>
              </span>
              <span className="col-span-2 text-right">
                <span className="text-xs block">Всего</span>
                <span className="text-[10px] italic block">(очков)</span>
              </span>
            </div>

            {/* Table rows */}
            <div className="space-y-2">
              {leaderboardLoading ? (
                // Skeleton loading state
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-full bg-secondary/50 animate-pulse">
                      <div className="col-span-3 flex items-center gap-1">
                        <div className="w-3 h-3 bg-muted rounded-full" />
                        <div className="w-4 h-4 bg-muted rounded" />
                      </div>
                      <div className="col-span-4">
                        <div className="h-4 bg-muted rounded w-20" />
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <div className="h-4 bg-muted rounded w-8" />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <div className="h-4 bg-muted rounded w-10" />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                tableData.map((row, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-full cursor-pointer transition-colors hover:bg-secondary/70 ${
                      row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                    }`}
                    onClick={() => {
                      handleNavigate(`/view-team?id=${row.id}`);
                    }}
                  >
                    <div className="col-span-3 flex items-center gap-1">
                      {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                      {row.change === "down" && !row.isUser && (
                        <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />
                      )}
                      {row.change === "down" && row.isUser && (
                        <img src={arrowDownBlack} alt="down" className="w-3 h-3" />
                      )}
                      {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                      <span className={`text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.position}</span>
                      {row.position === 1 && <img src={trophyGold} alt="1st" className="w-4 h-4" />}
                      {row.position === 2 && <img src={trophySilver} alt="2nd" className="w-4 h-4" />}
                      {row.position === 3 && <img src={trophyBronze} alt="3rd" className="w-4 h-4" />}
                    </div>
                    <span className={`col-span-4 text-sm truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.name}</span>
                    <span className={`col-span-3 text-center text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.tourPoints}</span>
                    <span className={`col-span-2 text-right font-bold text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>
                      {(row.totalPoints - (row.totalPenaltyPoints || 0)).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* View all button */}
            <Button
              variant="outline"
              className="w-full mt-6 rounded-lg py-6 font-semibold border-border hover:text-primary-foreground"
              onClick={() => handleNavigate("/tournament-table")}
            >
              Смотреть все
            </Button>
          </>
        )}

        {activeTab === "leagues" && (
          <>
            {/* Commercial Leagues Section */}
            <div className="mb-8">
              {/* Section Title */}
              <h2 className="text-2xl font-display text-foreground mb-2">Коммерческие лиги</h2>
              {/* Section Description */}
              <p className="text-muted-foreground text-sm mb-6">Соревнуйся за призы в коммерческих лигах</p>

              {/* Past leagues button */}
              {finishedLeagues.length > 0 && (
                <button
                  className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm py-3 mb-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                  onClick={() => setShowPastLeagues(!showPastLeagues)}
                >
                  {showPastLeagues ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Скрыть прошедшие турниры
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Посмотреть прошедшие турниры ({finishedLeagues.length})
                    </>
                  )}
                </button>
              )}

              {/* Past leagues */}
              {showPastLeagues && finishedLeagues.length > 0 && (
                <div className="space-y-3 mb-6">
                  {finishedLeagues.map((league, idx) => (
                    <Card
                      key={`finished-${idx}`}
                      className="bg-secondary/30 border-border/30 overflow-hidden cursor-pointer hover:bg-secondary/50 transition-colors opacity-70"
                      onClick={() =>
                        handleNavigate(
                          `/view-com-league?id=${league.id}&name=${encodeURIComponent(league.name)}&prize=${encodeURIComponent(league.prize)}&finished=true&startTour=${league.startTour}&deadline=${encodeURIComponent(league.deadline)}&registrationOpen=false&beforeRegistration=false`,
                        )
                      }
                    >
                      <div className="p-4">
                        {/* League Logo + Arrow */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                              <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-foreground text-lg font-bold">{league.name}</span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                          <span>Приз</span>
                          <span>Отрезок</span>
                        </div>

                        {/* Table Values */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-foreground mb-3">
                          <span className="font-medium">{league.prize}</span>
                          <span>{league.period}</span>
                        </div>

                        {/* Winner Info */}
                        <div className="pt-3 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Победитель: <span className="text-primary font-medium">{league.winnerName || 'Неизвестно'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Active leagues cards */}
              <div className="space-y-3">
                {displayedActiveLeagues.map((league, idx) => {
                  const userCommercialLeagues = JSON.parse(localStorage.getItem("userCommercialLeagues") || "[]");
                  const isParticipating = userCommercialLeagues.includes(league.id);

                  // Parse registration dates
                  const [startDay, startMonth, startYear] = league.registrationStart.split(".");
                  const [endDay, endMonth, endYear] = league.deadline.split(".");
                  const registrationStartDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
                  const deadlineDate = new Date(`${endYear}-${endMonth}-${endDay}T19:00:00`);
                  const now = new Date();
                  const isRegistrationOpen = now >= registrationStartDate && now < deadlineDate;
                  const isBeforeRegistration = now < registrationStartDate;

                  // Render blurred card for leagues before registration
                  if (isBeforeRegistration && !isParticipating) {
                    return (
                      <Card
                        key={idx}
                        className="relative bg-secondary/50 border-border/50 overflow-hidden"
                      >
                        {/* Blurred content */}
                        <div className="p-4 opacity-25 blur-[4px]">
                          {/* League Logo + Arrow */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                                <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
                              </div>
                              <span className="text-foreground text-lg font-bold">{league.name}</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                          </div>

                          {/* Table Header */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                            <span>Приз</span>
                            <span>Отрезок</span>
                          </div>

                          {/* Table Values */}
                          <div className="grid grid-cols-2 gap-2 text-sm text-foreground mb-3">
                            <span className="font-medium">{league.prize}</span>
                            <span>{league.period}</span>
                          </div>

                          {/* Registration Info */}
                          <div className="pt-3 border-t border-border/30">
                            <span className="text-xs text-muted-foreground">
                              Регистрация: {league.registrationStart} – {league.deadline}
                            </span>
                          </div>
                        </div>

                        {/* Overlay text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-foreground text-base font-bold font-unbounded mb-1">Регистрация откроется</p>
                          <p className="text-primary text-sm font-black">{league.registrationStart}</p>
                        </div>
                      </Card>
                    );
                  }

                  return (
                    <Card
                      key={idx}
                      className="bg-secondary/50 border-border/50 overflow-hidden cursor-pointer hover:bg-secondary/70 transition-colors"
                      onClick={() =>
                        handleNavigate(
                          `/view-com-league?id=${league.id}&name=${encodeURIComponent(league.name)}&prize=${encodeURIComponent(league.prize)}&finished=false&startTour=${league.startTour}&deadline=${encodeURIComponent(league.deadline)}&registrationOpen=${isRegistrationOpen}&beforeRegistration=${isBeforeRegistration}`,
                        )
                      }
                    >
                      <div className="p-4">
                        {/* League Logo + Arrow */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                              <img src={league.logo} alt={league.name} className="w-8 h-8 object-contain" />
                            </div>
                            <span className="text-foreground text-lg font-bold">{league.name}</span>
                          </div>
                          <ArrowRight className={`w-5 h-5 ${isParticipating ? "text-primary" : "text-muted-foreground"}`} />
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                          <span>Приз</span>
                          <span>Отрезок</span>
                        </div>

                        {/* Table Values */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-foreground mb-3">
                          <span className="font-medium">{league.prize}</span>
                          <span>{league.period}</span>
                        </div>

                        {/* Registration Info */}
                        <div className="pt-3 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Регистрация: {league.registrationStart} – {league.deadline}
                            </span>
                            {isParticipating && (
                              <span className="text-xs text-primary font-medium">Вы участвуете</span>
                            )}
                            {!isParticipating && isRegistrationOpen && (
                              <span className="text-xs text-primary font-medium">Открыта</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* See all active leagues button */}
              {activeLeagues.length > 3 && (
                <button
                  className="w-full flex items-center justify-center gap-1 text-foreground text-sm py-3 mt-4"
                  onClick={() => setShowAllCommercialLeagues(!showAllCommercialLeagues)}
                >
                  {showAllCommercialLeagues ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Скрыть
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Смотреть все ({activeLeagues.length})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* My Leagues */}
            <h2 className="text-2xl font-display text-foreground mb-2">Мои лиги</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с друзьями в собственных мини-лигах внутри Высшей лиги Беларуси по футболу
            </p>

            {/* My leagues content */}
            {myLeaguesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка...
              </div>
            ) : myLeagues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-xl mb-4">
                У вас пока нет лиг
              </div>
            ) : (
              <>
                {/* My leagues table header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
                  <span className="col-span-4">Место</span>
                  <span className="col-span-8">Название</span>
                </div>

                {/* My leagues rows */}
                <div className="space-y-2 mb-4">
                  {(showAllMyLeagues ? myLeagues : myLeagues.slice(0, 5)).map((league, idx) => (
                    <div
                      key={league.id}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary/70 transition-colors"
                      onClick={() => {
                        handleNavigate(
                          `/view-user-league?id=${league.id}&name=${encodeURIComponent(league.name)}&owner=${league.isOwner}&participants=${league.participants}`,
                        );
                      }}
                    >
                      <div className="col-span-4 flex items-center gap-1">
                        <img src={arrowSame} alt="same" className="w-3 h-3" />
                        <span className="text-foreground text-sm">{league.place}</span>
                      </div>
                      <span className="col-span-5 text-foreground text-sm truncate">{league.name}</span>
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        {league.isOwner && <User className="w-4 h-4 text-primary" />}
                        <span className="text-muted-foreground">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* See all my leagues button */}
            {myLeagues.length > 5 && (
              <button
                className="w-full flex items-center justify-center gap-1 text-foreground text-sm py-3 mb-4"
                onClick={() => setShowAllMyLeagues(!showAllMyLeagues)}
              >
                {showAllMyLeagues ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Скрыть
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Смотреть все ({myLeagues.length})
                  </>
                )}
              </button>
            )}

            {/* Create league button */}
            <Button
              className={`w-full rounded-lg py-6 font-semibold mb-8 ${
                userCreatedLeaguesCount >= 5
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary text-primary-foreground"
              }`}
              onClick={() => {
                if (userCreatedLeaguesCount >= 5) {
                  toast.error("Ты не можешь создать более 5 лиг, где являешься владельцем");
                } else {
                  handleNavigate("/create-league");
                }
              }}
            >
              Создать лигу
            </Button>

            {/* Club League */}
            <h2 className="text-2xl font-display text-foreground mb-2">{clubLeagueName}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с другими болельщиками твоего любимого клуба
            </p>

            {/* Club league content */}
            {clubLeaderboardLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Загрузка...
              </div>
            ) : clubLeaderboardData.length === 0 ? (
              <>
                {/* Club league table header */}
                <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
                  <span className="col-span-3 text-xs">Место</span>
                  <span className="col-span-4 text-xs">Название</span>
                  <span className="col-span-3 text-center">
                    <span className="text-xs block whitespace-nowrap">{currentTourNumber}-й тур</span>
                    <span className="text-[10px] italic block">(очки)</span>
                  </span>
                  <span className="col-span-2 text-right">
                    <span className="text-xs block">Всего</span>
                    <span className="text-[10px] italic block">(очков)</span>
                  </span>
                </div>
                <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-xl">
                  Нет данных
                </div>
              </>
            ) : (
              <>
                {/* Club league table header */}
                <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
                  <span className="col-span-3 text-xs">Место</span>
                  <span className="col-span-4 text-xs">Название</span>
                  <span className="col-span-3 text-center">
                    <span className="text-xs block whitespace-nowrap">{currentTourNumber}-й тур</span>
                    <span className="text-[10px] italic block">(очки)</span>
                  </span>
                  <span className="col-span-2 text-right">
                    <span className="text-xs block">Всего</span>
                    <span className="text-[10px] italic block">(очков)</span>
                  </span>
                </div>

                {/* Club league data from API */}
                {(() => {
                  // Find user's entry for collapsed view
                  const userEntry = clubLeaderboardData.find(entry => entry.isUser);
                  const userPosition = userEntry ? clubLeaderboardData.indexOf(userEntry) : -1;

                  // When collapsed: show top 3 + user (if not in top 3)
                  // When expanded: show paginated 10 items per page
                  let displayData;
                  if (showAllClubLeague) {
                    displayData = clubLeaderboardData.slice((clubLeaguePage - 1) * 10, clubLeaguePage * 10);
                  } else {
                    const top3 = clubLeaderboardData.slice(0, 3);
                    if (userEntry && userPosition >= 3) {
                      displayData = [...top3, userEntry];
                    } else {
                      displayData = top3;
                    }
                  }

                  const totalPages = Math.ceil(clubLeaderboardData.length / 10);

                  return (
                    <>
                      <div className="space-y-2">
                        {displayData.map((row) => (
                          <div
                            key={row.id}
                            className={`grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-secondary/70 ${
                              row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                            }`}
                            onClick={() => {
                              if (row.isUser && mySquadId) {
                                handleNavigate(`/view-team?id=${mySquadId}`);
                              } else {
                                handleNavigate(`/view-team?id=${row.id}&name=${encodeURIComponent(row.name)}`);
                              }
                            }}
                          >
                            <div className="col-span-3 flex items-center gap-1">
                              {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                              {row.change === "down" && !row.isUser && (
                                <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />
                              )}
                              {row.change === "down" && row.isUser && (
                                <img src={arrowDownBlack} alt="down" className="w-3 h-3" />
                              )}
                              {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                              <span className={`text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>
                                {row.position}
                              </span>
                              {row.position === 1 && <img src={trophyGold} alt="1st" className="w-4 h-4" />}
                              {row.position === 2 && <img src={trophySilver} alt="2nd" className="w-4 h-4" />}
                              {row.position === 3 && <img src={trophyBronze} alt="3rd" className="w-4 h-4" />}
                            </div>
                            <span
                              className={`col-span-4 text-sm truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                            >
                              {row.name}
                            </span>
                            <span
                              className={`col-span-3 text-center text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                            >
                              {row.tourPoints}
                            </span>
                            <span
                              className={`col-span-2 text-right font-bold text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                            >
                              {(row.totalPoints - (row.totalPenaltyPoints || 0)).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pagination for expanded view */}
                      {showAllClubLeague && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <button
                            className="px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm disabled:opacity-40"
                            disabled={clubLeaguePage === 1}
                            onClick={() => setClubLeaguePage((p) => p - 1)}
                          >
                            ←
                          </button>
                          <span className="text-foreground text-sm">
                            {clubLeaguePage} / {totalPages}
                          </span>
                          <button
                            className="px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm disabled:opacity-40"
                            disabled={clubLeaguePage === totalPages}
                            onClick={() => setClubLeaguePage((p) => p + 1)}
                          >
                            →
                          </button>
                        </div>
                      )}

                      {/* See all / collapse button */}
                      {clubLeaderboardData.length > 3 && (
                        <button
                          className="w-full flex items-center justify-center gap-1 text-foreground text-sm py-4"
                          onClick={() => {
                            setShowAllClubLeague(!showAllClubLeague);
                            if (!showAllClubLeague) setClubLeaguePage(1);
                          }}
                        >
                          {showAllClubLeague ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Скрыть
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Смотреть все
                            </>
                          )}
                        </button>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </>
        )}

        {activeTab === "cup" && (
          <div className="w-full">
            {/* Main Cup */}
            <h2 className="text-2xl font-display text-foreground mb-4">Кубок</h2>

            {/* Coming soon image */}
            <img 
              src={cupComingSoon} 
              alt="Скоро запустим 2026" 
              className="w-full rounded-xl"
            />
          </div>
        )}
      </main>

      {/* Home Button */}
      {/* <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}

      <EditTeamNameModal
        isOpen={isEditTeamNameModalOpen}
        onClose={() => setIsEditTeamNameModalOpen(false)}
        currentName={currentSquad?.name || teamName}
        onSave={handleSaveTeamName}
      />

      <RulesDrawer
        isOpen={isRulesDrawerOpen}
        onClose={() => setIsRulesDrawerOpen(false)}
      />
    </div>
  );
};

export default League;
