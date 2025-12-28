import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { getSavedTeam, getMainSquadAndBench, PlayerData, saveTeamTransfers } from "@/lib/teamData";
import { clubLogos } from "@/lib/clubLogos";
import FormationFieldTransfers from "@/components/FormationFieldTransfers";
import PlayerCard from "@/components/PlayerCard";
import BoostDrawer from "@/components/BoostDrawer";
import BuyPlayerDrawer from "@/components/BuyPlayerDrawer";
import ConfirmTransfersDrawer from "@/components/ConfirmTransfersDrawer";
import { getBoostState, setPendingBoost, clearPendingBoost, hasAnyPendingBoost, TRANSFER_BOOSTS, saveGoldenTourBackup, getGoldenTourBackup, clearGoldenTourBackup } from "@/lib/boostState";
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
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";
import Breadcrumbs from "@/components/Breadcrumbs";

import icon2x from "@/assets/icon-2x.png";
import iconStar from "@/assets/icon-star.png";
import iconFree from "@/assets/icon-free.png";
import iconBenchPlus from "@/assets/icon-bench-plus.png";
import icon3x from "@/assets/icon-3x.png";

// Club icons mapping - use clubLogos as primary, fall back to defaults
const clubIcons: Record<string, string> = {
  ...clubLogos,
  "Шахтер": clubLogo,
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
  "ВР": 2,
  "ЗЩ": 5,
  "ПЗ": 5,
  "НП": 3,
};

