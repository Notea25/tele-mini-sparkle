import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { getClubLogo } from "@/lib/clubLogos";
import swapArrowsPurple from "@/assets/swap-arrows-purple.png";

interface TransferRecord {
  type: "swap" | "buy" | "sell";
  playerOut?: {
    id: number;
    name: string;
    points: number;
    team?: string;
    position?: string;
    price?: number;
  };
  playerIn?: {
    id: number;
    name: string;
    points: number;
    team?: string;
    position?: string;
    price?: number;
  };
}

interface ConfirmTransfersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transfers: TransferRecord[];
  freeTransfersUsed: number;
  additionalTransfersUsed: number;
  pointsPenalty?: number;
  remainingBudget: number;
  hasTransferBoost?: boolean;
}

// Helper to format player name as "A. Surname"
const formatPlayerName = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const surname = parts.slice(1).join(" ");
  return `${firstName.charAt(0)}. ${surname}`;
};

// Player row component matching the list design
const TransferPlayerRow = ({ 
  player 
}: { 
  player: { 
    id: number; 
    name: string; 
    team?: string; 
    position?: string; 
    price?: number;
  } | undefined;
}) => {
  if (!player) {
    return (
      <div className="flex-1 bg-secondary rounded-xl h-12 flex items-center justify-center">
        <span className="text-muted-foreground text-sm">—</span>
      </div>
    );
  }

  const clubLogo = player.team ? getClubLogo(player.team) : undefined;
  const formattedName = formatPlayerName(player.name);
  const price = typeof player.price === 'number' ? player.price.toFixed(1) : '—';

  return (
    <div className="flex-1 bg-secondary rounded-xl h-12 px-3 flex items-center gap-2 min-w-0">
      {/* Club logo - fixed width */}
      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center">
        {clubLogo ? (
          <img src={clubLogo} alt="" className="w-6 h-6 object-contain" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted" />
        )}
      </div>
      
      {/* Name - flexible with truncation */}
      <span className="text-foreground text-sm font-medium truncate flex-1 min-w-0">
        {formattedName}
      </span>
      
      {/* Position - fixed width */}
      <span className="text-muted-foreground text-xs w-6 text-center flex-shrink-0">
        {player.position || '—'}
      </span>
      
      {/* Price - fixed width */}
      <span className="text-foreground text-sm font-medium w-8 text-right flex-shrink-0">
        {price}
      </span>
    </div>
  );
};

const ConfirmTransfersDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  transfers,
  freeTransfersUsed,
  additionalTransfersUsed,
  pointsPenalty = 0,
  remainingBudget,
  hasTransferBoost = false,
}: ConfirmTransfersDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center text-xl">Подтверди замены</DrawerTitle>
          <p className="text-muted-foreground text-sm text-center mt-1">
            Вы действительно хотите сохранить текущий состав?
          </p>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          {/* Transfer pairs */}
          {transfers.length > 0 ? (
            <div className="space-y-3 mb-6">
              {transfers.map((transfer, index) => (
                <div key={index} className="flex items-center justify-center gap-2">
                  {/* Player Out */}
                  <TransferPlayerRow player={transfer.playerOut} />

                  {/* Swap Icon */}
                  <img 
                    src={swapArrowsPurple} 
                    alt="swap" 
                    className="w-5 h-5 flex-shrink-0"
                  />

                  {/* Player In */}
                  <TransferPlayerRow player={transfer.playerIn} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">Нет изменений для сохранения</p>
          )}

          {/* Stats Section */}
          <div className="mb-6">
            <h3 className="text-foreground text-base font-semibold mb-3">Детали</h3>
            <div className="space-y-0">
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-muted-foreground text-sm">Бесплатных трансферов использовано</span>
                <span className={`text-sm font-medium ${hasTransferBoost ? "text-primary" : "text-foreground"}`}>
                  {hasTransferBoost ? "∞" : freeTransfersUsed}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-muted-foreground text-sm">Платных трансферов</span>
                <span className="text-foreground text-sm font-medium">{additionalTransfersUsed}</span>
              </div>
              {pointsPenalty > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-border">
                  <span className="text-muted-foreground text-sm">Штраф за трансферы</span>
                  <span className="text-red-500 text-sm font-medium">-{pointsPenalty} очков</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-border">
                <span className="text-muted-foreground text-sm">Остаток бюджета</span>
                <span className="text-foreground text-sm font-medium">{typeof remainingBudget === 'number' ? remainingBudget.toFixed(1) : remainingBudget}</span>
              </div>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg h-12"
            >
              Изменить
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-lg h-12 shadow-neon"
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ConfirmTransfersDrawer;
