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

const boostDescriptions: Record<string, { title: string; description: string }> = {
  bench: {
    title: "Скамейка+",
    description: "Очки, набранные игроками, оставленными на скамейке запасных в течение тура, будут добавлены к общему количеству очков. Отмена может быть произведена в любое время до окончания игровой недели.",
  },
  captain3x: {
    title: "3-х Капитан",
    description: "Очки, набранные вашим капитаном, будут утроены, а не удвоены в течение турнира. Отмена может быть произведена в любое время до окончания игровой недели."
  },
  transfers: {
    title: "Трансферы +",
    description: "Совершайте неограниченное количество постоянных трансферов в течение одного тура, не тратя на каждый из них обычные 4 очка.\nВы теряете первую карту Трансферы + после дедлайна 19-го тура, 29 декабря 16:00.\nВторая Трансферы + будет доступна после 16:00 29 декабря.\n\nЭта фишка не может быть отменена, если вы совершили 2 или более трансферов в этот тур. Как только статус фишки изменится с «Ожидает» на «Активна», активация не может быть отменена."
  },
  golden: {
    title: "Золотой тур",
    description: "Совершайте неограниченное количество бесплатных трансферов в течение одного тура. На следующем туре ваш состав вернется к тому, каким он был в начале последнего тура.\n\nЭту фишку нельзя отменить после того, как вы ее разыграли, если только вы еще не совершили трансфер в этом туре."
  },
  double: {
    title: "Двойная сила",
    description: "При использовании данной карты удваиваются очки не только капитана, но и вице-капитана. В случае, если кто-либо из выбранных игроков (капитана и вице-капитана) не сыграл в матче - бустер НЕ переходит к другим игрокам и просто сгорает (т.е удваиваются очки только того игрока, который играл в матче). Использовать можно 1 раз за весь сезон."
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
          {chip.status === "pending" && onCancel && (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="w-full h-14 rounded-full border-destructive text-destructive hover:bg-destructive/10 text-lg font-semibold"
              >
                Отменить
              </Button>
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
