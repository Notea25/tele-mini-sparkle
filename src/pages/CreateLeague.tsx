import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, ChevronRight } from "lucide-react";
import SportHeader from "@/components/SportHeader";
import homeIcon from "@/assets/home-icon.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowSame from "@/assets/arrow-same.png";

interface CreatedLeague {
  id: string;
  name: string;
  participants: number;
  isOwner: boolean;
  createdAt: string;
}

const CreateLeague = () => {
  const navigate = useNavigate();
  const [leagueName, setLeagueName] = useState("");
  const [createdLeague, setCreatedLeague] = useState<CreatedLeague | null>(null);

  // Check if we have a recently created league to display
  useEffect(() => {
    const currentLeagueId = sessionStorage.getItem("currentLeagueId");
    if (currentLeagueId) {
      const savedLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
      const league = savedLeagues.find((l: CreatedLeague) => l.id === currentLeagueId);
      if (league) {
        setCreatedLeague(league);
      }
    }
  }, []);

  const handleCreateLeague = () => {
    if (leagueName.trim()) {
      const newLeague: CreatedLeague = {
        id: `league-${Date.now()}`,
        name: leagueName.trim(),
        participants: 1,
        isOwner: true,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existingLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
      localStorage.setItem("userCreatedLeagues", JSON.stringify([...existingLeagues, newLeague]));
      
      // Store current league ID in session to show it
      sessionStorage.setItem("currentLeagueId", newLeague.id);
      
      setCreatedLeague(newLeague);
    }
  };

  const handleDeleteLeague = () => {
    if (createdLeague) {
      const existingLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
      const updatedLeagues = existingLeagues.filter((l: CreatedLeague) => l.id !== createdLeague.id);
      localStorage.setItem("userCreatedLeagues", JSON.stringify(updatedLeagues));
      sessionStorage.removeItem("currentLeagueId");
      navigate("/league");
    }
  };

  const handleInviteFriend = () => {
    // TODO: Implement invite functionality (share link, etc.)
    if (navigator.share) {
      navigator.share({
        title: `Присоединяйся к лиге ${createdLeague?.name}`,
        text: `Приглашаю тебя в мою лигу "${createdLeague?.name}" в Fantasy Sports!`,
      });
    }
  };

  // Mock standings data for the league
  const leagueStandings = [
    { position: 1, change: "same", name: "Dream team", tourPoints: 32, totalPoints: 3123 },
    { position: 2, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 3, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 4, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 5, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 6, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 7, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 8, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 9, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 10, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
  ];

  // If league is created, show the league management view
  if (createdLeague) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SportHeader backTo="/league" />
        
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
            <ChevronRight className="w-3 h-3" />
            <span>{createdLeague.name}</span>
          </div>

          {/* League Title with Owner Badge */}
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold text-foreground">{createdLeague.name}</h1>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
            <span className="col-span-2">Позиция</span>
            <span className="col-span-4">Команда</span>
            <span className="col-span-3 text-center">Очки / тур 29</span>
            <span className="col-span-3 text-right">Всего очков</span>
          </div>

          {/* League Standings */}
          <div className="space-y-2 mb-6">
            {leagueStandings.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-secondary/50 rounded-full"
              >
                <div className="col-span-2 flex items-center gap-1">
                  {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                  {row.change === "down" && <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />}
                  {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                  <span className="text-foreground font-medium">{row.position}</span>
                  {row.position <= 3 && <span className="text-yellow-500">🏆</span>}
                </div>
                <span className="col-span-4 text-foreground text-sm truncate">{row.name}</span>
                <span className="col-span-3 text-center text-foreground text-sm">{row.tourPoints}</span>
                <span className="col-span-3 text-right text-foreground text-sm font-medium">
                  {row.totalPoints.toLocaleString().replace(",", " ")}
                </span>
              </div>
            ))}
          </div>
        </main>

        {/* Fixed Bottom Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-2 space-y-3">
          <Button
            onClick={handleInviteFriend}
            className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground"
          >
            Пригласить друга
          </Button>
          <Button
            onClick={handleDeleteLeague}
            variant="outline"
            className="w-full rounded-full py-6 font-semibold border-border text-foreground"
          >
            ✕ Удалить лигу
          </Button>
        </div>
      </div>
    );
  }

  // Initial creation form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader backTo="/league" />
      <div className="flex-1 px-4 pt-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground italic mb-6">
          Создай свою лигу
        </h1>

        {/* League Name Input */}
        <Input
          type="text"
          placeholder="Название лиги"
          value={leagueName}
          onChange={(e) => setLeagueName(e.target.value)}
          className="w-full bg-secondary/50 border-none rounded-xl py-6 px-4 text-foreground placeholder:text-muted-foreground mb-4"
        />

        {/* Create Button */}
        <Button
          onClick={handleCreateLeague}
          disabled={!leagueName.trim()}
          className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground disabled:opacity-50"
        >
          Создать лигу
        </Button>
      </div>
    </div>
  );
};

export default CreateLeague;
