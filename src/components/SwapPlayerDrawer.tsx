import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import { getClubLogo } from "@/lib/clubLogos";

// Import jerseys from proper folder
import arsenalJersey from "@/assets/jerseys/arsenalJersey.png";
import bateJersey from "@/assets/jerseys/bateJersey.png";
import brestJersey from "@/assets/jerseys/brestJersey.png";
import dinamoJersey from "@/assets/jerseys/dinamoJersey.png";
import gomelJersey from "@/assets/jerseys/gomelJersey.png";
import minskJersey from "@/assets/jerseys/minskJersey.png";
import mlJersey from "@/assets/jerseys/mlJersey.png";
import naftanJersey from "@/assets/jerseys/naftanJersey.png";
import nemanJersey from "@/assets/jerseys/nemanJersey.png";
import slaviaJersey from "@/assets/jerseys/slaviaJersey.png";
import torpedoJersey from "@/assets/jerseys/torpedoJersey.png";
import vitebskJersey from "@/assets/jerseys/vitebskJersey.png";

// Goalkeeper jerseys
import arsenalGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/arsenalGoalkeeperJersey.png";
import bateGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/bateGoalkeeperJersey.png";
import gomelGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/gomelGoalkeeperJersey.png";
import mlGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/mlGoalkeeperJersey.png";
import slaviaGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/slaviaGoalkeeperJersey.png";
import vitebskGoalkeeperJersey from "@/assets/jerseys/goalkeeperJerseys/vitebskGoalkeeperJersey.png";

// Helper function to get jersey based on team and position
const getJerseyForTeam = (team: string, position?: string) => {
  const isGoalkeeper = position === "ВР";
  
  // Normalize team name
  const normalizedTeam = team.toLowerCase();
  
  if (normalizedTeam.includes("динамо") && normalizedTeam.includes("минск")) {
    return dinamoJersey;
  }
  if (normalizedTeam.includes("динамо") && normalizedTeam.includes("брест")) {
    return brestJersey;
  }
  if (normalizedTeam.includes("батэ") || normalizedTeam === "bate") {
    return isGoalkeeper ? bateGoalkeeperJersey : bateJersey;
  }
  if (normalizedTeam.includes("мл") || normalizedTeam.includes("витебск") && normalizedTeam.includes("мл")) {
    return isGoalkeeper ? mlGoalkeeperJersey : mlJersey;
  }
  if (normalizedTeam.includes("витебск") && !normalizedTeam.includes("мл")) {
    return isGoalkeeper ? vitebskGoalkeeperJersey : vitebskJersey;
  }
  if (normalizedTeam.includes("славия") || normalizedTeam.includes("мозырь")) {
    return isGoalkeeper ? slaviaGoalkeeperJersey : slaviaJersey;
  }
  if (normalizedTeam.includes("арсенал")) {
    return isGoalkeeper ? arsenalGoalkeeperJersey : arsenalJersey;
  }
  if (normalizedTeam.includes("неман")) {
    return nemanJersey;
  }
  if (normalizedTeam.includes("минск") && !normalizedTeam.includes("динамо")) {
    return minskJersey;
  }
  if (normalizedTeam.includes("торпедо") || normalizedTeam.includes("белаз")) {
    return torpedoJersey;
  }
  if (normalizedTeam.includes("гомель")) {
    return isGoalkeeper ? gomelGoalkeeperJersey : gomelJersey;
  }
  if (normalizedTeam.includes("нафтан") || normalizedTeam.includes("новополоцк")) {
    return naftanJersey;
  }
  if (normalizedTeam.includes("белшина")) {
    return slaviaJersey; // fallback
  }
  
  return dinamoJersey; // default fallback
};

// Truncate team name for display
const truncateTeamName = (name: string, maxLength: number = 10) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
};

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price: number;
  slotIndex?: number;
  isOnBench?: boolean;
}

interface ValidSwapOption {
  id: number;
  position: string;
}

interface SwapPlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayer: PlayerData | null;
  availablePlayers: PlayerData[];
  validSwapOptions: ValidSwapOption[];
  onSwap: (fromPlayerId: number, toPlayerId: number) => void;
}

