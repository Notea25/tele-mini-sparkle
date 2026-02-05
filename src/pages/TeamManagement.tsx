import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ArrowLeftRight, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PointsColumnHeader } from "@/components/PointsColumnHeader";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDeadline } from "@/hooks/useDeadline";
import { useTeams } from "@/hooks/useTeams";
import { useSquadData, EnrichedPlayer } from "@/hooks/useSquadData";
import { squadsApi, UpdateSquadPlayersRequest, boostsApi } from "@/lib/api";
import SportHeader from "@/components/SportHeader";
import { PlayerData } from "@/lib/teamData";
import { getValidSwapOptions, detectFormation, FORMATION_LABELS, FormationKey, isSwapValid } from "@/lib/formationUtils";
import FormationField from "@/components/FormationField";
import PlayerCard from "@/components/PlayerCard";
import BoostDrawer from "@/components/BoostDrawer";
import {
  resetAllBoosts,
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
import { BoostSection, TEAM_MANAGEMENT_BOOSTS, BoostId, BOOST_ID_TO_TYPE } from "@/constants/boosts";
import { mapAvailableBoostsToView, getActiveNextTourBoostId, buildBoostChipStateForPage, BoostAvailabilityMap } from "@/lib/boostViewModel";
import { PositionCode, getPositionLabel } from "@/constants/positions";
import { isValidFormation } from "@/constants/formations";
import type { ApplyBoostRequest } from "@/lib/api";

// Special chips data with icons - only team management boosts
const initialChips: BoostChip[] = [
  { id: "bench", icon: boostBench, label: "Скамейка +", sublabel: "Подробнее", status: "available" },
  { id: "captain3x", icon: boostCaptain3x, label: "3x Капитан", sublabel: "Подробнее", status: "available" },
  { id: "double", icon: boostDouble, label: "Двойная сила", sublabel: "Подробнее", status: "available" },
];

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
  hasLeftLeague?: boolean;
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

  // Track original state for detecting unsaved changes
  const [originalState, setOriginalState] = useState<{
    mainPlayerIds: number[];
    benchPlayerIds: number[];
    captain: number | null;
    viceCaptain: number | null;
  } | null>(null);
  const leagueId = getLeagueId();
  
  // Load squad data from API
  const { squad, squadTourData, mainPlayers: apiMainPlayers, benchPlayers: apiBenchPlayers, currentTour, nextTour, boostTourId, isLoading, error } = useSquadData(leagueId);
  
  // Fetch available boosts from API - всегда тянем свежие данные с бэка при заходе на страницу
  const { data: boostsResponse, isLoading: boostsLoading, refetch: refetchBoosts } = useQuery({
    queryKey: ['availableBoosts', squad?.id, boostTourId],
    queryFn: () =>
      squad && boostTourId
        ? boostsApi.getAvailable(squad.id, boostTourId)
        : Promise.resolve(null),
    enabled: !!squad?.id && !!boostTourId,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
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
  
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [selectedFormation, setSelectedFormation] = useState("1-4-4-2");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(() => initialChips);
  
  // Update specialChips when API data arrives
  useEffect(() => {
    if (!boostsLoading && boostsResponse?.success) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Boosts][TeamManagement] availableBoosts", {
          squadId: squad?.id,
          boostTourId,
          response: boostsResponse,
        });
      }

      setSpecialChips(
        buildBoostChipStateForPage({
          section: BoostSection.TEAM_MANAGEMENT,
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
  
  const [selectedBoostChip, setSelectedBoostChip] = useState<BoostChip | null>(null);
  const [isBoostDrawerOpen, setIsBoostDrawerOpen] = useState(false);
  const [otherPageBoostActive, setOtherPageBoostActive] = useState(false);

  // Check if boost is active on the other page (раздел "Трансферы")
  useEffect(() => {
    if (activeNextTourBoostId && !TEAM_MANAGEMENT_BOOSTS.includes(activeNextTourBoostId)) {
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

    const boostType = BOOST_ID_TO_TYPE[chipId as BoostId];
    if (!boostType) {
      toast.error("Неизвестный тип буста");
      return;
    }

    try {
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

      // Обновляем данные о доступности бустов и составе
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['availableBoosts', squad.id, boostTourId] }),
        queryClient.invalidateQueries({ queryKey: ['squad', squad.id] }),
        queryClient.invalidateQueries({ queryKey: ['squadTour', squad.id, currentTour ?? 0] }),
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка при применении буста");
    }
  };

  const cancelBoost = (_chipId: string) => {
    toast.error("Бусты нельзя отменить после активации");
  };

  // State for removing boost (кнопка "Отменить" для уже выбранного на тур буста)
  const [isRemovingBoost, setIsRemovingBoost] = useState(false);

  const removeBoost = (_chipId: string) => {
    toast.error("Бусты нельзя отменить после активации");
    setIsRemovingBoost(false);
  };
  // Deadline and teams using shared hooks
  const leagueIdStr = String(leagueId);
  const { deadlineDate, isLoading: deadlineLoading, timeLeft, formattedDeadline } = useDeadline(leagueIdStr);
  const { teams: apiTeams, isLoading: isLoadingTeams } = useTeams(leagueIdStr);

  // Local state for players (editable)
  const [mainSquadPlayers, setMainSquadPlayers] = useState<PlayerDataExt[]>([]);
  const [benchPlayersExt, setBenchPlayersExt] = useState<PlayerDataExt[]>([]);

  // If user switches league/squad, drop local edits and re-hydrate from API
  useEffect(() => {
    setMainSquadPlayers([]);
    setBenchPlayersExt([]);
    setOriginalState(null);
  }, [leagueId, squad?.id]);

  // Initialize players from API data
  useEffect(() => {
    // IMPORTANT: Do not overwrite local ordering after user has started editing.
    // Backend may return the same players in a different order (slotIndex recalculation),
    // which would visually "shuffle" players right after saving.
    const shouldHydrateFromApi = mainSquadPlayers.length === 0 && benchPlayersExt.length === 0;
    if (!shouldHydrateFromApi) return;

    if (apiMainPlayers.length > 0 && apiBenchPlayers.length > 0) {
      // Convert main players
      const convertedMain = apiMainPlayers.map(p => {
        return {
          id: p.id,
          name: p.name,
          name_rus: p.name_rus,
          team: p.team_name,
          team_rus: p.team_name_rus,
          team_logo: p.team_logo,
          photo: p.photo,
          position: p.position,
          price: p.price,
          points: p.points,
          total_points: p.total_points,
          slotIndex: p.slotIndex,
          isCaptain: squadTourData?.captain_id === p.id,
          isViceCaptain: squadTourData?.vice_captain_id === p.id,
          isOnBench: false,
          hasRedCard: p.hasRedCard,
          isInjured: p.isInjured,
          hasLeftLeague: p.hasLeftLeague,
          // Используем уже обогащённые поля из useSquadData
          nextOpponent: p.nextOpponent || "",
          nextOpponentHome: p.nextOpponentHome ?? false,
        };
      });
      setMainSquadPlayers(convertedMain);
      
      // Convert bench players
      const convertedBench = apiBenchPlayers.map(p => {
        return {
          id: p.id,
          name: p.name,
          team: p.team_name,
          team_logo: p.team_logo,
          position: p.position,
          price: p.price,
          points: p.points,
          total_points: p.total_points,
          slotIndex: p.slotIndex,
          isOnBench: true,
          hasRedCard: p.hasRedCard,
          isInjured: p.isInjured,
          hasLeftLeague: p.hasLeftLeague,
          // Используем уже обогащённые поля из useSquadData
          nextOpponent: p.nextOpponent || "",
          nextOpponentHome: p.nextOpponentHome ?? false,
        };
      });
      
      // Try to restore bench order from localStorage (workaround for backend not preserving order)
      let orderedBench = convertedBench;
      if (squad?.id) {
        const benchOrderKey = `benchOrder_${squad.id}`;
        const savedOrder = localStorage.getItem(benchOrderKey);
        if (savedOrder) {
          try {
            const savedIds: number[] = JSON.parse(savedOrder);
            // Reorder bench players according to saved order
            const benchMap = new Map(convertedBench.map(p => [p.id, p]));
            const reorderedBench: typeof convertedBench = [];
            
            // First, add players in saved order (if they still exist)
            for (const id of savedIds) {
              const player = benchMap.get(id);
              if (player) {
                reorderedBench.push(player);
                benchMap.delete(id);
              }
            }
            // Then add any remaining players (new players not in saved order)
            benchMap.forEach(player => reorderedBench.push(player));
            
            if (reorderedBench.length === convertedBench.length) {
              orderedBench = reorderedBench;
            }
          } catch {
            // Invalid saved order, use default
          }
        }
      }
      
      // Ensure goalkeeper is always first on bench
      const sortedBench = ensureGoalkeeperFirst(orderedBench as PlayerDataExt[]);
      const finalBench = sortedBench.map((p, i) => ({ ...p, slotIndex: i }));
      setBenchPlayersExt(finalBench);
      
      // Initialize original state with the SORTED order (after ensureGoalkeeperFirst)
      // This ensures originalState matches what we actually display
      if (!originalState) {
        setOriginalState({
          mainPlayerIds: convertedMain.map(p => p.id),
          benchPlayerIds: finalBench.map(p => p.id),
          captain: squadTourData?.captain_id ?? null,
          viceCaptain: squadTourData?.vice_captain_id ?? null,
        });
      }
    }
  }, [apiMainPlayers, apiBenchPlayers, squadTourData?.captain_id, squadTourData?.vice_captain_id, originalState, mainSquadPlayers.length, benchPlayersExt.length, squad?.id]);

  // Initialize captain/vice-captain from squad data
  useEffect(() => {
    if (squadTourData && mainSquadPlayers.length > 0) {
      const sortedByPrice = [...mainSquadPlayers].sort((a, b) => (b.price || 0) - (a.price || 0));
      
      // Determine captain - from API or auto-assign most expensive
      let captainId = squadTourData.captain_id;
      if (!captainId || !mainSquadPlayers.some(p => p.id === captainId)) {
        captainId = sortedByPrice[0]?.id || null;
      }
      
      // Determine vice-captain - from API or auto-assign second most expensive (must be different from captain)
      let viceCaptainId = squadTourData.vice_captain_id;
      if (!viceCaptainId || !mainSquadPlayers.some(p => p.id === viceCaptainId) || viceCaptainId === captainId) {
        const viceCaptainCandidate = sortedByPrice.find(p => p.id !== captainId);
        viceCaptainId = viceCaptainCandidate?.id || null;
      }
      
      setCaptain(captainId);
      setViceCaptain(viceCaptainId);
    }
  }, [squadTourData, mainSquadPlayers]);

  // Build request body for API
  const buildRequestBody = (): UpdateSquadPlayersRequest => {
    return {
      captain_id: captain,
      vice_captain_id: viceCaptain,
      main_player_ids: mainSquadPlayers.map(p => p.id),
      bench_player_ids: benchPlayersExt.map(p => p.id),
    };
  };

  // Handle save - сохраняем только состав (бусты применяются отдельно при подтверждении в окне буста)
  const handleSaveClick = async () => {
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
    const isValid = isValidFormation(
      mainPositionCounts["ЗЩ"] || 0,
      mainPositionCounts["ПЗ"] || 0,
      mainPositionCounts["НП"] || 0,
    );
    
    if (!isValid) {
      const currentSetup = `${mainPositionCounts["ЗЩ"] || 0}-${mainPositionCounts["ПЗ"] || 0}-${mainPositionCounts["НП"] || 0}`;
      toast.error(`Недопустимая схема (${currentSetup}). Доступные: 4-3-3, 4-4-2, 3-5-2, 5-4-1, 3-4-3, 4-5-1`);
      return;
    }
    
    setIsSaving(true);
    try {
      const requestBody = buildRequestBody();
      // Use new squad_tours API endpoint
      const result = await squadsApi.replacePlayers(
        squad.id,
        {
          main_player_ids: requestBody.main_player_ids || [],
          bench_player_ids: requestBody.bench_player_ids || [],
        },
        requestBody.captain_id,
        requestBody.vice_captain_id
      );
      
      if (result.success) {
        // Save bench order to localStorage so it persists across page visits
        // This is a workaround for backend not preserving bench order
        const benchOrderKey = `benchOrder_${squad.id}`;
        localStorage.setItem(benchOrderKey, JSON.stringify(benchPlayersExt.map(p => p.id)));
        
        // Invalidate squad cache to ensure fresh data on other pages
        await queryClient.invalidateQueries({ queryKey: ['my-squads'] });

        // Update original state to reflect saved changes
        setOriginalState({
          mainPlayerIds: mainSquadPlayers.map(p => p.id),
          benchPlayerIds: benchPlayersExt.map(p => p.id),
          captain,
          viceCaptain,
        });

        toast.success("Изменения сохранены");
        // Остаёмся на странице "Моя команда" после сохранения
      } else {
        toast.error(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (err) {
      toast.error(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Detect if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!originalState) return false;
    
    const currentMainIds = mainSquadPlayers.map(p => p.id);
    const currentBenchIds = benchPlayersExt.map(p => p.id);
    
    // Check if arrays differ (including order for bench)
    const mainChanged = currentMainIds.length !== originalState.mainPlayerIds.length ||
      currentMainIds.some((id, i) => originalState.mainPlayerIds[i] !== id) ||
      originalState.mainPlayerIds.some((id, i) => currentMainIds[i] !== id);
    
    const benchChanged = currentBenchIds.length !== originalState.benchPlayerIds.length ||
      currentBenchIds.some((id, i) => originalState.benchPlayerIds[i] !== id);
    
    const captainChanged = captain !== originalState.captain;
    const viceCaptainChanged = viceCaptain !== originalState.viceCaptain;
    
    return mainChanged || benchChanged || captainChanged || viceCaptainChanged;
  }, [originalState, mainSquadPlayers, benchPlayersExt, captain, viceCaptain]);

  // Handle discard changes - revert to original state
  const handleDiscardChanges = useCallback(() => {
    if (!originalState) return;
    
    // Re-fetch squad data will reset the UI to server state
    queryClient.invalidateQueries({ queryKey: ['my-squads'] });

    // Drop local edits so hydration effect can apply fresh API state
    setMainSquadPlayers([]);
    setBenchPlayersExt([]);
    setOriginalState(null);
  }, [originalState, queryClient]);

  // Swap mode state (no drawer)
  const [swapModePlayer, setSwapModePlayer] = useState<PlayerDataExt | null>(null);
  const [validSwapTargetIds, setValidSwapTargetIds] = useState<Set<number>>(new Set());

  const allPlayers = [...mainSquadPlayers, ...benchPlayersExt];

  // Group players by position for list view
  const playersByPosition: Record<PositionCode, PlayerDataExt[]> = {
    [PositionCode.GK]: mainSquadPlayers.filter((p) => p.position === PositionCode.GK),
    [PositionCode.DEF]: mainSquadPlayers.filter((p) => p.position === PositionCode.DEF),
    [PositionCode.MID]: mainSquadPlayers.filter((p) => p.position === PositionCode.MID),
    [PositionCode.FWD]: mainSquadPlayers.filter((p) => p.position === PositionCode.FWD),
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

  const renderListSection = (position: PositionCode, players: PlayerDataExt[]) => (
    <div className="mb-6" key={position}>
      {/* Position header */}
      <h3 className="text-primary font-medium text-medium mb-2">{getPositionLabel(position, players.length)}</h3>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1 text-xs text-muted-foreground text-regular">
        <span className="flex-1">Игрок</span>
        <div className="w-12 flex justify-center"><PointsColumnHeader type="season" /></div>
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
                (player.total_points ?? player.points ?? 0) > 0 ? "text-success" : (player.total_points ?? player.points ?? 0) < 0 ? "text-destructive" : "text-foreground"
              }`}>
                {(player.total_points ?? player.points ?? 0) > 0 ? `+${player.total_points ?? player.points ?? 0}` : (player.total_points ?? player.points ?? 0)}
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
      <SportHeader
        hasUnsavedChanges={hasUnsavedChanges}
        onDiscardChanges={handleDiscardChanges}
      />

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
            // Заблокирован бустом в другом разделе ("Трансферы")
            const isBlockedByOtherSection = otherPageBoostActive && chip.status === "available";
            // Заблокирован другим бустом в этом же разделе для текущего тура (нет usedInTour)
            const isBlockedBySameSection = chip.status === "used" && !chip.usedInTour;
            const isBlocked = isBlockedByOtherSection || isBlockedBySameSection;
            const isUsedHistorical = chip.status === "used" && !!chip.usedInTour;

            return (
              <div
                key={chip.id}
                onClick={() => {
                  // Всегда открываем дроуер: и для активных, и для заблокированных, и для уже использованных бустов
                  openBoostDrawer(chip);
                }}
                className={`flex flex-col items-center justify-center py-4 rounded-xl transition-all cursor-pointer ${
                  chip.status === "pending"
                    ? "bg-card border-2 border-primary hover:bg-card/80"
                    : isBlocked || isUsedHistorical
                      ? "bg-card/30 opacity-50"
                      : "bg-card hover:bg-card/80"
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
                    isBlocked || chip.status === "used" ? "text-muted-foreground" : "text-foreground"
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
                        ? (chip.usedInTour
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
          <h2 className="text-foreground text-xl font-display mb-4">Основной состав</h2>

          {Object.entries(playersByPosition).map(([position, players]) => renderListSection(position as PositionCode, players))}

          {/* Bench */}
          <h2 className="text-foreground text-xl font-display mb-4 mt-8">Замены</h2>

          {/* Column headers */}
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
            <span className="flex-1">Игрок</span>
            <div className="w-12 flex justify-center"><PointsColumnHeader type="season" /></div>
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
                    (player.total_points ?? player.points ?? 0) > 0 ? "text-success" : (player.total_points ?? player.points ?? 0) < 0 ? "text-destructive" : "text-foreground"
                  }`}>
                    {(player.total_points ?? player.points ?? 0) > 0 ? `+${player.total_points ?? player.points ?? 0}` : (player.total_points ?? player.points ?? 0)}
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
        activeBoostChipId={activeNextTourBoostId}
        contextPage="team-management"
        blockedByOtherSection={otherPageBoostActive}
      />

      {/* Confirm Boost Drawer (не используется, подтверждение буста происходит внутри окна буста) */}

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
