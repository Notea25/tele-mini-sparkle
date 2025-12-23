import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export type BoostStatus = "available" | "pending" | "used";

export interface BoostChip {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  status: BoostStatus;
  usedInTour?: number;
}

interface BoostDrawerProps {
  chip: BoostChip | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (chipId: string) => void;
  onCancel?: (chipId: string) => void;
  currentTour?: number;
}

const boostDescriptions: Record<string, { title: string; description: string; canCancel: boolean }> = {
  bench: {
    title: "Скамейка+",
    description: "Эффект: Очки игроков, находящихся на скамейке запасных, засчитываются в общую сумму баллов команды наравне с игроками стартового состава.\n\nВажно: Буст можно отменить до наступления дедлайна тура.",
    canCancel: true,
  },
  captain3x: {
    title: "3× Капитан",
    description: "Эффект: Очки, набранные твоим капитаном, утраиваются.\n\nОсобые условия:\n1. Если капитан не вышел на поле, буст передаётся вице-капитану.\n2. Если и вице-капитан не появился на поле, буст сгорает.\n\nВажно: Буст можно отменить до наступления дедлайна тура.",
    canCancel: true,
  },
  transfers: {
    title: "Трансферы+",
    description: "Эффект: Позволяет совершить неограниченное количество трансферов за один раз (без штрафа в -4 очка за каждый).\n\nОсобые условия:\n1. Все внесённые изменения в состав становятся постоянными.\n2. Накопленные до активации буста бесплатные трансферы сгорают.\n\nВажно: Буст НЕЛЬЗЯ отменить после активации.",
    canCancel: false,
  },
  golden: {
    title: "Золотой тур",
    description: "Эффект: Позволяет совершать неограниченное количество бесплатных трансферов (без штрафа -4 очка) в рамках одного игрового тура.\n\nОсобые условия:\n1. После окончания тура состав автоматически возвращается к тому, который был до активации буста.\n2. Накопленные бесплатные трансферы НЕ сгорают.\n\nВажно: Буст НЕЛЬЗЯ отменить после активации.",
    canCancel: false,
  },
  double: {
    title: "Двойная сила",
    description: "Эффект: Очки удваиваются как для капитана, так и для вице-капитана.\n\nОсобые условия:\n1. Если капитан или вице-капитан не вышли на поле, буст НЕ переносится на других игроков.\n\nВажно: Буст можно отменить до наступления дедлайна тура.",
    canCancel: true,
  }
};

const BoostDrawer = ({ chip, isOpen, onClose, onApply, onCancel, currentTour = 1 }: BoostDrawerProps) => {
  if (!chip) return null;

  const boostInfo = boostDescriptions[chip.id];

  const handleApply = () => {
    onApply(chip.id);
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(chip.id);
    }
    onClose();
  };

  const getStatusText = () => {
    if (chip.status === "pending") {
      return `Используется в ${currentTour} туре`;
    }
    if (chip.status === "used" && chip.usedInTour) {
      return `Использовано в ${chip.usedInTour} туре`;
    }
    return null;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-[#1a1a2e] border-t border-gray-800">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-600 mb-4 mt-2" />
        <DrawerHeader className="flex flex-col items-center text-center px-6 pb-6">
          <div className="mb-4">
            <img 
              src={chip.icon} 
              alt={chip.label} 
              className="w-16 h-16 object-contain"
            />
          </div>
          <DrawerTitle className="text-2xl font-bold text-white mb-4">
            {boostInfo?.title || chip.label}
          </DrawerTitle>
          <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
            {boostInfo?.description}
          </p>
          {getStatusText() && (
            <p className={`text-sm mt-4 ${chip.status === "pending" ? "text-primary" : "text-gray-500"}`}>
              {getStatusText()}
            </p>
          )}
        </DrawerHeader>
        <div className="px-6 pb-8 space-y-3">
          {chip.status === "available" && (
            <Button
              onClick={handleApply}
              className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
            >
              Использовать
            </Button>
          )}
          {chip.status === "pending" && (
            <>
              {onCancel && boostInfo?.canCancel && (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full h-14 rounded-full border-destructive text-destructive hover:bg-destructive/10 text-lg font-semibold"
                >
                  Отменить
                </Button>
              )}
              <Button
                onClick={onClose}
                className="w-full h-14 rounded-full bg-[#2a2a3e] hover:bg-[#3a3a4e] text-white text-lg font-semibold"
              >
                Закрыть
              </Button>
            </>
          )}
          {chip.status === "used" && (
            <Button
              onClick={onClose}
              className="w-full h-14 rounded-full bg-[#2a2a3e] hover:bg-[#3a3a4e] text-white text-lg font-semibold"
            >
              Закрыть
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BoostDrawer;