// Player card component for swap drawer
const SwapPlayerCard = ({ 
  player, 
  onClick, 
  disabled = false 
}: { 
  player: PlayerData; 
  onClick?: () => void; 
  disabled?: boolean;
}) => {
  const clubLogo = getClubLogo(player.team);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-[76px] flex-shrink-0 flex flex-col items-center
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform'}
      `}
    >
      {/* Card container */}
      <div className={`
        relative w-full aspect-[4/5] rounded-xl overflow-hidden
        ${disabled ? 'bg-secondary/30' : 'bg-[#3a5a28]/40'}
        border border-white/20 backdrop-blur-[2px]
      `}>
        {/* Club logo watermark */}
        {clubLogo && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 z-0">
            <img 
              src={clubLogo} 
              alt="" 
              className="w-6 h-6 object-contain opacity-60"
            />
          </div>
        )}
        
        {/* Jersey */}
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <img 
            src={getJerseyForTeam(player.team, player.position)} 
            alt={player.name} 
            className={`w-[120%] h-auto object-contain ${disabled ? 'grayscale' : ''}`}
          />
        </div>
        
        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-4 pb-1 px-1">
          <p className="text-foreground text-[10px] font-medium text-center truncate leading-tight">
            {player.name}
          </p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-muted-foreground text-[8px]">
              ({player.position})
            </span>
            <span className="text-muted-foreground text-[8px] truncate max-w-[50px]">
              {truncateTeamName(player.team, 8)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

// Empty slot placeholder
const EmptySlotCard = () => (
  <div className="relative w-[76px] flex-shrink-0 flex flex-col items-center">
    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border-2 border-dashed border-primary bg-primary/5 flex items-center justify-center">
      <span className="text-primary text-3xl font-light">?</span>
    </div>
    <p className="text-muted-foreground text-[10px] mt-1 text-center">Выбери</p>
  </div>
);

const SwapPlayerDrawer = ({ 
  isOpen, 
  onClose, 
  selectedPlayer, 
  availablePlayers,
  validSwapOptions,
  onSwap 
}: SwapPlayerDrawerProps) => {
  if (!selectedPlayer) return null;

  const handleSwap = (targetPlayer: PlayerData) => {
    onSwap(selectedPlayer.id, targetPlayer.id);
    onClose();
  };

  // Filter available players to only those with valid swap options
  const validPlayerIds = new Set(validSwapOptions.map(opt => opt.id));
  const validPlayers = availablePlayers.filter(p => validPlayerIds.has(p.id));
  const invalidPlayers = availablePlayers.filter(p => !validPlayerIds.has(p.id));

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center text-xl">
            Замена игрока
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto">
          {/* Current player and selection - card style */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Selected player card */}
            <SwapPlayerCard player={selectedPlayer} />
            
            {/* Swap arrows */}
            <ArrowLeftRight className="w-6 h-6 text-primary flex-shrink-0" />
            
            {/* Empty slot for selection */}
            <EmptySlotCard />
          </div>

          {/* Valid players for swap */}
          <div>
            <p className="text-muted-foreground text-sm mb-4">
              {selectedPlayer.isOnBench ? "Доступные игроки на поле:" : "Доступные игроки на скамейке:"}
            </p>
            
            {validPlayers.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
                <p className="text-center text-muted-foreground">
                  Нет доступных игроков для замены.
                </p>
                <p className="text-center text-muted-foreground text-xs">
                  Замена невозможна - нет подходящей схемы
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {validPlayers.map((player) => (
                  <SwapPlayerCard 
                    key={player.id}
                    player={player} 
                    onClick={() => handleSwap(player)}
                  />
                ))}
              </div>
            )}

            {/* Show invalid options with explanation */}
            {invalidPlayers.length > 0 && validPlayers.length > 0 && (
              <div className="mt-6">
                <p className="text-muted-foreground text-xs mb-3">
                  Недоступно (нет подходящей схемы):
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {invalidPlayers.map((player) => (
                    <SwapPlayerCard 
                      key={player.id}
                      player={player} 
                      disabled
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SwapPlayerDrawer;
