import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import Breadcrumbs from "@/components/Breadcrumbs";

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
  hasRedCard?: boolean;
}

const DreamTeam = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [currentTour, setCurrentTour] = useState(29);

  const teamName = "Dream team";

  // Main squad players - best performers
  const mainSquadPlayers: PlayerData[] = [
    { id: 0, name: "Плотников", team: "Динамо Минск", position: "ВР", points: 32, price: 6.5, slotIndex: 0 },
    { id: 4, name: "Плотников", team: "Белшина", position: "ЗЩ", points: 28, price: 6.5, slotIndex: 0 },
    { id: 5, name: "Плотников", team: "Динамо Минск", position: "ЗЩ", points: 30, price: 6.5, slotIndex: 1, isCaptain: true },
    { id: 6, name: "Плотников", team: "Динамо Минск", position: "ЗЩ", points: 27, price: 6.5, slotIndex: 2, hasRedCard: true },
    { id: 7, name: "Плотников", team: "БАТЭ", position: "ЗЩ", points: 29, price: 6.5, slotIndex: 3 },
    { id: 12, name: "Плотников", team: "Белшина", position: "ПЗ", points: 35, price: 6.5, slotIndex: 0 },
    { id: 13, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 33, price: 6.5, slotIndex: 1 },
    { id: 14, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 31, price: 6.5, slotIndex: 2 },
    { id: 15, name: "Плотников", team: "БАТЭ", position: "ПЗ", points: 34, price: 6.5, slotIndex: 3 },
    { id: 22, name: "Плотников", team: "Динамо Минск", position: "НП", points: 38, price: 6.5, slotIndex: 0 },
    { id: 23, name: "Плотников", team: "БАТЭ", position: "НП", points: 36, price: 6.5, slotIndex: 1 },
  ];

  const benchPlayers: PlayerData[] = [
    { id: 100, name: "Плотников", team: "Динамо Минск", position: "ЗЩ", points: 24, price: 6.5, isOnBench: true },
    { id: 101, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 25, price: 6.5, isOnBench: true },
    { id: 102, name: "Плотников", team: "Динамо Минск", position: "ПЗ", points: 23, price: 6.5, isOnBench: true },
    { id: 103, name: "Плотников", team: "Динамо Минск", position: "ВР", points: 22, price: 6.5, isOnBench: true },
  ];

  // Calculate total points
  const totalPoints = mainSquadPlayers.reduce((sum, p) => sum + p.points, 0);

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
        <div className="bg-primary rounded-t-2xl p-4 flex flex-col items-center">
          <span className="text-4xl font-bold text-primary-foreground">{totalPoints}</span>
          <span className="text-primary-foreground/80 text-sm">Очки</span>
        </div>
        <div className="bg-secondary rounded-b-2xl py-2 text-center">
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
                <span className="w-10 flex-shrink-0 text-foreground text-sm text-center">{player.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamTeam;
