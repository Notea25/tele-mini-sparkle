import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertCircle } from "lucide-react";
import swapArrowsPurple from "@/assets/swap-arrows-purple.png";
import { getClubLogo } from "@/lib/clubLogos";
import { getJerseyForTeam } from "@/hooks/getJerseyForTeam";

// Truncate team name for display
const truncateTeamName = (name: string, maxLength: number = 10) => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
};

interface PlayerData {
  id: number;
  name: string;
  name_rus?: string;
  team: string;
  team_rus?: string;
  field_player_jersey?: string;
  goalkeeper_jersey?: string;
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
          {(() => {
            const jerseyUrl = getJerseyForTeam({
              name: player.team,
              name_rus: player.team_rus,
              field_player_jersey: player.field_player_jersey,
              goalkeeper_jersey: player.goalkeeper_jersey
            }, player.position);
            
            return jerseyUrl ? (
              <img 
                src={jerseyUrl}
                alt={player.name} 
                className={`w-[120%] h-auto object-contain ${disabled ? 'grayscale' : ''}`}
              />
            ) : null;
          })()}
        </div>
        
        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-4 pb-1 px-1">
          <p className="text-foreground text-[10px] font-medium text-center truncate leading-tight">
            {player.name_rus || player.name}
          </p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-muted-foreground text-[8px]">
              ({player.position})
            </span>
            <span className="text-muted-foreground text-[8px] truncate max-w-[50px]">
              {truncateTeamName(player.team_rus || player.team, 8)}
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
            <img src={swapArrowsPurple} alt="swap" className="w-8 h-8 flex-shrink-0" />
            
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
