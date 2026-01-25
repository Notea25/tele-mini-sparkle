import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ArrowLeftRight, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDeadline } from "@/hooks/useDeadline";
import { useTeams } from "@/hooks/useTeams";
import { useSquadData, EnrichedPlayer } from "@/hooks/useSquadData";
import { squadsApi, UpdateSquadPlayersRequest, boostsApi, BoostType } from "@/lib/api";
import SportHeader from "@/components/SportHeader";
import { PlayerData } from "@/lib/teamData";
import { getValidSwapOptions, detectFormation, FORMATION_LABELS, FormationKey, isSwapValid } from "@/lib/formationUtils";
import FormationField from "@/components/FormationField";
import PlayerCard from "@/components/PlayerCard";
import BoostDrawer from "@/components/BoostDrawer";
import ConfirmBoostDrawer from "@/components/ConfirmBoostDrawer";
import {
  getBoostState,
  setPendingBoost,
  clearPendingBoost,
  hasAnyPendingBoost,
  resetAllBoosts,
  TEAM_MANAGEMENT_BOOSTS,
} from "@/lib/boostState";
import { clubLogos } from "@/lib/clubLogos";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";
import { getNextOpponentData } from "@/lib/scheduleUtils";


import boostBench from "@/assets/boost-bench.png";
import boostCaptain3x from "@/assets/boost-captain3x.png";
import boostDouble from "@/assets/boost-double.png";

// Club icons mapping
const clubIcons: Record<string, string> = {
  Белшина: clubBelshina,
  БАТЭ: clubLogo,
  "Динамо Минск": clubLogo,
  Шахтер: clubLogo,
  Неман: clubLogo,
  Славия: clubLogo,
  Торпедо: clubLogo,
};

import { BoostChip, BoostStatus } from "@/components/BoostDrawer";

// Special chips data with icons - only team management boosts
const initialChips: BoostChip[] = [
  { id: "bench", icon: boostBench, label: "Скамейка +", sublabel: "Подробнее", status: "available" },
  { id: "captain3x", icon: boostCaptain3x, label: "3x Капитан", sublabel: "Подробнее", status: "available" },
  { id: "double", icon: boostDouble, label: "Двойная сила", sublabel: "Подробнее", status: "available" },
];

// Mapping API boost types to local chip IDs
const boostTypeToChipId: Record<BoostType, string> = {
  'bench_boost': 'bench',
  'triple_captain': 'captain3x',
  'double_bet': 'double',
  'transfers_plus': 'transfers', // Not used on this page
  'gold_tour': 'gold', // Not used on this page
};

// Formation options - all 8 valid formations
const formationOptions: { value: FormationKey; label: string }[] = Object.entries(FORMATION_LABELS).map(
  ([value, label]) => ({ value: value as FormationKey, label }),
);

// Get league ID from localStorage or use default
const getLeagueId = (): number => {
  const saved = localStorage.getItem("fantasySelectedLeagueId");
  return saved ? parseInt(saved, 10) : 116;
};

interface PlayerDataExt extends PlayerData {
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
  hasRedCard?: boolean;
  isInjured?: boolean;
  team_logo?: string;
}

// Ensure goalkeeper is always first on the bench (utility function)
const ensureGoalkeeperFirst = (bench: PlayerDataExt[]): PlayerDataExt[] => {
  const gkIdx = bench.findIndex(p => p.position === "ВР");
  if (gkIdx <= 0) return bench; // Already first or no GK
  
  const newBench = [...bench];
  const [gk] = newBench.splice(gkIdx, 1);
  newBench.unshift(gk);
  return newBench;
};

const TeamManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const leagueId = getLeagueId();
  
  // Load squad data from API
  const { squad, mainPlayers: apiMainPlayers, benchPlayers: apiBenchPlayers, currentTour, nextTour, boostTourId, isLoading, error } = useSquadData(leagueId);
  
  // Fetch available boosts from API - use boostTourId (next tour or current tour)
  const { data: boostsResponse, isLoading: boostsLoading } = useQuery({
    queryKey: ['availableBoosts', squad?.id, boostTourId],
    queryFn: () => squad && boostTourId ? boostsApi.getAvailable(squad.id, boostTourId) : Promise.resolve(null),
    enabled: !!squad?.id && !!boostTourId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  
  // Map API boosts to availability and used tour number
  const apiBoostData = useMemo(() => {
    const data: Record<string, { available: boolean; usedInTourNumber?: number | null }> = {};
    if (boostsResponse?.success && boostsResponse.data?.boosts) {
      boostsResponse.data.boosts.forEach(boost => {
        const chipId = boostTypeToChipId[boost.type];
        if (chipId) {
          data[chipId] = {
            available: boost.available,
            usedInTourNumber: boost.used_in_tour_number,
          };
        }
      });
    }
    return data;
  }, [boostsResponse]);
  
  const usedForNextTour = boostsResponse?.success ? boostsResponse.data?.used_for_next_tour : false;
  
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [selectedFormation, setSelectedFormation] = useState("1-4-4-2");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  
  // Track initial boost state to detect changes (MUST be declared before useEffect that uses it)
  const [initialBoostState, setInitialBoostState] = useState<{ hasBoost: boolean; boostId?: string } | null>(null);
  
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(() => {
    // Инициализируем только состояние "pending" из localStorage.
    // Фактический факт использования буста (used) доверяем только бэкенду (boostsApi.getAvailable),
    // чтобы не получить ситуацию, когда несколько бустов помечены как использованные в одном туре.
    const boostState = getBoostState();
    return initialChips.map((chip) => {
      if (boostState.pendingBoostId === chip.id && boostState.pendingBoostPage === "team-management") {
        return { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" };
      }
      return chip;
    });
  });
  
  // Update specialChips when API data arrives
  useEffect(() => {
    if (!boostsLoading && boostsResponse?.success) {
      setSpecialChips(prev => prev.map(chip => {
        const boostData = apiBoostData[chip.id];
        const boostState = getBoostState();

        // pending-состояние управляется локально (из localStorage)
        if (boostState.pendingBoostId === chip.id && boostState.pendingBoostPage === 'team-management') {
          return { ...chip, status: 'pending' as BoostStatus, sublabel: 'Используется' };
        }

        // Если бэкенд говорит, что буст больше недоступен (уже использован в каком-то туре)
        if (boostData && boostData.available === false) {
          return {
            ...chip,
            status: 'used' as BoostStatus,
            sublabel: boostData.usedInTourNumber
              ? `Использован в ${boostData.usedInTourNumber} туре`
              : 'Использован',
            usedInTour: boostData.usedInTourNumber || undefined,
          };
        }

        // Если на следующий тур уже назначен какой-то буст, остальные считаем недоступными
        if (usedForNextTour) {
          return {
            ...chip,
            status: 'used' as BoostStatus,
            sublabel: 'Недоступен (буст уже выбран на следующий тур)',
          };
        }

        // В остальных случаях — буст доступен
        return { ...chip, status: 'available' as BoostStatus, sublabel: 'Подробнее' };
      }));
    }
  }, [boostsLoading, boostsResponse, apiBoostData, usedForNextTour]);
  
  // Track initial boost state when data is loaded
  useEffect(() => {
    if (!boostsLoading && boostsResponse?.success && initialBoostState === null) {
      // Считаем, что если на следующий тур уже выбран какой-то буст,
      // то буст "уже есть" и это базовое состояние
      if (usedForNextTour) {
        setInitialBoostState({ hasBoost: true });
      } else {
        setInitialBoostState({ hasBoost: false });
      }
    }
  }, [boostsLoading, boostsResponse, initialBoostState, usedForNextTour]);
  
  const [selectedBoostChip, setSelectedBoostChip] = useState<BoostChip | null>(null);
  const [isBoostDrawerOpen, setIsBoostDrawerOpen] = useState(false);
  const [isConfirmBoostOpen, setIsConfirmBoostOpen] = useState(false);
  const [otherPageBoostActive, setOtherPageBoostActive] = useState(false);

  // Check if boost is active on the other page
  useEffect(() => {
    const checkOtherPageBoost = () => {
      const { pending, boostId, page } = hasAnyPendingBoost();
      if (pending && page === "transfers") {
        setOtherPageBoostActive(true);
      } else {
        setOtherPageBoostActive(false);
      }
    };
    checkOtherPageBoost();

    // Listen for storage changes from other tabs/pages
    const handleStorageChange = () => checkOtherPageBoost();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openBoostDrawer = (chip: BoostChip) => {
    // Check if boost is active on other page
    if (otherPageBoostActive) {
      toast.error("В этом туре уже активирован буст в разделе Трансферы");
      return;
    }
    setSelectedBoostChip(chip);
    setIsBoostDrawerOpen(true);
  };

  const applyBoost = (chipId: string) => {
    // Check if another boost is already pending (local or from other page)
    const hasPendingBoost = specialChips.some((chip) => chip.status === "pending");
    const { pending, page } = hasAnyPendingBoost();

    if (hasPendingBoost || (pending && page !== "team-management")) {
      toast.error("В одном туре можно использовать только 1 буст");
      return;
    }

    setPendingBoost(chipId, "team-management");
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

  // State for removing boost
  const [isRemovingBoost, setIsRemovingBoost] = useState(false);

  const removeBoost = async (chipId: string) => {
    if (!squad?.id || !boostTourId) {
      toast.error("Не удалось определить параметры для отмены буста");
      return;
    }

    setIsRemovingBoost(true);
    try {
      const response = await boostsApi.remove(squad.id, boostTourId);
      setIsBoostDrawerOpen(false);
      
      if (response.success) {
        toast.success("Буст успешно отменён");
        // Refetch boosts data
        window.location.reload();
      } else {
        toast.error(response.error || "Ошибка при отмене буста");
      }
    } catch (err) {
      toast.error("Ошибка при отмене буста");
    } finally {
      setIsRemovingBoost(false);
    }
  };
  // Deadline and teams using shared hooks
  const leagueIdStr = String(leagueId);
  const { deadlineDate, isLoading: deadlineLoading, timeLeft, formattedDeadline } = useDeadline(leagueIdStr);
  const { teams: apiTeams, isLoading: isLoadingTeams } = useTeams(leagueIdStr);

  // Local state for players (editable)
  const [mainSquadPlayers, setMainSquadPlayers] = useState<PlayerDataExt[]>([]);
  const [benchPlayersExt, setBenchPlayersExt] = useState<PlayerDataExt[]>([]);

  // Initialize players from API data
  useEffect(() => {
    if (apiMainPlayers.length > 0) {
      const converted = apiMainPlayers.map(p => {
        const opponentData = getNextOpponentData(p.team_name);
        return {
          id: p.id,
          name: p.name,
          team: p.team_name,
          team_logo: p.team_logo,
          position: p.position,
          price: p.price,
          points: p.points,
          slotIndex: p.slotIndex,
          isCaptain: squad?.captain_id === p.id,
          isViceCaptain: squad?.vice_captain_id === p.id,
          isOnBench: false,
          nextOpponent: opponentData.nextOpponent,
          nextOpponentHome: opponentData.nextOpponentHome,
        };
      });
      setMainSquadPlayers(converted);
    }
  }, [apiMainPlayers, squad?.captain_id, squad?.vice_captain_id]);

  useEffect(() => {
    if (apiBenchPlayers.length > 0) {
      const converted = apiBenchPlayers.map(p => {
        const opponentData = getNextOpponentData(p.team_name);
        return {
          id: p.id,
          name: p.name,
          team: p.team_name,
          team_logo: p.team_logo,
          position: p.position,
          price: p.price,
          points: p.points,
          slotIndex: p.slotIndex,
          isOnBench: true,
          nextOpponent: opponentData.nextOpponent,
          nextOpponentHome: opponentData.nextOpponentHome,
        };
      });
      // Ensure goalkeeper is always first on bench
      const orderedBench = ensureGoalkeeperFirst(converted);
      setBenchPlayersExt(orderedBench.map((p, i) => ({ ...p, slotIndex: i })));
    }
  }, [apiBenchPlayers]);

  // Initialize captain/vice-captain from squad data
  useEffect(() => {
    if (squad && mainSquadPlayers.length > 0) {
      const sortedByPrice = [...mainSquadPlayers].sort((a, b) => (b.price || 0) - (a.price || 0));
      
      // Determine captain - from API or auto-assign most expensive
      let captainId = squad.captain_id;
      if (!captainId || !mainSquadPlayers.some(p => p.id === captainId)) {
        captainId = sortedByPrice[0]?.id || null;
      }
      
      // Determine vice-captain - from API or auto-assign second most expensive (must be different from captain)
      let viceCaptainId = squad.vice_captain_id;
      if (!viceCaptainId || !mainSquadPlayers.some(p => p.id === viceCaptainId) || viceCaptainId === captainId) {
        const viceCaptainCandidate = sortedByPrice.find(p => p.id !== captainId);
        viceCaptainId = viceCaptainCandidate?.id || null;
      }
      
      setCaptain(captainId);
      setViceCaptain(viceCaptainId);
    }
  }, [squad, mainSquadPlayers]);

  // Build request body for API
  const buildRequestBody = (): UpdateSquadPlayersRequest => {
    return {
      captain_id: captain,
      vice_captain_id: viceCaptain,
      main_player_ids: mainSquadPlayers.map(p => p.id),
      bench_player_ids: benchPlayersExt.map(p => p.id),
    };
  };

  // Handle save - directly save to backend
  const handleSaveClick = async () => {
    const pendingBoost = specialChips.find((c) => c.status === "pending");
    
    // Only show confirmation if boost state has changed:
    // 1. New boost was added (pending boost exists but wasn't there initially)
    // 2. Boost was removed (pending boost doesn't exist but was there initially)
    if (pendingBoost) {
      // Check if this is a NEW boost (not just re-saving an already applied one)
      const isNewBoost = !initialBoostState?.hasBoost || initialBoostState.boostId !== pendingBoost.id;
      
      if (isNewBoost) {
        // This is a new or changed boost - show confirmation
        setIsConfirmBoostOpen(true);
        return;
      }
      // If it's the same boost that was already applied, just save normally (skip confirmation)
    }
    
    if (!squad) return;
    
    // Validate main squad positions (frontend uses Russian position codes)
    const mainPositionCounts: Record<string, number> = {};
    mainSquadPlayers.forEach(player => {
      mainPositionCounts[player.position] = (mainPositionCounts[player.position] || 0) + 1;
    });
    
    const benchPositionCounts: Record<string, number> = {};
    benchPlayersExt.forEach(player => {
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
      f => f.DEF === (mainPositionCounts["ЗЩ"] || 0) &&
           f.MID === (mainPositionCounts["ПЗ"] || 0) &&
           f.FWD === (mainPositionCounts["НП"] || 0)
    );
    
    if (!isValidFormation) {
      const currentSetup = `${mainPositionCounts["ЗЩ"] || 0}-${mainPositionCounts["ПЗ"] || 0}-${mainPositionCounts["НП"] || 0}`;
      toast.error(`Недопустимая схема (${currentSetup}). Доступные: 4-3-3, 4-4-2, 3-5-2, 5-4-1, 3-4-3, 4-5-1`);
      return;
    }
    
    setIsSaving(true);
    try {
      const requestBody = buildRequestBody();
      const result = await squadsApi.updatePlayers(squad.id, requestBody);
      
      if (result.success) {
        // Invalidate squad cache to ensure fresh data on other pages
        await queryClient.invalidateQueries({ queryKey: ['my-squads'] });
        
        toast.success("Изменения сохранены");
        navigate("/league");
      } else {
        toast.error(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (err) {
      toast.error(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Swap mode state (no drawer)
  const [swapModePlayer, setSwapModePlayer] = useState<PlayerDataExt | null>(null);
  const [validSwapTargetIds, setValidSwapTargetIds] = useState<Set<number>>(new Set());

  const allPlayers = [...mainSquadPlayers, ...benchPlayersExt];

  // Group players by position for list view
  const playersByPosition = {
    ВР: mainSquadPlayers.filter((p) => p.position === "ВР"),
    ЗЩ: mainSquadPlayers.filter((p) => p.position === "ЗЩ"),
    ПЗ: mainSquadPlayers.filter((p) => p.position === "ПЗ"),
    НП: mainSquadPlayers.filter((p) => p.position === "НП"),
  };

  const getPositionLabel = (pos: string, count: number): string => {
    if (pos === "ВР") return count === 1 ? "Вратарь" : "Вратари";
    if (pos === "ЗЩ") return "Защита";
    if (pos === "ПЗ") return "Полузащита";
    if (pos === "НП") return "Нападение";
    return pos;
  };

  // Enter swap mode - highlight valid targets
  const handlePlayerSwap = (playerId: number) => {
    const player = allPlayers.find((p) => p.id === playerId) as PlayerDataExt | undefined;
    if (!player) return;

    // If clicking the same player, exit swap mode
    if (swapModePlayer?.id === playerId) {
      exitSwapMode();
      return;
    }

    // If in swap mode and clicking a valid target, perform swap
    if (swapModePlayer && validSwapTargetIds.has(playerId)) {
      handleSwapConfirm(swapModePlayer.id, playerId);
      exitSwapMode();
      return;
    }

    // Calculate valid swap targets
    const validOptions = getValidSwapOptions(mainSquadPlayers, benchPlayersExt, player);
    const validIds = new Set(validOptions.map((opt) => opt.id));

    setSwapModePlayer(player);
    setValidSwapTargetIds(validIds);
  };

  const exitSwapMode = () => {
    setSwapModePlayer(null);
    setValidSwapTargetIds(new Set());
  };

  const handleSwapConfirm = (fromPlayerId: number, toPlayerId: number) => {
    const fromPlayer = allPlayers.find(p => p.id === fromPlayerId);
    const toPlayer = allPlayers.find(p => p.id === toPlayerId);
    
    if (!fromPlayer || !toPlayer) {
      toast.error("Игрок не найден");
      exitSwapMode();
      return;
    }

    const fromIsMain = !fromPlayer.isOnBench;
    const toIsMain = !toPlayer.isOnBench;

    // Both on main squad - not allowed
    if (fromIsMain && toIsMain) {
      toast.info("Игроки в основном составе не меняются местами");
      exitSwapMode();
      return;
    }

    // Both on bench - swap bench order (but GK restrictions apply)
    if (!fromIsMain && !toIsMain) {
      // Goalkeeper must stay first on bench - block GK swaps with non-GK
      if ((fromPlayer.position === "ВР" && toPlayer.position !== "ВР") ||
          (toPlayer.position === "ВР" && fromPlayer.position !== "ВР")) {
        toast.error("Вратарь должен быть первым в очереди замен");
        exitSwapMode();
        return;
      }
      
      const fromIdx = benchPlayersExt.findIndex(p => p.id === fromPlayerId);
      const toIdx = benchPlayersExt.findIndex(p => p.id === toPlayerId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const newBench = [...benchPlayersExt];
        [newBench[fromIdx], newBench[toIdx]] = [newBench[toIdx], newBench[fromIdx]];
        setBenchPlayersExt(ensureGoalkeeperFirst(newBench).map((p, i) => ({ ...p, slotIndex: i })));
        toast.success(`${fromPlayer.name} ↔ ${toPlayer.name}`);
      }
      exitSwapMode();
      return;
    }

    // One main, one bench
    const mainPlayer = fromIsMain ? fromPlayer : toPlayer;
    const benchPlayer = fromIsMain ? toPlayer : fromPlayer;
    
    // Goalkeeper special rule: can only swap with goalkeeper
    if (mainPlayer.position === "ВР" || benchPlayer.position === "ВР") {
      if (mainPlayer.position !== benchPlayer.position) {
        toast.error("Вратарь может меняться только с вратарём");
        exitSwapMode();
        return;
      }
    }
    
    // For non-goalkeepers, check if the resulting formation is valid
    if (mainPlayer.position !== benchPlayer.position) {
      const { valid, message } = isSwapValid(mainSquadPlayers, mainPlayer, benchPlayer);
      if (!valid) {
        toast.error(message || "Замена невозможна");
        exitSwapMode();
        return;
      }
    }
    
    // Swap players between main and bench
    const newMain = mainSquadPlayers
      .filter(p => p.id !== mainPlayer.id)
      .concat({ ...benchPlayer, isOnBench: false });
    
    const newBench = benchPlayersExt
      .filter(p => p.id !== benchPlayer.id)
      .concat({ ...mainPlayer, isOnBench: true });
    
    // Reassign slot indices and ensure goalkeeper is first on bench
    setMainSquadPlayers(reassignSlotIndices(newMain));
    setBenchPlayersExt(ensureGoalkeeperFirst(newBench).map((p, i) => ({ ...p, slotIndex: i })));
    
    toast.success(`${mainPlayer.name} ↔ ${benchPlayer.name}`);
    exitSwapMode();
  };

  // Helper function to reassign slot indices based on positions
  const reassignSlotIndices = (players: PlayerDataExt[]): PlayerDataExt[] => {
    const positionCounters: Record<string, number> = {
      ВР: 0,
      ЗЩ: 0,
      ПЗ: 0,
      НП: 0,
    };

    return players.map((player) => {
      const slotIndex = positionCounters[player.position] || 0;
      positionCounters[player.position] = slotIndex + 1;
      return { ...player, slotIndex };
    });
  };

  // Handle bench player reordering (swap between bench players)
  const handleBenchReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newBench = [...benchPlayersExt];
    const [movedPlayer] = newBench.splice(fromIndex, 1);
    newBench.splice(toIndex, 0, movedPlayer);
    
    setBenchPlayersExt(newBench.map((p, i) => ({ ...p, slotIndex: i })));
    toast.success("Порядок скамейки изменён");
  };

  // Handle swapping a main squad player with a bench player via long-press
  const handleSwapMainAndBench = (mainPlayerId: number, benchPlayerId: number) => {
    handleSwapConfirm(mainPlayerId, benchPlayerId);
  };


  // Team abbreviations for next match
  const teamAbbreviations: Record<string, string> = {
    Арсенал: "АРС",
    БАТЭ: "БАТ",
    Белшина: "БЕЛ",
    Витебск: "ВИТ",
    Гомель: "ГОМ",
    "Динамо-Минск": "ДМН",
    "Динамо-Брест": "ДБР",
    Днепр: "ДНП",
    Ислочь: "ИСЛ",
    "МЛ Витебск": "МЛ",
    Минск: "МИН",
    Нафтан: "НАФ",
    Неман: "НЕМ",
    "Славия-Мозырь": "СЛА",
    "Торпедо-БелАЗ": "ТОР",
    Шахтер: "ШАХ",
    Барановичи: "БАР",
  };

  // Get next opponent for a team (simplified - just shows a random opponent)
  const getNextOpponent = (team: string): string => {
    const teams = Object.keys(teamAbbreviations).filter((t) => t !== team);
    const hash = team.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const opponent = teams[hash % teams.length];
    return teamAbbreviations[opponent] || "—";
  };

  const renderListSection = (position: string, players: PlayerDataExt[]) => (
    <div className="mb-6" key={position}>
      {/* Position header */}
      <h3 className="text-primary font-medium text-medium mb-2">{getPositionLabel(position, players.length)}</h3>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1 text-xs text-muted-foreground text-regular">
        <span className="flex-1">Игрок</span>
        <div className="w-12 flex justify-center">Очки</div>
        <div className="w-14 flex justify-center ml-2">Сл. матч</div>
        <span className="w-10"></span>
      </div>

      {/* Players */}
      <div className="space-y-2">
        {players.map((player) => {
          const clubLogoSrc = player.team_logo || clubLogos[player.team] || clubIcons[player.team];
          const isCaptainPlayer = captain === player.id;
          const isViceCaptainPlayer = viceCaptain === player.id;
          const playerExt = player as PlayerDataExt;
          
          // Swap mode highlighting
          const isSwapSource = swapModePlayer?.id === player.id;
          const isValidSwapTarget = swapModePlayer && validSwapTargetIds.has(player.id);
          const isInSwapModeButNotTarget = swapModePlayer && !isSwapSource && !isValidSwapTarget;

          return (
            <div 
              key={player.id} 
              className={`rounded-xl px-4 py-2 flex items-center transition-all duration-200 ${
                isSwapSource 
                  ? "bg-primary/30 border-2 border-primary" 
                  : isValidSwapTarget 
                    ? "bg-primary/20 border-2 border-primary/60 cursor-pointer" 
                    : isInSwapModeButNotTarget 
                      ? "bg-card/50 opacity-40" 
                      : "bg-card"
              }`}
              onClick={isValidSwapTarget ? () => handlePlayerSwap(player.id) : undefined}
            >
              {/* Club logo + Player name + position + badges */}
              <div
                className={`flex-1 flex items-center gap-2 min-w-0 ${!swapModePlayer ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={!swapModePlayer ? () => setSelectedPlayerForCard(player.id) : undefined}
              >
                {clubLogoSrc && <img src={clubLogoSrc} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />}
                <span className="text-foreground font-medium text-medium truncate">{player.name}</span>
                <span className="text-muted-foreground text-xs text-regular">{player.position}</span>
                {/* Captain badge */}
                {isCaptainPlayer && (
                  <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                    К
                  </span>
                )}
                {/* Vice-captain badge */}
                {isViceCaptainPlayer && (
                  <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                    ВК
                  </span>
                )}
                {/* Red card badge */}
                {playerExt.hasRedCard && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                    КК
                  </span>
                )}
                {/* Injury badge */}
                {playerExt.isInjured && !playerExt.hasRedCard && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                    Т
                  </span>
                )}
              </div>

              {/* Points */}
              <div className={`w-12 flex-shrink-0 flex justify-center text-sm font-medium ${
                player.points > 0 ? "text-success" : player.points < 0 ? "text-destructive" : "text-foreground"
              }`}>
                {player.points > 0 ? `+${player.points}` : player.points}
              </div>

              {/* Next match opponent */}
              <div className="w-14 flex-shrink-0 flex justify-center text-muted-foreground text-sm ml-2">
                {getNextOpponent(player.team)}
              </div>

              {/* Swap button */}
              {!swapModePlayer && (
                <button
                  onClick={() => handlePlayerSwap(player.id)}
                  className="w-8 h-8 ml-2 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
                </button>
              )}
              {isSwapSource && (
                <span className="ml-2 text-primary text-xs font-medium">Выбран</span>
              )}
              {isValidSwapTarget && (
                <span className="ml-2 text-primary text-xs font-medium animate-pulse">Заменить</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Ошибка загрузки: {error}</p>
      </div>
    );
  }

  // No squad state
  if (!squad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Команда не найдена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SportHeader />

      {/* Team Header */}
      <div className="px-4 mt-6">

        {/* Team name */}
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-foreground text-3xl font-display">{squad?.name || "Моя команда"}</h1>
        </div>

        {/* Tour Label with Gradient Lines */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-muted-foreground/30" />
          <span className="text-muted-foreground text-sm font-medium">
            {nextTour ? `${nextTour} тур` : currentTour ? `${currentTour} тур` : "—"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between text-sm text-regular">
          <span className="text-muted-foreground">
            Дедлайн: <span className="text-foreground font-medium">{deadlineLoading ? '...' : formattedDeadline || '—'}</span>
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
        <div className="grid grid-cols-3 gap-3">
          {specialChips.map((chip) => {
            const isBlocked = otherPageBoostActive && chip.status === "available";
            const boostData = apiBoostData[chip.id];
            const isDisabledByApi = boostData?.available === false;
            const isDisabled = isBlocked || isDisabledByApi || chip.status === "used";
            
            // Boosts that can be cancelled: bench, captain3x, double
            const cancellableBoosts = ["bench", "captain3x", "double"];
            const canBeRemoved = chip.status === "used" && cancellableBoosts.includes(chip.id);
            const isClickable = !isBlocked && (chip.status === "available" || chip.status === "pending" || canBeRemoved);
            
            return (
              <div
                key={chip.id}
                onClick={() => {
                  if (isBlocked) {
                    toast.error("В этом туре уже активирован буст в разделе Трансферы");
                    return;
                  }
                  if (isClickable) {
                    openBoostDrawer(chip);
                  }
                }}
                className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all ${
                  !isClickable
                    ? "bg-card/30 opacity-50 cursor-not-allowed"
                    : chip.status === "pending"
                      ? "bg-card border-2 border-primary hover:bg-card/80 cursor-pointer"
                      : chip.status === "used" && canBeRemoved
                        ? "bg-card/60 hover:bg-card/80 cursor-pointer"
                        : "bg-card hover:bg-card/80 cursor-pointer"
                }`}
              >
                <img
                  src={chip.icon}
                  alt={chip.label}
                  className={`w-8 h-8 object-contain mb-1 transition-all ${
                    isDisabled ? "grayscale opacity-50" : ""
                  }`}
                />
                <span
                  className={`text-[10px] font-medium text-center leading-tight ${
                    isDisabled ? "text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {chip.label}
                </span>
                <span
                  className={`text-[8px] ${
                    isDisabled
                      ? "text-muted-foreground"
                      : chip.status === "pending"
                        ? "text-primary"
                        : "text-foreground/60"
                  }`}
                >
                  {isBlocked
                    ? "Заблокировано"
                    : chip.status === "pending"
                      ? "Используется"
                      : chip.status === "used"
                        ? (chip.sublabel?.startsWith("Использован")
                            ? chip.sublabel
                            : chip.usedInTour
                              ? `${chip.usedInTour} тур`
                              : "Использован")
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

      {/* Captain selectors */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-muted-foreground text-sm mb-2 block">Капитан</label>
            <Select value={captain?.toString() || ""} onValueChange={(v) => setCaptain(Number(v))}>
              <SelectTrigger className="w-full bg-card border-border text-foreground rounded-xl">
                <SelectValue placeholder="Выбрать">
                  {captain ? allPlayers.find((p) => p.id === captain)?.name : "Плотников"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {mainSquadPlayers.map((player) => (
                  <SelectItem
                    key={player.id}
                    value={player.id.toString()}
                    className="text-foreground hover:bg-secondary cursor-pointer"
                    disabled={player.id === viceCaptain}
                  >
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-muted-foreground text-sm mb-2 block">Вице-капитан</label>
            <Select value={viceCaptain?.toString() || ""} onValueChange={(v) => setViceCaptain(Number(v))}>
              <SelectTrigger className="w-full bg-card border-border text-foreground rounded-xl">
                <SelectValue placeholder="Выбрать">
                  {viceCaptain ? allPlayers.find((p) => p.id === viceCaptain)?.name : "Чиж"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {mainSquadPlayers.map((player) => (
                  <SelectItem
                    key={player.id}
                    value={player.id.toString()}
                    className="text-foreground hover:bg-secondary cursor-pointer"
                    disabled={player.id === captain}
                  >
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main content */}
      {activeTab === "formation" ? (
        <div className="mt-10 sm:mt-14 md:mt-16 lg:mt-20">
          <FormationField
            mode="management"
            mainSquadPlayers={mainSquadPlayers}
            benchPlayers={benchPlayersExt}
            showBench={true}
            onPlayerClick={(player) => {
              if (swapModePlayer) {
                // In swap mode - check if valid target
                if (validSwapTargetIds.has(player.id)) {
                  handlePlayerSwap(player.id);
                }
              } else {
                setSelectedPlayerForCard(player.id);
              }
            }}
            onSwapPlayer={handlePlayerSwap}
            onSwapBenchPlayers={handleBenchReorder}
            captain={captain}
            viceCaptain={viceCaptain}
            showCaptainBadges={true}
            showPrice={false}
            isBenchBoostActive={specialChips.find((c) => c.id === "bench")?.status === "pending"}
            isDoublePowerBoostActive={specialChips.find((c) => c.id === "double")?.status === "pending"}
            isCaptain3xBoostActive={specialChips.find((c) => c.id === "captain3x")?.status === "pending"}
            swapModePlayerId={swapModePlayer?.id || null}
            validSwapTargetIds={validSwapTargetIds}
          />
        </div>
      ) : (
        <div className="px-4 mt-6 pb-6">
          {/* Main Squad */}
          <h2 className="text-foreground text-xl font-bold mb-4">Основной состав</h2>

          {Object.entries(playersByPosition).map(([position, players]) => renderListSection(position, players))}

          {/* Bench */}
          <h2 className="text-foreground text-xl font-bold mb-4 mt-8">Замены</h2>

          {/* Column headers */}
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
            <span className="flex-1">Игрок</span>
            <div className="w-12 flex justify-center">Очки</div>
            <div className="w-14 flex justify-center ml-2">Сл. матч</div>
            <span className="w-10"></span>
          </div>

          <div className="space-y-2">
            {benchPlayersExt.map((player, index) => {
              const clubLogoSrc = player.team_logo || clubLogos[player.team] || clubIcons[player.team];
              const playerExt = player as PlayerDataExt;
              const isCaptainPlayer = captain === player.id;
              const isViceCaptainPlayer = viceCaptain === player.id;
              
              // Swap mode highlighting
              const isSwapSource = swapModePlayer?.id === player.id;
              const isValidSwapTarget = swapModePlayer && validSwapTargetIds.has(player.id);
              const isInSwapModeButNotTarget = swapModePlayer && !isSwapSource && !isValidSwapTarget;

              return (
                <div 
                  key={player.id} 
                  className={`rounded-xl px-4 py-2 flex items-center transition-all duration-200 ${
                    isSwapSource 
                      ? "bg-primary/30 border-2 border-primary" 
                      : isValidSwapTarget 
                        ? "bg-primary/20 border-2 border-primary/60 cursor-pointer" 
                        : isInSwapModeButNotTarget 
                          ? "bg-card/50 opacity-40" 
                          : "bg-card"
                  }`}
                  onClick={isValidSwapTarget ? () => handlePlayerSwap(player.id) : undefined}
                >
                  {/* Club logo + Player name + position + badges */}
                  <div
                    className={`flex-1 flex items-center gap-2 min-w-0 ${!swapModePlayer ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={!swapModePlayer ? () => setSelectedPlayerForCard(player.id) : undefined}
                  >
                    {clubLogoSrc && (
                      <img src={clubLogoSrc} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                    )}
                    <span className="text-foreground font-medium truncate">{player.name}</span>
                    <span className="text-muted-foreground text-xs">{player.position}</span>
                    {/* Captain badge */}
                    {isCaptainPlayer && (
                      <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        К
                      </span>
                    )}
                    {/* Vice-captain badge */}
                    {isViceCaptainPlayer && (
                      <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        ВК
                      </span>
                    )}
                    {/* Red card badge */}
                    {playerExt.hasRedCard && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        КК
                      </span>
                    )}
                    {/* Injury badge */}
                    {playerExt.isInjured && !playerExt.hasRedCard && (
                      <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        Т
                      </span>
                    )}
                  </div>

                  {/* Points */}
                  <div className={`w-12 flex-shrink-0 flex justify-center text-sm font-medium ${
                    player.points > 0 ? "text-success" : player.points < 0 ? "text-destructive" : "text-foreground"
                  }`}>
                    {player.points > 0 ? `+${player.points}` : player.points}
                  </div>

                  {/* Next match opponent */}
                  <div className="w-14 flex-shrink-0 flex justify-center text-muted-foreground text-sm ml-2">
                    {getNextOpponent(player.team)}
                  </div>

                  {/* Swap button */}
                  {!swapModePlayer && (
                    <button
                      onClick={() => handlePlayerSwap(player.id)}
                      className="w-8 h-8 ml-2 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
                    </button>
                  )}
                  {isSwapSource && (
                    <span className="ml-2 text-primary text-xs font-medium">Выбран</span>
                  )}
                  {isValidSwapTarget && (
                    <span className="ml-2 text-primary text-xs font-medium animate-pulse">Заменить</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Swap Mode Cancel Bar */}
      {swapModePlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary px-4 py-4 z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-foreground font-medium">Замена: {swapModePlayer.name}</p>
              <p className="text-muted-foreground text-sm">Выбери игрока для замены</p>
            </div>
            <Button
              onClick={exitSwapMode}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <X className="w-4 h-4 mr-2" />
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Section with Save Button */}
      {!swapModePlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 z-50">
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg h-12"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Сохранить
          </Button>
        </div>
      )}

      {/* Add padding to account for fixed bottom */}
      <div className="h-20" />

      {/* Player Card Drawer */}
      {selectedPlayerForCard !== null && (() => {
        const currentPlayer = allPlayers.find((p) => p.id === selectedPlayerForCard);
        // Get swap targets for the current player
        const swapTargets = currentPlayer 
          ? (currentPlayer.isOnBench 
              ? mainSquadPlayers 
              : benchPlayersExt
            ).filter(p => p.id !== selectedPlayerForCard)
          : [];
        
        // Calculate valid swap IDs
        const validOptions = currentPlayer 
          ? getValidSwapOptions(mainSquadPlayers, benchPlayersExt, currentPlayer)
          : [];
        const validIds = new Set(validOptions.map(opt => opt.id));

        // Build contextual error messages for invalid swap targets
        const swapInvalidMessages: Record<number, string> = {};
        if (currentPlayer) {
          const POSITION_KEY: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
            "ВР": "GK",
            "ЗЩ": "DEF",
            "ПЗ": "MID",
            "НП": "FWD",
          };

          const LIMITS: Record<"GK" | "DEF" | "MID" | "FWD", { min: number; max: number }> = {
            GK: { min: 1, max: 1 },
            DEF: { min: 3, max: 5 },
            MID: { min: 2, max: 5 },
            FWD: { min: 1, max: 3 },
          };

          const baseCounts = {
            GK: mainSquadPlayers.filter((p) => p.position === "ВР").length,
            DEF: mainSquadPlayers.filter((p) => p.position === "ЗЩ").length,
            MID: mainSquadPlayers.filter((p) => p.position === "ПЗ").length,
            FWD: mainSquadPlayers.filter((p) => p.position === "НП").length,
          };

          const getReason = (fieldOutPos: string, fieldInPos: string): string => {
            const outKey = POSITION_KEY[fieldOutPos];
            const inKey = POSITION_KEY[fieldInPos];
            if (!outKey || !inKey) return "Замена невозможна";

            const next = { ...baseCounts } as typeof baseCounts;
            next[outKey] -= 1;
            next[inKey] += 1;

            const belowMin = (key: keyof typeof next) => next[key] < LIMITS[key].min;
            const aboveMax = (key: keyof typeof next) => next[key] > LIMITS[key].max;

            const minMessage = (key: keyof typeof next) => {
              switch (key) {
                case "GK":
                  return "На поле должен быть хотя бы 1 вратарь";
                case "DEF":
                  return "На поле должно быть минимум 3 защитника";
                case "MID":
                  return "На поле должно быть минимум 2 полузащитника";
                case "FWD":
                  return "На поле должно быть минимум 1 нападающий";
              }
            };

            const maxMessage = (key: keyof typeof next) => {
              switch (key) {
                case "GK":
                  return "На поле не может быть 2 вратаря";
                case "DEF":
                  return "На поле не может быть более 5 защитников";
                case "MID":
                  return "На поле не может быть более 5 полузащитников";
                case "FWD":
                  return "На поле не может быть более 3 нападающих";
              }
            };

            // Priority 1: user removes someone → don't break minimums (especially for removed position)
            if (belowMin(outKey)) return minMessage(outKey);
            if (belowMin("GK")) return minMessage("GK");
            if (belowMin("DEF")) return minMessage("DEF");
            if (belowMin("MID")) return minMessage("MID");
            if (belowMin("FWD")) return minMessage("FWD");

            // Priority 2: user adds someone → don't exceed maximums (especially for incoming position)
            if (aboveMax(inKey)) return maxMessage(inKey);
            if (aboveMax("GK")) return maxMessage("GK");
            if (aboveMax("DEF")) return maxMessage("DEF");
            if (aboveMax("MID")) return maxMessage("MID");
            if (aboveMax("FWD")) return maxMessage("FWD");

            return "Замена невозможна - нет подходящей схемы";
          };

          for (const t of swapTargets) {
            if (validIds.has(t.id)) continue;

            const fieldOutPos = currentPlayer.isOnBench ? t.position : currentPlayer.position;
            const fieldInPos = currentPlayer.isOnBench ? currentPlayer.position : t.position;
            swapInvalidMessages[t.id] = getReason(fieldOutPos, fieldInPos);
          }
        }

        return (
          <PlayerCard
            player={currentPlayer || null}
            isOpen={selectedPlayerForCard !== null}
            onClose={() => setSelectedPlayerForCard(null)}
            isSelected={true}
            onToggleSelect={() => {}}
            isCaptain={captain === selectedPlayerForCard}
            isViceCaptain={viceCaptain === selectedPlayerForCard}
            onSetCaptain={setCaptain}
            onSetViceCaptain={setViceCaptain}
            variant="management"
            hidePointsBreakdown={true}
            swapablePlayers={swapTargets}
            validSwapIds={validIds}
            swapInvalidMessages={swapInvalidMessages}
            onSwapSelect={(targetPlayerId) => {
              handleSwapConfirm(selectedPlayerForCard, targetPlayerId);
              setSelectedPlayerForCard(null);
            }}
            onSwap={(playerId) => {
              setSelectedPlayerForCard(null);
              handlePlayerSwap(playerId);
            }}
          />
        );
      })()}


      {/* Boost Drawer */}
      <BoostDrawer
        chip={selectedBoostChip ? specialChips.find((c) => c.id === selectedBoostChip.id) || null : null}
        isOpen={isBoostDrawerOpen}
        onClose={() => setIsBoostDrawerOpen(false)}
        onApply={applyBoost}
        onCancel={cancelBoost}
        onRemove={removeBoost}
        currentTour={nextTour || currentTour}
        isRemoving={isRemovingBoost}
        hasActiveBoostInTour={specialChips.some((c) => c.status === "pending") || otherPageBoostActive}
      />

      {/* Confirm Boost Drawer */}
      <ConfirmBoostDrawer
        isOpen={isConfirmBoostOpen}
        onClose={() => setIsConfirmBoostOpen(false)}
        pendingBoost={specialChips.find((c) => c.status === "pending") || null}
        squadId={squad?.id || null}
        tourId={boostTourId}
        onConfirm={() => {
          setIsConfirmBoostOpen(false);
          navigate("/league");
        }}
        onChangeBoost={() => {
          setIsConfirmBoostOpen(false);
        }}
      />

      {/* Developer Mode: Reset Boosts Button */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            resetAllBoosts();
            toast.success("Все бусты сброшены!");
            window.location.reload();
          }}
          className="fixed bottom-24 right-4 z-50 bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-70 hover:opacity-100 transition-opacity"
        >
          🔧 Сброс бустов
        </button>
      )}

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

export default TeamManagement;
