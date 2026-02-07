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
import { PointsColumnHeader } from "@/components/PointsColumnHeader";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { getSavedTeam, PlayerData, saveTeamTransfers } from "@/lib/teamData";
import { useDeadline } from "@/hooks/useDeadline";
import { useTeams } from "@/hooks/useTeams";
import { usePlayers, TransformedPlayer } from "@/hooks/usePlayers";
import { useSquadData } from "@/hooks/useSquadData";
import { clubLogos } from "@/lib/clubLogos";
import { squadsApi, boostsApi, BoostType, ApplyBoostRequest } from "@/lib/api";
import { getNextOpponentData } from "@/lib/scheduleUtils";
import FormationField from "@/components/FormationField";
import PlayerCard from "@/components/PlayerCard";
import BoostDrawer from "@/components/BoostDrawer";
import ConfirmTransfersDrawer from "@/components/ConfirmTransfersDrawer";
import { TRANSFER_BOOSTS, saveGoldenTourBackup, getGoldenTourBackup, clearGoldenTourBackup } from "@/lib/boostState";
import { calculateTransferCosts, TRANSFERS_CONFIG } from "@/lib/transferState";
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
import { BoostChip, BoostStatus } from "@/components/BoostDrawer";
import { BoostSection, TEAM_MANAGEMENT_BOOSTS, BoostId, BOOST_ID_TO_TYPE } from "@/constants/boosts";
import { mapAvailableBoostsToView, getActiveNextTourBoostId, buildBoostChipStateForPage } from "@/lib/boostViewModel";
import { PositionCode } from "@/constants/positions";
import clubLogo from "@/assets/club-logo.png";
import boostTransfers from "@/assets/boost-transfers.png";
import { pluralizeDays } from "@/lib/pluralize";
import boostGolden from "@/assets/boost-golden.png";
import boostBench from "@/assets/boost-bench.png";
import boostCaptain3x from "@/assets/boost-captain3x.png";
import boostDouble from "@/assets/boost-double.png";

// Club icons mapping - use clubLogos as primary, fall back to defaults
const clubIcons: Record<string, string> = {
  ...clubLogos,
  Шахтер: clubLogo,
};

// Special chips for transfers page UI - only 2 chips
const initialChips: BoostChip[] = [
  { id: "transfers", icon: boostTransfers, label: "Трансферы +", sublabel: "Подробнее", status: "available" },
  { id: "golden", icon: boostGolden, label: "Золотой тур", sublabel: "Подробнее", status: "available" },
];

// All 5 boosts for confirmation drawer
const allBoostsTemplate: BoostChip[] = [
  { id: "bench", icon: boostBench, label: "Скамейка +", sublabel: "Подробнее", status: "available" },
  { id: "captain3x", icon: boostCaptain3x, label: "3x Капитан", sublabel: "Подробнее", status: "available" },
  { id: "transfers", icon: boostTransfers, label: "Трансферы +", sublabel: "Подробнее", status: "available" },
  { id: "golden", icon: boostGolden, label: "Золотой тур", sublabel: "Подробнее", status: "available" },
  { id: "double", icon: boostDouble, label: "Двойная сила", sublabel: "Подробнее", status: "available" },
];

interface PlayerDataExt extends PlayerData {
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  team_logo?: string;
  isOnBench?: boolean;
  hasRedCard?: boolean;
  isInjured?: boolean;
  hasLeftLeague?: boolean;
  name_rus?: string;
  team_rus?: string;
}

// Fixed formation for transfers: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 players
const TRANSFERS_FORMATION_SLOTS: Record<string, number> = {
  ВР: 2,
  ЗЩ: 5,
  ПЗ: 5,
  НП: 3,
};

const ITEMS_PER_PAGE = 8;

