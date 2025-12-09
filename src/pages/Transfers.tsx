import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useNavigate, useBlocker } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { getSavedTeam, getMainSquadAndBench, PlayerData } from "@/lib/teamData";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import PlayerCard from "@/components/PlayerCard";
import SwapPlayerDrawer from "@/components/SwapPlayerDrawer";
import BoostDrawer from "@/components/BoostDrawer";
import BuyPlayerDrawer from "@/components/BuyPlayerDrawer";
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
import homeIcon from "@/assets/home-icon.png";
import flameIcon from "@/assets/flame-icon.png";
import icon2x from "@/assets/icon-2x.png";
import iconStar from "@/assets/icon-star.png";
import iconFree from "@/assets/icon-free.png";

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

// Special chips for transfers - only 3 chips as per reference
const initialChips = [
  { id: "double", icon: icon2x, label: "Двойная сила", sublabel: "Подробнее", active: true },
  { id: "transfers", icon: iconStar, label: "Трансферы +", sublabel: "Подробнее", active: true },
  { id: "golden", icon: iconFree, label: "Золотой тур", sublabel: "Подробнее", active: true },
];

interface PlayerDataExt extends PlayerData {
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
}

const Transfers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [teamName] = useState(() => getSavedTeam().teamName);
  const [specialChips, setSpecialChips] = useState(initialChips);
  const [selectedBoostChip, setSelectedBoostChip] = useState<typeof initialChips[0] | null>(null);
  const [isBoostDrawerOpen, setIsBoostDrawerOpen] = useState(false);

  const openBoostDrawer = (chip: typeof initialChips[0]) => {
    setSelectedBoostChip(chip);
    setIsBoostDrawerOpen(true);
  };

  const applyBoost = (chipId: string) => {
    setSpecialChips(prev => 
      prev.map(chip => 
        chip.id === chipId ? { ...chip, active: false } : chip
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

  // Load saved team from localStorage
  const [mainSquadPlayers, setMainSquadPlayers] = useState<PlayerDataExt[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<PlayerDataExt[]>([]);
  
  // Track initial state to detect changes
  const initialStateRef = useRef<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  useEffect(() => {
    const { mainSquad, bench } = getMainSquadAndBench();
    if (mainSquad.length > 0) {
      setMainSquadPlayers(mainSquad);
      setBenchPlayers(bench);
      // Store initial state
      initialStateRef.current = JSON.stringify([...mainSquad, ...bench].map(p => p.id).sort());
    }
  }, []);

  // Check for changes whenever players change
  useEffect(() => {
    const currentState = JSON.stringify([...mainSquadPlayers, ...benchPlayers].map(p => p.id).sort());
    if (initialStateRef.current && currentState !== initialStateRef.current) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [mainSquadPlayers, benchPlayers]);

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

  // Block React Router navigation
  const blocker = useBlocker(
    useCallback(() => hasChanges, [hasChanges])
  );

  // Show dialog when blocker is triggered
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowExitDialog(true);
    }
  }, [blocker.state]);

  // Swap drawer state
  const [swapDrawerOpen, setSwapDrawerOpen] = useState(false);
  const [playerToSwap, setPlayerToSwap] = useState<PlayerData | null>(null);
  
  // Buy player drawer state
  const [buyDrawerOpen, setBuyDrawerOpen] = useState(false);

  const handleBackClick = () => {
    if (hasChanges) {
      setShowExitDialog(true);
      return true; // Prevent default navigation
    }
    return false;
  };

  const handleSaveAndExit = () => {
    const allPlayersList = [...mainSquadPlayers, ...benchPlayers];
    if (allPlayersList.length < 15) {
      toast.error(`Состав не сформирован. Выбрано ${allPlayersList.length} из 15 игроков`);
      setShowExitDialog(false);
      return;
    }
    // TODO: Save changes to localStorage/backend
    setShowExitDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate("/league");
    }
  };

  const handleExitWithoutSaving = () => {
    setShowExitDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate("/league");
    }
  };

  const handleContinueEditing = () => {
    setShowExitDialog(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const allPlayers = [...mainSquadPlayers, ...benchPlayers];

  // Calculate budget info
  const totalPrice = allPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
  const budget = 100 - totalPrice;
  const freeTransfers = 5;
  const MAX_PLAYERS_PER_CLUB = 3;
  const MAX_SQUAD_SIZE = 15;

  const getPlayersCountByClub = (clubName: string) => {
    return allPlayers.filter(p => p.team === clubName).length;
  };

  const handleBuyPlayer = (player: PlayerData, targetPosition?: string, isOnBench?: boolean, targetSlotIndex?: number) => {
    // Check if team is already full
    if (allPlayers.length >= MAX_SQUAD_SIZE) {
      toast.error("Команда уже полная (15 игроков)");
      return;
    }

    // Check budget
    if (player.price > budget) {
      toast.error("Недостаточно бюджета");
      return;
    }

    // Check club limit
    if (getPlayersCountByClub(player.team) >= MAX_PLAYERS_PER_CLUB) {
      toast.error(`Нельзя добавить больше ${MAX_PLAYERS_PER_CLUB} игроков из одного клуба`);
      return;
    }

    // If specific slot is provided (from clicking empty slot)
    if (targetPosition !== undefined && isOnBench !== undefined && targetSlotIndex !== undefined) {
      if (isOnBench) {
        const newPlayer: PlayerDataExt = {
          ...player,
          isOnBench: true,
        };
        setBenchPlayers(prev => [...prev, newPlayer]);
      } else {
        const newPlayer: PlayerDataExt = {
          ...player,
          slotIndex: targetSlotIndex,
          isOnBench: false,
        };
        setMainSquadPlayers(prev => [...prev, newPlayer]);
      }
      setBuyDrawerOpen(false);
      toast.success(`${player.name} добавлен в команду`);
      return;
    }

    // Priority: fill main squad empty slots first, then bench
    // Check for empty slots in main squad
    const formationSlots = [
      { position: "ВР", count: 1 },
      { position: "ЗЩ", count: 4 },
      { position: "ПЗ", count: 4 },
      { position: "НП", count: 2 },
    ];

    let addedToMainSquad = false;
    
    for (const slot of formationSlots) {
      if (slot.position === player.position) {
        const occupiedSlots = mainSquadPlayers
          .filter(p => p.position === slot.position)
          .map(p => p.slotIndex);
        
        for (let i = 0; i < slot.count; i++) {
          if (!occupiedSlots.includes(i)) {
            const newPlayer: PlayerDataExt = {
              ...player,
              slotIndex: i,
              isOnBench: false,
            };
            setMainSquadPlayers(prev => [...prev, newPlayer]);
            addedToMainSquad = true;
            break;
          }
        }
        break;
      }
    }

    // If no main squad slot available, add to bench
    if (!addedToMainSquad) {
      if (benchPlayers.length >= 4) {
        toast.error("Скамейка запасных заполнена");
        return;
      }
      const newPlayer: PlayerDataExt = {
        ...player,
        isOnBench: true,
      };
      setBenchPlayers(prev => [...prev, newPlayer]);
    }

    setBuyDrawerOpen(false);
    toast.success(`${player.name} добавлен в команду`);
  };

  // Group players by position for list view
  const playersByPosition = {
    "ВР": mainSquadPlayers.filter(p => p.position === "ВР"),
    "ЗЩ": mainSquadPlayers.filter(p => p.position === "ЗЩ"),
    "ПЗ": mainSquadPlayers.filter(p => p.position === "ПЗ"),
    "НП": mainSquadPlayers.filter(p => p.position === "НП"),
  };

  const positionLabels: Record<string, string> = {
    "ВР": "Вратарь",
    "ЗЩ": "Защита",
    "ПЗ": "Полузащита",
    "НП": "Нападение",
  };

  const handlePlayerSwap = (playerId: number) => {
    const player = allPlayers.find(p => p.id === playerId);
    if (player) {
      setPlayerToSwap(player);
      setSwapDrawerOpen(true);
    }
  };

  const handleSellPlayer = (playerId: number) => {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    if (player.isOnBench) {
      setBenchPlayers(prev => prev.filter(p => p.id !== playerId));
    } else {
      setMainSquadPlayers(prev => prev.filter(p => p.id !== playerId));
    }

    // Close the player card drawer
    setSelectedPlayerForCard(null);
  };

  const handleSwapConfirm = (fromPlayerId: number, toPlayerId: number) => {
    const fromPlayer = allPlayers.find(p => p.id === fromPlayerId);
    const toPlayer = allPlayers.find(p => p.id === toPlayerId);
    
    if (!fromPlayer || !toPlayer) return;

    const fromIsOnBench = fromPlayer.isOnBench;
    const toIsOnBench = toPlayer.isOnBench;

    if (fromIsOnBench && !toIsOnBench) {
      const toSlotIndex = toPlayer.slotIndex;
      
      setMainSquadPlayers(prev => 
        prev.map(p => p.id === toPlayerId 
          ? { ...fromPlayer, slotIndex: toSlotIndex, isOnBench: false } 
          : p
        )
      );
      setBenchPlayers(prev => 
        prev.map(p => p.id === fromPlayerId 
          ? { ...toPlayer, slotIndex: undefined, isOnBench: true } 
          : p
        )
      );
    } else if (!fromIsOnBench && toIsOnBench) {
      const fromSlotIndex = fromPlayer.slotIndex;
      
      setMainSquadPlayers(prev => 
        prev.map(p => p.id === fromPlayerId 
          ? { ...toPlayer, slotIndex: fromSlotIndex, isOnBench: false } 
          : p
        )
      );
      setBenchPlayers(prev => 
        prev.map(p => p.id === toPlayerId 
          ? { ...fromPlayer, slotIndex: undefined, isOnBench: true } 
          : p
        )
      );
    }
  };

  const getAvailableSwapPlayers = () => {
    if (!playerToSwap) return [];
    
    if (playerToSwap.isOnBench) {
      return mainSquadPlayers.filter(p => p.position === playerToSwap.position);
    } else {
      return benchPlayers.filter(p => p.position === playerToSwap.position);
    }
  };

  // Slot counts per position for main squad (1-4-4-2 formation)
  const positionSlotCounts: Record<string, number> = {
    "ВР": 1,
    "ЗЩ": 4,
    "ПЗ": 4,
    "НП": 2,
  };

  const renderListSection = (position: string, players: PlayerDataExt[]) => {
    const slotCount = positionSlotCounts[position] || 0;
    const occupiedSlots = players.map(p => p.slotIndex);
    
    // Create array of slots (filled and empty)
    const slots: (PlayerDataExt | { isEmpty: true; slotIndex: number })[] = [];
    for (let i = 0; i < slotCount; i++) {
      const player = players.find(p => p.slotIndex === i);
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
          <span className="w-14 text-center">Клуб</span>
          <span className="w-12 text-center">Очки</span>
          <span className="w-10 text-center">Цена</span>
          <span className="w-10"></span>
        </div>

        <div className="space-y-2">
          {slots.map((slot, idx) => {
            if ('isEmpty' in slot) {
              // Empty slot
              return (
                <div
                  key={`empty-${position}-${slot.slotIndex}`}
                  className="bg-card/50 rounded-full px-4 py-2 flex items-center cursor-pointer hover:bg-card/70 transition-colors"
                  onClick={() => setBuyDrawerOpen(true)}
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-muted-foreground">Пустой слот</span>
                    <span className="text-muted-foreground text-xs">{position}</span>
                  </div>
                  <div className="w-14 flex-shrink-0"></div>
                  <div className="w-12 flex-shrink-0"></div>
                  <span className="w-10 flex-shrink-0"></span>
                  <button
                    className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              );
            }

            // Player slot
            const player = slot;
            return (
              <div
                key={player.id}
                className="bg-card rounded-full px-4 py-2 flex items-center"
              >
                <div 
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                  onClick={() => setSelectedPlayerForCard(player.id)}
                >
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                </div>
                
                <div className="w-14 flex-shrink-0 flex justify-center">
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
                
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">
                  {player.price}
                </span>
                
                <button
                  onClick={() => handleSellPlayer(player.id)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
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
      <SportHeader backTo="/league" onBackClick={handleBackClick} />

      {/* Team Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img 
              src={homeIcon} 
              alt="Home" 
              className="w-5 h-5 object-contain cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
            <span>▸</span>
            <span>Футбол</span>
            <span>▸</span>
            <span>Беларусь</span>
            <span>▸</span>
            <span className="text-muted-foreground">Трансферы</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
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

      {/* Special Chips - 3 chips as per reference */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {specialChips.map((chip) => (
            <div
              key={chip.id}
              onClick={() => openBoostDrawer(chip)}
              className="flex-1 flex flex-col items-center justify-center py-4 rounded-2xl bg-card cursor-pointer transition-all hover:bg-card/80 border border-border"
            >
              <img 
                src={chip.icon} 
                alt={chip.label} 
                className={`w-8 h-8 object-contain mb-1 transition-all ${!chip.active ? "grayscale opacity-50" : ""}`}
              />
              <span className="text-foreground text-[10px] font-medium text-center leading-tight">{chip.label}</span>
              <span className={`text-[8px] ${chip.active ? "text-primary" : "text-muted-foreground"}`}>
                {chip.active ? chip.sublabel : "Использовано"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex bg-secondary rounded-full p-1">
          <Button
            onClick={() => setActiveTab("formation")}
            className={`flex-1 rounded-full h-9 ${
              activeTab === "formation"
                ? "bg-card text-foreground hover:bg-card/90 shadow-sm"
                : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground"
            }`}
          >
            Расстановка
          </Button>
          <Button
            onClick={() => setActiveTab("list")}
            className={`flex-1 rounded-full h-9 ${
              activeTab === "list"
                ? "bg-card text-foreground hover:bg-card/90 shadow-sm"
                : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground"
            }`}
          >
            Списком
          </Button>
        </div>
      </div>

      {/* Main content */}
      {activeTab === "formation" ? (
        <div className="mt-4">
          <FormationFieldManagement 
            mainSquadPlayers={mainSquadPlayers}
            benchPlayers={benchPlayers}
            maxBenchSize={4}
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onRemovePlayer={handleSellPlayer}
            onEmptySlotClick={() => setBuyDrawerOpen(true)}
          />
        </div>
      ) : (
        <div className="px-4 mt-6 pb-6">
          <h2 className="text-foreground text-xl font-bold mb-4">Основной состав</h2>
          
          {Object.entries(playersByPosition).map(([position, players]) => 
            renderListSection(position, players)
          )}

          <h2 className="text-foreground text-xl font-bold mb-4 mt-8">Замены</h2>
          
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
            <span className="flex-1">Игрок</span>
            <span className="w-14 text-center">Клуб</span>
            <span className="w-12 text-center">Очки</span>
            <span className="w-10 text-center">Цена</span>
            <span className="w-10"></span>
          </div>

          <div className="space-y-2">
            {/* Render 4 bench slots */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const player = benchPlayers[idx];
              
              if (!player) {
                // Empty bench slot
                return (
                  <div
                    key={`empty-bench-${idx}`}
                    className="bg-card/50 rounded-full px-4 py-2 flex items-center cursor-pointer hover:bg-card/70 transition-colors"
                    onClick={() => setBuyDrawerOpen(true)}
                  >
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground">Пустой слот</span>
                      <span className="text-muted-foreground text-xs">ЗАМ</span>
                    </div>
                    <div className="w-14 flex-shrink-0"></div>
                    <div className="w-12 flex-shrink-0"></div>
                    <span className="w-10 flex-shrink-0"></span>
                    <button
                      className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={player.id}
                  className="bg-card rounded-full px-4 py-2 flex items-center"
                >
                  <div 
                    className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                    onClick={() => setSelectedPlayerForCard(player.id)}
                  >
                    <span className="text-foreground font-medium truncate">{player.name}</span>
                    <span className="text-muted-foreground text-xs">{player.position}</span>
                  </div>
                  
                  <div className="w-14 flex-shrink-0 flex justify-center">
                    {clubIcons[player.team] && (
                      <img 
                        src={clubIcons[player.team]} 
                        alt={player.team}
                        className="w-5 h-5 object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="w-12 flex-shrink-0 flex items-center justify-center gap-1">
                    {player.id % 2 === 0 && <img src={flameIcon} alt="fire" className="w-3 h-3" />}
                    <span className="text-foreground text-sm">{player.points}</span>
                  </div>
                  
                  <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">
                    {player.price}
                  </span>
                  
                  <button
                    onClick={() => handleSellPlayer(player.id)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 z-50">
        {/* Stats Row */}
        <div className="flex justify-between mb-4">
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
            onClick={() => setBuyDrawerOpen(true)}
            className="flex-1 bg-[#2A2A3E] hover:bg-[#3A3A4E] text-white font-semibold rounded-full h-12"
          >
            + Добавить игрока
          </Button>
          <Button 
            onClick={() => {
              if (allPlayers.length < 15) {
                toast.error(`Состав не сформирован. Выбрано ${allPlayers.length} из 15 игроков`);
                return;
              }
              navigate("/league");
            }}
            className={`flex-1 rounded-full h-12 font-semibold ${
              allPlayers.length < 15 
                ? "bg-[#4A5D23] text-muted-foreground cursor-not-allowed" 
                : "bg-[#A8FF00] hover:bg-[#98EE00] text-black"
            }`}
          >
            Сохранить
          </Button>
        </div>
      </div>

      {/* Player Card Drawer */}
      {selectedPlayerForCard !== null && (
        <PlayerCard
          player={allPlayers.find(p => p.id === selectedPlayerForCard) || null}
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
          onSwap={(playerId) => {
            const player = allPlayers.find(p => p.id === playerId);
            if (player) {
              setPlayerToSwap(player);
              setSwapDrawerOpen(true);
            }
          }}
        />
      )}

      {/* Swap Player Drawer */}
      <SwapPlayerDrawer
        isOpen={swapDrawerOpen}
        onClose={() => {
          setSwapDrawerOpen(false);
          setPlayerToSwap(null);
        }}
        selectedPlayer={playerToSwap}
        availablePlayers={getAvailableSwapPlayers()}
        onSwap={handleSwapConfirm}
      />

      {/* Boost Drawer */}
      <BoostDrawer
        chip={selectedBoostChip ? specialChips.find(c => c.id === selectedBoostChip.id) || null : null}
        isOpen={isBoostDrawerOpen}
        onClose={() => setIsBoostDrawerOpen(false)}
        onApply={applyBoost}
      />

      {/* Buy Player Drawer */}
      <BuyPlayerDrawer
        isOpen={buyDrawerOpen}
        onClose={() => setBuyDrawerOpen(false)}
        onBuyPlayer={handleBuyPlayer}
        currentTeamPlayerIds={allPlayers.map(p => p.id)}
        currentBudget={budget}
        getPlayersCountByClub={getPlayersCountByClub}
        maxPlayersPerClub={MAX_PLAYERS_PER_CLUB}
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
              disabled={allPlayers.length < 15}
              className={`${
                allPlayers.length < 15 
                  ? "bg-[#4A5D23] text-muted-foreground cursor-not-allowed" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              Сохранить {allPlayers.length < 15 && `(${allPlayers.length}/15)`}
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
    </div>
  );
};

export default Transfers;
