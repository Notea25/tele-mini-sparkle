import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import { getSavedTeam, getMainSquadAndBench, PlayerData } from "@/lib/teamData";
import homeIcon from "@/assets/home-icon.png";
import icon2x from "@/assets/icon-2x.png";
import iconStar from "@/assets/icon-star.png";
import iconFree from "@/assets/icon-free.png";

const specialChips = [
  { id: "double", icon: icon2x, label: "Двойная сила", sublabel: "Подробнее" },
  { id: "transfers", icon: iconStar, label: "Трансферы +", sublabel: "Подробнее" },
  { id: "golden", icon: iconFree, label: "Золотой тур", sublabel: "Подробнее" },
];

const Transfers = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [teamName] = useState(() => getSavedTeam().teamName);

  // Load saved team
  const [mainSquadPlayers, setMainSquadPlayers] = useState<PlayerData[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const { mainSquad, bench } = getMainSquadAndBench();
    if (mainSquad.length > 0) {
      setMainSquadPlayers(mainSquad);
      setBenchPlayers(bench);
    }
  }, []);

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

  const allPlayers = [...mainSquadPlayers, ...benchPlayers];
  const totalPrice = allPlayers.reduce((sum, p) => sum + p.price, 0);
  const freeTransfers = 5;
  const budget = 100 - totalPrice;

  const handleRemovePlayer = (playerId: number) => {
    setMainSquadPlayers(prev => prev.filter(p => p.id !== playerId));
    setBenchPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <SportHeader backTo="/league" />

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
        <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
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
        <div className="mt-4">
          <FormationFieldManagement
            mainSquadPlayers={mainSquadPlayers}
            benchPlayers={benchPlayers}
            onPlayerClick={() => {}}
          />
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
            {allPlayers.map((player) => (
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
