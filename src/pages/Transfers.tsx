import { Button } from "@/components/ui/button";
import { ChevronRight, Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import SportHeader from "@/components/SportHeader";
import homeIcon from "@/assets/home-icon.png";
import icon2x from "@/assets/icon-2x.png";
import iconStar from "@/assets/icon-star.png";
import iconFree from "@/assets/icon-free.png";
import footballField from "@/assets/football-field.png";
import playerJerseyTeam from "@/assets/player-jersey-team.png";
import playerJerseyWhite from "@/assets/player-jersey-white.png";

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price: number;
  slotIndex?: number;
}

const specialChips = [
  { id: "double", icon: icon2x, label: "Двойная сила", sublabel: "Подробнее" },
  { id: "transfers", icon: iconStar, label: "Трансферы +", sublabel: "Подробнее" },
  { id: "golden", icon: iconFree, label: "Золотой тур", sublabel: "Подробнее" },
];

const Transfers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [teamName, setTeamName] = useState("Lucky Team");
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [editedTeamName, setEditedTeamName] = useState("Lucky Team");

  // Deadline countdown
  const deadlineDate = new Date("2025-12-14T19:00:00");
  const tournamentStartDate = new Date("2025-12-04T19:00:00");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();
      const totalDuration = deadlineDate.getTime() - tournamentStartDate.getTime();
      const elapsed = now.getTime() - tournamentStartDate.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
        
        setTimeLeft({ days, hours, minutes, seconds, progress });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Players data
  const [players, setPlayers] = useState<PlayerData[]>([
    { id: 0, name: "Плотников", team: "Динамо Минск", position: "ВР", points: 26, price: 6.5, slotIndex: 0 },
    { id: 1, name: "Плотников", team: "БАТЭ", position: "ВР", points: 26, price: 6.5, slotIndex: 1 },
    { id: 4, name: "Плотников", team: "Динамо Минск", position: "ЗЩ", points: 26, price: 6.5, slotIndex: 0 },
    { id: 5, name: "Плотников", team: "БАТЭ", position: "ЗЩ", points: 26, price: 6.5, slotIndex: 1 },
    { id: 6, name: "Плотников", team: "Динамо Минск", position: "ЗЩ", points: 26, price: 6.5, slotIndex: 2 },
    { id: 7, name: "Плотников", team: "Динамо Минск", position: "ЗЩ", points: 26, price: 6.5, slotIndex: 3 },
    { id: 8, name: "Плотников", team: "Белшина", position: "ЗЩ", points: 26, price: 6.5, slotIndex: 4 },
    { id: 12, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 26, price: 6.5, slotIndex: 0 },
    { id: 13, name: "Плотников", team: "Белшина", position: "ПЗ", points: 26, price: 6.5, slotIndex: 1 },
    { id: 14, name: "Плотников", team: "БАТЭ", position: "ПЗ", points: 26, price: 6.5, slotIndex: 2 },
    { id: 15, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 26, price: 6.5, slotIndex: 3 },
    { id: 16, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 26, price: 6.5, slotIndex: 4 },
    { id: 22, name: "Плотников", team: "БАТЭ", position: "НП", points: 26, price: 6.5, slotIndex: 0 },
    { id: 23, name: "Плотников", team: "Динамо Минск", position: "НП", points: 26, price: 6.5, slotIndex: 1 },
    { id: 24, name: "Плотников", team: "Белшина", position: "НП", points: 26, price: 6.5, slotIndex: 2 },
  ]);

  const freeTransfers = 5;
  const budget = 8;
  const totalPrice = players.reduce((sum, p) => sum + p.price, 0);

  const handleRemovePlayer = (playerId: number) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  // Formation 2-5-5-3
  const formation = [
    { position: "ВР", row: 1, col: 2, slotIndex: 0 },
    { position: "ВР", row: 1, col: 4, slotIndex: 1 },
    { position: "ЗЩ", row: 2, col: 1, slotIndex: 0 },
    { position: "ЗЩ", row: 2, col: 2, slotIndex: 1 },
    { position: "ЗЩ", row: 2, col: 3, slotIndex: 2 },
    { position: "ЗЩ", row: 2, col: 4, slotIndex: 3 },
    { position: "ЗЩ", row: 2, col: 5, slotIndex: 4 },
    { position: "ПЗ", row: 3, col: 1, slotIndex: 0 },
    { position: "ПЗ", row: 3, col: 2, slotIndex: 1 },
    { position: "ПЗ", row: 3, col: 3, slotIndex: 2 },
    { position: "ПЗ", row: 3, col: 4, slotIndex: 3 },
    { position: "ПЗ", row: 3, col: 5, slotIndex: 4 },
    { position: "НП", row: 4, col: 2, slotIndex: 0 },
    { position: "НП", row: 4, col: 3, slotIndex: 1 },
    { position: "НП", row: 4, col: 4, slotIndex: 2 },
  ];

  const getPlayerStyle = (row: number, col: number) => {
    const topPositions: Record<number, string> = {
      1: "2%",
      2: "22%",
      3: "48%",
      4: "74%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "30%", 4: "70%" },
      2: { 1: "10%", 2: "28%", 3: "50%", 4: "72%", 5: "90%" },
      3: { 1: "10%", 2: "28%", 3: "50%", 4: "72%", 5: "90%" },
      4: { 2: "28%", 3: "50%", 4: "72%" },
    };

    return {
      top: topPositions[row] || "0%",
      left: leftPositions[row]?.[col] || "50%",
      transform: "translateX(-50%)",
    };
  };

  const getPlayerForSlot = (position: string, slotIndex: number) => {
    return players.find(p => p.position === position && p.slotIndex === slotIndex);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <SportHeader />

      {/* Breadcrumb */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <img 
            src={homeIcon} 
            alt="Home" 
            className="w-5 h-5 object-contain cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("/")}
          />
          <ChevronRight className="w-3 h-3" />
          <span>Футбол</span>
          <ChevronRight className="w-3 h-3" />
          <span>Беларусь</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Трансферы</span>
        </div>
      </div>

      {/* Team Name */}
      <div className="px-4 mt-4 flex items-center justify-center gap-2">
        {isEditingTeamName ? (
          <div className="flex items-center gap-2">
            <Input
              value={editedTeamName}
              onChange={(e) => setEditedTeamName(e.target.value)}
              className="text-2xl font-bold bg-card border-border text-foreground h-10 w-56 text-center"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setTeamName(editedTeamName || "Lucky Team");
                  setIsEditingTeamName(false);
                }
                if (e.key === "Escape") {
                  setEditedTeamName(teamName);
                  setIsEditingTeamName(false);
                }
              }}
            />
            <button
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              onClick={() => {
                setTeamName(editedTeamName || "Lucky Team");
                setIsEditingTeamName(false);
              }}
            >
              <Check className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
            <button
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => {
                setEditedTeamName(teamName);
                setIsEditingTeamName(true);
              }}
            >
              <Pencil className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Deadline */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground text-sm">
            Дедлайн: <span className="text-foreground">04.04 в 19.00</span>
          </span>
          <span className="text-foreground text-sm">
            {timeLeft.days} дня {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${timeLeft.progress}%` }}
          />
        </div>
      </div>

      {/* Special Chips */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {specialChips.map((chip) => (
            <div
              key={chip.id}
              className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-20 rounded-2xl bg-card"
            >
              <img src={chip.icon} alt={chip.label} className="w-8 h-8 object-contain mb-1" />
              <span className="text-foreground text-[10px] font-medium text-center leading-tight">{chip.label}</span>
              <span className="text-primary text-[8px]">{chip.sublabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 flex gap-2">
        <Button
          onClick={() => setActiveTab("formation")}
          className={`flex-1 rounded-full ${
            activeTab === "formation"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Расстановка
        </Button>
        <Button
          onClick={() => setActiveTab("list")}
          className={`flex-1 rounded-full ${
            activeTab === "list"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Списком
        </Button>
      </div>

      {/* Formation View */}
      {activeTab === "formation" && (
        <div className="px-4 mt-4">
          <div 
            className="relative w-full rounded-2xl overflow-hidden"
            style={{ 
              backgroundImage: `url(${footballField})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '500px'
            }}
          >
            {formation.map((slot, idx) => {
              const player = getPlayerForSlot(slot.position, slot.slotIndex);
              const style = getPlayerStyle(slot.row, slot.col);

              return (
                <div
                  key={idx}
                  className="absolute flex flex-col items-center"
                  style={style}
                >
                  <div className="relative">
                    {player ? (
                      <>
                        <img 
                          src={playerJerseyTeam} 
                          alt="Jersey" 
                          className="w-12 h-12 object-contain"
                        />
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-foreground" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                          <div className="flex items-center gap-0.5 bg-primary/90 rounded px-1">
                            <span className="text-[8px] text-primary-foreground">{player.price}</span>
                            <span className="text-[8px] text-primary-foreground">•</span>
                            <span className="text-[8px] text-primary-foreground font-bold">{player.points}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <img 
                        src={playerJerseyWhite} 
                        alt="Empty" 
                        className="w-12 h-12 object-contain opacity-50"
                      />
                    )}
                  </div>
                  <div className="bg-background/90 rounded px-2 py-0.5 mt-1 text-center">
                    <span className="text-[9px] text-foreground block">
                      {player ? `${slot.position} ${player.name}` : slot.position}
                    </span>
                    {player && (
                      <span className="text-[8px] text-muted-foreground">(Д) {player.team.length > 8 ? player.team.substring(0, 8) : player.team}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {activeTab === "list" && (
        <div className="px-4 mt-4">
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground mb-2">
            <span className="flex-1">Игрок</span>
            <span className="w-14 text-center">Клуб</span>
            <span className="w-12 text-center">Очки</span>
            <span className="w-10 text-center">Цена</span>
            <span className="w-8"></span>
          </div>

          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-card rounded-full px-4 py-2 flex items-center"
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                </div>
                <span className="w-14 flex-shrink-0 text-muted-foreground text-sm text-center truncate">
                  {player.team.length > 6 ? player.team.substring(0, 6) : player.team}
                </span>
                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{player.points}</span>
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price}</span>
                <button
                  onClick={() => handleRemovePlayer(player.id)}
                  className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center hover:bg-destructive/30 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Свободные трансферы</span>
            <span className="text-foreground text-2xl font-bold">{freeTransfers}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Бюджет</span>
            <span className="text-foreground text-2xl font-bold">{budget}</span>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground text-xs block">Цена</span>
            <span className="text-foreground text-2xl font-bold">{totalPrice.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            + Добавить игрока
          </Button>
          <Button 
            variant="outline"
            className="flex-1 rounded-full border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate("/league")}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
