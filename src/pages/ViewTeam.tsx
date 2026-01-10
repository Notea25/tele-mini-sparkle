import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import SportHeader from "@/components/SportHeader";
import FormationFieldManagement from "@/components/FormationFieldManagement";
import { PlayerData } from "@/lib/teamData";
import PlayerCard from "@/components/PlayerCard";
import { clubLogos } from "@/lib/clubLogos";
import { useSquadById, EnrichedPlayer } from "@/hooks/useSquadById";

const ViewTeam = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [selectedPlayer, setSelectedPlayer] = useState<EnrichedPlayer | null>(null);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);

  // Get squad ID from URL params
  const squadIdParam = searchParams.get("id");
  const squadId = squadIdParam ? parseInt(squadIdParam, 10) : null;

  const { squad, mainPlayers, benchPlayers, currentTour, tourPoints, isLoading, error } = useSquadById(squadId);

  // Convert EnrichedPlayer to PlayerData for FormationFieldManagement
  const mainSquadForField = useMemo((): PlayerData[] => {
    return mainPlayers.map(p => ({
      id: p.id,
      name: p.name,
      team: p.team_name,
      position: p.position,
      price: p.price,
      points: p.points,
      slotIndex: p.slotIndex,
      isCaptain: squad?.captain_id === p.id,
      isViceCaptain: squad?.vice_captain_id === p.id,
    }));
  }, [mainPlayers, squad]);

  const benchForField = useMemo((): PlayerData[] => {
    return benchPlayers.map(p => ({
      id: p.id,
      name: p.name,
      team: p.team_name,
      position: p.position,
      price: p.price,
      points: p.points,
      slotIndex: p.slotIndex,
    }));
  }, [benchPlayers]);

  const handlePlayerClick = (player: PlayerData) => {
    const enrichedPlayer = mainPlayers.find(p => p.id === player.id) || 
                           benchPlayers.find(p => p.id === player.id);
    if (enrichedPlayer) {
      setSelectedPlayer(enrichedPlayer);
      setIsPlayerCardOpen(true);
    }
  };

  const getPositionLabel = (pos: string, count: number): string => {
    if (pos === "ВР") return count === 1 ? "Вратарь" : "Вратари";
    if (pos === "ЗЩ") return "Защита";
    if (pos === "ПЗ") return "Полузащита";
    if (pos === "НП") return "Нападение";
    return pos;
  };

  if (!squadId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">ID команды не указан</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Ошибка загрузки: {error}</p>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Команда не найдена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SportHeader />

      {/* Team Name */}
      <div className="px-4 mt-4 flex items-center justify-center gap-2">
        <h1 className="text-foreground text-3xl font-bold">{squad.name}</h1>
      </div>

      {/* Tour Label with Gradient Lines */}
      <div className="px-4 mt-4 flex items-center justify-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-muted-foreground/30" />
        <span className="text-muted-foreground text-sm font-medium">
          {currentTour ? `${currentTour} тур` : "—"}
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-muted-foreground/30" />
      </div>

      {/* Points Block */}
      <div className="px-4 mt-3 flex items-center justify-center gap-3">
        <div className="bg-primary rounded-xl px-6 py-2 flex items-center justify-center gap-2 min-w-[200px]">
          <span className="text-2xl font-bold text-primary-foreground">{tourPoints}</span>
          <span className="text-primary-foreground/80 text-sm">очков</span>
        </div>
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
            mainSquadPlayers={mainSquadForField}
            benchPlayers={benchForField}
            onPlayerClick={handlePlayerClick}
            captain={squad.captain_id}
            viceCaptain={squad.vice_captain_id}
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
            const playersInPosition = mainPlayers.filter(p => p.position === position);
            if (playersInPosition.length === 0) return null;

            return (
              <div className="mb-6" key={position}>
                <h3 className="text-primary font-medium mb-2">
                  {getPositionLabel(position, playersInPosition.length)}
                </h3>
                <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
                  <span className="flex-1">Игрок</span>
                  <div className="w-12 flex justify-center">Очки</div>
                  <div className="w-10 flex justify-center">Цена</div>
                </div>
                <div className="space-y-2">
                  {playersInPosition.map((player) => {
                    const isCaptain = squad.captain_id === player.id;
                    const isViceCaptain = squad.vice_captain_id === player.id;

                    return (
                      <div
                        key={player.id}
                        onClick={() => {
                          setSelectedPlayer(player);
                          setIsPlayerCardOpen(true);
                        }}
                        className="bg-card rounded-xl px-4 py-2 flex items-center cursor-pointer hover:bg-card/80 transition-colors"
                      >
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          {clubLogos[player.team_name] && (
                            <img
                              src={clubLogos[player.team_name]}
                              alt={player.team_name}
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                          )}
                          <span className="text-foreground font-medium truncate">{player.name}</span>
                          <span className="text-muted-foreground text-xs">{player.position}</span>
                          {isCaptain && (
                            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                              К
                            </span>
                          )}
                          {isViceCaptain && (
                            <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                              ВК
                            </span>
                          )}
                        </div>
                        <div className="w-12 flex-shrink-0 flex justify-center text-foreground text-sm">
                          {player.points}
                        </div>
                        <div className="w-10 flex-shrink-0 flex justify-center text-foreground text-sm">
                          {player.price}
                        </div>
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
            {benchPlayers.map((player) => {
              const isCaptain = squad.captain_id === player.id;
              const isViceCaptain = squad.vice_captain_id === player.id;
              
              return (
                <div
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player);
                    setIsPlayerCardOpen(true);
                  }}
                  className="bg-card rounded-xl px-4 py-2 flex items-center cursor-pointer hover:bg-card/80 transition-colors opacity-70"
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    {clubLogos[player.team_name] && (
                      <img
                        src={clubLogos[player.team_name]}
                        alt={player.team_name}
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="text-foreground font-medium truncate">{player.name}</span>
                    <span className="text-muted-foreground text-xs">{player.position}</span>
                    {isCaptain && (
                      <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        К
                      </span>
                    )}
                    {isViceCaptain && (
                      <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        ВК
                      </span>
                    )}
                  </div>
                  <div className="w-12 flex-shrink-0 flex justify-center text-foreground text-sm">
                    {player.points}
                  </div>
                  <div className="w-10 flex-shrink-0 flex justify-center text-foreground text-sm">
                    {player.price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Card Drawer */}
      <PlayerCard
        player={
          selectedPlayer
            ? {
                id: selectedPlayer.id,
                name: selectedPlayer.name,
                team: selectedPlayer.team_name,
                position: selectedPlayer.position,
                price: selectedPlayer.price,
                points: selectedPlayer.points,
              }
            : null
        }
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
        variant="view"
      />
    </div>
  );
};

export default ViewTeam;
