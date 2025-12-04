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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import FooterNav from "@/components/FooterNav";
import FormationField from "@/components/FormationField";

const ITEMS_PER_PAGE = 6;

const TeamBuilder = () => {
  const navigate = useNavigate();
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
    { id: 0, name: "Вакулич", team: "Динамо Минск", position: "ВР", points: 79, price: 9 },
    { id: 1, name: "Петров", team: "БАТЭ", position: "ВР", points: 65, price: 8 },
    { id: 2, name: "Климович", team: "Шахтер", position: "ВР", points: 71, price: 7 },
    { id: 3, name: "Горбунов", team: "Неман", position: "ВР", points: 58, price: 6 },
    // Защитники (ЗЩ)
    { id: 4, name: "Сидоров", team: "Шахтер", position: "ЗЩ", points: 72, price: 7 },
    { id: 5, name: "Иванов", team: "Динамо Минск", position: "ЗЩ", points: 68, price: 6 },
    { id: 6, name: "Соколов", team: "Шахтер", position: "ЗЩ", points: 70, price: 7 },
    { id: 7, name: "Орлов", team: "БАТЭ", position: "ЗЩ", points: 64, price: 6 },
    { id: 8, name: "Федоров", team: "Неман", position: "ЗЩ", points: 61, price: 5 },
    { id: 9, name: "Михайлов", team: "Динамо Минск", position: "ЗЩ", points: 73, price: 8 },
    { id: 10, name: "Зайцев", team: "Славия", position: "ЗЩ", points: 55, price: 5 },
    { id: 11, name: "Белов", team: "Торпедо", position: "ЗЩ", points: 59, price: 5 },
    // Полузащитники (ПЗ)
    { id: 12, name: "Козлов", team: "БАТЭ", position: "ПЗ", points: 81, price: 9 },
    { id: 13, name: "Новиков", team: "Шахтер", position: "ПЗ", points: 75, price: 8 },
    { id: 14, name: "Лебедев", team: "Динамо Минск", position: "ПЗ", points: 77, price: 8 },
    { id: 15, name: "Тарасов", team: "БАТЭ", position: "ПЗ", points: 69, price: 7 },
    { id: 16, name: "Киселев", team: "Неман", position: "ПЗ", points: 62, price: 6 },
    { id: 17, name: "Павлов", team: "Шахтер", position: "ПЗ", points: 74, price: 7 },
    { id: 18, name: "Семенов", team: "Славия", position: "ПЗ", points: 58, price: 5 },
    { id: 19, name: "Голубев", team: "Торпедо", position: "ПЗ", points: 63, price: 6 },
    { id: 20, name: "Виноградов", team: "Динамо Минск", position: "ПЗ", points: 71, price: 7 },
    { id: 21, name: "Богданов", team: "БАТЭ", position: "ПЗ", points: 67, price: 6 },
    // Нападающие (НП)
    { id: 22, name: "Морозов", team: "Динамо Минск", position: "НП", points: 88, price: 10 },
    { id: 23, name: "Волков", team: "БАТЭ", position: "НП", points: 82, price: 9 },
    { id: 24, name: "Кузнецов", team: "Шахтер", position: "НП", points: 79, price: 9 },
    { id: 25, name: "Попов", team: "Неман", position: "НП", points: 66, price: 7 },
    { id: 26, name: "Васильев", team: "Славия", position: "НП", points: 60, price: 6 },
    { id: 27, name: "Смирнов", team: "Торпедо", position: "НП", points: 64, price: 6 },
    { id: 28, name: "Ковалев", team: "Динамо Минск", position: "НП", points: 76, price: 8 },
    { id: 29, name: "Николаев", team: "БАТЭ", position: "НП", points: 70, price: 7 },
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
    setPriceFrom(prev => Math.min(prev + 1, priceTo));
    setCurrentPage(1);
  };
  const handlePriceFromDecrease = () => {
    setPriceFrom(prev => Math.max(prev - 1, 1));
    setCurrentPage(1);
  };
  const handlePriceToIncrease = () => {
    setPriceTo(prev => Math.min(prev + 1, 15));
    setCurrentPage(1);
  };
  const handlePriceToDecrease = () => {
    setPriceTo(prev => Math.max(prev - 1, priceFrom));
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

  const BUDGET = 100;
  const MAX_PLAYERS_PER_CLUB = 2;
  const currentTeamCost = selectedPlayersData.reduce((sum, p) => sum + p.price, 0);
  const currentBalance = BUDGET - currentTeamCost;

  const getPlayersCountByClub = (playerIds: number[], clubName: string) => {
    return playerIds.filter(id => {
      const p = players.find(player => player.id === id);
      return p?.team === clubName;
    }).length;
  };

  const togglePlayer = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    if (selectedPlayers.includes(playerId)) {
      // Remove player - also clear captain/vice-captain if needed
      if (captain === playerId) setCaptain(null);
      if (viceCaptain === playerId) setViceCaptain(null);
      setSelectedPlayers(prev => prev.filter((id) => id !== playerId));
    } else {
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
      setSelectedPlayers(prev => [...prev, playerId]);
    }
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setCaptain(null);
    setViceCaptain(null);
  };

  const handleAutoFill = () => {
    // Formation: 2 ВР, 5 ЗЩ, 5 ПЗ, 3 НП
    const formation = { ВР: 2, ЗЩ: 5, ПЗ: 5, НП: 3 };
    const selectedIds: number[] = [];
    let totalCost = 0;
    const clubCounts: Record<string, number> = {};

    Object.entries(formation).forEach(([position, count]) => {
      const positionPlayers = players
        .filter((p) => p.position === position && !selectedIds.includes(p.id))
        .sort((a, b) => a.price - b.price); // Sort by price to fit budget
      
      let added = 0;
      for (const player of positionPlayers) {
        if (added >= count) break;
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
    setCaptain(null);
    setViceCaptain(null);
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
            <span className="text-primary">Lucky Team</span>
          </div>
        </div>
        <h1 className="text-foreground text-3xl font-bold mb-2">Lucky Team</h1>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дедлайн: 04.04 в 19:00</span>
          <span className="text-foreground">3 дня 08:36:53</span>
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
          <div className="px-4 mt-6">
            <FormationField selectedPlayers={selectedPlayersData} onRemovePlayer={(id) => togglePlayer(id)} />
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
      <div className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
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
      <div className="px-4 mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="w-20">Игрок</span>
          <span className="w-8"></span>
          <span>Клуб</span>
        </div>
        <div className="flex items-center gap-3 pr-10">
          <span>Очки</span>
          <span>Цена</span>
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 mt-3 space-y-2">
        {paginatedPlayers.map((player) => {
          const isSelected = selectedPlayers.includes(player.id);
          return (
            <div key={player.id} className="bg-card rounded-full px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-foreground font-medium">{player.name}</span>
                <span className="text-muted-foreground text-sm">{player.position}</span>
                <span className="text-muted-foreground text-sm">{player.team}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-foreground font-medium">{player.points}</span>
                </div>
                <span className="text-foreground font-medium">9</span>
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
        <Select 
          value={captain?.toString() || ""} 
          onValueChange={(val) => {
            const id = parseInt(val);
            setCaptain(id);
            if (viceCaptain === id) setViceCaptain(null);
          }}
        >
          <SelectTrigger className="flex-1 bg-card border-border text-foreground">
            <SelectValue placeholder="Капитан" />
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
        <Select 
          value={viceCaptain?.toString() || ""} 
          onValueChange={(val) => {
            const id = parseInt(val);
            setViceCaptain(id);
            if (captain === id) setCaptain(null);
          }}
        >
          <SelectTrigger className="flex-1 bg-card border-border text-foreground">
            <SelectValue placeholder="Вице капитан" />
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

      {/* Warning */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#6B6B8D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Вы не можете добавить больше 2-ух игроков из одного клуба в свою команду
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 flex gap-3">
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

      {/* Team Cost & Balance */}
      <div className="px-4 mt-6">
        <div className="flex justify-between mb-4">
          <div>
            <span className="text-muted-foreground text-sm">Стоимость команды</span>
            <p className="text-foreground text-3xl font-bold">
              {currentTeamCost}
            </p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-sm">Баланс</span>
            <p className="text-foreground text-3xl font-bold">
              {currentBalance}
            </p>
          </div>
        </div>
        <Button
          disabled={selectedPlayers.length === 0}
          className={`w-full rounded-full py-3 font-semibold text-black ${
            selectedPlayers.length === 0
              ? "bg-[#4A5D23] cursor-not-allowed"
              : "bg-[#A8FF00] hover:bg-[#98EE00]"
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

      {/* Team Balance */}
      <div className="px-4 mt-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-muted-foreground text-sm mb-1">Стоимость команды</div>
            <div className="text-foreground text-3xl font-bold">0</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm mb-1">Баланс</div>
            <div className="text-foreground text-3xl font-bold">100</div>
          </div>
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default TeamBuilder;
