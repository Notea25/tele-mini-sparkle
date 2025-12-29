import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import { getSavedTeam, getMainSquadAndBench, PlayerData } from "@/lib/teamData";

import PlayerCard from "@/components/PlayerCard";
import { generateTourData, getTourBoostInfo, MAX_TOURS, BoostType } from "@/lib/tourData";
import { getDisplayedPoints, calculateTotalTourPoints } from "@/lib/pointsCalculation";
import { clubLogos } from "@/lib/clubLogos";
import iconBenchPlus from "@/assets/icon-bench-plus.png";
import icon2x from "@/assets/icon-2x-new.png";
import icon3x from "@/assets/icon-3x-new.png";

interface ExtendedPlayerData extends PlayerData {
  displayedPoints: number;
}

const YourTeam = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [currentTour, setCurrentTour] = useState(29);
  const [teamName] = useState(() => getSavedTeam().teamName);

  // Load saved team
  const [mainSquadPlayers, setMainSquadPlayers] = useState<ExtendedPlayerData[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<ExtendedPlayerData[]>([]);
  const [captain, setCaptain] = useState<number | null>(null);
  const [viceCaptain, setViceCaptain] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ExtendedPlayerData | null>(null);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);

  // Generate tour data for user's team (using seed 999 for user)
  const { tourPoints, tourBoosts } = useMemo(() => {
    return generateTourData(999);
  }, []);

  // Get current tour boost info
  const currentBoostInfo = getTourBoostInfo(tourBoosts[currentTour - 1]);
  const currentBoostType = tourBoosts[currentTour - 1];

  // Check which boosts are active for current tour
  const isBenchBoostActive = currentBoostType === "bench";
  const isCaptain3xBoostActive = currentBoostType === "captain3x";
  const isDoublePowerBoostActive = currentBoostType === "double";

  useEffect(() => {
    const { mainSquad, bench } = getMainSquadAndBench();
    const savedTeam = getSavedTeam();
    
    if (mainSquad.length > 0) {
      const savedCaptain = savedTeam.captain;
      const savedViceCaptain = savedTeam.viceCaptain;
      
      // Deterministic injury and red card based on tour
      const seed = 999 * 100 + currentTour;
      const injuredIdx = Math.floor((Math.sin(seed * 17) * 10000 - Math.floor(Math.sin(seed * 17) * 10000)) * mainSquad.length);
      let redCardIdx = Math.floor((Math.sin(seed * 23) * 10000 - Math.floor(Math.sin(seed * 23) * 10000)) * mainSquad.length);
      if (redCardIdx === injuredIdx) {
        redCardIdx = (redCardIdx + 1) % mainSquad.length;
      }
      
      // Add displayed points with boost multipliers
      const updatedMainSquad: ExtendedPlayerData[] = mainSquad.map((p, idx) => {
        const isCaptainPlayer = p.id === savedCaptain;
        const isViceCaptainPlayer = p.id === savedViceCaptain;
        
        return {
          ...p,
          hasRedCard: idx === redCardIdx,
          isInjured: idx === injuredIdx,
          isCaptain: isCaptainPlayer,
          isViceCaptain: isViceCaptainPlayer,
          displayedPoints: getDisplayedPoints(p.points, isCaptainPlayer, isViceCaptainPlayer, currentBoostType),
        };
      });
      
      const updatedBench: ExtendedPlayerData[] = bench.map(p => ({
        ...p,
        displayedPoints: p.points,
      }));
      
      setMainSquadPlayers(updatedMainSquad);
      setBenchPlayers(updatedBench);
      setCaptain(savedCaptain);
      setViceCaptain(savedViceCaptain);
    }
  }, [currentTour, currentBoostType]);

  // Calculate total tour points
  const totalTourPoints = useMemo(() => {
    if (mainSquadPlayers.length === 0) return 0;
    return calculateTotalTourPoints(mainSquadPlayers, benchPlayers, currentBoostType);
  }, [mainSquadPlayers, benchPlayers, currentBoostType]);

  const handlePlayerClick = (player: ExtendedPlayerData | PlayerData) => {
    const extendedPlayer = player as ExtendedPlayerData;
    setSelectedPlayer(extendedPlayer);
    setIsPlayerCardOpen(true);
  };

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
          <span className="text-2xl font-bold text-primary-foreground">{totalTourPoints}</span>
          <span className="text-primary-foreground/80 text-sm">очков</span>
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
      <div className="px-4 mt-6">
        <div className="flex bg-secondary rounded-lg p-1">
          <Button
            onClick={() => setActiveTab("formation")}
            className={`flex-1 rounded-md ${
              activeTab === "formation"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Расстановка
          </Button>
          <Button
            onClick={() => setActiveTab("list")}
            className={`flex-1 rounded-md ${
              activeTab === "list"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-transparent text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Список
          </Button>
        </div>
      </div>

      {/* Formation View */}
      {activeTab === "formation" && (
        <div className="mt-6">
          <FormationFieldManagement
            mainSquadPlayers={mainSquadPlayers.map(p => ({ ...p, points: p.displayedPoints }))}
            benchPlayers={benchPlayers}
            onPlayerClick={handlePlayerClick}
            captain={captain}
            viceCaptain={viceCaptain}
            isBenchBoostActive={isBenchBoostActive}
            isDoublePowerBoostActive={isDoublePowerBoostActive}
            isCaptain3xBoostActive={isCaptain3xBoostActive}
            showPrice={false}
            showPointsInsteadOfTeam={true}
          />
        </div>
      )}

      {/* List View */}
      {activeTab === "list" && (
        <div className="px-4 mt-6 pb-6">
          {/* Main Squad */}
          <h2 className="text-foreground text-xl font-bold mb-4">Основной состав</h2>

          {/* Grouped by position */}
          {(["ВР", "ЗЩ", "ПЗ", "НП"] as const).map((position) => {
            const playersInPosition = mainSquadPlayers.filter(p => p.position === position);
            if (playersInPosition.length === 0) return null;

            const getPositionLabel = (pos: string, count: number): string => {
              if (pos === "ВР") return count === 1 ? "Вратарь" : "Вратари";
              if (pos === "ЗЩ") return "Защита";
              if (pos === "ПЗ") return "Полузащита";
              if (pos === "НП") return "Нападение";
              return pos;
            };

            return (
              <div className="mb-6" key={position}>
                <h3 className="text-primary font-medium mb-2">{getPositionLabel(position, playersInPosition.length)}</h3>
                <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
                  <span className="flex-1">Игрок</span>
                  <div className="w-12 flex justify-center">Очки</div>
                  <div className="w-10 flex justify-center">Цена</div>
                </div>
                <div className="space-y-2">
                  {playersInPosition.map((player) => {
                    const isCaptainPlayer = captain === player.id;
                    const isViceCaptainPlayer = viceCaptain === player.id;
                    const showCaptain3xBadge = isCaptain3xBoostActive && isCaptainPlayer;
                    const showDoublePowerBadge = isDoublePowerBoostActive && (isCaptainPlayer || isViceCaptainPlayer);
                    
                    return (
                      <div
                        key={player.id}
                        onClick={() => handlePlayerClick(player)}
                        className={`bg-card rounded-full px-4 py-2 flex items-center cursor-pointer hover:bg-card/80 transition-colors ${
                          showCaptain3xBadge || showDoublePowerBadge ? "border border-primary" : ""
                        } ${player.hasRedCard || player.isInjured ? "border border-red-500" : ""}`}
                      >
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          {clubLogos[player.team] && (
                            <img src={clubLogos[player.team]} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                          )}
                          <span className="text-foreground font-medium truncate">{player.name}</span>
                          <span className="text-muted-foreground text-xs">{player.position}</span>
                          {isCaptainPlayer && (
                            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">К</span>
                          )}
                          {isViceCaptainPlayer && (
                            <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">ВК</span>
                          )}
                          {showCaptain3xBadge && (
                            <img src={icon3x} alt="3x" className="w-4 h-4" />
                          )}
                          {showDoublePowerBadge && !showCaptain3xBadge && (
                            <img src={icon2x} alt="2x" className="w-4 h-4" />
                          )}
                          {player.hasRedCard && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">КК</span>
                          )}
                          {player.isInjured && !player.hasRedCard && (
                            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">ТР</span>
                          )}
                        </div>
                        <div className="w-12 flex-shrink-0 flex justify-center text-foreground text-sm">{player.displayedPoints}</div>
                        <div className="w-10 flex-shrink-0 flex justify-center text-foreground text-sm">{player.price}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Bench */}
          <h2 className="text-foreground text-xl font-bold mb-4 mt-8">Замены</h2>
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
            <span className="flex-1">Игрок</span>
            <div className="w-12 flex justify-center">Очки</div>
            <div className="w-10 flex justify-center">Цена</div>
          </div>
          <div className="space-y-2">
            {benchPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className={`bg-card rounded-full px-4 py-2 flex items-center cursor-pointer hover:bg-card/80 transition-colors ${
                  isBenchBoostActive ? "border border-primary" : "opacity-70"
                }`}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  {clubLogos[player.team] && (
                    <img src={clubLogos[player.team]} alt={player.team} className="w-5 h-5 object-contain flex-shrink-0" />
                  )}
                  <span className="text-foreground font-medium truncate">{player.name}</span>
                  <span className="text-muted-foreground text-xs">{player.position}</span>
                  {isBenchBoostActive && (
                    <img src={iconBenchPlus} alt="Bench+" className="w-4 h-4" />
                  )}
                </div>
                <div className="w-12 flex-shrink-0 flex justify-center text-foreground text-sm">{player.displayedPoints}</div>
                <div className="w-10 flex-shrink-0 flex justify-center text-foreground text-sm">{player.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Card Drawer */}
      <PlayerCard
        player={selectedPlayer ? { ...selectedPlayer, points: selectedPlayer.displayedPoints } : null}
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
        variant="view"
      />
    </div>
  );
};

export default YourTeam;