import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SportHeader from "@/components/SportHeader";
import homeIcon from "@/assets/home-icon.png";
import btnTeam from "@/assets/btn-team.png";
import btnTransfers from "@/assets/btn-transfers.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";

const League = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"main" | "leagues" | "cup">("main");
  const [teamName, setTeamName] = useState("Lucky Team");

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
        const progress = Math.min((elapsed / totalDuration) * 100, 100);
        
        setTimeLeft({ days, hours, minutes, seconds, progress });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tournament table data
  const tableData = [
    { position: 1, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 2, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 3, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 9, change: "down", name: "Моя команда", tourPoints: 32, totalPoints: 3123, isUser: true },
  ];

  const tabs = [
    { id: "main", label: "Главная" },
    { id: "leagues", label: "Лиги" },
    { id: "cup", label: "Кубок" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader />

      <main className="flex-1 px-4 pb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
          <img 
            src={homeIcon} 
            alt="Home" 
            className="w-4 h-4 cursor-pointer hover:opacity-80" 
            onClick={() => navigate("/")}
          />
          <ChevronRight className="w-3 h-3" />
          <span>Футбол</span>
          <ChevronRight className="w-3 h-3" />
          <span>Беларусь</span>
        </div>

        {/* Tabs */}
        <div className="bg-secondary/50 rounded-full p-1 flex mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "main" | "leagues" | "cup")}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Team Name */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-foreground">{teamName}</h1>
          <Pencil className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
        </div>

        {/* Current Tour Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <span className="text-muted-foreground text-sm whitespace-nowrap">29 тур</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Average result */}
          <div className="bg-secondary/50 rounded-2xl px-3 py-2 flex flex-col items-center border border-border">
            <span className="text-2xl font-bold text-foreground">40</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Средний результат</span>
            <span className="text-muted-foreground text-sm">→</span>
          </div>
          
          {/* Your points - highlighted */}
          <div className="bg-primary rounded-2xl px-3 py-2 flex flex-col items-center">
            <span className="text-2xl font-bold text-primary-foreground">55</span>
            <span className="text-[10px] text-primary-foreground/80 whitespace-nowrap">Твои очки</span>
            <span className="text-primary-foreground text-sm">→</span>
          </div>
          
          {/* Best result */}
          <div className="bg-secondary/50 rounded-2xl px-3 py-2 flex flex-col items-center border border-border">
            <span className="text-2xl font-bold text-foreground">129</span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Лучший результат</span>
            <span className="text-muted-foreground text-sm">→</span>
          </div>
        </div>

        {/* Next Tour */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <span className="text-muted-foreground text-sm whitespace-nowrap">30 тур</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Deadline */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground text-sm">
            Дедлайн: <span className="text-foreground">04.04 в 19.00</span>
          </span>
          <span className="text-foreground text-sm">
            {timeLeft.days} дня {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full mb-6">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${timeLeft.progress}%` }}
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <img 
            src={btnTeam} 
            alt="Команда" 
            className="w-full cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate("/team-builder")}
          />
          <img 
            src={btnTransfers} 
            alt="Трансферы" 
            className="w-full cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>

        {/* Tournament Table */}
        <h2 className="text-2xl font-bold text-foreground mb-4">Турнирная таблица</h2>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
          <span className="col-span-2">Позиция</span>
          <span className="col-span-4">Команда</span>
          <span className="col-span-3 text-center">Очки / тур<br/>29</span>
          <span className="col-span-3 text-center">Всего очков</span>
        </div>

        {/* Table rows */}
        <div className="space-y-2">
          {tableData.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-full ${
                  row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                }`}
                style={{ width: 'calc(100% - 24px)' }}
              >
                <div className="col-span-2 flex items-center gap-1">
                  {row.change === "up" && <img src={arrowUpRed} alt="up" className="w-3 h-3" />}
                  {row.change === "down" && !row.isUser && <img src={arrowDownGreen} alt="down" className="w-3 h-3" />}
                  {row.change === "down" && row.isUser && <img src={arrowDownBlack} alt="down" className="w-3 h-3" />}
                  {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                  <span className={`font-medium ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.position}</span>
                  {row.position === 1 && <img src={trophyGold} alt="1st" className="w-4 h-4" />}
                  {row.position === 2 && <img src={trophySilver} alt="2nd" className="w-4 h-4" />}
                  {row.position === 3 && <img src={trophyBronze} alt="3rd" className="w-4 h-4" />}
                </div>
                <span className={`col-span-4 font-medium truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.name}</span>
                <span className={`col-span-3 text-center ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.tourPoints}</span>
                <span className={`col-span-3 text-center font-bold ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.totalPoints.toLocaleString()}</span>
              </div>
              <span className={`font-bold text-sm w-5 ${row.isUser ? "text-primary" : "text-transparent"}`}>
                {row.isUser ? "Ты" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* View all button */}
        <Button
          variant="outline"
          className="w-full mt-6 rounded-full py-6 font-semibold border-border"
        >
          Смотреть все
        </Button>
      </main>
    </div>
  );
};

export default League;
