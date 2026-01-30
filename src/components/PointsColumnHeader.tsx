import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

type PointsType = "season" | "tour";

interface PointsColumnHeaderProps {
  type: PointsType;
  className?: string;
  children?: React.ReactNode;
}

const TOOLTIPS: Record<PointsType, string> = {
  season: "В этой графе показаны очки игроков за весь текущий сезон",
  tour: "В этой графе показаны очки игроков за крайний игровой тур (или за текущий тур, если он ещё не завершён)",
};

export function PointsColumnHeader({ type, className = "", children }: PointsColumnHeaderProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-0.5 cursor-pointer hover:text-foreground transition-colors ${className}`}
            onClick={() => setOpen(!open)}
          >
            {children || <span>Очки</span>}
            <Info className="w-3 h-3 opacity-60" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-[250px] text-center text-xs bg-popover border-border z-[100]"
        >
          <p>{TOOLTIPS[type]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default PointsColumnHeader;
