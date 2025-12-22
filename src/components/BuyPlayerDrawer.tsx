import { useState, useMemo, useEffect } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, X } from "lucide-react";
import { PlayerData, allPlayers, allTeams } from "@/lib/teamData";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";


const ITEMS_PER_PAGE = 6;

// Club icons mapping - default logo for all teams
const clubIcons: Record<string, string> = Object.fromEntries(
  allTeams.map(team => [team, team === "Белшина" ? clubBelshina : clubLogo])
);

// Use allPlayers from teamData
const allChampionshipPlayers = allPlayers;

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
  const [activeFilter, setActiveFilter] = useState("Все");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(14);
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

  const teams = ["Все команды", ...allTeams];
  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];

  const handleSort = (field: "name" | "points" | "price") => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    } else if (sortDirection === "desc") {
      // Second click: switch to ascending
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      // Third click: clear sort
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

      if (player.price < priceFrom || player.price > priceTo) return false;

      if (activeFilter === "Все") return true;
      if (activeFilter === "Вратари") return player.position === "ВР";
      if (activeFilter === "Защитники") return player.position === "ЗЩ";
      if (activeFilter === "Полузащитники") return player.position === "ПЗ";
      if (activeFilter === "Нападающие") return player.position === "НП";
      return true;
    });
  }, [availablePlayers, searchQuery, selectedTeam, priceFrom, priceTo, activeFilter]);

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
    // Use small epsilon for floating point comparison
    if (player.price > currentBudget + 0.001) return false;
    if (getPlayersCountByClub(player.team) >= maxPlayersPerClub) return false;
    return true;
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTeam("Все команды");
    setPriceFrom(3);
    setPriceTo(14);
    setActiveFilter("Все");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    activeFilter !== "Все" ||
    selectedTeam !== "Все команды" ||
    priceFrom !== 3 ||
    priceTo !== 14;

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
          <div className="bg-card rounded-xl p-3 mb-4 flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Доступный бюджет:</span>
            <span className="text-primary font-bold text-lg">{currentBudget.toFixed(1)}</span>
          </div>

          {/* Filters section */}
          <div className="space-y-3 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Поиск по имени"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 bg-card border-border rounded-xl h-11 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Team filter */}
            <Select value={selectedTeam} onValueChange={(v) => { setSelectedTeam(v); setCurrentPage(1); }}>
              <SelectTrigger className="h-11 bg-card border-border rounded-xl text-foreground text-sm w-full focus:ring-2 focus:ring-primary focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Position filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
                  className={`rounded-full h-9 px-4 text-sm whitespace-nowrap ${
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-card/80 border border-border"
                  }`}
                >
                  {filter}
                </Button>
              ))}
            </div>

            {/* Price range */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Цена:</span>
                <div className="flex items-center gap-1 bg-card rounded-xl px-2 py-1.5 border border-border">
                  <button 
                    onClick={() => { setPriceFrom(Math.max(3, priceFrom - 1)); setCurrentPage(1); }} 
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <span className="text-foreground text-sm w-10 text-center">{priceFrom.toFixed(1)}</span>
                  <button 
                    onClick={() => { setPriceFrom(Math.min(priceFrom + 1, priceTo)); setCurrentPage(1); }} 
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
                <span className="text-muted-foreground text-sm">—</span>
                <div className="flex items-center gap-1 bg-card rounded-xl px-2 py-1.5 border border-border">
                  <button 
                    onClick={() => { setPriceTo(Math.max(priceFrom, priceTo - 1)); setCurrentPage(1); }} 
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <span className="text-foreground text-sm w-10 text-center">{priceTo.toFixed(1)}</span>
                  <button 
                    onClick={() => { setPriceTo(Math.min(14, priceTo + 1)); setCurrentPage(1); }} 
                    className="w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
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
