import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import homeIcon from "@/assets/home-icon.png";

// Random team names (same as in TournamentTable)
const teamNames = [
  "FC Phoenix", "Red Bulls", "Golden Eagles", "Thunder FC", "Storm United",
  "Blue Lions", "Silver Hawks", "Dark Knights", "Fire Dragons", "Ice Warriors",
  "Royal Tigers", "Electric City", "Shadow Wolves", "Crimson Kings", "Emerald Stars",
  "Diamond FC", "Platinum United", "Bronze Legends", "Copper Chiefs", "Steel Titans",
  "Galaxy FC", "Cosmic Stars", "Meteor United", "Comet FC", "Asteroid FC",
  "Ocean Waves", "River Flow", "Lake City", "Mountain FC", "Valley United",
  "Forest Rangers", "Desert Hawks", "Tundra Bears", "Jungle Cats", "Savanna Lions",
  "Arctic Foxes", "Tropical Storm", "Volcano FC", "Canyon City", "Prairie Dogs",
  "Night Owls", "Dawn Breakers", "Sunset FC", "Twilight United", "Midnight FC",
  "Victory FC", "Champion Stars", "Glory United", "Honor FC", "Pride City",
  "Spirit FC", "Soul United", "Heart FC", "Mind Warriors", "Power FC",
  "Speed Demons", "Flash FC", "Lightning FC", "Bolt United", "Spark City",
  "Alpha FC", "Beta United", "Gamma FC", "Delta City", "Omega FC",
  "Zenith Stars", "Apex United", "Summit FC", "Peak City", "Pinnacle FC",
  "Nova FC", "Quantum United", "Fusion FC", "Energy City", "Dynamo FC",
  "Rocket FC", "Jet United", "Turbo FC", "Nitro City", "Boost FC",
  "Legend FC", "Myth United", "Epic FC", "Hero City", "Champion FC",
  "Elite Stars", "Premier United", "Supreme FC", "Ultimate City", "Max FC",
  "Prime FC", "Core United", "Base FC", "Root City", "Origin FC",
  "Future FC", "Next United", "Forward FC", "Ahead City", "Beyond FC"
];

const playerNames = [
  "Иванов", "Петров", "Сидоров", "Козлов", "Новиков",
  "Морозов", "Волков", "Алексеев", "Лебедев", "Семенов",
  "Егоров", "Павлов", "Федоров", "Николаев", "Соколов"
];

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
}

const ViewTeam = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [currentTour, setCurrentTour] = useState(29);

  const teamIndex = parseInt(teamId || "1") - 1;
  const teamName = teamNames[teamIndex % teamNames.length];

  // Generate random players for this team
  const { mainSquadPlayers, benchPlayers, totalPoints } = useMemo(() => {
    const positions = ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП"];
    const benchPositions = ["ЗЩ", "ПЗ", "ПЗ", "ВР"];
    
    const main: PlayerData[] = positions.map((pos, idx) => ({
      id: idx,
      name: playerNames[idx % playerNames.length],
      team: "Динамо Минск",
      position: pos,
      points: Math.floor(Math.random() * 20) + 20,
      price: Math.floor(Math.random() * 5) + 5 + Math.random(),
      slotIndex: positions.slice(0, idx).filter(p => p === pos).length,
      isCaptain: idx === 5,
    }));

    const bench: PlayerData[] = benchPositions.map((pos, idx) => ({
      id: 100 + idx,
      name: playerNames[(idx + 11) % playerNames.length],
      team: "БАТЭ",
      position: pos,
      points: Math.floor(Math.random() * 15) + 15,
      price: Math.floor(Math.random() * 4) + 4 + Math.random(),
      isOnBench: true,
    }));

    const total = main.reduce((sum, p) => sum + p.points, 0);

    return { mainSquadPlayers: main, benchPlayers: bench, totalPoints: total };
  }, [teamId]);

  const handleTourChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentTour > 1) {
      setCurrentTour(currentTour - 1);
    } else if (direction === "next" && currentTour < 38) {
      setCurrentTour(currentTour + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <span className="text-primary">{teamName}</span>
        </div>
      </div>

      {/* Team Name */}
      <div className="px-4 mt-4 flex items-center justify-center">
        <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
      </div>

      {/* Tour Selector */}
      <div className="px-4 mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => handleTourChange("prev")}
          disabled={currentTour <= 1}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-secondary/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-foreground text-lg font-medium">{currentTour} тур</span>
        <button
          onClick={() => handleTourChange("next")}
          disabled={currentTour >= 38}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-secondary/50 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Points Card */}
      <div className="px-4 mt-6">
        <div className="bg-primary rounded-2xl p-4 flex flex-col items-center">
          <span className="text-4xl font-bold text-primary-foreground">{totalPoints}</span>
          <span className="text-primary-foreground/80 text-sm">Очки</span>
        </div>
        <div className="bg-secondary/80 rounded-b-2xl py-2 text-center -mt-2">
          <span className="text-foreground text-sm font-medium">3x Капитан</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6 flex gap-2">
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
        <div className="mt-6">
          <FormationFieldManagement
            mainSquadPlayers={mainSquadPlayers}
            benchPlayers={benchPlayers}
            onPlayerClick={() => {}}
          />
        </div>
      )}

      {/* List View */}
      {activeTab === "list" && (
        <div className="px-4 mt-6 pb-6">
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground mb-2">
            <span className="flex-1">Игрок</span>
            <span className="w-14 text-center">Клуб</span>
            <span className="w-12 text-center">Очки</span>
            <span className="w-10 text-center">Цена</span>
          </div>

          <div className="space-y-2">
            {mainSquadPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-card rounded-full px-4 py-2 flex items-center"
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                  {player.isCaptain && (
                    <span className="bg-primary text-primary-foreground text-[8px] px-1 rounded">x3</span>
                  )}
                </div>
                <span className="w-14 flex-shrink-0 text-muted-foreground text-sm text-center truncate">
                  {player.team.length > 6 ? player.team.substring(0, 6) : player.team}
                </span>
                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{player.points}</span>
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price.toFixed(1)}</span>
              </div>
            ))}
          </div>

          <h3 className="text-muted-foreground text-sm mt-6 mb-2">Замены</h3>
          <div className="space-y-2">
            {benchPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-card rounded-full px-4 py-2 flex items-center opacity-70"
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                </div>
                <span className="w-14 flex-shrink-0 text-muted-foreground text-sm text-center truncate">
                  {player.team.length > 6 ? player.team.substring(0, 6) : player.team}
                </span>
                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{player.points}</span>
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTeam;
