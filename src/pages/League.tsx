import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ChevronRight, ChevronDown, ChevronUp, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SportHeader from "@/components/SportHeader";
import EditTeamNameModal from "@/components/EditTeamNameModal";
import homeIcon from "@/assets/home-icon.png";
import btnTeam from "@/assets/btn-team.png";
import btnTransfers from "@/assets/btn-transfers.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";

const League = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"main" | "leagues" | "cup">("main");
  const [teamName, setTeamName] = useState(() => {
    return localStorage.getItem("fantasyTeamName") || "Lucky Team";
  });
  const [isEditTeamNameModalOpen, setIsEditTeamNameModalOpen] = useState(false);
  const [showAllCommercialLeagues, setShowAllCommercialLeagues] = useState(false);
  const [showAllClubLeague, setShowAllClubLeague] = useState(false);
  const [clubLeaguePage, setClubLeaguePage] = useState(1);

  // Current tour for determining finished leagues (simulated as tour 6 for demo)
  const currentTour = 6;
  // Save team name to localStorage when it changes
  const handleSaveTeamName = (newName: string) => {
    setTeamName(newName);
    localStorage.setItem("fantasyTeamName", newName);
  };

  // Deadline countdown
  const deadlineDate = new Date("2025-12-14T19:00:00");
  const tournamentStartDate = new Date("2025-12-04T19:00:00");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();
      const totalDuration = deadlineDate.getTime() - tournamentStartDate.getTime();
      const elapsed = now.getTime() - tournamentStartDate.getTime();

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

  // Tournament table data
  const tableData = [
    { position: 1, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 2, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 3, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 9, change: "down", name: "Моя команда", tourPoints: 32, totalPoints: 3123, isUser: true },
  ];

  // Commercial leagues data with end tour for blur logic
  const commercialLeagues = [
    { id: "betera", name: "Betera", prize: "100 Freebet", period: "1-3 тур", endTour: 3 },
    { id: "bnb", name: "BNB", prize: "1000 BYN", period: "4-6 тур", endTour: 6 },
    { id: "atlant-m", name: "Atlant-M", prize: "iPhone 17", period: "7-9 тур", endTour: 9 },
    { id: "abff", name: "ABFF", prize: "VIP-ложа", period: "10-12 тур", endTour: 12 },
    { id: "bcs", name: "BCS", prize: "MacBook", period: "13-15 тур", endTour: 15 },
    { id: "hc-dinamo", name: "HC Dinamo", prize: "Абонемент", period: "16-18 тур", endTour: 18 },
    { id: "maxline", name: "Maxline", prize: "250 Free Spin", period: "19-21 тур", endTour: 21 },
    { id: "papa-doner", name: "Papa Doner", prize: "100 BYN", period: "22-24 тур", endTour: 24 },
    { id: "zubr", name: "Zubr", prize: "AirPods", period: "25-27 тур", endTour: 27 },
    { id: "hello", name: "Hello", prize: "1000 минут", period: "28-30 тур", endTour: 30 },
  ];

  // Determine which leagues to display based on showAll state
  const displayedCommercialLeagues = showAllCommercialLeagues ? commercialLeagues : commercialLeagues.slice(0, 4);

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
    })),
    ...staticLeagues,
  ];

  const tabs = [
    { id: "main", label: "Главная" },
    { id: "leagues", label: "Лиги" },
    { id: "cup", label: "Кубок" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader />

      <main className="flex-1 px-4 pb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
          <img
            src={homeIcon}
            alt="Home"
            className="w-4 h-4 cursor-pointer hover:opacity-80"
            onClick={() => navigate("/")}
          />
          <ChevronRight className="w-3 h-3" />
          <span>Футбол</span>
          <ChevronRight className="w-3 h-3" />
          <span>Беларусь</span>
        </div>

        {/* Tabs */}
        <div className="bg-secondary/50 rounded-full p-1 flex mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "main" | "leagues" | "cup")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
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
              <h1 className="text-2xl font-bold text-foreground">{teamName}</h1>
              <Pencil
                className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setIsEditTeamNameModalOpen(true)}
              />
            </div>

            {/* Current Tour Stats */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <span className="text-muted-foreground text-sm whitespace-nowrap">29 тур</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div
                className="bg-secondary/50 rounded-2xl px-3 py-2 flex flex-col items-center border border-border cursor-pointer hover:bg-secondary/70 transition-colors"
                onClick={() => navigate("/tournament-table")}
              >
                <span className="text-2xl font-bold text-foreground">40</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Средний результат</span>
                <span className="text-muted-foreground text-sm">→</span>
              </div>
              <div
                className="bg-primary rounded-2xl px-3 py-2 flex flex-col items-center cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => navigate("/your-team")}
              >
                <span className="text-2xl font-bold text-primary-foreground">55</span>
                <span className="text-[10px] text-primary-foreground/80 whitespace-nowrap">Твои очки</span>
                <span className="text-primary-foreground text-sm">→</span>
              </div>
              <div
                className="bg-secondary/50 rounded-2xl px-3 py-2 flex flex-col items-center border border-border cursor-pointer hover:bg-secondary/70 transition-colors"
                onClick={() => navigate("/dream-team")}
              >
                <span className="text-2xl font-bold text-foreground">129</span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">Лучший результат</span>
                <span className="text-muted-foreground text-sm">→</span>
              </div>
            </div>

            {/* Next Tour */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <span className="text-muted-foreground text-sm whitespace-nowrap">30 тур</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            {/* Deadline */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground text-sm">
                Дедлайн: <span className="text-foreground">04.04 в 19.00</span>
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
            <div className="grid grid-cols-2 gap-3 mb-8">
              <img
                src={btnTeam}
                alt="Команда"
                className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate("/team-management")}
              />
              <img
                src={btnTransfers}
                alt="Трансферы"
                className="w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate("/transfers")}
              />
            </div>

            {/* Tournament Table */}
            <h2 className="text-2xl font-bold text-foreground mb-4">Турнирная таблица</h2>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
              <span className="col-span-2">Позиция</span>
              <span className="col-span-4">Команда</span>
              <span className="col-span-3 text-center">
                Очки / тур
                <br />
                29
              </span>
              <span className="col-span-3 text-center">Всего очков</span>
            </div>

            {/* Table rows */}
            <div className="space-y-2">
              {tableData.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-full ${
                      row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                    }`}
                    style={{ width: "calc(100% - 24px)" }}
                  >
                    <div className="col-span-2 flex items-center gap-1">
                      {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                      {row.change === "down" && !row.isUser && (
                        <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />
                      )}
                      {row.change === "down" && row.isUser && (
                        <img src={arrowDownBlack} alt="down" className="w-3 h-3" />
                      )}
                      {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                      <span className={`font-medium ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>
                        {row.position}
                      </span>
                      {row.position === 1 && <img src={trophyGold} alt="1st" className="w-4 h-4" />}
                      {row.position === 2 && <img src={trophySilver} alt="2nd" className="w-4 h-4" />}
                      {row.position === 3 && <img src={trophyBronze} alt="3rd" className="w-4 h-4" />}
                    </div>
                    <span
                      className={`col-span-4 font-medium truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                    >
                      {row.name}
                    </span>
                    <span
                      className={`col-span-3 text-center ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                    >
                      {row.tourPoints}
                    </span>
                    <span
                      className={`col-span-3 text-center font-bold ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                    >
                      {row.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  {row.isUser ? (
                    <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                      Ты
                    </span>
                  ) : (
                    <span className="w-8" />
                  )}
                </div>
              ))}
            </div>

            {/* View all button */}
            <Button
              variant="outline"
              className="w-full mt-6 rounded-full py-6 font-semibold border-border"
              onClick={() => navigate("/tournament-table")}
            >
              Смотреть все
            </Button>
          </>
        )}

        {activeTab === "leagues" && (
          <>
            {/* Commercial Leagues */}
            <h2 className="text-2xl font-bold text-foreground mb-2">Коммерческие лиги</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Участвуя в коммерческих лигах, вы боретесь за призы в 10-ти трёхтуровых отрезках сезона. Считаются только
              очки внутри отрезка.
            </p>

            {/* Commercial leagues table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
              <span className="col-span-4">Название</span>
              <span className="col-span-4">Приз</span>
              <span className="col-span-4">Отрезок</span>
            </div>

            {/* Commercial leagues rows */}
            <div className="space-y-2 mb-4">
              {displayedCommercialLeagues.map((league, idx) => {
                const isFinished = currentTour > league.endTour;
                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-2 items-center px-4 py-3 bg-secondary/50 rounded-full cursor-pointer hover:bg-secondary/70 transition-colors ${
                      isFinished ? "opacity-40" : ""
                    }`}
                    onClick={() =>
                      navigate(
                        `/view-league?id=${league.id}&name=${encodeURIComponent(league.name)}&owner=false&commercial=true&finished=${isFinished}`,
                      )
                    }
                  >
                    <span className="col-span-4 text-foreground text-sm truncate">{league.name}</span>
                    <span className="col-span-4 text-foreground text-sm truncate">{league.prize}</span>
                    <span className="col-span-3 text-foreground text-sm">{league.period}</span>
                    <span className="col-span-1 text-muted-foreground text-right">→</span>
                  </div>
                );
              })}
            </div>

            {/* See all commercial */}
            <button
              className="w-full flex items-center justify-center gap-1 text-foreground text-sm py-2 mb-8"
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
                  Смотреть все
                </>
              )}
            </button>

            {/* My Leagues */}
            <h2 className="text-2xl font-bold text-foreground mb-2">Мои лиги</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с друзьями в собственных мини-лигах внутри Высшей лиги Беларуси по футболу
            </p>

            {/* My leagues table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
              <span className="col-span-4">Место в лиге</span>
              <span className="col-span-8">Название</span>
            </div>

            {/* My leagues rows */}
            <div className="space-y-2 mb-4">
              {myLeagues.map((league, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-secondary/50 rounded-full cursor-pointer hover:bg-secondary/70 transition-colors"
                  onClick={() => {
                    navigate(
                      `/view-league?id=${league.id}&name=${encodeURIComponent(league.name)}&owner=${league.isOwner}`,
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

            {/* Create league button */}
            <Button
              className={`w-full rounded-full py-6 font-semibold mb-8 ${
                userCreatedLeagues.length >= 10
                  ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                  : "bg-primary text-primary-foreground"
              }`}
              onClick={() => {
                if (userCreatedLeagues.length >= 10) {
                  toast.error("Вы не можете создать более 10 лиг, где вы являетесь владельцем");
                } else {
                  navigate("/create-league");
                }
              }}
            >
              Создать лигу
            </Button>

            {/* Club League */}
            <h2 className="text-2xl font-bold text-foreground mb-2">Лига «Динамо-Минск»</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с другими болельщиками твоего любимого клуба
            </p>

            {/* Club league table header - same as Мои лиги */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
              <span>Место в лиге</span>
              <span className="flex-1 text-center">Название</span>
              <span className="w-16 text-center">Тур</span>
              <span className="w-20 text-right">Всего</span>
            </div>

            {/* Club league data - full 100 users with user at position 9 */}
            {(() => {
              const topTeamNames = ["Ars", "Diamande", "Stayki"];
              const clubLeagueFullData = Array.from({ length: 100 }, (_, i) => ({
                position: i + 1,
                change: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "same" as "up" | "down" | "same",
                name: i === 8 ? "Моя команда" : i < 3 ? topTeamNames[i] : `Team ${i + 1}`,
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
                        className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-full cursor-pointer transition-colors hover:bg-secondary/70 ${
                          row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                        }`}
                        onClick={() => navigate(`/view-team/${row.teamId}`)}
                      >
                        <div className="col-span-4 flex items-center gap-1">
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
                          className={`col-span-2 text-center text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                        >
                          {row.tourPoints}
                        </span>
                        <span
                          className={`col-span-2 text-right font-bold text-sm flex items-center justify-end gap-1 ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}
                        >
                          {row.totalPoints.toLocaleString()}
                          <ArrowRight className={`w-4 h-4 ${row.isUser ? "text-primary-foreground" : "text-muted-foreground"}`} />
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
          <>
            {/* Main Cup */}
            <h2 className="text-2xl font-bold text-foreground mb-4">Кубок</h2>

            {/* Coming soon card */}
            <div className="bg-secondary/30 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[280px] border border-border/50">
              <h3 className="text-2xl font-bold text-foreground mb-2">Скоро запустим</h3>
              <span className="text-primary text-xl font-medium">2026</span>
            </div>
          </>
        )}
      </main>

      <EditTeamNameModal
        isOpen={isEditTeamNameModalOpen}
        onClose={() => setIsEditTeamNameModalOpen(false)}
        currentName={teamName}
        onSave={handleSaveTeamName}
      />
    </div>
  );
};

export default League;
