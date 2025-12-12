import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, AlertCircle } from "lucide-react";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import { BoostChip } from "@/components/BoostDrawer";

interface TransferRecord {
  type: "swap" | "buy" | "sell";
  playerOut?: {
    id: number;
    name: string;
    points: number;
  };
  playerIn?: {
    id: number;
    name: string;
    points: number;
  };
}

interface ConfirmTransfersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transfers: TransferRecord[];
  freeTransfersUsed: number;
  additionalTransfersUsed: number;
  remainingBudget: number;
  boosts?: BoostChip[];
}

const ConfirmTransfersDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  transfers,
  freeTransfersUsed,
  additionalTransfersUsed,
  remainingBudget,
  boosts = [],
}: ConfirmTransfersDrawerProps) => {
  // Check if any boost is active (pending)
  const hasActiveBoost = boosts.some(b => b.status === "pending");

  const getBoostStatusText = (boost: BoostChip) => {
    if (boost.status === "pending") {
      return "Используется";
    }
    if (boost.status === "used" && boost.usedInTour) {
      return `${boost.usedInTour} тур`;
    }
    return "Не использован";
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-foreground text-center text-xl">
            Подтвердите замены
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 pb-6 overflow-y-auto">
          {/* Transfer pairs */}
          {transfers.length > 0 ? (
            <div className="space-y-3 mb-6">
              {transfers.map((transfer, index) => (
                <div key={index} className="flex items-center justify-center gap-3">
                  {/* Player Out */}
                  <div className="flex-1 bg-secondary rounded-xl p-3 flex items-center gap-3">
                    <img 
                      src={playerJerseyTeam} 
                      alt={transfer.playerOut?.name || "Player"} 
                      className="w-10 h-10 object-contain rounded-lg"
                    />
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">
                        {transfer.playerOut?.name || "—"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {transfer.playerOut?.points || 0} очков
                      </span>
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <ArrowLeftRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                  {/* Player In */}
                  <div className="flex-1 bg-secondary rounded-xl p-3 flex items-center gap-3">
                    <img 
                      src={playerJerseyTeam} 
                      alt={transfer.playerIn?.name || "Player"} 
                      className="w-10 h-10 object-contain rounded-lg"
                    />
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-medium">
                        {transfer.playerIn?.name || "—"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {transfer.playerIn?.points || 0} очков
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              Нет изменений для сохранения
            </p>
          )}

          {/* Boosts Section - only show if there are boosts */}
          {boosts.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {boosts.map((boost) => (
                  <div
                    key={boost.id}
                    className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] relative ${
                      boost.status === "pending"
                        ? "bg-card border-2 border-primary"
                        : "bg-card/50 grayscale opacity-60"
                    }`}
                  >
                    <img 
                      src={boost.icon} 
                      alt={boost.label} 
                      className={`w-8 h-8 mb-1 ${boost.status !== "pending" ? "grayscale" : ""}`} 
                    />
                    <span className={`text-xs font-medium text-center ${
                      boost.status === "pending" ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {boost.label}
                    </span>
                    <span className={`text-[10px] text-center ${
                      boost.status === "pending" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {getBoostStatusText(boost)}
                    </span>
                    {/* Alert circle indicator */}
                    <AlertCircle className={`absolute top-1 right-1 w-4 h-4 ${
                      boost.status === "pending" ? "text-primary" : "text-muted-foreground/50"
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="mb-6">
            <h3 className="text-foreground text-lg font-semibold mb-4">Очки</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Свободных Трансферов потрачено</span>
                <span className="text-foreground font-semibold">{freeTransfersUsed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Дополнительных Трансферов потрачено</span>
                <span className="text-foreground font-semibold">{additionalTransfersUsed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Остаток бюджета</span>
                <span className="text-foreground font-semibold">{remainingBudget}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={onClose}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-full h-12"
            >
              Изменить
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-[#A8FF00] hover:bg-[#98EE00] text-black font-semibold rounded-full h-12"
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
