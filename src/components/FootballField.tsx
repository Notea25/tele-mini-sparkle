import { useState } from "react";
import { Plus, X } from "lucide-react";
import fieldWithPlayers from "@/assets/field-with-players.png";

interface PlayerPosition {
  id: string;
  x: number;
  y: number;
  hasPlayer: boolean;
  name?: string;
  position: string;
}

const initialPositions: PlayerPosition[] = [
  // Goalkeeper
  { id: "gk", x: 50, y: 88, hasPlayer: false, position: "ВР" },
  // Defenders
  { id: "lb", x: 15, y: 70, hasPlayer: false, position: "ЛЗ" },
  { id: "lcb", x: 35, y: 72, hasPlayer: false, position: "ЦЗ" },
  { id: "rcb", x: 65, y: 72, hasPlayer: false, position: "ЦЗ" },
  { id: "rb", x: 85, y: 70, hasPlayer: false, position: "ПЗ" },
  // Midfielders
  { id: "lm", x: 20, y: 48, hasPlayer: false, position: "ЛП" },
  { id: "cm1", x: 40, y: 50, hasPlayer: false, position: "ЦП" },
  { id: "cm2", x: 60, y: 50, hasPlayer: false, position: "ЦП" },
  { id: "rm", x: 80, y: 48, hasPlayer: false, position: "ПП" },
  // Forwards
  { id: "lf", x: 35, y: 25, hasPlayer: false, position: "ЛН" },
  { id: "rf", x: 65, y: 25, hasPlayer: false, position: "ПН" },
];

interface FootballFieldProps {
  onAddPlayer?: (positionId: string) => void;
  onRemovePlayer?: (positionId: string) => void;
}

const FootballField = ({ onAddPlayer, onRemovePlayer }: FootballFieldProps) => {
  const [positions, setPositions] = useState<PlayerPosition[]>(initialPositions);

  const handleTogglePlayer = (positionId: string) => {
    setPositions(prev =>
      prev.map(pos => {
        if (pos.id === positionId) {
          const newHasPlayer = !pos.hasPlayer;
          if (newHasPlayer) {
            onAddPlayer?.(positionId);
          } else {
            onRemovePlayer?.(positionId);
          }
          return { ...pos, hasPlayer: newHasPlayer, name: newHasPlayer ? "Игрок" : undefined };
        }
        return pos;
      })
    );
  };

  return (
    <div className="relative w-full">
      {/* Field Background */}
      <div 
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #2d5a1e 0%, #488D10 50%, #2d5a1e 100%)",
        }}
      >
        {/* Field markings */}
        <div className="relative w-full aspect-[3/4] p-4">
          {/* Field border */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
            {/* Center line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
            {/* Penalty area top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-t-0 border-white/30" />
            {/* Goal area top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 border-2 border-t-0 border-white/30" />
            {/* Penalty area bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 border-2 border-b-0 border-white/30" />
            {/* Goal area bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-6 border-2 border-b-0 border-white/30" />
          </div>

          {/* Player Positions */}
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Add/Remove Button */}
              <button
                onClick={() => handleTogglePlayer(pos.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
                  pos.hasPlayer
                    ? "bg-card/80 hover:bg-card text-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {pos.hasPlayer ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>

              {/* Jersey/Position */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-12 rounded-sm flex items-center justify-center ${
                  pos.hasPlayer ? "bg-white" : "bg-white/50"
                }`}>
                  <span className="text-xs font-bold text-background">{pos.position}</span>
                </div>
                {pos.hasPlayer && pos.name && (
                  <span className="text-white text-xs font-medium mt-1 bg-black/50 px-2 py-0.5 rounded">
                    {pos.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FootballField;
