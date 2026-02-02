import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Minus, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown, X } from "lucide-react";
import { PlayerData } from "@/lib/teamData";
import { clubLogos } from "@/lib/clubLogos";

const ITEMS_PER_PAGE = 6;

interface BuyPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyPlayer: (player: PlayerData) => void;
  onPlayerClick?: (player: PlayerData) => void;
  currentTeamPlayerIds: number[];
  currentBudget: number;
  getPlayersCountByClub: (clubName: string) => number;
  maxPlayersPerClub: number;
  initialPositionFilter?: string | null;
  availablePlayers: PlayerData[];
  teams: string[];
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
  onPlayerClick,
  currentTeamPlayerIds,
  currentBudget,
  getPlayersCountByClub,
  maxPlayersPerClub,
  initialPositionFilter,
  availablePlayers: allChampionshipPlayers,
  teams: allTeams,
}: BuyPlayerDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Все команды");
  const [activeFilter, setActiveFilter] = useState("Все");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(14);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"name" | "points" | "price" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Default sort by price desc without showing UI indicator
  const [isDefaultSort, setIsDefaultSort] = useState(true);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  
  // Scroll search input into view when keyboard appears
  const scrollSearchIntoView = useCallback(() => {
    const inputEl = searchInputRef.current;
    const drawerEl = drawerContentRef.current;
    if (!inputEl || !drawerEl) return;
    
    // Scroll the input to be visible at the top of the drawer content
    inputEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  
  // Keep the search visible when keyboard opens / viewport changes
  useEffect(() => {
    if (!isSearchFocused) return;
    
    const vv = window.visualViewport;
    
    const onViewportChange = () => {
      // Small delay to let the viewport settle
      window.setTimeout(scrollSearchIntoView, 50);
    };
    
    vv?.addEventListener("resize", onViewportChange);
    vv?.addEventListener("scroll", onViewportChange);
    
    return () => {
      vv?.removeEventListener("resize", onViewportChange);
      vv?.removeEventListener("scroll", onViewportChange);
    };
  }, [isSearchFocused, scrollSearchIntoView]);

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
  
  // Note: This component is deprecated and not used in the app anymore
  // All player management now uses API data through hooks

  const handleSort = (field: "name" | "points" | "price") => {
    // When user clicks sort, disable default sort
    setIsDefaultSort(false);
    
    if (sortField !== field) {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    } else if (sortDirection === "desc") {
      // Second click: switch to ascending
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      // Third click: clear sort, restore default
      setSortField(null);
      setSortDirection(null);
      setIsDefaultSort(true);
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
    const query = searchQuery.trim().toLowerCase();
    return availablePlayers.filter(player => {
      // Ищем по фамилии (последнее слово в ФИО), но если её нет — по полному имени
      const [firstName, ...lastNameParts] = player.name.split(" ");
      const lastName = lastNameParts.join(" ").toLowerCase();
      const fullName = player.name.toLowerCase();
      const searchTarget = lastName || fullName;
      const matchesSearch = query === "" || searchTarget.includes(query);
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
      // Default sort: by price descending (without UI indicator)
      if (isDefaultSort && !sortField) {
        return b.price - a.price;
      }
      
      if (!sortField || !sortDirection) return 0;

      if (sortField === "name") {
        // Сортируем по фамилии (последнее слово в ФИО). Если фамилии нет, используем полное имя.
        const [aFirst, ...aLastParts] = a.name.split(" ");
        const [bFirst, ...bLastParts] = b.name.split(" ");
        const aLast = (aLastParts.join(" ") || a.name).toLowerCase();
        const bLast = (bLastParts.join(" ") || b.name).toLowerCase();
        const comparison = aLast.localeCompare(bLast, "ru");
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
  }, [filteredPlayers, sortField, sortDirection, isDefaultSort]);

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
        <div ref={drawerContentRef} className="p-4 overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground text-xl font-display">Доступные игроки</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Budget info */}
          <div className="bg-card border border-border rounded-xl h-10 px-3 mb-2 flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Доступный бюджет:</span>
            <span className="text-primary font-semibold text-sm">{currentBudget.toFixed(1)}</span>
          </div>

          {/* Filters section */}
          <div className="space-y-2 mb-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                  // Scroll to search after keyboard appears
                  window.setTimeout(scrollSearchIntoView, 350);
                }}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                className="pl-10 pr-10 bg-card border-border rounded-xl h-10 text-foreground placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Collapsible filters - animated hide when search is focused */}
            <div 
              className={`transition-all duration-300 ease-out overflow-hidden ${
                isSearchFocused ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
              }`}
            >
              {/* Team filter */}
              <Select value={selectedTeam} onValueChange={(v) => { setSelectedTeam(v); setCurrentPage(1); }}>
                <SelectTrigger className="h-10 bg-card border-border rounded-xl text-foreground text-sm w-full focus:ring-2 focus:ring-primary focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      <div className="flex items-center gap-2">
                        {team !== "Все команды" && clubLogos[team] && (
                          <img src={clubLogos[team]} alt={team} className="w-5 h-5 object-contain" />
                        )}
                        <span>{team}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Position filters */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mt-2">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setCurrentPage(1); }}
                    className={`rounded-full h-8 px-4 text-sm whitespace-nowrap ${
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
              <div className="flex items-center gap-2 mt-2">
                <span className="text-muted-foreground text-sm">Цена:</span>
                <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
                  <button 
                    onClick={() => { setPriceFrom(Math.max(3, priceFrom - 1)); setCurrentPage(1); }} 
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <span className="text-foreground text-sm w-9 text-center">{priceFrom.toFixed(1)}</span>
                  <button 
                    onClick={() => { setPriceFrom(Math.min(priceFrom + 1, priceTo)); setCurrentPage(1); }} 
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
                <span className="text-muted-foreground text-sm">—</span>
                <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
                  <button 
                    onClick={() => { setPriceTo(Math.max(priceFrom, priceTo - 1)); setCurrentPage(1); }} 
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3 text-primary-foreground" />
                  </button>
                  <span className="text-foreground text-sm w-9 text-center">{priceTo.toFixed(1)}</span>
                  <button 
                    onClick={() => { setPriceTo(Math.min(14, priceTo + 1)); setCurrentPage(1); }} 
                    className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
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
                  className={`bg-card rounded-xl px-3 py-2 flex items-center cursor-pointer hover:bg-card/80 transition-colors ${!canBuy ? "opacity-50" : ""}`}
                  onClick={() => onPlayerClick?.(player as PlayerData)}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {clubLogos[player.team] && (
                      <img 
                        src={clubLogos[player.team]} 
                        alt={player.team}
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="text-foreground font-medium text-sm truncate">{player.name}</span>
                    <span className="text-muted-foreground text-xs flex-shrink-0">{player.position}</span>
                  </div>
                  
                  <span className={`w-12 flex-shrink-0 text-sm text-center font-medium ${
                    player.points > 0 ? "text-success" : player.points < 0 ? "text-destructive" : "text-foreground"
                  }`}>
                    {player.points > 0 ? `+${player.points}` : player.points}
                  </span>
                  
                  <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">
                    {player.price}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canBuy) onBuyPlayer(player as PlayerData);
                    }}
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