// Deterministically distribute players to main squad and bench based on slotIndex and formation rules
// This is the single source of truth - never rely on isOnBench flag for distribution
function distributePlayersToMainAndBench(allPlayers: PlayerDataExt[]): {
  mainSquad: PlayerDataExt[];
  bench: PlayerDataExt[];
} {
  // Group players by position, sorted by slotIndex
  const byPosition: Record<string, PlayerDataExt[]> = {
    ВР: [],
    ЗЩ: [],
    ПЗ: [],
    НП: [],
  };

  allPlayers.forEach((player) => {
    if (byPosition[player.position]) {
      byPosition[player.position].push(player);
    }
  });

  // Sort each position group by slotIndex
  Object.keys(byPosition).forEach((pos) => {
    byPosition[pos].sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));
  });

  // Fixed distribution rules:
  // GK (ВР): slotIndex 0 → main, slotIndex 1 → bench
  // DEF (ЗЩ): slotIndex 0-4, need to determine how many in main based on formation
  // MID (ПЗ): slotIndex 0-4, need to determine how many in main based on formation
  // FWD (НП): slotIndex 0-2, all go to main squad

  const mainSquad: PlayerDataExt[] = [];
  const bench: PlayerDataExt[] = [];

  // GK: first one to main, second to bench (always)
  if (byPosition["ВР"].length >= 1) {
    mainSquad.push(byPosition["ВР"][0]);
  }
  if (byPosition["ВР"].length >= 2) {
    bench.push(byPosition["ВР"][1]);
  }

  // FWD: all go to main (max 3)
  byPosition["НП"].forEach((p) => mainSquad.push(p));

  // Now we need 10 more for main squad (1 GK + 10 outfield = 11 total)
  // We have FWD already added (up to 3), so need (10 - FWD_count) more
  const fwdInMain = byPosition["НП"].length;
  const remainingSlotsForMain = 10 - fwdInMain;

  // We have DEF + MID to fill remaining slots
  const totalDefMid = byPosition["ЗЩ"].length + byPosition["ПЗ"].length;

  // Determine split: prioritize filling from what's available
  // Try to use all DEF first up to formation limit, then fill with MID
  const defCount = byPosition["ЗЩ"].length;
  const midCount = byPosition["ПЗ"].length;

  // We need to distribute remainingSlotsForMain between DEF and MID
  // Valid formations have 3-5 DEF and 2-5 MID in main squad
  let defInMain = Math.min(defCount, 5); // Max 5 DEF
  let midInMain = Math.min(midCount, 5); // Max 5 MID

  // Adjust if total exceeds remaining slots
  if (defInMain + midInMain > remainingSlotsForMain) {
    // Need to reduce - prefer keeping balance
    const excess = defInMain + midInMain - remainingSlotsForMain;

    // Reduce from the position with more players, but respect minimums (3 DEF, 2 MID minimum)
    if (defInMain > 3 && (midInMain <= 2 || defCount >= midCount)) {
      defInMain = Math.max(3, defInMain - excess);
    } else if (midInMain > 2) {
      midInMain = Math.max(2, midInMain - excess);
    }

    // Re-check and adjust if still over
    if (defInMain + midInMain > remainingSlotsForMain) {
      const remaining = remainingSlotsForMain;
      // Distribute remaining slots proportionally but respect minimums
      if (remaining >= 5) {
        defInMain = Math.min(defCount, Math.max(3, remaining - 2));
        midInMain = remaining - defInMain;
      } else {
        // Edge case - just fill what we can
        defInMain = Math.min(defCount, remaining);
        midInMain = remaining - defInMain;
      }
    }
  }

  // Add DEF to main squad (first defInMain by slotIndex)
  for (let i = 0; i < defInMain && i < byPosition["ЗЩ"].length; i++) {
    mainSquad.push(byPosition["ЗЩ"][i]);
  }
  // Remaining DEF to bench
  for (let i = defInMain; i < byPosition["ЗЩ"].length; i++) {
    bench.push(byPosition["ЗЩ"][i]);
  }

  // Add MID to main squad (first midInMain by slotIndex)
  for (let i = 0; i < midInMain && i < byPosition["ПЗ"].length; i++) {
    mainSquad.push(byPosition["ПЗ"][i]);
  }
  // Remaining MID to bench
  for (let i = midInMain; i < byPosition["ПЗ"].length; i++) {
    bench.push(byPosition["ПЗ"][i]);
  }

  return { mainSquad, bench };
}

