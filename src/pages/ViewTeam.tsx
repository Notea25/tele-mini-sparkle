import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import Breadcrumbs from "@/components/Breadcrumbs";
import PlayerCard from "@/components/PlayerCard";
import { generateTourData, getTourBoostInfo, MAX_TOURS } from "@/lib/tourData";

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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [currentTour, setCurrentTour] = useState(29);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);

  const teamIdParam = searchParams.get("id");
  const parsedTeamId = Number.parseInt(teamIdParam ?? "1", 10);
  const teamId = Number.isFinite(parsedTeamId) ? parsedTeamId : 1;

  const teamNameParam = searchParams.get("name");
  const teamIndex = teamId - 1;
  const teamName = teamNameParam || teamNames[teamIndex % teamNames.length];

  // Generate tour data for this team
  const { tourPoints, tourBoosts } = useMemo(() => {
    return generateTourData(teamId);
  }, [teamId]);

  // Get current tour boost info
  const currentBoostInfo = getTourBoostInfo(tourBoosts[currentTour - 1]);
  const currentTourPoints = tourPoints[currentTour - 1] || 0;

  // Generate random players for this team and tour
  // Total squad: 2 ВР, 5 ЗЩ, 5 ПЗ, 3 НП = 15 players
  const { mainSquadPlayers, benchPlayers, captainId, viceCaptainId } = useMemo(() => {
    // Main squad: 1 ВР, 4 ЗЩ, 4 ПЗ, 2 НП = 11
    const positions = ["ВР", "ЗЩ", "ЗЩ", "ЗЩ", "ЗЩ", "ПЗ", "ПЗ", "ПЗ", "ПЗ", "НП", "НП"];
    // Bench: 1 ВР, 1 ЗЩ, 1 ПЗ, 1 НП = 4 (goalkeeper always first)
    const benchPositions = ["ВР", "ЗЩ", "ПЗ", "НП"];
    
    // Use tour and teamId as seed for different points per tour
    const seed = teamId * 100 + currentTour;
    
    // Deterministic captain and vice-captain selection based on seed
    const captainSeed = Math.sin(seed * 7) * 10000;
    const captainIdx = Math.floor((captainSeed - Math.floor(captainSeed)) * 11);
    let viceCaptainIdx = Math.floor((Math.sin(seed * 13) * 10000 - Math.floor(Math.sin(seed * 13) * 10000)) * 11);
    if (viceCaptainIdx === captainIdx) {
      viceCaptainIdx = (viceCaptainIdx + 1) % 11;
    }
    
    const main: PlayerData[] = positions.map((pos, idx) => {
      const playerSeed = seed * 100 + idx;
      const pseudoRandom = Math.sin(playerSeed) * 10000;
      const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
      
      return {
        id: idx,
        name: playerNames[idx % playerNames.length],
        team: "Динамо Минск",
        position: pos,
        points: Math.floor(randomFactor * 15) + 2,
        price: Math.floor(randomFactor * 5) + 5 + randomFactor,
        slotIndex: positions.slice(0, idx).filter(p => p === pos).length,
        isCaptain: idx === captainIdx,
        isViceCaptain: idx === viceCaptainIdx,
      };
    });

    const bench: PlayerData[] = benchPositions.map((pos, idx) => {
      const playerSeed = seed * 100 + 50 + idx;
      const pseudoRandom = Math.sin(playerSeed) * 10000;
      const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
      
      return {
        id: 100 + idx,
        name: playerNames[(idx + 11) % playerNames.length],
        team: "БАТЭ",
        position: pos,
        points: Math.floor(randomFactor * 10) + 1,
        price: Math.floor(randomFactor * 4) + 4 + randomFactor,
        isOnBench: true,
      };
    });

    return { 
      mainSquadPlayers: main, 
      benchPlayers: bench,
      captainId: captainIdx,
      viceCaptainId: viceCaptainIdx,
    };
  }, [teamId, currentTour]);

  const handleTourChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentTour > 1) {
      setCurrentTour(currentTour - 1);
    } else if (direction === "next" && currentTour < MAX_TOURS) {
      setCurrentTour(currentTour + 1);
    }
  };

  const handlePlayerClick = (player: PlayerData) => {
    setSelectedPlayer(player);
    setIsPlayerCardOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SportHeader backTo="/league" />

      {/* Breadcrumb */}
      <div className="px-4 mt-4">
        <Breadcrumbs
          items={[
            { label: "Футбол", path: "/" },
            { label: "Беларусь", path: "/" },
            { label: "Лига", path: "/league" },
            { label: teamName },
          ]}
        />
      </div>

      {/* Team Name */}
      <div className="px-4 mt-4 flex items-center justify-center">
        <h1 className="text-foreground text-3xl font-bold">{teamName}</h1>
      </div>

      {/* Tour Label with Gradient Lines */}
      <div className="px-4 mt-4 flex items-center justify-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-muted-foreground/30" />
        <span className="text-muted-foreground text-sm font-medium">{currentTour} тур</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-muted-foreground/30" />
      </div>

      {/* Points Block with Navigation Arrows */}
      <div className="px-4 mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => handleTourChange("prev")}
          disabled={currentTour <= 1}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-secondary/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="bg-primary rounded-full px-6 py-2 flex items-center justify-center gap-2 min-w-[200px]">
          <span className="text-2xl font-bold text-primary-foreground">{currentTourPoints}</span>
          <span className="text-primary-foreground/80 text-sm">очков</span>
          {/* Used Boost Icon - only show if boost was used this tour */}
          {currentBoostInfo && (
            <div className="bg-secondary rounded-lg p-1.5 flex items-center justify-center ml-1" title={currentBoostInfo.label}>
              <img src={currentBoostInfo.icon} alt={currentBoostInfo.label} className="w-5 h-5 object-contain" />
            </div>
          )}
        </div>
        
        <button
          onClick={() => handleTourChange("next")}
          disabled={currentTour >= MAX_TOURS}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-secondary/50 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
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
            onPlayerClick={handlePlayerClick}
            captain={captainId}
            viceCaptain={viceCaptainId}
            showPrice={false}
            showPointsInsteadOfTeam={true}
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
            {[...mainSquadPlayers]
              .sort((a, b) => {
                const positionOrder = { "ВР": 0, "ЗЩ": 1, "ПЗ": 2, "НП": 3 };
                return (positionOrder[a.position as keyof typeof positionOrder] ?? 4) - 
                       (positionOrder[b.position as keyof typeof positionOrder] ?? 4);
              })
              .map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className="bg-card rounded-full px-4 py-2 flex items-center cursor-pointer hover:bg-card/80 transition-colors"
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                  {player.isCaptain && (
                    <span className="bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded font-bold">К</span>
                  )}
                  {player.isViceCaptain && (
                    <span className="bg-secondary text-secondary-foreground text-[8px] px-1.5 py-0.5 rounded font-bold">ВК</span>
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
                onClick={() => handlePlayerClick(player)}
                className="bg-card rounded-full px-4 py-2 flex items-center opacity-70 cursor-pointer hover:bg-card/80 transition-colors"
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

      {/* Player Card Drawer */}
      <PlayerCard
        player={selectedPlayer}
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
        variant="view"
      />
    </div>
  );
};

export default ViewTeam;
