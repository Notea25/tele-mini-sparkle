import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  X,
  Plus,
  Search,
  Minus,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { getSavedTeam, getMainSquadAndBench, PlayerData, saveTeamTransfers, allPlayers } from "@/lib/teamData";
import { useDeadline } from "@/hooks/useDeadline";
import { useTeams } from "@/hooks/useTeams";
import { clubLogos } from "@/lib/clubLogos";
import FormationFieldTransfers from "@/components/FormationFieldTransfers";
import PlayerCard from "@/components/PlayerCard";
import BoostDrawer from "@/components/BoostDrawer";
import ConfirmTransfersDrawer from "@/components/ConfirmTransfersDrawer";
import {
  getBoostState,
  setPendingBoost,
  clearPendingBoost,
  hasAnyPendingBoost,
  TRANSFER_BOOSTS,
  saveGoldenTourBackup,
  getGoldenTourBackup,
  clearGoldenTourBackup,
} from "@/lib/boostState";
import { getTransferState, calculateTransferCosts, recordTransfers, TRANSFERS_CONFIG } from "@/lib/transferState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import clubLogo from "@/assets/club-logo.png";

import icon2x from "@/assets/icon-2x.png";
import iconStar from "@/assets/icon-star.png";
import iconFree from "@/assets/icon-free.png";
import iconBenchPlus from "@/assets/icon-bench-plus.png";
import icon3x from "@/assets/icon-3x.png";

// Club icons mapping - use clubLogos as primary, fall back to defaults
const clubIcons: Record<string, string> = {
  ...clubLogos,
  Шахтер: clubLogo,
};

import { BoostChip, BoostStatus } from "@/components/BoostDrawer";

// Special chips for transfers page UI - only 2 chips
const initialChips: BoostChip[] = [
  { id: "transfers", icon: iconStar, label: "Трансферы +", sublabel: "Подробнее", status: "available" },
  { id: "golden", icon: iconFree, label: "Золотой тур", sublabel: "Подробнее", status: "available" },
];

// All 5 boosts for confirmation drawer
const allBoostsTemplate: BoostChip[] = [
  { id: "bench", icon: iconBenchPlus, label: "Скамейка +", sublabel: "Подробнее", status: "available" },
  { id: "captain3x", icon: icon3x, label: "3x Капитан", sublabel: "Подробнее", status: "available" },
  { id: "transfers", icon: iconStar, label: "Трансферы +", sublabel: "Подробнее", status: "available" },
  { id: "golden", icon: iconFree, label: "Золотой тур", sublabel: "Подробнее", status: "available" },
  { id: "double", icon: icon2x, label: "Двойная сила", sublabel: "Подробнее", status: "available" },
];

interface PlayerDataExt extends PlayerData {
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

// Fixed formation for transfers: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 players
const TRANSFERS_FORMATION_SLOTS: Record<string, number> = {
  ВР: 2,
  ЗЩ: 5,
  ПЗ: 5,
  НП: 3,
};

const ITEMS_PER_PAGE = 8;

const Transfers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [buyPlayerForCard, setBuyPlayerForCard] = useState<PlayerData | null>(null);
  const [teamName] = useState(() => getSavedTeam().teamName);
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(() => {
    const boostState = getBoostState();
    return initialChips.map((chip) => {
      if (boostState.pendingBoostId === chip.id) {
        return { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" };
      }
      const usedBoost = boostState.usedBoosts.find((b) => b.id === chip.id);
      if (usedBoost) {
        return { ...chip, status: "used" as BoostStatus, usedInTour: usedBoost.tour };
      }
      return chip;
    });
  });
  const [selectedBoostChip, setSelectedBoostChip] = useState<BoostChip | null>(null);
  const [isBoostDrawerOpen, setIsBoostDrawerOpen] = useState(false);
  const [otherPageBoostActive, setOtherPageBoostActive] = useState(false);
  const currentTour = 1;

  // Player list state (like TeamBuilder)
  const playerListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("Все команды");
  const [activeFilter, setActiveFilter] = useState("Все");
  const [priceFrom, setPriceFrom] = useState(3);
  const [priceTo, setPriceTo] = useState(14);
  const [sortField, setSortField] = useState<"name" | "points" | "price" | null>("price");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");
  const [pendingPositionFilter, setPendingPositionFilter] = useState<string | null>(null);
  const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);