const Transfers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [buyPlayerForCard, setBuyPlayerForCard] = useState<PlayerData | null>(null);
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(() => initialChips);
  const [selectedBoostChip, setSelectedBoostChip] = useState<BoostChip | null>(null);
  const [isBoostDrawerOpen, setIsBoostDrawerOpen] = useState(false);
  const [otherPageBoostActive, setOtherPageBoostActive] = useState(false);
  const [isRemovingBoost, setIsRemovingBoost] = useState(false);

  // Store transfers snapshot for confirm drawer to prevent flash when state updates
  const [confirmedTransfers, setConfirmedTransfers] = useState<
    Array<{
      type: "swap" | "buy" | "sell";
      playerOut?: {
        id: number;
        name: string;
        points: number;
        team?: string;
        position?: string;
        price?: number;
        team_logo?: string;
      };
      playerIn?: {
        id: number;
        name: string;
        points: number;
        team?: string;
        position?: string;
        price?: number;
        team_logo?: string;
      };
    }>
  >([]);

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

  // Load teams and players from API with caching
  const leagueId = localStorage.getItem("fantasySelectedLeagueId") || "116";
  const leagueIdNum = parseInt(leagueId, 10) || 116;
  const { teams: apiTeams, isLoading: isLoadingTeams } = useTeams(leagueId);
  const { players: apiPlayers, isLoading: isLoadingPlayers } = usePlayers(leagueId);
  const {
    squad,
    squadTourData,
    mainPlayers: apiMainPlayers,
    benchPlayers: apiBenchPlayers,
    previousTour,
    currentTour,
    nextTour,
    boostTourId,
    isLoading: isLoadingSquad,
    refetch: refetchSquad,
  } = useSquadData(leagueIdNum);

  // Check if season hasn't started yet (no previous tour and no current tour)
  const isSeasonNotStarted = previousTour === null && currentTour === null;

  const teamName = squad?.name || getSavedTeam().teamName || "Lucky Team";

  // Fetch available boosts from API — всегда тянем свежие данные с бэка при заходе на страницу
  const {
    data: boostsResponse,
    isLoading: boostsLoading,
    refetch: refetchBoosts,
  } = useQuery({
    queryKey: ["availableBoosts", squad?.id, boostTourId],
    queryFn: () => (squad && boostTourId ? boostsApi.getAvailable(squad.id, boostTourId) : Promise.resolve(null)),
    enabled: !!squad?.id && !!boostTourId,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  // Гарантируем запрос к бэку при появлении squadId/boostTourId (при заходе на страницу или смене лиги/тура)
  useEffect(() => {
    if (squad?.id && boostTourId) {
      refetchBoosts();
    }
  }, [squad?.id, boostTourId, refetchBoosts]);

  // Map API boosts to availability and used tour number
  const availabilityMap = useMemo(
    () => mapAvailableBoostsToView(boostsResponse?.success ? boostsResponse.data?.boosts : undefined),
    [boostsResponse],
  );

  const usedForNextTour = boostsResponse?.success ? boostsResponse.data?.used_for_next_tour : false;

  // ID буста, уже активированного на следующий тур (если есть)
  const activeNextTourBoostId = useMemo(
    () => getActiveNextTourBoostId(availabilityMap, usedForNextTour, nextTour ?? null),
    [availabilityMap, usedForNextTour, nextTour],
  );

  const teams = ["Все команды", ...apiTeams.map((t) => t.name)];
  const filters = ["Все", "Вратари", "Защитники", "Полузащитники", "Нападающие"];
  const positionToFilter: Record<string, string> = {
    [PositionCode.GK]: "Вратари",
    [PositionCode.DEF]: "Защитники",
    [PositionCode.MID]: "Полузащитники",
    [PositionCode.FWD]: "Нападающие",
  };

  // Update specialChips when API data arrives
  useEffect(() => {
    if (!boostsLoading && boostsResponse?.success) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Boosts][Transfers] availableBoosts", {
          squadId: squad?.id,
          boostTourId,
          response: boostsResponse,
        });
      }

      setSpecialChips(
        buildBoostChipStateForPage({
          section: BoostSection.TRANSFERS,
          baseChips: initialChips,
          availabilityMap,
          usedForNextTour,
          activeNextTourBoostId,
          nextTourNumber: nextTour ?? null,
          pendingBoostId: null,
        }),
      );
    }
  }, [boostsLoading, boostsResponse, availabilityMap, usedForNextTour, nextTour, activeNextTourBoostId]);

  // Check if boost is active on the other page (раздел "Моя команда")
  useEffect(() => {
    if (activeNextTourBoostId && TEAM_MANAGEMENT_BOOSTS.includes(activeNextTourBoostId)) {
      setOtherPageBoostActive(true);
    } else {
      setOtherPageBoostActive(false);
    }
  }, [activeNextTourBoostId]);

  const openBoostDrawer = (chip: BoostChip) => {
    // Даже если буст заблокирован, открываем плашку с описанием и объяснением причины блокировки
    setSelectedBoostChip(chip);
    setIsBoostDrawerOpen(true);
  };

  const applyBoost = async (chipId: string) => {
    if (!squad || !boostTourId) {
      toast.error("Бусты можно использовать только для следующего тура");
      return;
    }

    // Нельзя активировать больше одного буста на тур (в любой из секций)
    const hasActiveBoostHere = specialChips.some((chip) => chip.status === "pending");
    if (hasActiveBoostHere || otherPageBoostActive) {
      toast.error("В одном туре можно использовать только 1 буст");
      return;
    }

    // Трансферные бусты нельзя отменять, поэтому сразу применяем на бэкенде
    if (chipId === "transfers" || chipId === "golden") {
      try {
        const boostType = BOOST_ID_TO_TYPE[chipId as BoostId];
        if (!boostType) {
          toast.error("Неизвестный тип буста");
          return;
        }
        const body: ApplyBoostRequest = {
          squad_id: squad.id,
          tour_id: boostTourId,
          type: boostType,
        };

        const result = await boostsApi.apply(body);
        if (!result.success) {
          toast.error(result.error || "Не удалось применить буст");
          return;
        }

        toast.success("Буст использован для следующего тура");

        // Локально помечаем буст как активный на этот тур (пока не придут данные с бэка)
        setSpecialChips((prev) =>
          prev.map((chip) =>
            chip.id === chipId ? { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" } : chip,
          ),
        );

        // Обновляем данные о доступности бустов с сервера
        queryClient.invalidateQueries({ queryKey: ["availableBoosts", squad.id, boostTourId] });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ошибка при применении буста");
      }

      return;
    }
  };

  const cancelBoost = (_chipId: string) => {
    toast.error("Бусты нельзя отменить после активации");
  };

  const removeBoost = async (_chipId: string) => {
    toast.error("Бусты нельзя отменить после активации");
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

  // Initialize players from API squad data
  useEffect(() => {
    if (isLoadingSquad || apiMainPlayers.length === 0) return;

    // Convert API players to local format with next opponent data
    const mainSquadConverted = apiMainPlayers.map((p) => {
      return {
        id: p.id,
        name: p.name,
        name_rus: p.name_rus,
        team: p.team_name,
        team_rus: p.team_name_rus,
        position: p.position,
        price: p.price,
        points: p.points,
        total_points: p.total_points,
        slotIndex: p.slotIndex,
        team_logo: p.team_logo,
        isCaptain: squadTourData?.captain_id === p.id,
        isViceCaptain: squadTourData?.vice_captain_id === p.id,
        // Используем уже обогащённые поля из useSquadData
        nextOpponent: p.nextOpponent || "",
        nextOpponentHome: p.nextOpponentHome ?? false,
        // Добавляем статусы из API
        hasRedCard: p.hasRedCard,
        isInjured: p.isInjured,
        hasLeftLeague: p.hasLeftLeague,
      };
    });

    const benchConverted = apiBenchPlayers.map((p) => {
      return {
        id: p.id,
        name: p.name,
        name_rus: p.name_rus,
        team: p.team_name,
        team_rus: p.team_name_rus,
        position: p.position,
        price: p.price,
        points: p.points,
        total_points: p.total_points,
        slotIndex: p.slotIndex,
        team_logo: p.team_logo,
        // Используем уже обогащённые поля из useSquadData
        nextOpponent: p.nextOpponent || "",
        nextOpponentHome: p.nextOpponentHome ?? false,
        // Добавляем статусы из API
        hasRedCard: p.hasRedCard,
        isInjured: p.isInjured,
        hasLeftLeague: p.hasLeftLeague,
      };
    });

    // Mark main squad players (first 11) and bench players (last 4)
    const allLoadedPlayers = [
      ...mainSquadConverted.map((p) => ({ ...p, isOnBench: false })),
      ...benchConverted.map((p) => ({ ...p, isOnBench: true })),
    ];

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
  }, [isLoadingSquad, apiMainPlayers, apiBenchPlayers, squadTourData?.captain_id, squadTourData?.vice_captain_id]);

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
      playerOut?: {
        id: number;
        name: string;
        points: number;
        team?: string;
        position?: string;
        price?: number;
        team_logo?: string;
      };
      playerIn?: {
        id: number;
        name: string;
        points: number;
        team?: string;
        position?: string;
        price?: number;
        team_logo?: string;
      };
    }> = [];

    const maxPairs = Math.max(playersOut.length, playersIn.length);
    for (let i = 0; i < maxPairs; i++) {
      const pOut = playersOut[i];
      const pIn = playersIn[i];

      transfers.push({
        type: pOut && pIn ? "swap" : pOut ? "sell" : "buy",
        playerOut: pOut
          ? {
              id: pOut.id,
              name: pOut.name,
              points: pOut.points,
              team: pOut.team,
              position: pOut.position,
              price: pOut.price,
              team_logo: pOut.team_logo,
            }
          : undefined,
        playerIn: pIn
          ? {
              id: pIn.id,
              name: pIn.name,
              points: pIn.points,
              team: pIn.team,
              position: pIn.position,
              price: pIn.price,
              team_logo: pIn.team_logo,
            }
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
    // Use deterministic distribution
    const { mainSquad, bench } = distributePlayersToMainAndBench(players);
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
  // If season hasn't started (no previous/current tour), treat as unlimited free transfers
  const hasAnyTransferBoost = hasTransfersBoost || hasGoldenTourBoost || isSeasonNotStarted;

  // Calculate pending transfer costs
  // NEW ARCHITECTURE: Use squadTourData.replacements from backend as source of truth
  // If season hasn't started, no penalty applies
  const pendingTransferCount = getTransferRecords().length;
  const transferCosts = isSeasonNotStarted
    ? { freeTransfersUsed: 0, paidTransfers: 0, pointsPenalty: 0 }
    : calculateTransferCosts(
        pendingTransferCount,
        hasTransfersBoost,
        hasGoldenTourBoost,
        squadTourData?.replacements ?? 2, // Backend data as source of truth
      );

  // Calculate free transfers remaining dynamically - subtract pending transfers
  // If season hasn't started, show infinity
  const freeTransfersRemaining = hasAnyTransferBoost
    ? "∞"
    : Math.max(0, (squadTourData?.replacements ?? 2) - pendingTransferCount);

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

    // Round to 1 decimal for comparison (prices are only to tenths)
    const roundedPrice = Math.round(player.price * 10) / 10;
    const roundedBudget = Math.round(budget * 10) / 10;
    if (roundedPrice > roundedBudget) {
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
    // Priority: fill main squad slots (first 11 players) before bench slots
    const maxSlots = TRANSFERS_FORMATION_SLOTS[player.position] || 0;
    const occupiedSlots = players.filter((p) => p.position === player.position).map((p) => p.slotIndex);

    // Simply find the first empty slotIndex for this position
    // Distribution to main/bench will be handled by distributePlayersToMainAndBench()
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
  const playersByPosition: Record<PositionCode, PlayerDataExt[]> = {
    [PositionCode.GK]: players.filter((p) => p.position === PositionCode.GK),
    [PositionCode.DEF]: players.filter((p) => p.position === PositionCode.DEF),
    [PositionCode.MID]: players.filter((p) => p.position === PositionCode.MID),
    [PositionCode.FWD]: players.filter((p) => p.position === PositionCode.FWD),
  };

  const positionLabels: Record<PositionCode, string> = {
    [PositionCode.GK]: "Вратари",
    [PositionCode.DEF]: "Защита",
    [PositionCode.MID]: "Полузащита",
    [PositionCode.FWD]: "Нападение",
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

  const filteredPlayers = apiPlayers.filter((player) => {
    // Exclude already selected players
    if (currentTeamPlayerIds.includes(player.id)) return false;

    const query = searchQuery.trim().toLowerCase();
    // Ищем по русскому имени (фамилии), с фоллбеком на английское
    const displayName = player.name_rus || player.name;
    const matchesSearch = query === "" || displayName.toLowerCase().includes(query);
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
      // Сортируем по русскому имени с фоллбеком на английское
      const aName = (a.name_rus || a.name).toLowerCase();
      const bName = (b.name_rus || b.name).toLowerCase();
      const comparison = aName.localeCompare(bName, "ru");
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

  const renderListSection = (position: PositionCode, positionPlayers: PlayerDataExt[]) => {
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
          <span className="w-12 text-center">
            <PointsColumnHeader type="season" />
          </span>
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
            const clubLogoSrc = player.team_logo || clubIcons[player.team] || clubLogo;
            const isNewPlayer = newPlayerIds.has(player.id);
            const isCaptainPlayer = captain === player.id;
            const isViceCaptainPlayer = viceCaptain === player.id;
            const playerExt = player as PlayerDataExt;

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
                  <img src={clubLogoSrc} alt={player.team_rus || player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                  <span className="text-foreground font-medium text-medium truncate">{player.name_rus || player.name}</span>
                  <span className="text-muted-foreground text-xs text-regular">{player.position}</span>

                  {/* Капитанские значки */}
                  {isCaptainPlayer && (
                    <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      К
                    </span>
                  )}
                  {isViceCaptainPlayer && (
                    <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      ВК
                    </span>
                  )}

                  {/* Значки статусов */}
                  {playerExt.hasRedCard && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      КК
                    </span>
                  )}
                  {playerExt.isInjured && !playerExt.hasRedCard && (
                    <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      Т
                    </span>
                  )}
                  {playerExt.hasLeftLeague && !playerExt.hasRedCard && !playerExt.isInjured && (
                    <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      У
                    </span>
                  )}
                </div>

                <span
                  className={`w-12 flex-shrink-0 text-sm text-center font-medium ${
                    (player.total_points ?? player.points ?? 0) > 0
                      ? "text-success"
                      : (player.total_points ?? player.points ?? 0) < 0
                        ? "text-destructive"
                        : "text-foreground"
                  }`}
                >
                  {(player.total_points ?? player.points ?? 0) > 0
                    ? `+${player.total_points ?? player.points ?? 0}`
                    : (player.total_points ?? player.points ?? 0)}
                </span>
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
      {/* Header - sticky wrapper to match /league */}
      <div ref={headerRef} className="sticky top-0 z-50">
        <SportHeader hasUnsavedChanges={hasChanges} onDiscardChanges={handleExitWithoutSaving} />
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
            {timeLeft.days} {pluralizeDays(timeLeft.days)} {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
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
                onClick={() => {
                  // Даже если буст заблокирован, всегда открываем плашку с описанием и причиной блокировки
                  openBoostDrawer(chip);
                }}
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
                          : "text-foreground/60"
                  }`}
                >
                  {isBlocked
                    ? "Заблокирован"
                    : chip.status === "pending"
                      ? "Используется"
                      : chip.status === "used"
                        ? chip.usedInTour
                          ? `${chip.usedInTour} тур`
                          : "Заблокирован"
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
        <>
          {/* Football Field - clip bottom like before, but reserve top space for goal/sponsor logos */}
          <div className="mt-10 sm:mt-14 md:mt-16 lg:mt-20 overflow-hidden pt-[6%]">
            <div className="mb-[-18%]">
              <FormationField
                mode="transfers"
                players={players}
                onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
                onRemovePlayer={handleSellPlayer}
                onEmptySlotClick={(position, _isOnBench, slotIndex) => handleEmptySlotClick(position, slotIndex ?? 0)}
                captain={captain}
                viceCaptain={viceCaptain}
                removedPlayers={removedPlayersInfo}
                newPlayerIds={newPlayerIds}
              />
            </div>
          </div>

          {/* Divider between selected players and available players */}
          <div className="mx-4 mt-6 mb-2 border-t border-border" />
          <div className="px-4 mb-4">
            <h3 className="text-foreground text-xl font-display">Доступные игроки</h3>
          </div>

          {/* Search */}
          <div ref={playerListRef} className="px-4">
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
                  <SelectItem value="Все команды" className="text-foreground hover:bg-secondary cursor-pointer">
                    <span>Все команды</span>
                  </SelectItem>
                  {isLoadingTeams ? (
                    <div className="px-4 py-2 text-muted-foreground">Загрузка...</div>
                  ) : apiTeams.length > 0 ? (
                    [...apiTeams]
                      .sort((a, b) => (a.name_rus || a.name).localeCompare(b.name_rus || b.name, 'ru'))
                      .map((team) => (
                        <SelectItem
                          key={team.id}
                          value={team.name}
                          className="text-foreground hover:bg-secondary cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <img src={team.logo} alt={team.name_rus || team.name} className="w-5 h-5 object-contain" />
                            <span>{team.name_rus || team.name}</span>
                          </div>
                        </SelectItem>
                      ))
                  ) : (
                    teams
                      .filter((t) => t !== "Все команды")
                      .map((team) => (
                        <SelectItem
                          key={team}
                          value={team}
                          className="text-foreground hover:bg-secondary cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {clubLogos[team] && (
                              <img src={clubLogos[team]} alt={team} className="w-5 h-5 object-contain" />
                            )}
                            <span>{team}</span>
                          </div>
                        </SelectItem>
                      ))
                  )}
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
                <PointsColumnHeader type="season" className={sortField === "points" ? "text-primary" : ""}>
                  <span>Очки</span>
                </PointsColumnHeader>
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
          <div className={`px-4 mt-3 space-y-2 ${totalPages <= 1 ? "pb-[100px]" : "pb-6"}`}>
            {paginatedPlayers.map((player) => {
              const canBuy =
                player.price <= budget + 0.001 && getPlayersCountByClub(player.team) < MAX_PLAYERS_PER_CLUB;
              const playerExt = player as TransformedPlayer;
              return (
                <div key={player.id} className="bg-card rounded-xl px-4 py-2 flex items-center">
                  {/* Club icon */}
                  <div className="w-6 flex-shrink-0 flex justify-center mr-2">
                    <img
                      src={playerExt.team_logo || clubIcons[player.team] || clubLogo}
                      alt={player.team}
                      className="w-5 h-5 object-contain"
                    />
                  </div>

                  {/* Player name + position + статусные значки */}
                  <div
                    className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                    onClick={() => setBuyPlayerForCard(player)}
                  >
                    <span className="text-foreground font-medium truncate">{playerExt.name_rus || player.name}</span>
                    <span className="text-muted-foreground text-xs flex-shrink-0">{player.position}</span>

                    {/* Значки статусов для доступных игроков */}
                    {playerExt.hasRedCard && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        КК
                      </span>
                    )}
                    {playerExt.isInjured && !playerExt.hasRedCard && (
                      <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        Т
                      </span>
                    )}
                    {playerExt.hasLeftLeague && !playerExt.hasRedCard && !playerExt.isInjured && (
                      <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        У
                      </span>
                    )}
                  </div>

                  {/* Points - total season points without sign, white color */}
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
            <div className="px-4 mb-24 flex items-center justify-center gap-4">
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
        </>
      ) : (
        <>
          <div className="px-4 mt-6">
            <h2 className="text-foreground text-xl font-display mb-4">Состав команды</h2>
          </div>
          <div className="px-4">
            {Object.entries(playersByPosition).map(([position, positionPlayers]) =>
              renderListSection(position as PositionCode, positionPlayers),
            )}
          </div>
        </>
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
                  `У тебя ${TRANSFERS_CONFIG.FREE_PER_TOUR} бесплатных трансфера за тур. Каждый дополнительный стоит -${TRANSFERS_CONFIG.PENALTY_PER_EXTRA} очка. Платных трансферов: ${transferCosts.paidTransfers}. Штрафы применяются в следующем туре.`,
                );
              } else {
                toast.info(
                  `У тебя ${TRANSFERS_CONFIG.FREE_PER_TOUR} бесплатных трансфера за тур. Каждый дополнительный стоит -${TRANSFERS_CONFIG.PENALTY_PER_EXTRA} очка. Штрафы применяются в следующем туре.`,
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
              // Capture current transfers before opening drawer to prevent flash
              setConfirmedTransfers(getTransferRecords());
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
        onRemove={removeBoost}
        currentTour={currentTour || 1}
        isRemoving={isRemovingBoost}
        hasActiveBoostInTour={specialChips.some((c) => c.status === "pending") || otherPageBoostActive}
        contextPage="transfers"
        blockedByOtherSection={otherPageBoostActive}
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
            <Button
              onClick={() => {
                if (players.length < 15) {
                  toast.error(`Состав не сформирован. Выбрано ${players.length} из 15 игроков`);
                  return;
                }
                handleSaveAndExit();
              }}
              className={`w-full rounded-lg h-12 font-semibold transition-all ${
                players.length < 15
                  ? "bg-primary/30 text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
              }`}
            >
              Сохранить
            </Button>
            <Button
              onClick={() => {
                handleExitWithoutSaving();
              }}
              className="w-full rounded-lg h-12 font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Не сохранять
            </Button>
            <Button
              onClick={() => {
                handleContinueEditing();
              }}
              variant="secondary"
              className="w-full rounded-lg h-12 font-semibold"
            >
              Продолжить редактирование
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Transfers Drawer */}
      <ConfirmTransfersDrawer
        isOpen={showConfirmDrawer}
        onClose={() => setShowConfirmDrawer(false)}
        onConfirm={async () => {
          // Use deterministic distribution based on slotIndex and position - single source of truth
          // This ensures correct distribution even after multiple transfers with active boosts
          const { mainSquad, bench } = distributePlayersToMainAndBench(players);

          // Validate distribution result
          const totalDistributed = mainSquad.length + bench.length;
          if (totalDistributed !== 15) {
            console.error("[Transfers] Distribution error:", {
              totalPlayers: players.length,
              mainSquadSize: mainSquad.length,
              benchSize: bench.length,
              totalDistributed,
            });
            toast.error(`Ошибка распределения: ${totalDistributed}/15 игроков`);
            return;
          }
          if (mainSquad.length !== 11) {
            console.error("[Transfers] Invalid main squad size:", mainSquad.length, "expected 11");
            toast.error(`Некорректное количество игроков в основе: ${mainSquad.length}/11`);
            return;
          }
          if (bench.length !== 4) {
            console.error("[Transfers] Invalid bench size:", bench.length, "expected 4");
            toast.error(`Некорректное количество игроков на скамейке: ${bench.length}/4`);
            return;
          }

          // Validate main squad positions (frontend uses Russian position codes)
          const mainPositionCounts: Record<string, number> = {};
          mainSquad.forEach((player) => {
            mainPositionCounts[player.position] = (mainPositionCounts[player.position] || 0) + 1;
          });

          const benchPositionCounts: Record<string, number> = {};
          bench.forEach((player) => {
            benchPositionCounts[player.position] = (benchPositionCounts[player.position] || 0) + 1;
          });

          // Must have exactly 1 GK on field and 1 GK on bench
          if ((mainPositionCounts["ВР"] || 0) !== 1) {
            toast.error("В основном составе должен быть ровно 1 вратарь");
            return;
          }
          if ((benchPositionCounts["ВР"] || 0) !== 1) {
            toast.error("На скамейке должен быть ровно 1 вратарь");
            return;
          }

          // Check if main squad matches any valid formation
          const validFormations = [
            { DEF: 4, MID: 3, FWD: 3, name: "4-3-3" },
            { DEF: 4, MID: 4, FWD: 2, name: "4-4-2" },
            { DEF: 3, MID: 5, FWD: 2, name: "3-5-2" },
            { DEF: 5, MID: 4, FWD: 1, name: "5-4-1" },
            { DEF: 3, MID: 4, FWD: 3, name: "3-4-3" },
            { DEF: 4, MID: 5, FWD: 1, name: "4-5-1" },
            { DEF: 5, MID: 2, FWD: 3, name: "5-2-3" },
            { DEF: 5, MID: 3, FWD: 2, name: "5-3-2" },
          ];

          const isValidFormation = validFormations.some(
            (f) =>
              f.DEF === (mainPositionCounts["ЗЩ"] || 0) &&
              f.MID === (mainPositionCounts["ПЗ"] || 0) &&
              f.FWD === (mainPositionCounts["НП"] || 0),
          );

          if (!isValidFormation) {
            const currentSetup = `${mainPositionCounts["ЗЩ"] || 0}-${mainPositionCounts["ПЗ"] || 0}-${mainPositionCounts["НП"] || 0}`;
            toast.error(`Недопустимая схема (${currentSetup}). Доступные: 4-3-3, 4-4-2, 3-5-2, 5-4-1, 3-4-3, 4-5-1`);
            return;
          }

          const transferCount = getTransferRecords().length;

          // Check if we have free transfers or boosts
          const freeTransfers = squadTourData?.replacements ?? 0;
          const willHavePenalty = !hasAnyTransferBoost && transferCount > freeTransfers;

          if (willHavePenalty) {
            const paidTransfersCount = transferCount - freeTransfers;
            const penalty = paidTransfersCount * 4;
            console.warn("[Transfers] Paid transfers will be applied:", {
              totalTransfers: transferCount,
              freeTransfers,
              paidTransfers: paidTransfersCount,
              penalty,
            });
          }

          // Calculate transfer costs for display
          // If season hasn't started, no penalty
          const finalTransferCosts = isSeasonNotStarted
            ? { freeTransfersUsed: 0, paidTransfers: 0, pointsPenalty: 0 }
            : calculateTransferCosts(
                transferCount,
                hasTransfersBoost,
                hasGoldenTourBoost,
                squadTourData?.replacements ?? 2,
              );

          // Debug: log distribution results
          console.log("[Transfers] Distribution result:", {
            mainSquad: mainSquad.map((p) => ({ id: p.id, name: p.name, position: p.position, slotIndex: p.slotIndex })),
            bench: bench.map((p) => ({ id: p.id, name: p.name, position: p.position, slotIndex: p.slotIndex })),
            mainPositionCounts,
            benchPositionCounts,
            transferInfo: {
              transferCount,
              freeTransfers,
              hasBoost: hasAnyTransferBoost,
              willHavePenalty,
              costs: finalTransferCosts,
            },
          });

          // Save via API
          if (squad?.id) {
            const response = await squadsApi.replacePlayers(
              squad.id,
              {
                main_player_ids: mainSquad.map((p) => p.id),
                bench_player_ids: bench.map((p) => p.id),
              },
              captain,
              viceCaptain,
            );

            if (!response.success) {
              console.error("[Transfers] Save failed:", response);

              // Extract error message from response.data.detail or response.error
              const backendDetail = (response.data as any)?.detail;

              // Special handling for "No replacements left" error
              if (backendDetail === "No replacements left") {
                const paidTransfersCount = transferCount - freeTransfers;
                const penalty = paidTransfersCount * 4;
                toast.error(
                  `Бэкенд не поддерживает платные трансферы. ` +
                    `Вы хотели сделать ${transferCount} замен (бесплатных: ${freeTransfers}, платных: ${paidTransfersCount}, штраф: -${penalty} очков). ` +
                    `Нужно исправить серверную логику.`,
                  { duration: 8000 },
                );
                return;
              }

              const errorMessage = backendDetail
                ? `Ошибка: ${backendDetail}`
                : response.error
                  ? `Ошибка: ${response.error}`
                  : `Ошибка сохранения (${response.status || "unknown"} ${response.statusText || ""})`;

              toast.error(errorMessage, { duration: 5000 });
              return;
            }

            // Invalidate squad cache so other pages get fresh data
            queryClient.invalidateQueries({ queryKey: ["my-squads"] });

            // Refetch squad data to update replacements count
            await refetchSquad();
          }

          // Also save locally for backup
          saveTeamTransfers(mainSquad, bench, captain, viceCaptain);
          initialStateRef.current = JSON.stringify(players.map((p) => p.id).sort());
          initialPlayersRef.current = [...players];
          setHasChanges(false);

          if (finalTransferCosts.pointsPenalty > 0) {
            toast.success(`Изменения сохранены. Штраф: -${finalTransferCosts.pointsPenalty} очков`);
          } else {
            toast.success("Изменения сохранены");
          }

          // Close drawer and navigate
          setShowConfirmDrawer(false);
          navigate("/league");
        }}
        transfers={confirmedTransfers}
        freeTransfersUsed={transferCosts.freeTransfersUsed}
        additionalTransfersUsed={transferCosts.paidTransfers}
        pointsPenalty={transferCosts.pointsPenalty}
        remainingBudget={budget} // Already rounded to 1 decimal place
        hasTransferBoost={hasAnyTransferBoost}
      />

      {/* Home Button */}
      {/* <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}
    </div>
  );
};

export default Transfers;
