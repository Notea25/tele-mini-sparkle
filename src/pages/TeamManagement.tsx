import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { getSavedTeam, getMainSquadAndBench, PlayerData } from "@/lib/teamData";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import PlayerCard from "@/components/PlayerCard";
import SwapPlayerDrawer, { getFormationCounts, getFormationLabel, VALID_FORMATIONS } from "@/components/SwapPlayerDrawer";
import BoostDrawer from "@/components/BoostDrawer";
import clubBelshina from "@/assets/club-belshina.png";
import clubLogo from "@/assets/club-logo.png";
import homeIcon from "@/assets/home-icon.png";
import flameIcon from "@/assets/flame-icon.png";
import iconBenchPlus from "@/assets/icon-bench-plus.png";
import icon3x from "@/assets/icon-3x.png";
import iconStar from "@/assets/icon-star.png";
import iconFree from "@/assets/icon-free.png";
import icon2x from "@/assets/icon-2x.png";

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

import { BoostChip, BoostStatus } from "@/components/BoostDrawer";

// Special chips data with icons
const initialChips: BoostChip[] = [
  { id: "bench", icon: iconBenchPlus, label: "Скамейка +", sublabel: "Подробнее", status: "available" },
  { id: "captain3x", icon: icon3x, label: "3x Капитан", sublabel: "Подробнее", status: "available" },
  { id: "transfers", icon: iconStar, label: "Трансферы +", sublabel: "Подробнее", status: "available" },
  { id: "golden", icon: iconFree, label: "Золотой тур", sublabel: "Подробнее", status: "available" },
  { id: "double", icon: icon2x, label: "Двойная сила", sublabel: "Подробнее", status: "available" },
];

// Formation options
const formationOptions = [
  { value: "1-4-4-2", label: "Схема (1 ВР - 4 ЗЩ - 4 ПЗ - 2 НП)" },
  { value: "1-4-3-3", label: "Схема (1 ВР - 4 ЗЩ - 3 ПЗ - 3 НП)" },
  { value: "1-3-5-2", label: "Схема (1 ВР - 3 ЗЩ - 5 ПЗ - 2 НП)" },
  { value: "1-5-3-2", label: "Схема (1 ВР - 5 ЗЩ - 3 ПЗ - 2 НП)" },
  { value: "1-5-4-1", label: "Схема (1 ВР - 5 ЗЩ - 4 ПЗ - 1 НП)" },
];

interface PlayerDataExt extends PlayerData {
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
}

const TeamManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [selectedFormation, setSelectedFormation] = useState("1-4-4-2");
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayerForCard, setSelectedPlayerForCard] = useState<number | null>(null);
  const [teamName] = useState(() => getSavedTeam().teamName);
  const [specialChips, setSpecialChips] = useState<BoostChip[]>(initialChips);
  const [selectedBoostChip, setSelectedBoostChip] = useState<BoostChip | null>(null);
  const [isBoostDrawerOpen, setIsBoostDrawerOpen] = useState(false);
  const currentTour = 1; // Current tour number

  const openBoostDrawer = (chip: BoostChip) => {
    setSelectedBoostChip(chip);
    setIsBoostDrawerOpen(true);
  };

  const applyBoost = (chipId: string) => {
    // Check if another boost is already pending
    const hasPendingBoost = specialChips.some(chip => chip.status === "pending");
    if (hasPendingBoost) {
      toast.error("В одном туре можно использовать только 1 буст");
      return;
    }
    
    setSpecialChips(prev => 
      prev.map(chip => 
        chip.id === chipId ? { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" } : chip
      )
    );
  };

  const cancelBoost = (chipId: string) => {
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

  // Load saved team from localStorage
  const [mainSquadPlayers, setMainSquadPlayers] = useState<PlayerDataExt[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<PlayerDataExt[]>([]);

  useEffect(() => {
    const { mainSquad, bench } = getMainSquadAndBench();
    if (mainSquad.length > 0) {
      setMainSquadPlayers(mainSquad);
      setBenchPlayers(bench);
    }
  }, []);

  // Swap drawer state
  const [swapDrawerOpen, setSwapDrawerOpen] = useState(false);
  const [playerToSwap, setPlayerToSwap] = useState<PlayerData | null>(null);

  const allPlayers = [...mainSquadPlayers, ...benchPlayers];

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

  const handleSwapConfirm = (fromPlayerId: number, toPlayerId: number) => {
    const fromPlayer = allPlayers.find(p => p.id === fromPlayerId);
    const toPlayer = allPlayers.find(p => p.id === toPlayerId);
    
    if (!fromPlayer || !toPlayer) return;

    // Determine if swapping between main and bench
    const fromIsOnBench = fromPlayer.isOnBench;
    const toIsOnBench = toPlayer.isOnBench;

    let newMainSquadPlayers: PlayerDataExt[];
    let newBenchPlayers: PlayerDataExt[];

    if (fromIsOnBench && !toIsOnBench) {
      // Bench player replacing field player
      const toSlotIndex = toPlayer.slotIndex;
      
      newMainSquadPlayers = mainSquadPlayers.map(p => p.id === toPlayerId 
        ? { ...fromPlayer, slotIndex: toSlotIndex, isOnBench: false } 
        : p
      );
      newBenchPlayers = benchPlayers.map(p => p.id === fromPlayerId 
        ? { ...toPlayer, slotIndex: undefined, isOnBench: true } 
        : p
      );
    } else if (!fromIsOnBench && toIsOnBench) {
      // Field player replacing bench player
      const fromSlotIndex = fromPlayer.slotIndex;
      
      newMainSquadPlayers = mainSquadPlayers.map(p => p.id === fromPlayerId 
        ? { ...toPlayer, slotIndex: fromSlotIndex, isOnBench: false } 
        : p
      );
      newBenchPlayers = benchPlayers.map(p => p.id === toPlayerId 
        ? { ...fromPlayer, slotIndex: undefined, isOnBench: true } 
        : p
      );
    } else {
      return;
    }

    // Get new formation counts and label
    const newCounts = getFormationCounts(newMainSquadPlayers);
    const formationLabel = getFormationLabel(newCounts);
    
    setMainSquadPlayers(newMainSquadPlayers);
    setBenchPlayers(newBenchPlayers);
    
    // Show success toast with player names and new formation
    toast.success(
      <div className="space-y-1">
        <div className="font-medium">Игрок {toPlayer.name} ({toPlayer.position}) заменен на {fromPlayer.name} ({fromPlayer.position})</div>
        <div className="text-sm text-muted-foreground">Схема изменена на ({formationLabel})</div>
      </div>
    );
  };

  const handleSwapError = (errorMessage: string, validFormations: string[]) => {
    toast.error(
      <div className="space-y-2">
        <div className="font-medium">{errorMessage}</div>
        <div className="text-sm">Допустимые схемы:</div>
        <ul className="text-xs space-y-1">
          {validFormations.map((f, i) => (
            <li key={i}>• {f}</li>
          ))}
        </ul>
      </div>,
      { duration: 6000 }
    );
    setSwapDrawerOpen(false);
    setPlayerToSwap(null);
  };

  // Get available players for swap - now returns ALL players from opposite location
  const getAvailableSwapPlayers = () => {
    if (!playerToSwap) return [];
    
    if (playerToSwap.isOnBench) {
      // Bench player - can swap with any field player
      return mainSquadPlayers;
    } else {
      // Field player - can swap with any bench player
      return benchPlayers;
    }
  };

  const renderListSection = (position: string, players: PlayerData[]) => (
    <div className="mb-6" key={position}>
      {/* Position header */}
      <h3 className="text-primary font-medium mb-2">{positionLabels[position]}</h3>
      
      {/* Column headers */}
      <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
        <span className="flex-1">Игрок ↕</span>
        <span className="w-14 text-center">Клуб</span>
        <span className="w-12 text-center">Очки ↕</span>
        <span className="w-10 text-center">Цена ↕</span>
        <span className="w-10"></span>
      </div>

      {/* Players */}
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-card rounded-full px-4 py-2 flex items-center"
          >
            {/* Player name + position */}
            <div 
              className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
              onClick={() => setSelectedPlayerForCard(player.id)}
            >
              <span className="text-foreground font-medium truncate">{player.name}</span>
              <span className="text-muted-foreground text-xs">{player.position}</span>
            </div>
            
            {/* Club */}
            <div className="w-14 flex-shrink-0 flex justify-center">
              {clubIcons[player.team] && (
                <img 
                  src={clubIcons[player.team]} 
                  alt={player.team}
                  className="w-5 h-5 object-contain"
                />
              )}
            </div>
            
            {/* Points - some have fire icon */}
            <div className="w-12 flex-shrink-0 flex items-center justify-center gap-1">
              {player.id % 3 === 0 && <img src={flameIcon} alt="fire" className="w-3 h-3" />}
              <span className="text-foreground text-sm">{player.points}</span>
            </div>
            
            {/* Price */}
            <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">
              {player.price}
            </span>
            
            {/* Swap button */}
            <button
              onClick={() => handlePlayerSwap(player.id)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SportHeader backTo="/league" />

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
            <span>Футбол</span>
            <span>•</span>
            <span>Беларусь</span>
            <span>•</span>
            <span className="text-foreground">Управление командой</span>
          </div>
        </div>
        
        {/* Team name */}
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

      {/* Tabs */}
      <div className="px-4 mt-6 flex gap-2">
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
          Списком
        </Button>
      </div>

      {/* Formation selector (only in list view) */}
      {activeTab === "list" && (
        <div className="px-4 mt-4">
          <Select value={selectedFormation} onValueChange={setSelectedFormation}>
            <SelectTrigger className="w-full bg-card border-border text-foreground rounded-full">
              <SelectValue>
                {formationOptions.find(f => f.value === selectedFormation)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {formationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-secondary cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Special Chips */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {specialChips.map((chip) => (
            <div
              key={chip.id}
              onClick={() => openBoostDrawer(chip)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl cursor-pointer transition-all hover:bg-card/80 ${
                chip.status === "pending" 
                  ? "bg-card border-2 border-primary" 
                  : chip.status === "used" 
                    ? "bg-card/50" 
                    : "bg-card"
              }`}
            >
              <img 
                src={chip.icon} 
                alt={chip.label} 
                className={`w-8 h-8 object-contain mb-1 transition-all ${chip.status === "used" ? "grayscale opacity-50" : ""}`}
              />
              <span className="text-foreground text-[10px] font-medium text-center leading-tight">{chip.label}</span>
              <span className={`text-[8px] ${
                chip.status === "pending" 
                  ? "text-primary" 
                  : chip.status === "used" 
                    ? "text-muted-foreground" 
                    : "text-primary"
              }`}>
                {chip.status === "pending" 
                  ? "Используется" 
                  : chip.status === "used" 
                    ? `${chip.usedInTour} тур` 
                    : chip.sublabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Captain selectors */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-muted-foreground text-sm mb-2 block">Капитан</label>
            <Select value={captain?.toString() || ""} onValueChange={(v) => setCaptain(Number(v))}>
              <SelectTrigger className="w-full bg-card border-border text-foreground rounded-full">
                <SelectValue placeholder="Выбрать">
                  {captain ? allPlayers.find(p => p.id === captain)?.name : "Плотников"}
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
              <SelectTrigger className="w-full bg-card border-border text-foreground rounded-full">
                <SelectValue placeholder="Выбрать">
                  {viceCaptain ? allPlayers.find(p => p.id === viceCaptain)?.name : "Чиж"}
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
            benchPlayers={benchPlayers}
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onSwapPlayer={handlePlayerSwap}
          />
        </div>
      ) : (
        <div className="px-4 mt-6 pb-6">
          {/* Main Squad */}
          <h2 className="text-foreground text-xl font-bold mb-4">Основной состав</h2>
          
          {Object.entries(playersByPosition).map(([position, players]) => 
            renderListSection(position, players)
          )}

          {/* Bench */}
          <h2 className="text-foreground text-xl font-bold mb-4 mt-8">Замены</h2>
          
          {/* Column headers */}
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
            <span className="flex-1">Игрок</span>
            <span className="w-14 text-center">Клуб</span>
            <span className="w-12 text-center">Очки</span>
            <span className="w-10 text-center">Цена</span>
            <span className="w-10"></span>
          </div>

          <div className="space-y-2">
            {benchPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-card rounded-full px-4 py-2 flex items-center"
              >
                {/* Player name + position */}
                <div 
                  className="flex-1 flex items-center gap-2 cursor-pointer hover:opacity-80 min-w-0"
                  onClick={() => setSelectedPlayerForCard(player.id)}
                >
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                </div>
                
                {/* Club */}
                <div className="w-14 flex-shrink-0 flex justify-center">
                  {clubIcons[player.team] && (
                    <img 
                      src={clubIcons[player.team]} 
                      alt={player.team}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                </div>
                
                {/* Points */}
                <div className="w-12 flex-shrink-0 flex items-center justify-center gap-1">
                  {player.id % 2 === 0 && <img src={flameIcon} alt="fire" className="w-3 h-3" />}
                  <span className="text-foreground text-sm">{player.points}</span>
                </div>
                
                {/* Price */}
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">
                  {player.price}
                </span>
                
                {/* Swap button */}
                <button
                  onClick={() => handlePlayerSwap(player.id)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  <ArrowLeftRight className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        onSwapError={handleSwapError}
        mainSquadPlayers={mainSquadPlayers}
      />

      {/* Boost Drawer */}
      <BoostDrawer
        chip={selectedBoostChip ? specialChips.find(c => c.id === selectedBoostChip.id) || null : null}
        isOpen={isBoostDrawerOpen}
        onClose={() => setIsBoostDrawerOpen(false)}
        onApply={applyBoost}
        onCancel={cancelBoost}
        currentTour={currentTour}
      />
    </div>
  );
};

export default TeamManagement;