  // Load teams from API with caching
  const leagueId = localStorage.getItem("fantasySelectedLeagueId") || "116";
  const { teams: apiTeams, isLoading: isLoadingTeams } = useTeams(leagueId);
  const teams = ["Все команды", ...apiTeams.map((t) => t.name)];
  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];
  const positionToFilter: Record<string, string> = {
    ВР: "Вратари",
    ЗЩ: "Защитники",
    ПЗ: "Полузащитники",
    НП: "Нападающие",
  };

  // Check if boost is active on the other page
  useEffect(() => {
    const checkOtherPageBoost = () => {
      const { pending, boostId, page } = hasAnyPendingBoost();
      if (pending && page === "team-management") {
        setOtherPageBoostActive(true);
      } else {
        setOtherPageBoostActive(false);
      }
    };
    checkOtherPageBoost();

    const handleStorageChange = () => checkOtherPageBoost();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openBoostDrawer = (chip: BoostChip) => {
    if (otherPageBoostActive) {
      toast.error("В этом туре уже активирован буст в разделе Управление командой");
      return;
    }
    setSelectedBoostChip(chip);
    setIsBoostDrawerOpen(true);
  };

  const applyBoost = (chipId: string) => {
    const hasPendingBoost = specialChips.some((chip) => chip.status === "pending");
    const { pending, page } = hasAnyPendingBoost();

    if (hasPendingBoost || (pending && page !== "transfers")) {
      toast.error("В одном туре можно использовать только 1 буст");
      return;
    }

    if (chipId === "golden") {
      const mainSquad = players.slice(0, 11).map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        price: p.price,
        points: p.points,
        slotIndex: p.slotIndex,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
      }));
      const bench = players.slice(11, 15).map((p) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        price: p.price,
        points: p.points,
        slotIndex: p.slotIndex,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
      }));
      saveGoldenTourBackup(currentTour, mainSquad, bench, captain, viceCaptain);
      toast.info("Состав сохранён. После окончания тура он будет автоматически восстановлен.");
    }

    setPendingBoost(chipId, "transfers");
    setSpecialChips((prev) =>
      prev.map((chip) =>
        chip.id === chipId ? { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" } : chip,
      ),
    );
  };

  const cancelBoost = (chipId: string) => {
    clearPendingBoost();
    setSpecialChips((prev) =>
      prev.map((chip) =>
        chip.id === chipId ? { ...chip, status: "available" as BoostStatus, sublabel: "Подробнее" } : chip,
      ),
    );
  };

  // Deadline countdown using shared hook (leagueId defined above with useTeams)
  const { deadlineDate, isLoading: deadlineLoading, timeLeft, formattedDeadline } = useDeadline(leagueId);

  // All 15 players in one array
  const [players, setPlayers] = useState<PlayerDataExt[]>([]);

  // Track initial state to detect changes
  const initialStateRef = useRef<string>("");
  const initialPlayersRef = useRef<PlayerDataExt[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Confirm transfers drawer state
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);

  useEffect(() => {
    const { mainSquad, bench } = getMainSquadAndBench();
    const allLoadedPlayers = [...mainSquad, ...bench];

    const positionCounters: Record<string, number> = { ВР: 0, ЗЩ: 0, ПЗ: 0, НП: 0 };
    const reassignedPlayers = allLoadedPlayers.map((p) => {
      const slotIndex = positionCounters[p.position] || 0;
      positionCounters[p.position] = slotIndex + 1;
      return { ...p, slotIndex };
    });

    if (reassignedPlayers.length > 0) {
      setPlayers(reassignedPlayers);
      initialStateRef.current = JSON.stringify(reassignedPlayers.map((p) => p.id).sort());
      initialPlayersRef.current = reassignedPlayers;
    }
  }, []);

  // Check for changes whenever players change
  useEffect(() => {
    const currentState = JSON.stringify(players.map((p) => p.id).sort());
    if (initialStateRef.current && currentState !== initialStateRef.current) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [players]);

  // Handle browser beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  // Header height for scroll calculations
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => setHeaderHeight(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const scrollToPlayerList = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = playerListRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, top), behavior });
    },
    [headerHeight],
  );

  const scrollSearchIntoView = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = searchInputRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, top), behavior });
    },
    [headerHeight],
  );

  // Track if initial scroll has been done for this focus session
  const initialScrollDoneRef = useRef(false);

  // Reset the flag when search loses focus
  useEffect(() => {
    if (!isSearchFocused) {
      initialScrollDoneRef.current = false;
    }
  }, [isSearchFocused]);

  const ensureSearchVisibleOnce = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      if (initialScrollDoneRef.current) return;
      initialScrollDoneRef.current = true;
      scrollSearchIntoView(behavior);
      window.setTimeout(() => scrollSearchIntoView("auto"), 120);
      window.setTimeout(() => scrollSearchIntoView("auto"), 360);
    },
    [scrollSearchIntoView],
  );

  // Scroll search into view only on initial keyboard open
  useEffect(() => {
    if (!isSearchFocused) return;

    const vv = window.visualViewport;
    let initialHeight = vv?.height ?? window.innerHeight;

    const onViewportResize = () => {
      const currentHeight = vv?.height ?? window.innerHeight;
      // Only scroll when keyboard appears (height decreases significantly)
      if (currentHeight < initialHeight - 100 && !initialScrollDoneRef.current) {
        ensureSearchVisibleOnce("auto");
      }
    };

    vv?.addEventListener("resize", onViewportResize);

    return () => {
      vv?.removeEventListener("resize", onViewportResize);
    };
  }, [isSearchFocused, ensureSearchVisibleOnce]);

  // Calculate removed players with their original slot info for visual hints
  const getRemovedPlayersInfo = () => {
    const currentPlayerIds = new Set(players.map((p) => p.id));
    return initialPlayersRef.current
      .filter((p) => !currentPlayerIds.has(p.id))
      .map((p) => ({
        position: p.position,
        slotIndex: p.slotIndex ?? 0,
        name: p.name,
        team: p.team,
      }));
  };

  const removedPlayersInfo = getRemovedPlayersInfo();

  // Reset squad to initial state
  const handleResetSquad = () => {
    if (initialPlayersRef.current.length > 0) {
      setPlayers([...initialPlayersRef.current]);
      toast.success("Состав восстановлен");
    }
  };

  // Calculate new player IDs
  const newPlayerIds = useMemo(() => {
    const initialPlayerIds = new Set(initialPlayersRef.current.map((p) => p.id));
    return new Set(players.filter((p) => !initialPlayerIds.has(p.id)).map((p) => p.id));
  }, [players]);

  // Calculate transfer records for confirmation
  const getTransferRecords = () => {
    const currentPlayerIds = new Set(players.map((p) => p.id));
    const initialPlayerIds = new Set(initialPlayersRef.current.map((p) => p.id));

    const playersOut = initialPlayersRef.current.filter((p) => !currentPlayerIds.has(p.id));
    const playersIn = players.filter((p) => !initialPlayerIds.has(p.id));

    const transfers: Array<{
      type: "swap" | "buy" | "sell";
      playerOut?: { id: number; name: string; points: number; team?: string; position?: string };
      playerIn?: { id: number; name: string; points: number; team?: string; position?: string };
    }> = [];

    const maxPairs = Math.max(playersOut.length, playersIn.length);
    for (let i = 0; i < maxPairs; i++) {
      const pOut = playersOut[i];
      const pIn = playersIn[i];

      transfers.push({
        type: pOut && pIn ? "swap" : pOut ? "sell" : "buy",
        playerOut: pOut
          ? { id: pOut.id, name: pOut.name, points: pOut.points, team: pOut.team, position: pOut.position }
          : undefined,
        playerIn: pIn
          ? { id: pIn.id, name: pIn.name, points: pIn.points, team: pIn.team, position: pIn.position }
          : undefined,
      });
    }

    return transfers;
  };

  const handleNavigationAttempt = (targetPath: string) => {
    if (hasChanges) {
      setPendingNavigation(targetPath);
      setShowExitDialog(true);
      return true;
    }
    navigate(targetPath);
    return false;
  };

  const handleBackClick = () => {
    return handleNavigationAttempt("/league");
  };

  const handleHomeClick = () => {
    handleNavigationAttempt("/");
  };

  const handleSaveAndExit = () => {
    if (players.length < 15) {
      toast.error(`Состав не сформирован. Выбрано ${players.length} из 15 игроков`);
      setShowExitDialog(false);
      return;
    }
    const mainSquad = players.slice(0, 11);
    const bench = players.slice(11, 15);
    saveTeamTransfers(mainSquad, bench, captain, viceCaptain);
    initialStateRef.current = JSON.stringify(players.map((p) => p.id).sort());
    setHasChanges(false);
    toast.success("Изменения сохранены");
    setShowExitDialog(false);
    navigate(pendingNavigation || "/league");
    setPendingNavigation(null);
  };

  const handleExitWithoutSaving = () => {
    setShowExitDialog(false);
    navigate(pendingNavigation || "/league");
    setPendingNavigation(null);
  };

  const handleContinueEditing = () => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  };

  // Calculate budget info
  const totalPrice = Math.round(players.reduce((sum, p) => sum + (p.price || 0), 0) * 10) / 10;
  const budget = Math.round((100 - totalPrice) * 10) / 10;
  const MAX_PLAYERS_PER_CLUB = 3;
  const MAX_SQUAD_SIZE = 15;

  // Check if transfer boost is active
  const hasTransfersBoost = specialChips.some((c) => c.id === "transfers" && c.status === "pending");
  const hasGoldenTourBoost = specialChips.some((c) => c.id === "golden" && c.status === "pending");
  const hasAnyTransferBoost = hasTransfersBoost || hasGoldenTourBoost;

  // Calculate pending transfer costs
  const pendingTransferCount = getTransferRecords().length;
  const transferCosts = calculateTransferCosts(pendingTransferCount, hasTransfersBoost, hasGoldenTourBoost);

  // Calculate free transfers remaining
  const transferState = getTransferState();
  const alreadyUsed = transferState.transfersUsedThisTour;
  const totalUsedIncludingPending = alreadyUsed + pendingTransferCount;
  const freeTransfersRemaining = hasAnyTransferBoost
    ? "∞"
    : Math.max(0, TRANSFERS_CONFIG.FREE_PER_TOUR - totalUsedIncludingPending);

  const getPlayersCountByClub = (clubName: string) => {
    return players.filter((p) => p.team === clubName).length;
  };

  const handleBuyPlayer = (
    player: PlayerData,
    targetPosition?: string,
    _isOnBench?: boolean,
    targetSlotIndex?: number,
  ) => {
    if (players.length >= MAX_SQUAD_SIZE) {
      toast.error("Команда уже полная (15 игроков)");
      return;
    }

    if (player.price > budget + 0.001) {
      toast.error("Недостаточно бюджета");
      return;
    }

    if (getPlayersCountByClub(player.team) >= MAX_PLAYERS_PER_CLUB) {
      toast.error(`Нельзя добавить больше ${MAX_PLAYERS_PER_CLUB} игроков из одного клуба`);
      return;
    }

    // If specific slot is provided
    if (targetPosition !== undefined && targetSlotIndex !== undefined) {
      const newPlayer: PlayerDataExt = {
        ...player,
        slotIndex: targetSlotIndex,
      };
      setPlayers((prev) => [...prev, newPlayer]);
      setPendingPositionFilter(null);
      setPendingSlotIndex(null);
      toast.success(`${player.name} добавлен в команду`);
      return;
    }

    // Find empty slot for this position
    const maxSlots = TRANSFERS_FORMATION_SLOTS[player.position] || 0;
    const occupiedSlots = players.filter((p) => p.position === player.position).map((p) => p.slotIndex);

    for (let i = 0; i < maxSlots; i++) {
      if (!occupiedSlots.includes(i)) {
        const newPlayer: PlayerDataExt = {
          ...player,
          slotIndex: i,
        };
        setPlayers((prev) => [...prev, newPlayer]);
        setPendingPositionFilter(null);
        setPendingSlotIndex(null);
        toast.success(`${player.name} добавлен в команду`);
        return;
      }
    }

    toast.error(`Нет свободных позиций для ${player.position}`);
  };

  // Group players by position for list view
  const playersByPosition = {
    ВР: players.filter((p) => p.position === "ВР"),
    ЗЩ: players.filter((p) => p.position === "ЗЩ"),
    ПЗ: players.filter((p) => p.position === "ПЗ"),
    НП: players.filter((p) => p.position === "НП"),
  };

  const positionLabels: Record<string, string> = {
    ВР: "Вратари",
    ЗЩ: "Защита",
    ПЗ: "Полузащита",
    НП: "Нападение",
  };

  const handleSellPlayer = (playerId: number) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setSelectedPlayerForCard(null);
  };

  const handleEmptySlotClick = (position: string, slotIndex: number) => {
    setPendingPositionFilter(position);
    setPendingSlotIndex(slotIndex);
    const filterName = positionToFilter[position] || "Все";
    setActiveFilter(filterName);
    setCurrentPage(1);
    setTimeout(() => {
      scrollToPlayerList("smooth");
    }, 100);
  };

  const handleAddPlayerButtonClick = () => {
    setPendingPositionFilter(null);
    setPendingSlotIndex(null);
    setActiveFilter("Все");
    setCurrentPage(1);
    setTimeout(() => {
      scrollToPlayerList("smooth");
    }, 100);
  };

  // Filter players for available list
  const currentTeamPlayerIds = players.map((p) => p.id);

  const filteredPlayers = allPlayers.filter((player) => {
    // Exclude already selected players
    if (currentTeamPlayerIds.includes(player.id)) return false;

    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const matchesTeam = selectedTeam === "Все команды" || player.team === selectedTeam;
    if (!matchesTeam) return false;

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

  // Apply sorting
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const effectiveSortField = sortField || "price";
    const effectiveSortDirection = sortDirection || "desc";

    if (effectiveSortField === "name") {
      const comparison = a.name.localeCompare(b.name, "ru");
      return effectiveSortDirection === "asc" ? comparison : -comparison;
    }
    if (effectiveSortField === "points") {
      return effectiveSortDirection === "desc" ? b.points - a.points : a.points - b.points;
    }
    if (effectiveSortField === "price") {
      return effectiveSortDirection === "desc" ? b.price - a.price : a.price - b.price;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = sortedPlayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveFilter("Все");
    setSelectedTeam("Все команды");
    setPriceFrom(3);
    setPriceTo(14);
    setCurrentPage(1);
    setSortField("price");
    setSortDirection("desc");
    setPendingPositionFilter(null);
    setPendingSlotIndex(null);
  };

  const hasActiveFilters =
    searchQuery !== "" || activeFilter !== "Все" || selectedTeam !== "Все команды" || priceFrom !== 3 || priceTo !== 14;

  const handlePriceFromIncrease = () => {
    setPriceFrom((prev) => Math.min(prev + 1, priceTo));
    setCurrentPage(1);
  };
  const handlePriceFromDecrease = () => {
    setPriceFrom((prev) => Math.max(prev - 1, 3));
    setCurrentPage(1);
  };
  const handlePriceToIncrease = () => {
    setPriceTo((prev) => Math.min(prev + 1, 14));
    setCurrentPage(1);
  };
  const handlePriceToDecrease = () => {
    setPriceTo((prev) => Math.max(prev - 1, priceFrom));
    setCurrentPage(1);
  };

  const handleSort = (field: "name" | "points" | "price") => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    } else {
      if (field === "name") {
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else {
          setSortField(null);
          setSortDirection(null);
        }
      } else {
        if (sortDirection === "desc") {
          setSortDirection("asc");
        } else {
          setSortField(null);
          setSortDirection(null);
        }
      }
    }
    setCurrentPage(1);
  };

  const renderListSection = (position: string, positionPlayers: PlayerDataExt[]) => {
    const slotCount = TRANSFERS_FORMATION_SLOTS[position] || 0;

    const slots: (PlayerDataExt | { isEmpty: true; slotIndex: number })[] = [];
    for (let i = 0; i < slotCount; i++) {
      const player = positionPlayers.find((p) => p.slotIndex === i);
      if (player) {
        slots.push(player);
      } else {
        slots.push({ isEmpty: true, slotIndex: i });
      }
    }

    return (
      <div className="mb-6" key={position}>
        <h3 className="text-primary font-medium mb-2">{positionLabels[position]}</h3>

        <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
          <span className="flex-1">Игрок</span>
          <span className="w-12 text-center">Очки</span>
          <span className="w-10 text-center">Цена</span>
          <span className="w-10"></span>
        </div>

        <div className="space-y-2">
          {slots.map((slot, idx) => {
            if ("isEmpty" in slot) {
              const removedPlayer = removedPlayersInfo.find(
                (rp) => rp.position === position && rp.slotIndex === slot.slotIndex,
              );

              return (
                <div
                  key={`empty-${position}-${slot.slotIndex}`}
                  className="bg-card rounded-xl px-4 py-2 flex items-center cursor-pointer hover:bg-card/70 transition-colors"
                  onClick={() => handleEmptySlotClick(position, slot.slotIndex)}
                >
                  <div className="flex-1 cursor-pointer hover:opacity-80 min-w-0">
                    {removedPlayer ? (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 font-medium truncate">{removedPlayer.name}</span>
                        <span className="text-muted-foreground text-xs">{removedPlayer.team}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">{positionLabels[position]}</span>
                    )}
                  </div>

                  <span className="w-12 flex-shrink-0"></span>
                  <span className="w-10 flex-shrink-0"></span>

                  <button className="w-8 h-8 ml-2 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              );
            }

            const player = slot;
            const clubLogoSrc = clubIcons[player.team];
            const isNewPlayer = newPlayerIds.has(player.id);
            return (
              <div
                key={player.id}
                className={`rounded-xl px-4 py-2 flex items-center ${
                  isNewPlayer ? "bg-primary/25 border border-primary" : "bg-card"
                }`}
              >
                <div
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                  onClick={() => setSelectedPlayerForCard(player.id)}
                >
                  {clubLogoSrc && (
                    <img src={clubLogoSrc} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                  )}
                  <span className="text-foreground font-medium text-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs text-regular">{player.position}</span>
                </div>

                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{player.points}</span>
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price}</span>

                <button
                  onClick={() => handleSellPlayer(player.id)}
                  className="w-8 h-8 ml-2 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div ref={headerRef}>
        <SportHeader
          hasUnsavedChanges={hasChanges}
          onSaveChanges={handleSaveAndExit}
          onDiscardChanges={handleExitWithoutSaving}
        />
      </div>

      {/* Team Header */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-foreground text-3xl font-display">{teamName}</h1>
        </div>

        <div className="flex items-center justify-between text-sm text-regular">
          <span className="text-muted-foreground">
            Дедлайн:{" "}
            <span className="text-foreground font-medium">{deadlineLoading ? "..." : formattedDeadline || "—"}</span>
          </span>
          <span className="text-foreground">
            {timeLeft.days} дня {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
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

      {/* Special Chips */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {specialChips.map((chip) => {
            const isBlocked = otherPageBoostActive && chip.status === "available";
            return (
              <div
                key={chip.id}
                onClick={() => openBoostDrawer(chip)}
                className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl cursor-pointer transition-all ${
                  isBlocked
                    ? "bg-card/30 opacity-50"
                    : chip.status === "pending"
                      ? "bg-card border-2 border-primary"
                      : chip.status === "used"
                        ? "bg-card/50 border border-border"
                        : "bg-card border border-border hover:bg-card/80"
                }`}
              >
                <img
                  src={chip.icon}
                  alt={chip.label}
                  className={`w-8 h-8 object-contain mb-1 transition-all ${
                    isBlocked || chip.status === "used" ? "grayscale opacity-50" : ""
                  }`}
                />
                <span
                  className={`text-[10px] font-medium text-center leading-tight ${
                    isBlocked ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {chip.label}
                </span>
                <span
                  className={`text-[8px] ${
                    isBlocked
                      ? "text-muted-foreground"
                      : chip.status === "pending"
                        ? "text-primary"
                        : chip.status === "used"
                          ? "text-muted-foreground"
                          : "text-primary"
                  }`}
                >
                  {isBlocked
                    ? "Заблокировано"
                    : chip.status === "pending"
                      ? "Используется"
                      : chip.status === "used"
                        ? `${chip.usedInTour} тур`
                        : chip.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex bg-secondary rounded-lg p-1">
          <Button
            onClick={() => setActiveTab("formation")}
            className={`flex-1 rounded-md ${
              activeTab === "formation"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Расстановка
          </Button>
          <Button
            onClick={() => setActiveTab("list")}
            className={`flex-1 rounded-md ${
              activeTab === "list"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Список
          </Button>
        </div>
      </div>

      {/* Main content */}
      {activeTab === "formation" ? (
        <div className="mt-4 -mb-[18%]">
          <FormationFieldTransfers
            players={players}
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onRemovePlayer={handleSellPlayer}
            onEmptySlotClick={handleEmptySlotClick}
            captain={captain}
            viceCaptain={viceCaptain}
            removedPlayers={removedPlayersInfo}
            newPlayerIds={newPlayerIds}
          />
        </div>
      ) : (
        <>
          <div className="px-4 mt-6">
            <h2 className="text-foreground text-xl font-bold mb-4">Состав команды</h2>
          </div>
          <div className="px-4">
            {Object.entries(playersByPosition).map(([position, positionPlayers]) =>
              renderListSection(position, positionPlayers),
            )}
          </div>
        </>
      )}

      {/* Divider between selected players and available players */}
      <div className="mx-4 mt-6 mb-2 border-t border-border" />
      <div className="px-4 mb-4">
        <h3 className="text-foreground text-xl font-semibold">Доступные игроки</h3>
      </div>

      {/* Search */}
      <div ref={playerListRef} className="px-4 relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
              window.setTimeout(() => {
                scrollSearchIntoView("smooth");
              }, 350);
            }}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            className="pl-10 pr-10 h-10 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Очистить поиск"
              onClick={() => {
                handleSearchChange("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible filters - animated hide when search is focused */}
      <div
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isSearchFocused ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
        }`}
      >
        {/* Teams Filter */}
        <div className="px-4 mt-2 relative z-20">
          <Select value={selectedTeam} onValueChange={handleTeamChange}>
            <SelectTrigger className="w-full h-10 bg-card border-border rounded-xl text-foreground cursor-pointer">
              <SelectValue placeholder="Все команды" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              {teams.map((team) => (
                <SelectItem key={team} value={team} className="text-foreground hover:bg-secondary cursor-pointer">
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
        </div>

        {/* Position Filters */}
        <div className="px-4 mt-2 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <Button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              size="sm"
              className={`flex-shrink-0 rounded-full h-8 px-4 ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                  : "bg-card text-muted-foreground hover:bg-card/80 border border-border"
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>

        {/* Price Range */}
        <div className="px-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Цена:</span>
            <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
              <button
                onClick={handlePriceFromDecrease}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Minus className="w-3 h-3 text-primary-foreground" />
              </button>
              <span className="text-foreground text-sm w-9 text-center">{priceFrom.toFixed(1)}</span>
              <button
                onClick={handlePriceFromIncrease}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3 h-3 text-primary-foreground" />
              </button>
            </div>
            <span className="text-muted-foreground text-sm">—</span>
            <div className="flex items-center gap-1 bg-card rounded-xl px-1.5 py-1 border border-border">
              <button
                onClick={handlePriceToDecrease}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Minus className="w-3 h-3 text-primary-foreground" />
              </button>
              <span className="text-foreground text-sm w-9 text-center">{priceTo.toFixed(1)}</span>
              <button
                onClick={handlePriceToIncrease}
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
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

      {/* Players List Header */}
      <div className="px-4 mt-6 flex items-center text-xs text-muted-foreground">
        <button
          onClick={() => handleSort("name")}
          className={`flex-1 flex items-center gap-1 transition-colors ${sortField === "name" ? "text-primary" : "hover:text-foreground"}`}
        >
          <span>Игрок</span>
          {sortField === "name" ? (
            sortDirection === "asc" ? (
              <ChevronDown className="w-3 h-3 text-primary" />
            ) : (
              <ChevronUp className="w-3 h-3 text-primary" />
            )
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          )}
        </button>
        <div className="w-14 flex items-center justify-center">
          <button
            onClick={() => handleSort("points")}
            className={`flex items-center gap-1 transition-colors ${sortField === "points" ? "text-primary" : "hover:text-foreground"}`}
          >
            <span>Очки</span>
            {sortField === "points" ? (
              sortDirection === "desc" ? (
                <ChevronDown className="w-3 h-3 text-primary" />
              ) : (
                <ChevronUp className="w-3 h-3 text-primary" />
              )
            ) : (
              <ChevronsUpDown className="w-3 h-3 opacity-50" />
            )}
          </button>
        </div>
        <div className="w-14 flex items-center justify-center mr-8">
          <button
            onClick={() => handleSort("price")}
            className={`flex items-center gap-1 transition-colors ${sortField === "price" ? "text-primary" : "hover:text-foreground"}`}
          >
            <span>Цена</span>
            {sortField === "price" ? (
              sortDirection === "desc" ? (
                <ChevronDown className="w-3 h-3 text-primary" />
              ) : (
                <ChevronUp className="w-3 h-3 text-primary" />
              )
            ) : (
              <ChevronsUpDown className="w-3 h-3 opacity-50" />
            )}
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 mt-3 space-y-2 pb-6">
        {paginatedPlayers.map((player) => {
          const canBuy = player.price <= budget + 0.001 && getPlayersCountByClub(player.team) < MAX_PLAYERS_PER_CLUB;
          return (
            <div key={player.id} className="bg-card rounded-xl px-4 py-2 flex items-center">
              {/* Club icon */}
              <div className="w-6 flex-shrink-0 flex justify-center mr-2">
                <img src={clubIcons[player.team] || clubLogo} alt={player.team} className="w-5 h-5 object-contain" />
              </div>

              {/* Player name + position */}
              <div
                className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                onClick={() => setBuyPlayerForCard(player)}
              >
                <span className="text-foreground font-medium truncate">{player.name}</span>
                <span className="text-muted-foreground text-xs flex-shrink-0">{player.position}</span>
              </div>

              {/* Points */}
              <div className="w-14 flex-shrink-0 flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">{player.points}</span>
              </div>

              {/* Price */}
              <div className="w-14 flex-shrink-0 flex items-center justify-center">
                <span className="text-foreground text-sm">{player.price.toFixed(1)}</span>
              </div>

              {/* Add button */}
              <button
                onClick={() => {
                  if (pendingPositionFilter && pendingSlotIndex !== null) {
                    handleBuyPlayer(player, pendingPositionFilter, false, pendingSlotIndex);
                  } else {
                    handleBuyPlayer(player);
                  }
                }}
                disabled={!canBuy}
                className={`w-6 h-6 ml-2 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  canBuy ? "bg-primary hover:bg-primary/90" : "bg-muted cursor-not-allowed"
                }`}
              >
                <Plus className={`w-3 h-3 ${canBuy ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 mt-6 pb-20 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>

          {(() => {
            const pages: (number | string)[] = [];

            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);

              if (currentPage <= 3) {
                pages.push(2, 3, 4);
                pages.push("...", totalPages);
              } else if (currentPage >= totalPages - 2) {
                pages.push("...");
                pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push("...");
                pages.push(currentPage - 1, currentPage, currentPage + 1);
                pages.push("...", totalPages);
              }
            }

            return pages.map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="text-muted-foreground text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`text-sm font-medium transition-colors ${
                    page === currentPage ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {page}
                </button>
              ),
            );
          })()}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 hover:text-primary transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-50">
        {/* Reset squad button */}
        {hasChanges && (
          <Button
            onClick={handleResetSquad}
            variant="outline"
            className="w-full rounded-xl h-10 border-border text-muted-foreground hover:text-foreground mb-3"
          >
            Вернуть исходный состав
          </Button>
        )}

        {/* Stats Row */}
        <div className="flex justify-between mb-3">
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Бесплатные трансферы</span>
            <span className={`text-xl font-bold ${hasAnyTransferBoost ? "text-primary" : "text-foreground"}`}>
              {freeTransfersRemaining}
            </span>
          </div>
          <div
            className="text-center cursor-pointer"
            onClick={() => {
              if (transferCosts.pointsPenalty > 0) {
                toast.info(
                  `У тебя ${TRANSFERS_CONFIG.FREE_PER_TOUR} бесплатных трансфера за тур. Каждый дополнительный стоит -${TRANSFERS_CONFIG.PENALTY_PER_EXTRA} очка. Платных трансферов: ${transferCosts.paidTransfers}`,
                );
              } else {
                toast.info(
                  `У тебя ${TRANSFERS_CONFIG.FREE_PER_TOUR} бесплатных трансфера за тур. Каждый дополнительный стоит -${TRANSFERS_CONFIG.PENALTY_PER_EXTRA} очка.`,
                );
              }
            }}
          >
            <span className="text-muted-foreground text-xs block">Штраф</span>
            <span
              className={`text-xl font-bold ${transferCosts.pointsPenalty > 0 ? "text-red-500" : "text-foreground"}`}
            >
              {transferCosts.pointsPenalty > 0 ? `-${transferCosts.pointsPenalty}` : "0"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Бюджет</span>
            <span className="text-foreground text-xl font-bold">{budget.toFixed(1)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex gap-3">
          <Button
            onClick={handleAddPlayerButtonClick}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-lg h-12"
          >
            + Добавить игрока
          </Button>
          <Button
            onClick={() => {
              if (players.length < 15) {
                toast.error(`Состав не сформирован. Выбрано ${players.length} из 15 игроков`);
                return;
              }
              setShowConfirmDrawer(true);
            }}
            className={`flex-1 rounded-lg h-12 font-semibold transition-all ${
              players.length < 15
                ? "bg-primary/30 text-muted-foreground cursor-not-allowed"
                : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
            }`}
          >
            Сохранить
          </Button>
        </div>
      </div>

      {/* Buy Player Card Drawer */}
      {buyPlayerForCard && (
        <PlayerCard
          player={buyPlayerForCard}
          isOpen={!!buyPlayerForCard}
          onClose={() => setBuyPlayerForCard(null)}
          variant="buy"
          hidePointsBreakdown
          canBuy={
            buyPlayerForCard.price <= budget + 0.001 &&
            getPlayersCountByClub(buyPlayerForCard.team) < MAX_PLAYERS_PER_CLUB
          }
          onBuy={(playerId) => {
            if (buyPlayerForCard && buyPlayerForCard.id === playerId) {
              if (pendingPositionFilter && pendingSlotIndex !== null) {
                handleBuyPlayer(buyPlayerForCard, pendingPositionFilter, false, pendingSlotIndex);
              } else {
                handleBuyPlayer(buyPlayerForCard);
              }
            }
            setBuyPlayerForCard(null);
          }}
        />
      )}

      {/* Player Card Drawer */}
      {selectedPlayerForCard !== null && (
        <PlayerCard
          player={players.find((p) => p.id === selectedPlayerForCard) || null}
          isOpen={selectedPlayerForCard !== null}
          onClose={() => setSelectedPlayerForCard(null)}
          isSelected={true}
          onToggleSelect={() => {}}
          isCaptain={captain === selectedPlayerForCard}
          isViceCaptain={viceCaptain === selectedPlayerForCard}
          onSetCaptain={setCaptain}
          onSetViceCaptain={setViceCaptain}
          variant="transfers"
          onSell={handleSellPlayer}
          hidePointsBreakdown
        />
      )}

      {/* Boost Drawer */}
      <BoostDrawer
        chip={selectedBoostChip ? specialChips.find((c) => c.id === selectedBoostChip.id) || null : null}
        isOpen={isBoostDrawerOpen}
        onClose={() => setIsBoostDrawerOpen(false)}
        onApply={applyBoost}
        onCancel={cancelBoost}
        currentTour={currentTour}
      />

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Несохранённые изменения</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              У тебя есть несохранённые изменения в составе команды. Хочешь сохранить их перед выходом?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleSaveAndExit}
              disabled={players.length < 15}
              className={`${
                players.length < 15
                  ? "bg-[#4A5D23] text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              Сохранить {players.length < 15 && `(${players.length}/15)`}
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleExitWithoutSaving}
              className="bg-card border-border text-foreground hover:bg-card/80"
            >
              Не сохранять
            </AlertDialogCancel>
            <AlertDialogCancel
              onClick={handleContinueEditing}
              className="bg-[#2A2A3E] border-0 text-foreground hover:bg-[#3A3A4E]"
            >
              Продолжить редактирование
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Transfers Drawer */}
      <ConfirmTransfersDrawer
        isOpen={showConfirmDrawer}
        onClose={() => setShowConfirmDrawer(false)}
        onConfirm={() => {
          const mainSquad = players.slice(0, 11);
          const bench = players.slice(11, 15);

          const transferCount = getTransferRecords().length;
          const result = recordTransfers(transferCount, hasTransfersBoost, hasGoldenTourBoost);

          saveTeamTransfers(mainSquad, bench, captain, viceCaptain);
          initialStateRef.current = JSON.stringify(players.map((p) => p.id).sort());
          initialPlayersRef.current = [...players];
          setHasChanges(false);
          setShowConfirmDrawer(false);

          if (result.pointsPenalty > 0) {
            toast.success(`Изменения сохранены. Штраф: -${result.pointsPenalty} очков`);
          } else {
            toast.success("Изменения сохранены");
          }
          navigate("/league");
        }}
        transfers={getTransferRecords()}
        freeTransfersUsed={transferCosts.freeTransfersUsed}
        additionalTransfersUsed={transferCosts.paidTransfers}
        pointsPenalty={transferCosts.pointsPenalty}
        remainingBudget={Math.round(budget)}
        hasTransferBoost={hasAnyTransferBoost}
        boosts={allBoostsTemplate.map((boost) => {
          const currentChip = specialChips.find((c) => c.id === boost.id);
          if (currentChip) {
            return currentChip;
          }
          return boost;
        })}
      />
    </div>
  );
};

export default Transfers;
