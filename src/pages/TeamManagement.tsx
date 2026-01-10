import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ArrowLeftRight, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useDeadline } from "@/hooks/useDeadline";
import { useTeams } from "@/hooks/useTeams";
import { useSquadData, EnrichedPlayer } from "@/hooks/useSquadData";
import { squadsApi, UpdateSquadPlayersRequest } from "@/lib/api";
import SportHeader from "@/components/SportHeader";
import { PlayerData } from "@/lib/teamData";
import { getValidSwapOptions, detectFormation, FORMATION_LABELS, FormationKey } from "@/lib/formationUtils";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import PlayerCard from "@/components/PlayerCard";
import BoostDrawer from "@/components/BoostDrawer";
import ConfirmBoostDrawer from "@/components/ConfirmBoostDrawer";
import {
  getBoostState,
  setPendingBoost,
  clearPendingBoost,
  hasAnyPendingBoost,
  TEAM_MANAGEMENT_BOOSTS,
} from "@/lib/boostState";
import { clubLogos } from "@/lib/clubLogos";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";


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
}

const TeamManagement = () => {
  const navigate = useNavigate();
  const leagueId = getLeagueId();
  
  // Load squad data from API
  const { squad, mainPlayers: apiMainPlayers, benchPlayers: apiBenchPlayers, currentTour, isLoading, error } = useSquadData(leagueId);
  
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [selectedFormation, setSelectedFormation] = useState("1-4-4-2");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  
  // Debug mode states
  const [showDebugPreview, setShowDebugPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(() => {
    // Load initial state from localStorage
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
      const converted = apiMainPlayers.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team_name,
        position: p.position,
        price: p.price,
        points: p.points,
        slotIndex: p.slotIndex,
        isCaptain: squad?.captain_id === p.id,
        isViceCaptain: squad?.vice_captain_id === p.id,
        isOnBench: false,
      }));
      setMainSquadPlayers(converted);
    }
  }, [apiMainPlayers, squad?.captain_id, squad?.vice_captain_id]);

  useEffect(() => {
    if (apiBenchPlayers.length > 0) {
      const converted = apiBenchPlayers.map(p => ({
        id: p.id,
        name: p.name,
        team: p.team_name,
        position: p.position,
        price: p.price,
        points: p.points,
        slotIndex: p.slotIndex,
        isOnBench: true,
      }));
      setBenchPlayersExt(converted);
    }
  }, [apiBenchPlayers]);

  // Initialize captain/vice-captain from squad data
  useEffect(() => {
    if (squad) {
      if (squad.captain_id) {
        setCaptain(squad.captain_id);
      } else if (mainSquadPlayers.length > 0) {
        // Auto-assign captain to first player if not set
        const sortedByPrice = [...mainSquadPlayers].sort((a, b) => (b.price || 0) - (a.price || 0));
        setCaptain(sortedByPrice[0]?.id || null);
      }
      
      if (squad.vice_captain_id) {
        setViceCaptain(squad.vice_captain_id);
      } else if (mainSquadPlayers.length > 1) {
        // Auto-assign vice-captain
        const sortedByPrice = [...mainSquadPlayers].sort((a, b) => (b.price || 0) - (a.price || 0));
        const viceCaptainCandidate = sortedByPrice.find(p => p.id !== captain);
        setViceCaptain(viceCaptainCandidate?.id || null);
      }
    }
  }, [squad, mainSquadPlayers.length]);

  // Build request body for API
  const buildRequestBody = (): UpdateSquadPlayersRequest => {
    return {
      captain_id: captain,
      vice_captain_id: viceCaptain,
      main_player_ids: mainSquadPlayers.map(p => p.id),
      bench_player_ids: benchPlayersExt.map(p => p.id),
    };
  };

  // Handle save - show debug preview first
  const handleSaveClick = () => {
    const pendingBoost = specialChips.find((c) => c.status === "pending");
    if (pendingBoost) {
      setIsConfirmBoostOpen(true);
    } else {
      setShowDebugPreview(true);
    }
  };

  // Confirm and send request
  const handleConfirmSave = async () => {
    if (!squad) return;
    
    setIsSaving(true);
    try {
      const requestBody = buildRequestBody();
      const result = await squadsApi.updatePlayers(squad.id, requestBody);
      
      if (result.success) {
        toast.success("Изменения сохранены");
        setShowDebugPreview(false);
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

    // Only allow swaps between main and bench with same position
    if (fromIsMain === toIsMain) {
      if (fromIsMain) {
        toast.info("Игроки в основном составе не меняются местами");
      } else {
        // Both on bench - swap bench order
        const fromIdx = benchPlayersExt.findIndex(p => p.id === fromPlayerId);
        const toIdx = benchPlayersExt.findIndex(p => p.id === toPlayerId);
        if (fromIdx !== -1 && toIdx !== -1) {
          const newBench = [...benchPlayersExt];
          [newBench[fromIdx], newBench[toIdx]] = [newBench[toIdx], newBench[fromIdx]];
          setBenchPlayersExt(newBench.map((p, i) => ({ ...p, slotIndex: i })));
          toast.success(`${fromPlayer.name} ↔ ${toPlayer.name}`);
        }
      }
      exitSwapMode();
      return;
    }

    // One main, one bench - check same position
    const mainPlayer = fromIsMain ? fromPlayer : toPlayer;
    const benchPlayer = fromIsMain ? toPlayer : fromPlayer;
    
    if (mainPlayer.position !== benchPlayer.position) {
      toast.error("Можно менять только игроков с одинаковой позицией");
      exitSwapMode();
      return;
    }
    
    // Swap players between main and bench (captain/vice-captain roles stay with the player)
    const newMain = mainSquadPlayers
      .filter(p => p.id !== mainPlayer.id)
      .concat({ ...benchPlayer, isOnBench: false });
    
    const newBench = benchPlayersExt
      .filter(p => p.id !== benchPlayer.id)
      .concat({ ...mainPlayer, isOnBench: true });
    
    // Reassign slot indices
    setMainSquadPlayers(reassignSlotIndices(newMain));
    setBenchPlayersExt(newBench.map((p, i) => ({ ...p, slotIndex: i })));
    
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
          const clubLogo = clubLogos[player.team] || clubIcons[player.team];
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
                {clubLogo && <img src={clubLogo} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />}
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
            return (
              <div
                key={chip.id}
                onClick={() => openBoostDrawer(chip)}
                className={`flex flex-col items-center justify-center py-4 rounded-xl cursor-pointer transition-all ${
                  isBlocked
                    ? "bg-card/30 opacity-50"
                    : chip.status === "pending"
                      ? "bg-card border-2 border-primary hover:bg-card/80"
                      : chip.status === "used"
                        ? "bg-card/50"
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
        <div className="mt-4">
          <FormationFieldManagement
            mainSquadPlayers={mainSquadPlayers}
            benchPlayers={benchPlayersExt}
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
            showPrice={false}
            viceCaptain={viceCaptain}
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
              const clubLogo = clubLogos[player.team] || clubIcons[player.team];
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
                    {clubLogo && (
                      <img src={clubLogo} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                    )}
                    <span className="text-foreground font-medium truncate">{player.name}</span>
                    <span className="text-muted-foreground text-xs">{player.position}</span>
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
      {!swapModePlayer && !showDebugPreview && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 z-50">
          <Button
            onClick={handleSaveClick}
            className="w-full bg-[#A8FF00] hover:bg-[#98EE00] text-black font-semibold rounded-lg h-12"
          >
            Сохранить
          </Button>
        </div>
      )}

      {/* Debug Preview Modal */}
      {showDebugPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">DEBUG: Предпросмотр запроса</h2>
              <p className="text-sm text-muted-foreground">PUT /api/squads/update_players/{squad?.id}</p>
            </div>
            <div className="p-4">
              <pre className="bg-muted p-4 rounded-lg text-sm text-foreground overflow-auto font-mono whitespace-pre-wrap">
                {JSON.stringify(buildRequestBody(), null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDebugPreview(false)}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button
                className="flex-1 bg-[#A8FF00] hover:bg-[#98EE00] text-black"
                onClick={handleConfirmSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Подтвердить
              </Button>
            </div>
          </div>
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
        currentTour={currentTour}
      />

      {/* Confirm Boost Drawer */}
      <ConfirmBoostDrawer
        isOpen={isConfirmBoostOpen}
        onClose={() => setIsConfirmBoostOpen(false)}
        pendingBoost={specialChips.find((c) => c.status === "pending") || null}
        onConfirm={() => {
          setIsConfirmBoostOpen(false);
          toast.success("Изменения сохранены");
          navigate("/league");
        }}
        onChangeBoost={() => {
          setIsConfirmBoostOpen(false);
        }}
      />
    </div>
  );
};

export default TeamManagement;
