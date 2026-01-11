import { useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { BoostChip } from "@/components/BoostDrawer";
import { boostsApi, BoostType, ApplyBoostRequest } from "@/lib/api";
import { toast } from "sonner";

// Mapping local chip IDs to API boost types
const chipIdToBoostType: Record<string, BoostType> = {
  'bench': 'bench_boost',
  'captain3x': 'triple_captain',
  'double': 'double_bet',
  'transfers': 'transfers_plus',
  'gold': 'gold_tour',
};

interface ConfirmBoostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeBoost: () => void;
  pendingBoost: BoostChip | null;
  squadId: number | null;
  tourId: number | null;
}

const ConfirmBoostDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  onChangeBoost,
  pendingBoost,
  squadId,
  tourId,
}: ConfirmBoostDrawerProps) => {
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [requestBody, setRequestBody] = useState<ApplyBoostRequest | null>(null);

  if (!pendingBoost) return null;

  const handleConfirmClick = () => {
    if (!squadId || !tourId) {
      toast.error("Не удалось определить squad_id или tour_id");
      return;
    }

    const boostType = chipIdToBoostType[pendingBoost.id];
    if (!boostType) {
      toast.error("Неизвестный тип буста");
      return;
    }

    const body: ApplyBoostRequest = {
      squad_id: squadId,
      tour_id: tourId,
      type: boostType,
    };

    setRequestBody(body);
    setShowDebugModal(true);
  };

  const handleDebugConfirm = async () => {
    if (!requestBody) return;

    setIsApplying(true);
    try {
      const result = await boostsApi.apply(requestBody);
      
      if (result.success) {
        toast.success("Буст успешно применён");
        setShowDebugModal(false);
        onConfirm();
      } else {
        toast.error(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (err) {
      toast.error(`Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDebugCancel = () => {
    setShowDebugModal(false);
    setRequestBody(null);
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-card border-t border-border">
          <div className="px-6 py-6">
            {/* Title */}
            <h2 className="text-foreground text-xl font-display text-center mb-6">
              Подтверждение буста
            </h2>

            {/* Boost card */}
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/50 rounded-xl mb-6">
              <img 
                src={pendingBoost.icon} 
                alt={pendingBoost.label} 
                className="w-16 h-16 object-contain mb-3"
              />
              <span className="text-foreground text-lg font-medium text-center">
                {pendingBoost.label}
              </span>
              <span className="text-primary text-sm mt-1">
                Будет использован в этом туре
              </span>
            </div>

            {/* Warning text */}
            <p className="text-muted-foreground text-sm text-center mb-6 text-regular">
              После подтверждения буст нельзя будет отменить. Буст можно использовать только один раз за сезон.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onChangeBoost}
                className="flex-1 rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
              >
                Изменить
              </Button>
              <Button
                onClick={handleConfirmClick}
                className="flex-1 rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
              >
                Подтвердить
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Debug Modal */}
      <Dialog open={showDebugModal} onOpenChange={(open) => !open && handleDebugCancel()}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Debug: POST /api/boosts/apply</DialogTitle>
          </DialogHeader>
          
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-64">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
              {JSON.stringify(requestBody, null, 2)}
            </pre>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              onClick={handleDebugCancel}
              variant="outline"
              className="flex-1"
              disabled={isApplying}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDebugConfirm}
              className="flex-1 bg-primary text-primary-foreground"
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Отправка...
                </>
              ) : (
                "Отправить"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConfirmBoostDrawer;
