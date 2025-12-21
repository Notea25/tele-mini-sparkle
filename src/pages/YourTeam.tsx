import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import { getSavedTeam, getMainSquadAndBench, PlayerData } from "@/lib/teamData";
import Breadcrumbs from "@/components/Breadcrumbs";
import PlayerCard from "@/components/PlayerCard";
import { generateTourData, getTourBoostInfo, MAX_TOURS } from "@/lib/tourData";

const YourTeam = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [currentTour, setCurrentTour] = useState(29);
  const [teamName] = useState(() => getSavedTeam().teamName);

  // Load saved team
  const [mainSquadPlayers, setMainSquadPlayers] = useState<PlayerData[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<PlayerData[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);

  useEffect(() => {
    const { mainSquad, bench } = getMainSquadAndBench();
    if (mainSquad.length > 0) {
      setMainSquadPlayers(mainSquad);
      setBenchPlayers(bench);
    }
  }, []);

  const handlePlayerClick = (player: PlayerData) => {
    setSelectedPlayer(player);
    setIsPlayerCardOpen(true);
  };

  // Generate tour data for user's team (using seed 999 for user)
  const { tourPoints, tourBoosts } = useMemo(() => {
    return generateTourData(999);
  }, []);

  // Get current tour boost info
  const currentBoostInfo = getTourBoostInfo(tourBoosts[currentTour - 1]);
  const currentTourPoints = tourPoints[currentTour - 1] || 0;

  const handleTourChange = (direction: "prev" | "next") => {
    if (direction === "prev" && currentTour > 1) {
      setCurrentTour(currentTour - 1);
    } else if (direction === "next" && currentTour < MAX_TOURS) {
      setCurrentTour(currentTour + 1);
    }
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
      <div className="px-4 mt-4 flex items-center justify-center gap-2">
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
            showPrice={false}
            showPointsInsteadOfTeam={true}
          />
        </div>
      )}

      {/* List View */}
      {activeTab === "list" && (
        <div className="px-4 mt-6 pb-6">
          {/* Column headers */}
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground mb-2">
            <span className="flex-1">Игрок</span>
            <span className="w-14 text-center">Клуб</span>
            <span className="w-12 text-center">Очки</span>
            <span className="w-10 text-center">Цена</span>
          </div>

          {/* All players */}
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
                    <span className="bg-primary text-primary-foreground text-[8px] px-1 rounded">x3</span>
                  )}
                </div>
                <span className="w-14 flex-shrink-0 text-muted-foreground text-sm text-center truncate">
                  {player.team.length > 6 ? player.team.substring(0, 6) : player.team}
                </span>
                <span className="w-12 flex-shrink-0 text-foreground text-sm text-center">{player.points}</span>
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price}</span>
              </div>
            ))}
          </div>

          {/* Bench players */}
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
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price}</span>
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

export default YourTeam;
