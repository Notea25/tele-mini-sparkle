import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  ChevronDown,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Pencil,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import FooterNav from "@/components/FooterNav";
import FormationField from "@/components/FormationField";
import PlayerCard from "@/components/PlayerCard";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";

const ITEMS_PER_PAGE = 6;

// Club icons mapping
const clubIcons: Record<string, string> = {
  "Белшина": clubBelshina,
  "БАТЭ": clubLogo,
  "Динамо Минск": clubLogo,
  "Шахтер": clubLogo,
  "Неман": clubLogo,
  "Славия": clubLogo,
  "Торпедо": clubLogo,
};

const TeamBuilder = () => {
  const navigate = useNavigate();
  const playerListRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [activeFilter, setActiveFilter] = useState("Все");
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Все команды");
  const [selectedPoints, setSelectedPoints] = useState("Фильтр по очкам");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(10);
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("Lucky Team");
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState("Lucky Team");

  // Deadline countdown
  const deadlineDate = new Date("2025-12-14T19:00:00");
  const tournamentStartDate = new Date("2025-12-04T19:00:00"); // Tournament start (10 days before deadline)
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
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        
        setTimeLeft({ days, hours, minutes, seconds, progress });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const teams = ["Все команды", "Динамо Минск", "БАТЭ", "Шахтер", "Неман", "Славия", "Торпедо"];
  const pointsOptions = [
    { label: "Фильтр по очкам", value: "Фильтр по очкам" },
    { label: "80+", value: "80+" },
    { label: "70-79", value: "70-79" },
    { label: "60-69", value: "60-69" },
    { label: "< 60", value: "<60" },
  ];

  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];

  const players = [
    // Вратари (ВР)
    { id: 0, name: "Вакулич", team: "Динамо Минск", position: "ВР", points: 79, price: 10.5 },
    { id: 1, name: "Петров", team: "БАТЭ", position: "ВР", points: 65, price: 6.8 },
    { id: 2, name: "Климович", team: "Шахтер", position: "ВР", points: 71, price: 8.2 },
    { id: 3, name: "Горбунов", team: "Неман", position: "ВР", points: 58, price: 4.5 },
    // Защитники (ЗЩ)
    { id: 4, name: "Сидоров", team: "Шахтер", position: "ЗЩ", points: 72, price: 9.3 },
    { id: 5, name: "Иванов", team: "Динамо Минск", position: "ЗЩ", points: 68, price: 7.1 },
    { id: 6, name: "Соколов", team: "Шахтер", position: "ЗЩ", points: 70, price: 8.7 },
    { id: 7, name: "Орлов", team: "БАТЭ", position: "ЗЩ", points: 64, price: 5.9 },
    { id: 8, name: "Федоров", team: "Неман", position: "ЗЩ", points: 61, price: 4.2 },
    { id: 9, name: "Михайлов", team: "Динамо Минск", position: "ЗЩ", points: 73, price: 11.4 },
    { id: 10, name: "Зайцев", team: "Славия", position: "ЗЩ", points: 55, price: 4.8 },
    { id: 11, name: "Белов", team: "Торпедо", position: "ЗЩ", points: 59, price: 5.3 },
    // Полузащитники (ПЗ)
    { id: 12, name: "Козлов", team: "БАТЭ", position: "ПЗ", points: 81, price: 11.9 },
    { id: 13, name: "Новиков", team: "Шахтер", position: "ПЗ", points: 75, price: 9.6 },
    { id: 14, name: "Лебедев", team: "Динамо Минск", position: "ПЗ", points: 77, price: 10.2 },
    { id: 15, name: "Тарасов", team: "БАТЭ", position: "ПЗ", points: 69, price: 7.4 },
    { id: 16, name: "Киселев", team: "Неман", position: "ПЗ", points: 62, price: 5.1 },
    { id: 17, name: "Павлов", team: "Шахтер", position: "ПЗ", points: 74, price: 8.9 },
    { id: 18, name: "Семенов", team: "Славия", position: "ПЗ", points: 58, price: 4.6 },
    { id: 19, name: "Голубев", team: "Торпедо", position: "ПЗ", points: 63, price: 6.2 },
    { id: 20, name: "Виноградов", team: "Динамо Минск", position: "ПЗ", points: 71, price: 8.1 },
    { id: 21, name: "Богданов", team: "БАТЭ", position: "ПЗ", points: 67, price: 6.7 },
    // Нападающие (НП)
    { id: 22, name: "Морозов", team: "Динамо Минск", position: "НП", points: 88, price: 11.8 },
    { id: 23, name: "Волков", team: "БАТЭ", position: "НП", points: 82, price: 10.9 },
    { id: 24, name: "Кузнецов", team: "Шахтер", position: "НП", points: 79, price: 9.5 },
    { id: 25, name: "Попов", team: "Неман", position: "НП", points: 66, price: 5.7 },
    { id: 26, name: "Васильев", team: "Славия", position: "НП", points: 60, price: 4.3 },
    { id: 27, name: "Смирнов", team: "Торпедо", position: "НП", points: 64, price: 5.4 },
    { id: 28, name: "Ковалев", team: "Динамо Минск", position: "НП", points: 76, price: 8.6 },
    { id: 29, name: "Николаев", team: "БАТЭ", position: "НП", points: 70, price: 7.2 },
  ];

  const selectedPlayersData = players.filter((p) => selectedPlayers.includes(p.id));

  // Filter players based on activeFilter, search query, team, and points
  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const matchesTeam = selectedTeam === "Все команды" || player.team === selectedTeam;
    if (!matchesTeam) return false;

    // Points filter
    let matchesPoints = true;
    if (selectedPoints === "80+") matchesPoints = player.points >= 80;
    else if (selectedPoints === "70-79") matchesPoints = player.points >= 70 && player.points < 80;
    else if (selectedPoints === "60-69") matchesPoints = player.points >= 60 && player.points < 70;
    else if (selectedPoints === "<60") matchesPoints = player.points < 60;
    // "Фильтр по очкам" means show all, so matchesPoints stays true
    if (!matchesPoints) return false;

    // Price filter
    if (player.price < priceFrom) return false;
    if (player.price > priceTo) return false;

    if (activeFilter === "Все") return true;
    if (activeFilter === "Вратари") return player.position === "ВР";
    if (activeFilter === "Защитники") return player.position === "ЗЩ";
    if (activeFilter === "Полузащитники") return player.position === "ПЗ";
    if (activeFilter === "Нападающие") return player.position === "НП";
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Reset to page 1 when team changes
  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
    setCurrentPage(1);
  };

  // Reset to page 1 when points filter changes
  const handlePointsChange = (points: string) => {
    setSelectedPoints(points);
    setCurrentPage(1);
  };

  // Price control handlers
  const handlePriceFromIncrease = () => {
    setPriceFrom((prev) => Math.min(prev + 1, priceTo));
    setCurrentPage(1);
  };
  const handlePriceFromDecrease = () => {
    setPriceFrom((prev) => Math.max(prev - 1, 1));
    setCurrentPage(1);
  };
  const handlePriceToIncrease = () => {
    setPriceTo((prev) => Math.min(prev + 1, 15));
    setCurrentPage(1);
  };
  const handlePriceToDecrease = () => {
    setPriceTo((prev) => Math.max(prev - 1, priceFrom));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTeam("Все команды");
    setSelectedPoints("Фильтр по очкам");
    setPriceFrom(3);
    setPriceTo(10);
    setActiveFilter("Все");
    setCurrentPage(1);
  };

  const positionToFilter: Record<string, string> = {
    "ВР": "Вратари",
    "ЗЩ": "Защитники",
    "ПЗ": "Полузащитники",
    "НП": "Нападающие",
  };

  const handleEmptySlotClick = (position: string) => {
    const filterName = positionToFilter[position] || "Все";
    setActiveFilter(filterName);
    setCurrentPage(1);
    
    setTimeout(() => {
      playerListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const BUDGET = 100;
  const MAX_PLAYERS_PER_CLUB = 3;
  const currentTeamCost = selectedPlayersData.reduce((sum, p) => sum + p.price, 0);
  const currentBalance = BUDGET - currentTeamCost;

  const getPlayersCountByClub = (playerIds: number[], clubName: string) => {
    return playerIds.filter((id) => {
      const p = players.find((player) => player.id === id);
      return p?.team === clubName;
    }).length;
  };

  // Formation slots per position
  const POSITION_SLOTS: Record<string, number> = {
    "ВР": 2,
    "ЗЩ": 5,
    "ПЗ": 5,
    "НП": 3,
  };

  const getPlayersCountByPosition = (playerIds: number[], position: string) => {
    return playerIds.filter((id) => {
      const p = players.find((player) => player.id === id);
      return p?.position === position;
    }).length;
  };

  const togglePlayer = (playerId: number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    if (selectedPlayers.includes(playerId)) {
      // Remove player - also clear captain/vice-captain if needed
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
      setSelectedPlayers((prev) => prev.filter((id) => id !== playerId));
    } else {
      // Check available position slots
      const positionCount = getPlayersCountByPosition(selectedPlayers, player.position);
      const maxSlots = POSITION_SLOTS[player.position] || 0;
      if (positionCount >= maxSlots) {
        toast.error(`Все слоты для позиции "${player.position}" заняты`);
        return;
      }
      // Check budget before adding
      if (player.price > currentBalance) {
        toast.error("Недостаточно бюджета для добавления этого игрока");
        return;
      }
      // Check club limit
      const clubCount = getPlayersCountByClub(selectedPlayers, player.team);
      if (clubCount >= MAX_PLAYERS_PER_CLUB) {
        toast.error(`Нельзя добавить больше ${MAX_PLAYERS_PER_CLUB} игроков из одного клуба`);
        return;
      }
      setSelectedPlayers((prev) => [...prev, playerId]);
    }
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setCaptain(null);
    setViceCaptain(null);
  };

  const handleAutoFill = () => {
    // Formation: 2 ВР, 5 ЗЩ, 5 ПЗ, 3 НП
    const formation: Record<string, number> = { ВР: 2, ЗЩ: 5, ПЗ: 5, НП: 3 };
    
    // Start with currently selected players
    const selectedIds = [...selectedPlayers];
    let totalCost = selectedPlayersData.reduce((sum, p) => sum + p.price, 0);
    
    // Count existing club selections
    const clubCounts: Record<string, number> = {};
    selectedPlayersData.forEach(p => {
      clubCounts[p.team] = (clubCounts[p.team] || 0) + 1;
    });
    
    // Count existing position selections
    const positionCounts: Record<string, number> = {};
    selectedPlayersData.forEach(p => {
      positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
    });

    // Shuffle function for randomness
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Fill remaining slots for each position
    Object.entries(formation).forEach(([position, maxCount]) => {
      const currentCount = positionCounts[position] || 0;
      const slotsToFill = maxCount - currentCount;
      
      if (slotsToFill <= 0) return;
      
      // Get available players for this position (not already selected), shuffled randomly
      const availablePlayers = shuffleArray(
        players.filter((p) => p.position === position && !selectedIds.includes(p.id))
      );
      
      let added = 0;
      for (const player of availablePlayers) {
        if (added >= slotsToFill) break;
        
        const currentClubCount = clubCounts[player.team] || 0;
        if (totalCost + player.price <= BUDGET && currentClubCount < MAX_PLAYERS_PER_CLUB) {
          selectedIds.push(player.id);
          totalCost += player.price;
          clubCounts[player.team] = currentClubCount + 1;
          added++;
        }
      }
    });

    setSelectedPlayers(selectedIds);
  };

  const leaderboard = Array(10)
    .fill(null)
    .map((_, i) => ({
      rank: i + 1,
      name: "Lucky Team",
      games: 32,
      points: 2125,
      trend: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "same",
    }));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <SportHeader />

      {/* Back Button */}
      <div className="px-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/create-team")}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </Button>
      </div>

      {/* Team Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🏠</span>
            <span>⚽ Футбол</span>
            <span>•</span>
            <span>Беларусь</span>
            <span>•</span>
            <span className="text-primary">{teamName}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          {isEditingTeamName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                className="text-2xl font-bold bg-card border-border text-foreground h-10 w-72"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setTeamName(editedTeamName || "Lucky Team");
                    setIsEditingTeamName(false);
                  }
                  if (e.key === "Escape") {
                    setEditedTeamName(teamName);
                    setIsEditingTeamName(false);
                  }
                }}
              />
              <button
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                onClick={() => {
                  setTeamName(editedTeamName || "Lucky Team");
                  setIsEditingTeamName(false);
                }}
              >
                <Check className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => {
                  setEditedTeamName(teamName);
                  setIsEditingTeamName(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дедлайн: 14.12.2025 в 19:00</span>
          <span className="text-foreground">
            {timeLeft.days} дн. {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Deadline Progress Bar */}
      <div className="px-4 mt-4">
        <div className="w-full h-2 bg-card rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${timeLeft.progress}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6 flex gap-2">
        <Button
          onClick={() => setActiveTab("formation")}
          className={`flex-1 ${
            activeTab === "formation"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Расстановка
        </Button>
        <Button
          onClick={() => setActiveTab("list")}
          className={`flex-1 ${
            activeTab === "list"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Список
        </Button>
      </div>

      {activeTab === "formation" && (
        <>
          {/* Football Field */}
          <div className="px-4 mt-4">
            <FormationField 
              selectedPlayers={selectedPlayersData} 
              onRemovePlayer={(id) => togglePlayer(id)}
              onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
              onEmptySlotClick={handleEmptySlotClick}
            />
          </div>

          {/* Team Filters */}
          <div className="px-4 mt-6 flex gap-2">
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger className="flex-1 bg-card border-border text-foreground">
                <SelectValue placeholder="Команды" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {teams.map((team) => (
                  <SelectItem key={team} value={team} className="text-foreground hover:bg-secondary">
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPoints} onValueChange={handlePointsChange}>
              <SelectTrigger className="flex-1 bg-card border-border text-foreground">
                <SelectValue placeholder="Очки" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {pointsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-secondary">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="px-4 mt-4">
            <span className="text-foreground text-sm mb-3 block">Цена</span>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">от</span>
                <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                  <button
                    onClick={handlePriceFromDecrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary-foreground" />
                  </button>
                  <span className="text-foreground font-medium min-w-[40px] text-center">{priceFrom},0</span>
                  <button
                    onClick={handlePriceFromIncrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">до</span>
                <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2">
                  <button
                    onClick={handlePriceToDecrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-primary-foreground" />
                  </button>
                  <span className="text-foreground font-medium min-w-[40px] text-center">{priceTo},0</span>
                  <button
                    onClick={handlePriceToIncrease}
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="px-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Сбросить фильтры
            </Button>
          </div>
        </>
      )}

      {/* Position Filters */}
      <div ref={playerListRef} className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            size="sm"
            className={`flex-shrink-0 ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Players List Header */}
      <div className="px-4 mt-6 grid grid-cols-[1fr_auto] items-center text-sm text-muted-foreground">
        <div className="grid grid-cols-[100px_40px_24px] gap-1.5 items-center">
          <span>Игрок</span>
          <span></span>
          <span></span>
        </div>
        <div className="grid grid-cols-[50px_50px_32px] gap-1.5 items-center text-right">
          <span>Очки</span>
          <span>Цена</span>
          <span></span>
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 mt-3 space-y-2">
        {paginatedPlayers.map((player) => {
          const isSelected = selectedPlayers.includes(player.id);
          return (
            <div key={player.id} className="bg-card rounded-full px-4 py-2.5 grid grid-cols-[1fr_auto] items-center">
              <div className="grid grid-cols-[100px_40px_24px] gap-1.5 items-center">
                <span 
                  className="text-foreground font-medium truncate cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedPlayerForCard(player.id)}
                >
                  {player.name}
                </span>
                <span className="text-muted-foreground text-sm pointer-events-none">{player.position}</span>
                <img 
                  src={clubIcons[player.team] || clubLogo} 
                  alt={player.team} 
                  className="w-6 h-6 object-contain pointer-events-none"
                  title={player.team}
                />
              </div>
              <div className="grid grid-cols-[50px_50px_32px] gap-1.5 items-center">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-foreground font-medium">{player.points}</span>
                </div>
                <span className="text-foreground font-medium text-right">{player.price}</span>
                <Button
                  size="icon"
                  onClick={() => togglePlayer(player.id)}
                  className={`h-8 w-8 rounded-full ${
                    isSelected
                      ? "bg-muted hover:bg-muted/80 text-muted-foreground"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {isSelected ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-accent rounded transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                page === currentPage ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-accent rounded transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Captain Selection */}
      <div className="px-4 mt-6 flex gap-2">
        <div className="flex-1">
          <span className="text-foreground text-sm mb-2 block">Капитан</span>
          <Select
            value={captain?.toString() || ""}
            onValueChange={(val) => {
              const id = parseInt(val);
              setCaptain(id);
              if (viceCaptain === id) setViceCaptain(null);
            }}
          >
            <SelectTrigger className="w-full bg-card border-border text-foreground">
              <SelectValue placeholder="Выбрать" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {selectedPlayersData.map((player) => (
                <SelectItem
                  key={player.id}
                  value={player.id.toString()}
                  className="text-foreground hover:bg-secondary"
                  disabled={player.id === viceCaptain}
                >
                  {player.name} ({player.position})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <span className="text-foreground text-sm mb-2 block">Вице капитан</span>
          <Select
            value={viceCaptain?.toString() || ""}
            onValueChange={(val) => {
              const id = parseInt(val);
              setViceCaptain(id);
              if (captain === id) setCaptain(null);
            }}
          >
            <SelectTrigger className="w-full bg-card border-border text-foreground">
              <SelectValue placeholder="Выбрать" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {selectedPlayersData.map((player) => (
                <SelectItem
                  key={player.id}
                  value={player.id.toString()}
                  className="text-foreground hover:bg-secondary"
                  disabled={player.id === captain}
                >
                  {player.name} ({player.position})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#6B6B8D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Вы не можете добавить больше 3-ёх игроков из одного клуба в свою команду
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 mb-6 flex gap-3">
        <Button
          onClick={handleAutoFill}
          className="flex-1 bg-[#2A2A3E] hover:bg-[#3A3A4E] text-white font-semibold rounded-full py-3"
        >
          Автосбор
        </Button>
        <Button
          onClick={handleReset}
          disabled={selectedPlayers.length === 0}
          className={`flex-1 font-semibold rounded-full py-3 ${
            selectedPlayers.length === 0
              ? "bg-[#1A1A2E] text-muted-foreground opacity-50 cursor-not-allowed"
              : "bg-[#2A2A3E] hover:bg-[#3A3A4E] text-white"
          }`}
        >
          Сбросить
        </Button>
      </div>

      {/* Team Cost & Balance - Sticky */}
      <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 z-40">
        <div className="flex justify-between mb-4">
          <div>
            <span className="text-muted-foreground text-sm">Стоимость команды</span>
            <p className="text-foreground text-3xl font-bold">{currentTeamCost.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-sm">Баланс</span>
            <p className="text-foreground text-3xl font-bold">{currentBalance.toFixed(1)}</p>
          </div>
        </div>
        <Button
          disabled={selectedPlayers.length === 0}
          className={`w-full rounded-full py-3 font-semibold text-black ${
            selectedPlayers.length === 0 ? "bg-[#4A5D23] cursor-not-allowed" : "bg-[#A8FF00] hover:bg-[#98EE00]"
          }`}
        >
          Сохранить
        </Button>
      </div>

      {/* Leaderboard */}
      <div className="px-4 mt-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">Топ-10 общей лиги</h2>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <div className="divide-y divide-border">
            {leaderboard.map((team) => (
              <div key={team.rank} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {team.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {team.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {team.trend === "same" && <Minus className="w-4 h-4 text-muted-foreground" />}
                    <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-foreground"}`}>
                      {team.rank}
                    </span>
                  </div>
                  <span className="text-foreground font-semibold">🏆</span>
                  <span className="text-foreground">{team.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm">{team.games}</span>
                  <span className="text-foreground font-bold">{team.points}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Player Card Drawer */}
      <PlayerCard
        player={players.find(p => p.id === selectedPlayerForCard) || null}
        isOpen={selectedPlayerForCard !== null}
        onClose={() => setSelectedPlayerForCard(null)}
        isSelected={selectedPlayerForCard !== null && selectedPlayers.includes(selectedPlayerForCard)}
        onToggleSelect={togglePlayer}
        isCaptain={selectedPlayerForCard === captain}
        isViceCaptain={selectedPlayerForCard === viceCaptain}
        onSetCaptain={setCaptain}
        onSetViceCaptain={setViceCaptain}
      />
      
      <FooterNav />
    </div>
  );
};

export default TeamBuilder;
