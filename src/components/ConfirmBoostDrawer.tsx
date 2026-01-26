import { useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BoostChip } from "@/components/BoostDrawer";
import { boostsApi, BoostType, ApplyBoostRequest } from "@/lib/api";
import { toast } from "sonner";

// Mapping local chip IDs to API boost types
const chipIdToBoostType: Record<string, BoostType> = {
  bench: "bench_boost",
  captain3x: "triple_captain",
  double: "double_bet",
  transfers: "transfers_plus",
  gold: "gold_tour",
};

interface ConfirmBoostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeBoost: () => void;
  pendingBoost: BoostChip | null;
  squadId: number | null;
  tourId: number | null;
  /**
   * Изначально выбранный буст на следующий тур (по данным GET /api/boosts/available при заходе на страницу).
   * Если он отличается от pendingBoost.id, перед применением нового буста нужно вызвать DELETE /remove.
   */
  initialBoostChipId?: string | null;
}

const ConfirmBoostDrawer = ({
  isOpen,
  onClose,
  onConfirm,
  onChangeBoost,
  pendingBoost,
  squadId,
  tourId,
  initialBoostChipId = null,
}: ConfirmBoostDrawerProps) => {
  const [isApplying, setIsApplying] = useState(false);

  if (!pendingBoost) return null;

  const handleConfirmClick = async () => {
    if (!squadId || !tourId) {
      toast.error("Не удалось определить squad_id или tour_id");
      return;
    }

    const boostType = chipIdToBoostType[pendingBoost.id];
    if (!boostType) {
      toast.error("Неизвестный тип буста");
      return;
    }

    setIsApplying(true);
    try {
      // Если на момент захода на страницу был выбран другой буст на следующий тур — сначала удаляем его
      if (initialBoostChipId && initialBoostChipId !== pendingBoost.id) {
        const removeResult = await boostsApi.remove(squadId, tourId);
        if (!removeResult.success) {
          toast.error(removeResult.error || "Ошибка при отмене предыдущего буста");
          setIsApplying(false);
          return;
        }
      }

      const body: ApplyBoostRequest = {
        squad_id: squadId,
        tour_id: tourId,
        type: boostType,
      };

      const result = await boostsApi.apply(body);

      if (result.success) {
        toast.success("Буст успешно применён");
        onConfirm();
      } else {
        toast.error(`Ошибка: ${result.error || "Неизвестная ошибка"}`);
      }
    } catch (err) {
      toast.error(`Ошибка: ${err instanceof Error ? err.message : "Неизвестная ошибка"}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-card border-t border-border">
          <div className="px-6 py-6">
            {/* Title */}
            <h2 className="text-foreground text-xl font-display text-center mb-6">Подтверждение буста</h2>

            {/* Boost card */}
            <div className="flex flex-col items-center justify-center p-6 bg-secondary/50 rounded-xl mb-6">
              <img src={pendingBoost.icon} alt={pendingBoost.label} className="w-16 h-16 object-contain mb-3" />
              <span className="text-foreground text-lg font-medium text-center">{pendingBoost.label}</span>
              <span className="text-primary text-sm mt-1">Будет использован в этом туре</span>
            </div>

            {/* Warning text */}
            <p className="text-muted-foreground text-sm text-center mb-6 text-regular">
              Буст можно использовать только один раз за сезон.
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
                disabled={isApplying}
                className="flex-1 rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon flex items-center justify-center"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Подтверждение...
                  </>
                ) : (
                  "Подтвердить"
                )}
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ConfirmBoostDrawer;
