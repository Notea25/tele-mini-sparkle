import { useState, useMemo, useEffect } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, X } from "lucide-react";
import { PlayerData } from "@/lib/teamData";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";
import flameIcon from "@/assets/flame-icon.png";

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

// All championship players
const allChampionshipPlayers = [
  // Вратари (ВР)
  { id: 0, name: "Вакулич", team: "Динамо Минск", position: "ВР", points: 79, price: 10.5 },
  { id: 1, name: "Петров", team: "БАТЭ", position: "ВР", points: 65, price: 6.8 },
  { id: 2, name: "Климович", team: "Шахтер", position: "ВР", points: 71, price: 8.2 },
  { id: 3, name: "Горбунов", team: "Неман", position: "ВР", points: 58, price: 4.5 },
  { id: 30, name: "Антонов", team: "Славия", position: "ВР", points: 62, price: 5.4 },
  { id: 31, name: "Беляев", team: "Торпедо", position: "ВР", points: 55, price: 4.1 },
  { id: 32, name: "Воронов", team: "Динамо Минск", position: "ВР", points: 68, price: 7.3 },
  { id: 33, name: "Григорьев", team: "БАТЭ", position: "ВР", points: 74, price: 9.1 },
  { id: 60, name: "Давыдов", team: "Шахтер", position: "ВР", points: 60, price: 5.0 },
  { id: 61, name: "Ермаков", team: "Неман", position: "ВР", points: 53, price: 3.9 },
  // Защитники (ЗЩ)
  { id: 4, name: "Сидоров", team: "Шахтер", position: "ЗЩ", points: 72, price: 9.3 },
  { id: 5, name: "Иванов", team: "Динамо Минск", position: "ЗЩ", points: 68, price: 7.1 },
  { id: 6, name: "Соколов", team: "Шахтер", position: "ЗЩ", points: 70, price: 8.7 },
  { id: 7, name: "Орлов", team: "БАТЭ", position: "ЗЩ", points: 64, price: 5.9 },
  { id: 8, name: "Федоров", team: "Неман", position: "ЗЩ", points: 61, price: 4.2 },
  { id: 9, name: "Михайлов", team: "Динамо Минск", position: "ЗЩ", points: 73, price: 11.4 },
  { id: 10, name: "Зайцев", team: "Славия", position: "ЗЩ", points: 55, price: 4.8 },
  { id: 11, name: "Белов", team: "Торпедо", position: "ЗЩ", points: 59, price: 5.3 },
  { id: 34, name: "Денисов", team: "Динамо Минск", position: "ЗЩ", points: 66, price: 6.5 },
  { id: 35, name: "Егоров", team: "БАТЭ", position: "ЗЩ", points: 69, price: 7.8 },
  { id: 36, name: "Жуков", team: "Шахтер", position: "ЗЩ", points: 71, price: 8.4 },
  { id: 37, name: "Захаров", team: "Неман", position: "ЗЩ", points: 57, price: 4.6 },
  { id: 38, name: "Ильин", team: "Славия", position: "ЗЩ", points: 63, price: 5.7 },
  { id: 39, name: "Калинин", team: "Торпедо", position: "ЗЩ", points: 60, price: 5.1 },
  { id: 40, name: "Лазарев", team: "Динамо Минск", position: "ЗЩ", points: 75, price: 9.8 },
  { id: 41, name: "Макаров", team: "БАТЭ", position: "ЗЩ", points: 67, price: 7.2 },
  { id: 62, name: "Медведев", team: "Славия", position: "ЗЩ", points: 58, price: 4.9 },
  { id: 63, name: "Никитин", team: "Торпедо", position: "ЗЩ", points: 54, price: 4.0 },
  { id: 64, name: "Овчинников", team: "Шахтер", position: "ЗЩ", points: 65, price: 6.2 },
  { id: 65, name: "Прохоров", team: "Неман", position: "ЗЩ", points: 52, price: 3.8 },
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
  { id: 42, name: "Назаров", team: "Шахтер", position: "ПЗ", points: 72, price: 8.5 },
  { id: 43, name: "Осипов", team: "Неман", position: "ПЗ", points: 59, price: 4.9 },
  { id: 44, name: "Панов", team: "Славия", position: "ПЗ", points: 64, price: 6.0 },
  { id: 45, name: "Романов", team: "Торпедо", position: "ПЗ", points: 61, price: 5.5 },
  { id: 46, name: "Савельев", team: "Динамо Минск", position: "ПЗ", points: 78, price: 10.5 },
  { id: 47, name: "Титов", team: "БАТЭ", position: "ПЗ", points: 70, price: 7.9 },
  { id: 48, name: "Ушаков", team: "Шахтер", position: "ПЗ", points: 73, price: 8.8 },
  { id: 49, name: "Филиппов", team: "Неман", position: "ПЗ", points: 56, price: 4.3 },
  { id: 50, name: "Харитонов", team: "Славия", position: "ПЗ", points: 65, price: 6.4 },
  { id: 51, name: "Цветков", team: "Торпедо", position: "ПЗ", points: 68, price: 7.1 },
  { id: 66, name: "Рябов", team: "Динамо Минск", position: "ПЗ", points: 76, price: 9.9 },
  { id: 67, name: "Самойлов", team: "БАТЭ", position: "ПЗ", points: 66, price: 6.8 },
  { id: 68, name: "Трофимов", team: "Шахтер", position: "ПЗ", points: 70, price: 7.6 },
  { id: 69, name: "Уваров", team: "Неман", position: "ПЗ", points: 57, price: 4.5 },
  { id: 70, name: "Фомин", team: "Славия", position: "ПЗ", points: 62, price: 5.8 },
  { id: 71, name: "Хомяков", team: "Торпедо", position: "ПЗ", points: 60, price: 5.2 },
  // Нападающие (НП)
  { id: 22, name: "Морозов", team: "Динамо Минск", position: "НП", points: 88, price: 11.8 },
  { id: 23, name: "Волков", team: "БАТЭ", position: "НП", points: 82, price: 10.9 },
  { id: 24, name: "Кузнецов", team: "Шахтер", position: "НП", points: 79, price: 9.5 },
  { id: 25, name: "Попов", team: "Неман", position: "НП", points: 66, price: 5.7 },
  { id: 26, name: "Васильев", team: "Славия", position: "НП", points: 60, price: 4.3 },
  { id: 27, name: "Смирнов", team: "Торпедо", position: "НП", points: 64, price: 5.4 },
  { id: 28, name: "Ковалев", team: "Динамо Минск", position: "НП", points: 76, price: 8.6 },
  { id: 29, name: "Николаев", team: "БАТЭ", position: "НП", points: 70, price: 7.2 },
  { id: 52, name: "Чернов", team: "Шахтер", position: "НП", points: 77, price: 9.2 },
  { id: 53, name: "Шестаков", team: "Неман", position: "НП", points: 63, price: 5.6 },
  { id: 54, name: "Щербаков", team: "Славия", position: "НП", points: 58, price: 4.7 },
  { id: 55, name: "Яковлев", team: "Торпедо", position: "НП", points: 67, price: 6.3 },
  { id: 56, name: "Алексеев", team: "Динамо Минск", position: "НП", points: 84, price: 11.2 },
  { id: 57, name: "Борисов", team: "БАТЭ", position: "НП", points: 75, price: 8.9 },
  { id: 58, name: "Власов", team: "Шахтер", position: "НП", points: 71, price: 7.8 },
  { id: 59, name: "Гусев", team: "Неман", position: "НП", points: 62, price: 5.2 },
  { id: 72, name: "Широков", team: "Славия", position: "НП", points: 59, price: 4.9 },
  { id: 73, name: "Юрин", team: "Торпедо", position: "НП", points: 65, price: 6.0 },
  { id: 74, name: "Ясенев", team: "Динамо Минск", position: "НП", points: 80, price: 10.3 },
  { id: 75, name: "Артемьев", team: "БАТЭ", position: "НП", points: 73, price: 8.4 },
  { id: 76, name: "Буров", team: "Шахтер", position: "НП", points: 69, price: 7.0 },
  { id: 77, name: "Воробьев", team: "Неман", position: "НП", points: 61, price: 5.3 },
  { id: 78, name: "Громов", team: "Славия", position: "НП", points: 56, price: 4.4 },
  { id: 79, name: "Дроздов", team: "Торпедо", position: "НП", points: 68, price: 6.7 },
];

