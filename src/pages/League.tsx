import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ChevronDown, ChevronUp, User, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SportHeader from "@/components/SportHeader";
import EditTeamNameModal from "@/components/EditTeamNameModal";
import btnTeamBadge from "@/assets/btn-team.png";
import btnTransfersBadge from "@/assets/btn-transfers-badge.png";

import RulesDrawer from "@/components/RulesDrawer";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";
import { getLeaguePreviewTeams } from "@/lib/tournamentData";
import beteraLogo from "@/assets/betera-basketball-logo.png";
import eslLogo from "@/assets/esl-logo.png";
import leagueLogo from "@/assets/league-logo.png";
import aplLogo from "@/assets/apl-logo.png";
import { getGoldenTourBackup, clearGoldenTourBackup, getBoostState, markBoostAsUsed } from "@/lib/boostState";
import { restoreTeamFromBackup } from "@/lib/teamData";
import cupComingSoon from "@/assets/cup-coming-soon.png";

const LEAGUE_TAB_KEY = "fantasyLeagueActiveTab";

const League = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"main" | "leagues" | "cup">(() => {
    const savedTab = localStorage.getItem(LEAGUE_TAB_KEY);
    if (savedTab === "main" || savedTab === "leagues" || savedTab === "cup") {
      return savedTab;
    }
    return "main";
  });
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
      markBoostAsUsed("golden", backup.tour);
      clearGoldenTourBackup();
      
      toast.success("Тур завершён. Состав восстановлен после Золотого тура.");
    }
  }, [currentTour]);

  // Club to league name mapping
  const clubToLeagueName: Record<string, string> = {
    arsenal: "Лига «Арсенала»",
    baranovichi: "Лига «Барановичи»",
    bate: "Лига «БАТЭ»",
    belshina: "Лига «Белшина»",
    vitebsk: "Лига «Витебск»",
    gomel: "Лига «Гомель»",
    "dinamo-brest": "Лига «Динамо-Брест»",
    "dinamo-minsk": "Лига «Динамо-Минск»",
    "dnepr-mogilev": "Лига «Днепр-Могилев»",
    isloch: "Лига «Ислочь»",
    minsk: "Лига «Минск»",
    ml: "Лига «МЛ Витебск»",
    "naftan-novopolotsk": "Лига «Нафтан-Новополоцк»",
    neman: "Лига «Неман»",
    slavia: "Лига «Славия-Мозырь»",
    torpedo: "Лига «Торпедо-БелАЗ»",
  };

  // Get user's favorite team from localStorage
  const favoriteTeam = localStorage.getItem("fantasyFavoriteTeam") || "dinamo-minsk";
  const clubLeagueName = clubToLeagueName[favoriteTeam] || "Лига «Динамо-Минск»";
  // Save team name to localStorage when it changes
  const handleSaveTeamName = (newName: string) => {
    setTeamName(newName);
    localStorage.setItem("fantasyTeamName", newName);
  };

  // Deadline countdown
  const deadlineDate = new Date("2025-12-14T19:00:00");
  const tournamentStartDate = new Date("2025-12-04T19:00:00");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

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
    sessionStorage.setItem("leagueScrollPosition", window.scrollY.toString());
    navigate(path);
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();
      const totalDuration = deadlineDate.getTime() - tournamentStartDate.getTime();
      const elapsed = now.getTime() - tournamentStartDate.getTime();

      // Check if tournament has started
      setIsTournamentStarted(now >= firstTourDeadline);

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        const progress = Math.min((elapsed / totalDuration) * 100, 100);

        setTimeLeft({ days, hours, minutes, seconds, progress });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tournament table data from shared source
  const tableData = getLeaguePreviewTeams();

  // Commercial leagues data with end tour for blur logic and deadlines
  const commercialLeagues = [
    {
      id: "betera",
      name: "Betera",
      logo: beteraLogo,
      prize: "100 Freebet",
      period: "1-3 тур",
      endTour: 3,
      startTour: 1,
      registrationStart: "20.12.2025",
      deadline: "01.03.2026",
      winner: "ProGamer2025",
      winnerPoints: 287,
    },
    { id: "bnb", name: "BNB", logo: eslLogo, prize: "1000 BYN", period: "4-6 тур", endTour: 6, startTour: 4, registrationStart: "20.12.2025", deadline: "15.04.2026" },
    {
      id: "atlant-m",
      name: "Atlant-M",
      logo: leagueLogo,
      prize: "iPhone 17",
      period: "7-9 тур",
      endTour: 9,
      startTour: 7,
      registrationStart: "28.04.2026",
      deadline: "01.05.2026",
      winner: "LuckyStrike",
      winnerPoints: 298,
    },
    {
      id: "abff",
      name: "ABFF",
      logo: aplLogo,
      prize: "VIP-ложа",
      period: "10-12 тур",
      endTour: 12,
      startTour: 10,
      registrationStart: "17.05.2026",
      deadline: "20.05.2026",
    },
    {
      id: "bcs",
      name: "BCS",
      logo: beteraLogo,
      prize: "MacBook",
      period: "13-15 тур",
      endTour: 15,
      startTour: 13,
      registrationStart: "07.06.2026",
      deadline: "10.06.2026",
    },
    {
      id: "hc-dinamo",
      name: "HC Dinamo",
      logo: eslLogo,
      prize: "Абонемент",
      period: "16-18 тур",
      endTour: 18,
      startTour: 16,
      registrationStart: "28.06.2026",
      deadline: "01.07.2026",
    },
    {
      id: "maxline",
      name: "Maxline",
      logo: leagueLogo,
      prize: "250 Free Spin",
      period: "19-21 тур",
      endTour: 21,
      startTour: 19,
      registrationStart: "22.07.2026",
      deadline: "25.07.2026",
    },
    {
      id: "papa-doner",
      name: "Papa Doner",
      logo: aplLogo,
      prize: "100 BYN",
      period: "22-24 тур",
      endTour: 24,
      startTour: 22,
      registrationStart: "12.08.2026",
      deadline: "15.08.2026",
    },
    {
      id: "zubr",
      name: "Zubr",
      logo: beteraLogo,
      prize: "AirPods",
      period: "25-27 тур",
      endTour: 27,
      startTour: 25,
      registrationStart: "07.09.2026",
      deadline: "10.09.2026",
    },
    {
      id: "hello",
      name: "Hello",
      logo: eslLogo,
      prize: "1000 минут",
      period: "28-30 тур",
      endTour: 30,
      startTour: 28,
      registrationStart: "29.10.2026",
      deadline: "01.11.2026",
    },
  ];

  // Separate active and finished leagues
  const activeLeagues = commercialLeagues.filter(league => currentTour <= league.endTour);
  const finishedLeagues = commercialLeagues.filter(league => currentTour > league.endTour);

  // Split active leagues into open and upcoming
  const now = new Date();
  const openLeagues = activeLeagues.filter(league => {
    const [startDay, startMonth, startYear] = league.registrationStart.split(".");
    const [endDay, endMonth, endYear] = league.deadline.split(".");
    const registrationStartDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
    const deadlineDate = new Date(`${endYear}-${endMonth}-${endDay}T19:00:00`);
    return now >= registrationStartDate && now < deadlineDate;
  });
  const upcomingLeagues = activeLeagues.filter(league => {
    const [startDay, startMonth, startYear] = league.registrationStart.split(".");
    const registrationStartDate = new Date(`${startYear}-${startMonth}-${startDay}T00:00:00`);
    return now < registrationStartDate;
  });

  // Show 1 open + 1 upcoming by default, all on expand
  const displayedActiveLeagues = showAllCommercialLeagues 
    ? activeLeagues 
    : [...openLeagues.slice(0, 1), ...upcomingLeagues.slice(0, 1)];

  // My leagues data - combine static data with user-created leagues
  const staticLeagues: Array<{
    place: string;
    name: string;
    hasIcon: boolean;
    change: "up" | "down" | "same";
    isOwner: boolean;
    id: string;
  }> = [
    { place: "2 / 43", name: "Shabany", hasIcon: true, change: "up", isOwner: true, id: "static-shabany" },
    { place: "1 / 12", name: "Gold Cup", hasIcon: true, change: "up", isOwner: true, id: "static-goldcup" },
    { place: "12 / 98", name: "SakaTop", hasIcon: false, change: "down", isOwner: false, id: "static-sakatop" },
    { place: "43 / 474", name: "Gunners", hasIcon: false, change: "down", isOwner: false, id: "static-gunners" },
  ];

  // Load user-created leagues from localStorage
  const [userCreatedLeagues, setUserCreatedLeagues] = useState<
    Array<{
      id: string;
      name: string;
      participants: number;
      isOwner: boolean;
    }>
  >([]);

  useEffect(() => {
    const savedLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
    setUserCreatedLeagues(savedLeagues);
  }, []);

  const myLeagues = [
    ...userCreatedLeagues.map((league) => ({
      place: `1 / ${league.participants}`,
      name: league.name,
      hasIcon: true,
      change: "same" as const,
      isOwner: true,
      id: league.id,
      participants: league.participants,
    })),
    ...staticLeagues.map((league) => ({
      ...league,
      participants: parseInt(league.place.split(" / ")[1]) || 1,
    })),
  ];

  const tabs = [
    { id: "main", label: "Главная" },
    { id: "leagues", label: "Лиги" },
    { id: "cup", label: "Кубок" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader />

      <main className="flex-1 px-4 pb-6 overflow-x-hidden">

        {/* Tabs */}
        <div className="bg-secondary/50 rounded-lg p-1 flex mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                const newTab = tab.id as "main" | "leagues" | "cup";
                setActiveTab(newTab);
                localStorage.setItem(LEAGUE_TAB_KEY, newTab);
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
              <h1 className="text-2xl font-display text-foreground">{teamName}</h1>
              <Pencil
                className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setIsEditTeamNameModalOpen(true)}
              />
            </div>

            {/* Current/First Tour Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <span className="text-muted-foreground text-sm whitespace-nowrap text-regular">
                {isTournamentStarted ? "29 тур" : "1 тур"}
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div
                className="bg-secondary rounded-xl py-3 flex flex-col items-center cursor-pointer hover:bg-secondary/80 transition-all"
                onClick={() => handleNavigate("/tournament-table")}
              >
                <span className="text-xl font-medium text-foreground">{isTournamentStarted ? "40" : "0"}</span>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap text-regular">Средний результат</span>
                <span className="text-muted-foreground text-xs text-regular">→</span>
              </div>
              <div
                className="bg-primary rounded-xl py-3 flex flex-col items-center cursor-pointer hover:bg-primary/90 transition-all"
                onClick={() => handleNavigate("/your-team")}
              >
                <span className="text-2xl font-medium text-primary-foreground">{isTournamentStarted ? "55" : "0"}</span>
                <span className="text-[10px] text-primary-foreground/70 whitespace-nowrap text-regular">Мои очки</span>
                <span className="text-primary-foreground text-xs text-regular">→</span>
              </div>
              <div
                className="bg-secondary rounded-xl py-3 flex flex-col items-center cursor-pointer hover:bg-secondary/80 transition-all"
                onClick={() => handleNavigate("/dream-team")}
              >
                <span className="text-xl font-medium text-foreground">{isTournamentStarted ? "129" : "0"}</span>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap text-regular">Лучший результат</span>
                <span className="text-muted-foreground text-xs text-regular">→</span>
              </div>
            </div>

            {/* Next Tour (only shown after tournament starts) */}
            {isTournamentStarted && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
                <span className="text-muted-foreground text-sm whitespace-nowrap">30 тур</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
              </div>
            )}

            {/* Deadline */}
            <div className="flex justify-between items-center mb-2 text-regular">
              <span className="text-muted-foreground text-sm">
                Дедлайн: <span className="text-foreground font-medium">04.04 в 19.00</span>
              </span>
              <span className="text-foreground text-sm">
                {timeLeft.days} дня {String(timeLeft.hours).padStart(2, "0")}:
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
                className="relative w-full h-[44px] bg-primary rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 transition-all shadow-neon"
                onClick={() => handleNavigate("/team-management")}
              >
                <img 
                  src={btnTeamBadge} 
                  alt="" 
                  className="absolute -top-2 -right-2 w-8 h-8 object-contain"
                />
                <span className="text-[#212121] font-rubik text-[16px] font-medium">Моя команда</span>
              </button>
              <button
                className="relative w-full h-[44px] bg-primary rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 transition-all shadow-neon"
                onClick={() => handleNavigate("/transfers")}
              >
                <img 
                  src={btnTransfersBadge} 
                  alt="" 
                  className="absolute -top-2 -right-2 w-8 h-8 object-contain"
                />
                <span className="text-[#212121] font-rubik text-[16px] font-medium">Трансферы</span>
              </button>
            </div>

            {/* Rules button */}
            <div
              className="w-full h-10 bg-secondary rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary/80 transition-opacity mb-8"
              onClick={() => setIsRulesDrawerOpen(true)}
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium text-sm">Правила игры</span>
            </div>

            {/* Tournament Table */}
            <h2 className="text-2xl font-bold text-foreground mb-4">Турнирная таблица</h2>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
              <span className="col-span-3 text-xs">Место</span>
              <span className="col-span-4 text-xs">Название</span>
              <span className="col-span-3 text-center">
                <span className="text-xs block whitespace-nowrap">29-й тур</span>
                <span className="text-[10px] italic block">(очки)</span>
              </span>
              <span className="col-span-2 text-right">
                <span className="text-xs block">Всего</span>
                <span className="text-[10px] italic block">(очков)</span>
              </span>
            </div>

            {/* Table rows */}
            <div className="space-y-2">
              {tableData.map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-full cursor-pointer transition-colors hover:bg-secondary/70 ${
                    row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                  }`}
                  onClick={() => {
                    if (row.isUser) {
                      handleNavigate("/your-team");
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
                    <span className={`text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.position}</span>
                  </div>
                  <span className={`col-span-4 text-sm truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.name}</span>
                  <span className={`col-span-3 text-center text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.tourPoints}</span>
                  <span className={`col-span-2 text-right font-bold text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>
                    {row.totalPoints.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* View all button */}
            <Button
              variant="outline"
              className="w-full mt-6 rounded-lg py-6 font-semibold border-border"
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Коммерческие лиги</h2>
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
                          `/view-league?id=${league.id}&name=${encodeURIComponent(league.name)}&owner=false&commercial=true&finished=true&startTour=${league.startTour}&deadline=${encodeURIComponent(league.deadline)}&registrationOpen=false&beforeRegistration=false`,
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
                              Победитель: <span className="text-primary font-medium">{league.winner}</span>
                            </span>
                            <span className="text-xs text-foreground font-bold">{league.winnerPoints} очков</span>
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
                          `/view-league?id=${league.id}&name=${encodeURIComponent(league.name)}&owner=false&commercial=true&finished=false&startTour=${league.startTour}&deadline=${encodeURIComponent(league.deadline)}&registrationOpen=${isRegistrationOpen}&beforeRegistration=${isBeforeRegistration}`,
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Мои лиги</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с друзьями в собственных мини-лигах внутри Высшей лиги Беларуси по футболу
            </p>

            {/* My leagues table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
              <span className="col-span-4">Место</span>
              <span className="col-span-8">Название</span>
            </div>

            {/* My leagues rows */}
            <div className="space-y-2 mb-4">
              {(showAllMyLeagues ? myLeagues : myLeagues.slice(0, 5)).map((league, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-secondary/50 rounded-xl cursor-pointer hover:bg-secondary/70 transition-colors"
                  onClick={() => {
                    handleNavigate(
                      `/view-league?id=${league.id}&name=${encodeURIComponent(league.name)}&owner=${league.isOwner}&participants=${league.participants}`,
                    );
                  }}
                >
                  <div className="col-span-4 flex items-center gap-1">
                    {league.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                    {league.change === "down" && <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />}
                    {league.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
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
                userCreatedLeagues.length >= 5
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary text-primary-foreground"
              }`}
              onClick={() => {
                if (userCreatedLeagues.length >= 5) {
                  toast.error("Ты не можешь создать более 5 лиг, где являешься владельцем");
                } else {
                  handleNavigate("/create-league");
                }
              }}
            >
              Создать лигу
            </Button>

            {/* Club League */}
            <h2 className="text-2xl font-bold text-foreground mb-2">{clubLeagueName}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с другими болельщиками твоего любимого клуба
            </p>

            {/* Club league table header - same style as /view-league */}
            <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
              <span className="col-span-3 text-xs">Место</span>
              <span className="col-span-4 text-xs">Название</span>
              <span className="col-span-3 text-center">
                <span className="text-xs block whitespace-nowrap">{currentTour}-й тур</span>
                <span className="text-[10px] italic block">(очки)</span>
              </span>
              <span className="col-span-2 text-right">
                <span className="text-xs block">Всего</span>
                <span className="text-[10px] italic block">(очков)</span>
              </span>
            </div>

            {/* Club league data - full 100 users with user at position 9 */}
            {(() => {
              const topTeamNames = ["Ars", "Diamande", "Stayki"];
              const clubLeagueFullData = Array.from({ length: 100 }, (_, i) => ({
                position: i + 1,
                change: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : ("same" as "up" | "down" | "same"),
                name: i === 8 ? "Alepyz" : i < 3 ? topTeamNames[i] : `Team ${i + 1}`,
                tourPoints: 32 - Math.floor(i / 10),
                totalPoints: 3123 - i * 15,
                isUser: i === 8,
                teamId: `team-${i + 1}`,
              }));

              // When collapsed: show top 3 + user (position 9)
              // When expanded: show paginated 10 items per page
              const displayData = showAllClubLeague
                ? clubLeagueFullData.slice((clubLeaguePage - 1) * 10, clubLeaguePage * 10)
                : [...clubLeagueFullData.slice(0, 3), clubLeagueFullData[8]];

              const totalPages = Math.ceil(clubLeagueFullData.length / 10);

              return (
                <>
                  <div className="space-y-2">
                    {displayData.map((row, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-secondary/70 ${
                          row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                        }`}
                        onClick={() => {
                          if (row.isUser) {
                            handleNavigate("/your-team");
                          } else {
                            handleNavigate(`/view-team?id=${row.teamId}&name=${encodeURIComponent(row.name)}`);
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
                          {row.totalPoints.toLocaleString()}
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
                </>
              );
            })()}
          </>
        )}

        {activeTab === "cup" && (
          <div className="w-full">
            {/* Main Cup */}
            <h2 className="text-2xl font-bold text-foreground mb-4">Кубок</h2>

            {/* Coming soon image */}
            <img 
              src={cupComingSoon} 
              alt="Скоро запустим 2026" 
              className="w-full rounded-xl"
            />
          </div>
        )}
      </main>

      <EditTeamNameModal
        isOpen={isEditTeamNameModalOpen}
        onClose={() => setIsEditTeamNameModalOpen(false)}
        currentName={teamName}
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