const Transfers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [buyPlayerForCard, setBuyPlayerForCard] = useState<PlayerData | null>(null);
  const [teamName] = useState(() => getSavedTeam().teamName);
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(() => {
    // Load initial state from localStorage
    const boostState = getBoostState();
    return initialChips.map(chip => {
      if (boostState.pendingBoostId === chip.id) {
        return { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" };
      }
      const usedBoost = boostState.usedBoosts.find(b => b.id === chip.id);
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
    
    // Listen for storage changes from other tabs/pages
    const handleStorageChange = () => checkOtherPageBoost();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const openBoostDrawer = (chip: BoostChip) => {
    // Check if boost is active on other page
    if (otherPageBoostActive) {
      toast.error("В этом туре уже активирован буст в разделе Управление командой");
      return;
    }
    setSelectedBoostChip(chip);
    setIsBoostDrawerOpen(true);
  };

  const applyBoost = (chipId: string) => {
    const hasPendingBoost = specialChips.some(chip => chip.status === "pending");
    const { pending, page } = hasAnyPendingBoost();
    
    if (hasPendingBoost || (pending && page !== "transfers")) {
      toast.error("В одном туре можно использовать только 1 буст");
      return;
    }
    
    // For Golden Tour boost, save the current squad state before making any changes
    if (chipId === "golden") {
      const mainSquad = players.slice(0, 11).map(p => ({
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
      const bench = players.slice(11, 15).map(p => ({
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
    setSpecialChips(prev => 
      prev.map(chip => 
        chip.id === chipId ? { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" } : chip
      )
    );
  };

  const cancelBoost = (chipId: string) => {
    clearPendingBoost();
    setSpecialChips(prev => 
      prev.map(chip => 
        chip.id === chipId ? { ...chip, status: "available" as BoostStatus, sublabel: "Подробнее" } : chip
      )
    );
  };

  // Deadline countdown
  const deadlineDate = new Date("2025-12-14T19:00:00");
  const tournamentStartDate = new Date("2025-12-04T19:00:00");
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
    // Merge all players and reassign slot indices based on position
    const allLoadedPlayers = [...mainSquad, ...bench];
    
    // Reassign slot indices for the new formation (2-5-5-3)
    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
    const reassignedPlayers = allLoadedPlayers.map(p => {
      const slotIndex = positionCounters[p.position] || 0;
      positionCounters[p.position] = slotIndex + 1;
      return { ...p, slotIndex };
    });
    
    if (reassignedPlayers.length > 0) {
      setPlayers(reassignedPlayers);
      initialStateRef.current = JSON.stringify(reassignedPlayers.map(p => p.id).sort());
      initialPlayersRef.current = reassignedPlayers;
    }
  }, []);

  // Check for changes whenever players change
  useEffect(() => {
    const currentState = JSON.stringify(players.map(p => p.id).sort());
    if (initialStateRef.current && currentState !== initialStateRef.current) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [players]);

  // Handle browser beforeunload (tab close, refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Buy player drawer state
  const [buyDrawerOpen, setBuyDrawerOpen] = useState(false);
  const [buyPositionFilter, setBuyPositionFilter] = useState<string | null>(null);

  // Calculate removed players with their original slot info for visual hints
  const getRemovedPlayersInfo = () => {
    const currentPlayerIds = new Set(players.map(p => p.id));
    return initialPlayersRef.current
      .filter(p => !currentPlayerIds.has(p.id))
      .map(p => ({
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

  // Calculate transfer records for confirmation
  const getTransferRecords = () => {
    const currentPlayerIds = new Set(players.map(p => p.id));
    const initialPlayerIds = new Set(initialPlayersRef.current.map(p => p.id));
    
    const playersOut = initialPlayersRef.current.filter(p => !currentPlayerIds.has(p.id));
    const playersIn = players.filter(p => !initialPlayerIds.has(p.id));
    
    const transfers: Array<{
      type: "swap" | "buy" | "sell";
      playerOut?: { id: number; name: string; points: number };
      playerIn?: { id: number; name: string; points: number };
    }> = [];
    
    const maxPairs = Math.max(playersOut.length, playersIn.length);
    for (let i = 0; i < maxPairs; i++) {
      const pOut = playersOut[i];
      const pIn = playersIn[i];
      
      transfers.push({
        type: pOut && pIn ? "swap" : (pOut ? "sell" : "buy"),
        playerOut: pOut ? { id: pOut.id, name: pOut.name, points: pOut.points } : undefined,
        playerIn: pIn ? { id: pIn.id, name: pIn.name, points: pIn.points } : undefined,
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
    // Save changes to localStorage - split into mainSquad (11) and bench (4)
    const mainSquad = players.slice(0, 11);
    const bench = players.slice(11, 15);
    saveTeamTransfers(mainSquad, bench, captain, viceCaptain);
    initialStateRef.current = JSON.stringify(players.map(p => p.id).sort());
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

  // Calculate budget info - round to 1 decimal to avoid floating point issues
  const totalPrice = Math.round(players.reduce((sum, p) => sum + (p.price || 0), 0) * 10) / 10;
  const budget = Math.round((100 - totalPrice) * 10) / 10;
  const freeTransfers = 5;
  const MAX_PLAYERS_PER_CLUB = 3;
  const MAX_SQUAD_SIZE = 15;

  const getPlayersCountByClub = (clubName: string) => {
    return players.filter(p => p.team === clubName).length;
  };

  const handleBuyPlayer = (player: PlayerData, targetPosition?: string, _isOnBench?: boolean, targetSlotIndex?: number) => {
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

    // If specific slot is provided (from clicking empty slot)
    if (targetPosition !== undefined && targetSlotIndex !== undefined) {
      const newPlayer: PlayerDataExt = {
        ...player,
        slotIndex: targetSlotIndex,
      };
      setPlayers(prev => [...prev, newPlayer]);
      setBuyDrawerOpen(false);
      setBuyPositionFilter(null);
      toast.success(`${player.name} добавлен в команду`);
      return;
    }

    // Find empty slot for this position
    const maxSlots = TRANSFERS_FORMATION_SLOTS[player.position] || 0;
    const occupiedSlots = players
      .filter(p => p.position === player.position)
      .map(p => p.slotIndex);
    
    for (let i = 0; i < maxSlots; i++) {
      if (!occupiedSlots.includes(i)) {
        const newPlayer: PlayerDataExt = {
          ...player,
          slotIndex: i,
        };
        setPlayers(prev => [...prev, newPlayer]);
        setBuyDrawerOpen(false);
        setBuyPositionFilter(null);
        toast.success(`${player.name} добавлен в команду`);
        return;
      }
    }

    toast.error(`Нет свободных позиций для ${player.position}`);
  };

  // Group players by position for list view
  const playersByPosition = {
    "ВР": players.filter(p => p.position === "ВР"),
    "ЗЩ": players.filter(p => p.position === "ЗЩ"),
    "ПЗ": players.filter(p => p.position === "ПЗ"),
    "НП": players.filter(p => p.position === "НП"),
  };

  const positionLabels: Record<string, string> = {
    "ВР": "Вратарь",
    "ЗЩ": "Защита",
    "ПЗ": "Полузащита",
    "НП": "Нападение",
  };

  const handleSellPlayer = (playerId: number) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setSelectedPlayerForCard(null);
  };

  const handleEmptySlotClick = (position: string, slotIndex: number) => {
    setBuyPositionFilter(position);
    setBuyDrawerOpen(true);
  };

  const renderListSection = (position: string, positionPlayers: PlayerDataExt[]) => {
    const slotCount = TRANSFERS_FORMATION_SLOTS[position] || 0;
    
    // Create array of slots (filled and empty)
    const slots: (PlayerDataExt | { isEmpty: true; slotIndex: number })[] = [];
    for (let i = 0; i < slotCount; i++) {
      const player = positionPlayers.find(p => p.slotIndex === i);
      if (player) {
        slots.push(player);
      } else {
        slots.push({ isEmpty: true, slotIndex: i });
      }
    }

    return (
      <div className="mb-6" key={position}>
        {/* Position header */}
        <h3 className="text-primary font-medium mb-2">{positionLabels[position]}</h3>
        
        {/* Column headers */}
        <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
          <span className="flex-1">Игрок</span>
          <span className="w-12 text-center">Очки</span>
          <span className="w-10 text-center">Цена</span>
          <span className="w-10"></span>
        </div>

        {/* Players */}
        <div className="space-y-2">
          {slots.map((slot, idx) => {
            if ('isEmpty' in slot) {
              return (
                <div
                  key={`empty-${position}-${slot.slotIndex}`}
                  className="bg-card/50 rounded-full px-4 py-2 flex items-center cursor-pointer hover:bg-card/70 transition-colors"
                  onClick={() => handleEmptySlotClick(position, slot.slotIndex)}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground">Пустой слот</span>
                    <span className="text-muted-foreground text-xs">{position}</span>
                  </div>
                  <span className="w-12 flex-shrink-0"></span>
                  <span className="w-10 flex-shrink-0"></span>
                  <button
                    className="w-8 h-8 ml-2 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              );
            }

            const player = slot;
            const clubLogo = clubIcons[player.team];
            return (
              <div
                key={player.id}
                className="bg-card rounded-full px-4 py-2 flex items-center"
              >
                {/* Club logo + Player name + position */}
                <div 
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                  onClick={() => setSelectedPlayerForCard(player.id)}
                >
                  {clubLogo && (
                    <img src={clubLogo} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                  )}
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                </div>
                
                {/* Points */}
                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{player.points}</span>
                
                {/* Price */}
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price}</span>
                
                {/* Remove button */}
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
      <SportHeader 
        backTo="/league" 
        hasUnsavedChanges={hasChanges}
        onSaveChanges={handleSaveAndExit}
        onDiscardChanges={handleExitWithoutSaving}
      />

      {/* Breadcrumb */}
      <div className="px-4 mt-4">
        <Breadcrumbs
          items={[
            { label: "Футбол", path: "/" },
            { label: "Беларусь", path: "/" },
            { label: "Лига", path: "/league" },
            { label: "Трансферы" },
          ]}
        />
      </div>

      {/* Team Header */}
      <div className="px-4 mt-4">
        
        <div className="flex items-center justify-center mb-2">
          <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дедлайн: <span className="text-foreground">04.04 в 19.00</span></span>
          <span className="text-foreground">
            {timeLeft.days} дня {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
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
                className={`flex flex-col items-center justify-center py-4 rounded-2xl cursor-pointer transition-all ${
                  isBlocked
                    ? "bg-card/30 opacity-50"
                    : chip.status === "pending"
                      ? "bg-card border-2 border-primary hover:bg-card/80"
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
                <span className={`text-[10px] font-medium text-center leading-tight ${
                  isBlocked ? "text-muted-foreground" : "text-foreground"
                }`}>{chip.label}</span>
                <span className={`text-[8px] ${
                  isBlocked
                    ? "text-muted-foreground"
                    : chip.status === "pending" 
                      ? "text-primary" 
                      : chip.status === "used" 
                        ? "text-muted-foreground" 
                        : "text-primary"
                }`}>
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
        <div className="flex bg-secondary rounded-full p-1">
          <Button
            onClick={() => setActiveTab("formation")}
            className={`flex-1 rounded-full ${
              activeTab === "formation"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Расстановка
          </Button>
          <Button
            onClick={() => setActiveTab("list")}
            className={`flex-1 rounded-full ${
              activeTab === "list"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Список
          </Button>
        </div>
      </div>

      {/* Main content */}
      {activeTab === "formation" ? (
        <div className="mt-4">
          <FormationFieldTransfers 
            players={players}
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onRemovePlayer={handleSellPlayer}
            onEmptySlotClick={handleEmptySlotClick}
            captain={captain}
            viceCaptain={viceCaptain}
            removedPlayers={removedPlayersInfo}
          />
        </div>
      ) : (
        <div className="px-4 mt-6 pb-36">
          <h2 className="text-foreground text-xl font-bold mb-4">Состав команды</h2>
          
          {Object.entries(playersByPosition).map(([position, positionPlayers]) => 
            renderListSection(position, positionPlayers)
          )}
        </div>
      )}

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-50">
        {/* Reset squad button - appears when there are changes */}
        {hasChanges && (
          <Button
            onClick={handleResetSquad}
            variant="outline"
            className="w-full rounded-full h-10 border-border text-muted-foreground hover:text-foreground mb-3"
          >
            Вернуть исходный состав
          </Button>
        )}
        
        {/* Stats Row */}
        <div className="flex justify-between mb-3">
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Бесплатные трансферы</span>
            <span className="text-foreground text-2xl font-bold">{freeTransfers}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Бюджет</span>
            <span className="text-foreground text-2xl font-bold">{budget.toFixed(0)}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Цена</span>
            <span className="text-foreground text-2xl font-bold">{totalPrice.toFixed(0)}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              setBuyPositionFilter(null);
              setBuyDrawerOpen(true);
            }}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-full h-12"
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
            className={`flex-1 rounded-full h-12 font-semibold transition-all ${
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
          onClose={() => {
            setBuyPlayerForCard(null);
            setBuyDrawerOpen(true);
          }}
          variant="buy"
          hidePointsBreakdown
          canBuy={
            buyPlayerForCard.price <= budget + 0.001 &&
            getPlayersCountByClub(buyPlayerForCard.team) < MAX_PLAYERS_PER_CLUB
          }
          onBuy={(playerId) => {
            if (buyPlayerForCard && buyPlayerForCard.id === playerId) {
              handleBuyPlayer(buyPlayerForCard);
            }
            setBuyPlayerForCard(null);
          }}
        />
      )}

      {/* Player Card Drawer */}
      {selectedPlayerForCard !== null && (
        <PlayerCard
          player={players.find(p => p.id === selectedPlayerForCard) || null}
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
        chip={selectedBoostChip ? specialChips.find(c => c.id === selectedBoostChip.id) || null : null}
        isOpen={isBoostDrawerOpen}
        onClose={() => setIsBoostDrawerOpen(false)}
        onApply={applyBoost}
        onCancel={cancelBoost}
        currentTour={currentTour}
      />

      {/* Buy Player Drawer */}
      <BuyPlayerDrawer
        isOpen={buyDrawerOpen}
        onClose={() => {
          setBuyDrawerOpen(false);
          setBuyPositionFilter(null);
        }}
        onBuyPlayer={handleBuyPlayer}
        onPlayerClick={(player) => {
          setBuyPlayerForCard(player);
          setBuyDrawerOpen(false);
        }}
        currentTeamPlayerIds={players.map(p => p.id)}
        currentBudget={budget}
        getPlayersCountByClub={getPlayersCountByClub}
        maxPlayersPerClub={MAX_PLAYERS_PER_CLUB}
        initialPositionFilter={buyPositionFilter}
      />

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Несохранённые изменения</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              У вас есть несохранённые изменения в составе команды. Хотите сохранить их перед выходом?
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
          saveTeamTransfers(mainSquad, bench, captain, viceCaptain);
          initialStateRef.current = JSON.stringify(players.map(p => p.id).sort());
          initialPlayersRef.current = [...players];
          setHasChanges(false);
          setShowConfirmDrawer(false);
          toast.success("Изменения сохранены");
          navigate("/league");
        }}
        transfers={getTransferRecords()}
        freeTransfersUsed={Math.min(getTransferRecords().length, freeTransfers)}
        additionalTransfersUsed={Math.max(0, getTransferRecords().length - freeTransfers)}
        remainingBudget={Math.round(budget)}
        boosts={allBoostsTemplate.map(boost => {
          const currentChip = specialChips.find(c => c.id === boost.id);
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