interface BuyPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyPlayer: (player: PlayerData) => void;
  currentTeamPlayerIds: number[];
  currentBudget: number;
  getPlayersCountByClub: (clubName: string) => number;
  maxPlayersPerClub: number;
  initialPositionFilter?: string | null;
}

const positionToFilterMap: Record<string, string> = {
  "ВР": "Вратари",
  "ЗЩ": "Защитники",
  "ПЗ": "Полузащитники",
  "НП": "Нападающие",
};

const BuyPlayerDrawer = ({
  isOpen,
  onClose,
  onBuyPlayer,
  currentTeamPlayerIds,
  currentBudget,
  getPlayersCountByClub,
  maxPlayersPerClub,
  initialPositionFilter,
}: BuyPlayerDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Все команды");
  const [selectedPoints, setSelectedPoints] = useState("Фильтр по очкам");
  const [activeFilter, setActiveFilter] = useState("Все");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"name" | "points" | "price" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Apply initial position filter when drawer opens
  useEffect(() => {
    if (isOpen && initialPositionFilter) {
      const filterName = positionToFilterMap[initialPositionFilter];
      if (filterName) {
        setActiveFilter(filterName);
        setCurrentPage(1);
      }
    }
  }, [isOpen, initialPositionFilter]);

  const teams = ["Все команды", "Арсенал", "Барановичи", "БАТЭ", "Белшина", "Витебск", "Гомель", "Динамо-Брест", "Динамо-Минск", "Днепр-Могилев", "Ислочь", "Минск", "МЛ Витебск", "Нафтан-Новополоцк", "Неман", "Славия-Мозырь", "Торпедо-БелАЗ"];
  const pointsOptions = [
    { label: "Фильтр по очкам", value: "Фильтр по очкам" },
    { label: "80+", value: "80+" },
    { label: "70-79", value: "70-79" },
    { label: "60-69", value: "60-69" },
    { label: "< 60", value: "<60" },
  ];
  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];

  const handleSort = (field: "name" | "points" | "price") => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortField(null);
      setSortDirection(null);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: "name" | "points" | "price") => {
    if (sortField !== field) return <ChevronsUpDown className="w-3 h-3" />;
    if (sortDirection === "asc") return <ChevronUp className="w-3 h-3" />;
    return <ChevronDown className="w-3 h-3" />;
  };

  // Filter out already selected players
  const availablePlayers = useMemo(() => {
    return allChampionshipPlayers.filter(p => !currentTeamPlayerIds.includes(p.id));
  }, [currentTeamPlayerIds]);

  // Apply filters
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const matchesTeam = selectedTeam === "Все команды" || player.team === selectedTeam;
      if (!matchesTeam) return false;

      let matchesPoints = true;
      if (selectedPoints === "80+") matchesPoints = player.points >= 80;
      else if (selectedPoints === "70-79") matchesPoints = player.points >= 70 && player.points < 80;
      else if (selectedPoints === "60-69") matchesPoints = player.points >= 60 && player.points < 70;
      else if (selectedPoints === "<60") matchesPoints = player.points < 60;
      if (!matchesPoints) return false;

      if (player.price < priceFrom || player.price > priceTo) return false;

      if (activeFilter === "Все") return true;
      if (activeFilter === "Вратари") return player.position === "ВР";
      if (activeFilter === "Защитники") return player.position === "ЗЩ";
      if (activeFilter === "Полузащитники") return player.position === "ПЗ";
      if (activeFilter === "Нападающие") return player.position === "НП";
      return true;
    });
  }, [availablePlayers, searchQuery, selectedTeam, selectedPoints, priceFrom, priceTo, activeFilter]);

  // Apply sorting
  const sortedPlayers = useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      if (!sortField || !sortDirection) return 0;

      if (sortField === "name") {
        const comparison = a.name.localeCompare(b.name, "ru");
        return sortDirection === "asc" ? comparison : -comparison;
      }
      if (sortField === "points") {
        return sortDirection === "desc" ? b.points - a.points : a.points - b.points;
      }
      if (sortField === "price") {
        return sortDirection === "desc" ? b.price - a.price : a.price - b.price;
      }
      return 0;
    });
  }, [filteredPlayers, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = sortedPlayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const canBuyPlayer = (player: typeof allChampionshipPlayers[0]) => {
    if (player.price > currentBudget) return false;
    if (getPlayersCountByClub(player.team) >= maxPlayersPerClub) return false;
    return true;
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTeam("Все команды");
    setSelectedPoints("Фильтр по очкам");
    setPriceFrom(3);
    setPriceTo(15);
    setActiveFilter("Все");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    activeFilter !== "Все" ||
    selectedTeam !== "Все команды" ||
    selectedPoints !== "Фильтр по очкам" ||
    priceFrom !== 3 ||
    priceTo !== 15;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background max-h-[90vh]">
        <div className="p-4 overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground text-xl font-bold">Добавить игрока</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Budget info */}
          <div className="bg-card rounded-xl p-3 mb-4 flex justify-between">
            <span className="text-muted-foreground text-sm">Доступный бюджет:</span>
            <span className="text-primary font-bold">{currentBudget.toFixed(1)}</span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Поиск по имени"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-card border-border rounded-full h-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Filters row */}
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
            <Select value={selectedTeam} onValueChange={(v) => { setSelectedTeam(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 bg-card border-border rounded-full text-foreground text-xs min-w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPoints} onValueChange={(v) => { setSelectedPoints(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 bg-card border-border rounded-full text-foreground text-xs min-w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pointsOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position filters */}
          <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter}
                onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
                className={`rounded-full h-7 px-3 text-xs ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-card/80"
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Price range */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-xs">Цена</span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  Сбросить фильтры
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">от</span>
              <div className="flex items-center gap-1 bg-card rounded-full px-2 py-1">
                <button 
                  onClick={() => { setPriceFrom(Math.max(1, priceFrom - 1)); setCurrentPage(1); }} 
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Minus className="w-3 h-3 text-primary-foreground" />
                </button>
                <span className="text-foreground text-xs w-8 text-center">{priceFrom},0</span>
                <button 
                  onClick={() => { setPriceFrom(Math.min(priceFrom + 1, priceTo)); setCurrentPage(1); }} 
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-primary-foreground" />
                </button>
              </div>
              <span className="text-muted-foreground text-xs">до</span>
              <div className="flex items-center gap-1 bg-card rounded-full px-2 py-1">
                <button 
                  onClick={() => { setPriceTo(Math.max(priceFrom, priceTo - 1)); setCurrentPage(1); }} 
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Minus className="w-3 h-3 text-primary-foreground" />
                </button>
                <span className="text-foreground text-xs w-8 text-center">{priceTo},0</span>
                <button 
                  onClick={() => { setPriceTo(Math.min(15, priceTo + 1)); setCurrentPage(1); }} 
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Plus className="w-3 h-3 text-primary-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Table header */}
          <div className="flex items-center px-3 py-1 text-xs text-muted-foreground">
            <button
              className={`flex-1 flex items-center gap-1 text-left ${sortField === "name" ? "text-primary" : ""}`}
              onClick={() => handleSort("name")}
            >
              Игрок {getSortIcon("name")}
            </button>
            <span className="w-12 text-center">Клуб</span>
            <button
              className={`w-12 flex items-center justify-center gap-1 ${sortField === "points" ? "text-primary" : ""}`}
              onClick={() => handleSort("points")}
            >
              Очки {getSortIcon("points")}
            </button>
            <button
              className={`w-12 flex items-center justify-center gap-1 ${sortField === "price" ? "text-primary" : ""}`}
              onClick={() => handleSort("price")}
            >
              Цена {getSortIcon("price")}
            </button>
            <span className="w-10"></span>
          </div>

          {/* Player list */}
          <div className="space-y-2 mb-4">
            {paginatedPlayers.map((player) => {
              const canBuy = canBuyPlayer(player);
              return (
                <div
                  key={player.id}
                  className={`bg-card rounded-full px-3 py-2 flex items-center ${!canBuy ? "opacity-50" : ""}`}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-foreground font-medium text-sm truncate">{player.name}</span>
                    <span className="text-muted-foreground text-xs">{player.position}</span>
                  </div>
                  
                  <div className="w-12 flex-shrink-0 flex justify-center">
                    {clubIcons[player.team] && (
                      <img 
                        src={clubIcons[player.team]} 
                        alt={player.team}
                        className="w-5 h-5 object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="w-12 flex-shrink-0 flex items-center justify-center gap-1">
                    {player.id % 3 === 0 && <img src={flameIcon} alt="fire" className="w-3 h-3" />}
                    <span className="text-foreground text-sm">{player.points}</span>
                  </div>
                  
                  <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">
                    {player.price}
                  </span>
                  
                  <button
                    onClick={() => canBuy && onBuyPlayer(player as PlayerData)}
                    disabled={!canBuy}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      canBuy
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-muted cursor-not-allowed"
                    }`}
                  >
                    <Plus className={`w-4 h-4 ${canBuy ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-muted-foreground text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BuyPlayerDrawer;
