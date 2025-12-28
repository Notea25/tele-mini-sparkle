import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import Breadcrumbs from "@/components/Breadcrumbs";
import PlayerCard from "@/components/PlayerCard";
import { generateTourData, getTourBoostInfo, MAX_TOURS, BoostType } from "@/lib/tourData";
import { getDisplayedPoints, calculateTotalTourPoints } from "@/lib/pointsCalculation";
import { clubLogos } from "@/lib/clubLogos";
import iconBenchPlus from "@/assets/icon-bench-plus.png";
import icon2x from "@/assets/icon-2x-new.png";
import icon3x from "@/assets/icon-3x-new.png";

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  displayedPoints: number;
  price: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
  hasRedCard?: boolean;
  isInjured?: boolean;
}

const DreamTeam = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [currentTour, setCurrentTour] = useState(29);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);

  const teamName = "Dream team";

  // Generate tour-specific dream team data
  const { mainSquadPlayers, benchPlayers, tourBoosts, captainId, viceCaptainId, totalTourPoints } = useMemo(() => {
    const { tourPoints, tourBoosts } = generateTourData(0); // seed 0 for dream team
    
    const seed = currentTour;
    const boostType = tourBoosts[currentTour - 1];
    
    // Deterministic captain and vice-captain selection based on seed
    const captainSeed = Math.sin(seed * 7) * 10000;
    const captainIdx = Math.floor((captainSeed - Math.floor(captainSeed)) * 11);
    let viceCaptainIdx = Math.floor((Math.sin(seed * 13) * 10000 - Math.floor(Math.sin(seed * 13) * 10000)) * 11);
    if (viceCaptainIdx === captainIdx) {
      viceCaptainIdx = (viceCaptainIdx + 1) % 11;
    }

    // Deterministic injury and red card
    const injuredIdx = Math.floor((Math.sin(seed * 17) * 10000 - Math.floor(Math.sin(seed * 17) * 10000)) * 11);
    let redCardIdx = Math.floor((Math.sin(seed * 23) * 10000 - Math.floor(Math.sin(seed * 23) * 10000)) * 11);
    if (redCardIdx === injuredIdx) {
      redCardIdx = (redCardIdx + 1) % 11;
    }

    const baseMainSquad = [
      { id: 0, name: "Плотников", team: "Динамо Минск", position: "ВР", price: 6.5, slotIndex: 0 },
      { id: 4, name: "Козлов", team: "Белшина", position: "ЗЩ", price: 6.5, slotIndex: 0 },
      { id: 5, name: "Иванов", team: "Динамо Минск", position: "ЗЩ", price: 6.5, slotIndex: 1 },
      { id: 6, name: "Петров", team: "Динамо Минск", position: "ЗЩ", price: 6.5, slotIndex: 2 },
      { id: 7, name: "Сидоров", team: "БАТЭ", position: "ЗЩ", price: 6.5, slotIndex: 3 },
      { id: 12, name: "Новиков", team: "Белшина", position: "ПЗ", price: 6.5, slotIndex: 0 },
      { id: 13, name: "Морозов", team: "Динамо Минск", position: "ПЗ", price: 6.5, slotIndex: 1 },
      { id: 14, name: "Волков", team: "Динамо Минск", position: "ПЗ", price: 6.5, slotIndex: 2 },
      { id: 15, name: "Алексеев", team: "БАТЭ", position: "ПЗ", price: 6.5, slotIndex: 3 },
      { id: 22, name: "Лебедев", team: "Динамо Минск", position: "НП", price: 6.5, slotIndex: 0 },
      { id: 23, name: "Семенов", team: "БАТЭ", position: "НП", price: 6.5, slotIndex: 1 },
    ];

    const baseBench = [
      { id: 103, name: "Николаев", team: "Динамо Минск", position: "ВР", price: 6.5 },
      { id: 100, name: "Егоров", team: "Динамо Минск", position: "ЗЩ", price: 6.5 },
      { id: 101, name: "Павлов", team: "Динамо Минск", position: "ПЗ", price: 6.5 },
      { id: 102, name: "Федоров", team: "Динамо Минск", position: "НП", price: 6.5 },
    ];

    // Assign tour-specific points (realistic: -1 to 15 per player)
    const mainSquad: PlayerData[] = baseMainSquad.map((p, idx) => {
      const playerSeed = seed * 100 + idx;
      const pseudoRandom = Math.sin(playerSeed) * 10000;
      const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
      // Realistic points: -1 to 15 with most players getting 2-8
      const basePoints = Math.floor(randomFactor * 17) - 1; // -1 to 15
      const isCaptain = idx === captainIdx;
      const isViceCaptain = idx === viceCaptainIdx;
      
      return { 
        ...p, 
        points: basePoints,
        displayedPoints: getDisplayedPoints(basePoints, isCaptain, isViceCaptain, boostType),
        isCaptain,
        isViceCaptain,
        hasRedCard: idx === redCardIdx,
        isInjured: idx === injuredIdx,
      };
    });

    const bench: PlayerData[] = baseBench.map((p, idx) => {
      const playerSeed = seed * 100 + 50 + idx;
      const pseudoRandom = Math.sin(playerSeed) * 10000;
      const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
      // Bench players: -1 to 10
      const basePoints = Math.floor(randomFactor * 12) - 1;
      
      return { 
        ...p, 
        points: basePoints,
        displayedPoints: basePoints,
        isOnBench: true,
      };
    });

    // Calculate total points with boost logic
    const total = calculateTotalTourPoints(mainSquad, bench, boostType);

    return { 
      mainSquadPlayers: mainSquad, 
      benchPlayers: bench, 
      tourBoosts,
      captainId: captainIdx,
      viceCaptainId: viceCaptainIdx,
      totalTourPoints: total,
    };
  }, [currentTour]);

  // Get current tour boost info
  const currentBoostInfo = getTourBoostInfo(tourBoosts[currentTour - 1]);
  const currentBoostType = tourBoosts[currentTour - 1];

  // Check which boosts are active for current tour
  const isBenchBoostActive = currentBoostType === "bench";
  const isCaptain3xBoostActive = currentBoostType === "captain3x";
  const isDoublePowerBoostActive = currentBoostType === "double";

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
            Список
          </Button>
      </div>

      {/* Formation View */}
      {activeTab === "formation" && (
        <div className="mt-6">
          <FormationFieldManagement
            mainSquadPlayers={mainSquadPlayers.map(p => ({ ...p, points: p.displayedPoints }))}
            benchPlayers={benchPlayers}
            onPlayerClick={handlePlayerClick}
            captain={captainId}
            viceCaptain={viceCaptainId}
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
            const positionLabels: Record<string, string> = {
              ВР: "Вратари",
              ЗЩ: "Защита",
              ПЗ: "Полузащита",
              НП: "Нападение",
            };
            const playersInPosition = mainSquadPlayers.filter(p => p.position === position);
            if (playersInPosition.length === 0) return null;

            return (
              <div className="mb-6" key={position}>
                <h3 className="text-primary font-medium mb-2">{positionLabels[position]}</h3>
                <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
                  <span className="flex-1">Игрок</span>
                  <div className="w-12 flex justify-center">Очки</div>
                  <div className="w-10 flex justify-center">Цена</div>
                </div>
                <div className="space-y-2">
                  {playersInPosition.map((player) => {
                    const showCaptain3xBadge = isCaptain3xBoostActive && player.isCaptain;
                    const showDoublePowerBadge = isDoublePowerBoostActive && (player.isCaptain || player.isViceCaptain);
                    
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
                          {player.isCaptain && (
                            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">К</span>
                          )}
                          {player.isViceCaptain && (
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

export default DreamTeam;