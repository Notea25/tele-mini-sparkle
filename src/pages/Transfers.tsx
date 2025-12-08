import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SportHeader from "@/components/SportHeader";
import { getSavedTeam, getMainSquadAndBench, PlayerData } from "@/lib/teamData";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import PlayerCard from "@/components/PlayerCard";
import SwapPlayerDrawer from "@/components/SwapPlayerDrawer";
import BoostDrawer from "@/components/BoostDrawer";
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

  // Calculate budget info
  const totalPrice = allPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
  const budget = 100 - totalPrice;
  const freeTransfers = 5;

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

  const renderListSection = (position: string, players: PlayerData[]) => (
    <div className="mb-6" key={position}>
      <h3 className="text-primary font-medium mb-2">{positionLabels[position]}</h3>
      
      <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
        <span className="flex-1">Игрок ↕</span>
        <span className="w-14 text-center">Клуб</span>
        <span className="w-12 text-center">Очки ↕</span>
        <span className="w-10 text-center">Цена ↕</span>
        <span className="w-10"></span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
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
    <div className="min-h-screen bg-background pb-32">
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
            onPlayerClick={(player) => setSelectedPlayerForCard(player.id)}
            onSwapPlayer={handlePlayerSwap}
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
            {benchPlayers.map((player) => (
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

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
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
            onClick={() => navigate("/add-player")}
            className="flex-1 bg-card text-foreground hover:bg-card/80 rounded-full h-12 border border-border"
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить игрока
          </Button>
          <Button 
            onClick={() => navigate("/league")}
            className="flex-1 bg-primary/30 text-primary hover:bg-primary/40 rounded-full h-12"
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
    </div>
  );
};

export default Transfers;
