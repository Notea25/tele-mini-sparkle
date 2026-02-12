import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PointsColumnHeader } from "@/components/PointsColumnHeader";
import { useState, useMemo, useEffect } from "react";
import SportHeader from "@/components/SportHeader";
import FormationField from "@/components/FormationField";
import { PlayerData } from "@/lib/teamData";
import PlayerCard from "@/components/PlayerCard";
import { clubLogos } from "@/lib/clubLogos";
import { useSquadById, EnrichedPlayer } from "@/hooks/useSquadById";
import { usePlayerStatuses } from "@/hooks/usePlayerStatuses";
import { getNextOpponentData } from "@/lib/scheduleUtils";
import { toursApi, squadsApi, playerStatusesApi, TourInfo, TourHistorySnapshot, TourHistoryPlayer, PlayerStatus, STATUS_INJURED, STATUS_RED_CARD, STATUS_LEFT_LEAGUE } from "@/lib/api";
import redCardBadge from "@/assets/red-card-badge.png";
import injuryBadge from "@/assets/injury-badge.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Map API positions to local format
const mapPosition = (position: string): string => {
  const positionMap: Record<string, string> = {
    "Goalkeeper": "ВР",
    "Defender": "ЗЩ",
    "Midfielder": "ПЗ",
    "Attacker": "НП",
    "Forward": "НП",
  };
  return positionMap[position] || position;
};

const ViewTeam = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [selectedPlayer, setSelectedPlayer] = useState<EnrichedPlayer | null>(null);
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);

  // Tour navigation state
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [selectedTourNumber, setSelectedTourNumber] = useState<number | null>(null);
  const [viewTourPoints, setViewTourPoints] = useState<number>(0);
  const [allTours, setAllTours] = useState<TourInfo[]>([]);
  const [isLoadingTourPoints, setIsLoadingTourPoints] = useState(false);
  
  // Historical squad data
  const [historySnapshots, setHistorySnapshots] = useState<TourHistorySnapshot[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Player statuses for selected tour
  const [tourPlayerStatuses, setTourPlayerStatuses] = useState<PlayerStatus[]>([]);

  // Get squad ID from URL params
  const squadIdParam = searchParams.get("id");
  const squadId = squadIdParam ? parseInt(squadIdParam, 10) : null;

  const { squad, squadTourData, mainPlayers, benchPlayers, currentTour, tourPoints, isLoading, error } = useSquadById(squadId);

  // Load squad history first, then filter tours based on history
  useEffect(() => {
    if (!squad || !squadId) return;

    const loadData = async () => {
      // Load squad history first
      setIsLoadingHistory(true);
      const historyResponse = await squadsApi.getHistory(squadId);
      const snapshots = historyResponse.success && historyResponse.data ? historyResponse.data : [];
      setHistorySnapshots(snapshots);
      setIsLoadingHistory(false);

      // Get tour IDs where user has history
      const historyTourIds = new Set(snapshots.map(s => s.tour_id));

      // Load tours
      const toursResponse = await toursApi.getPreviousCurrentNextTour(squad.league_id);
      if (toursResponse.success && toursResponse.data) {
        const now = new Date();
        const tours: TourInfo[] = [];
        
        // Add previous tour only if user has history for it
        if (toursResponse.data.previous_tour && historyTourIds.has(toursResponse.data.previous_tour.id)) {
          tours.push(toursResponse.data.previous_tour);
        }
        
        // Add current tour if deadline passed AND (tour ended OR has history)
        if (toursResponse.data.current_tour) {
          const currentDeadline = new Date(toursResponse.data.current_tour.deadline);
          const currentEndDate = new Date(toursResponse.data.current_tour.end_date);
          const hasHistory = historyTourIds.has(toursResponse.data.current_tour.id);
          
          // Show tour if deadline passed and either: tour ended OR we have snapshot data
          if (currentDeadline <= now && (currentEndDate <= now || hasHistory)) {
            tours.push(toursResponse.data.current_tour);
          }
        }
        
        // If no tours available yet (no current tour with passed deadline), 
        // show next tour data if available
        if (tours.length === 0 && toursResponse.data.next_tour) {
          tours.push(toursResponse.data.next_tour);
        }
        
        setAllTours(tours);

        // Set initial selected tour to the most recent available
        if (!selectedTourId && tours.length > 0) {
          const latestTour = tours[tours.length - 1];
          setSelectedTourId(latestTour.id);
          setSelectedTourNumber(latestTour.number);
        }
      }
    };

    loadData();
  }, [squad, squadId, selectedTourId]);

  // Get current tour ID for comparison
  // Include both 'current' and 'next' type tours as "current" (not historical)
  const currentTourId = useMemo(() => {
    // First try to find current tour, if not available use next tour
    const current = allTours.find(t => t.type === 'current');
    if (current) return current.id;
    const next = allTours.find(t => t.type === 'next');
    return next?.id ?? null;
  }, [allTours]);

  // Check if we're viewing a historical tour (not current/next)
  const isViewingHistoricalTour = selectedTourId !== null && selectedTourId !== currentTourId;

  // Get historical snapshot for selected tour
  const selectedSnapshot = useMemo((): TourHistorySnapshot | null => {
    if (!isViewingHistoricalTour || !selectedTourId) return null;
    return historySnapshots.find(s => s.tour_id === selectedTourId) ?? null;
  }, [isViewingHistoricalTour, selectedTourId, historySnapshots]);

  // Update points when selected tour changes
  useEffect(() => {
    if (!selectedTourId || !squadId) return;

    // If we have a snapshot for this tour, we use snapshot values directly in UI.
    // IMPORTANT: snapshot.points is GROSS (earned points), penalty is stored separately.
    if (selectedSnapshot) {
      // Avoid keeping stale leaderboard points when switching tours
      setViewTourPoints(0);
      setIsLoadingTourPoints(false);
      return;
    }

    // Otherwise load from leaderboard
    const loadTourPoints = async () => {
      setIsLoadingTourPoints(true);
      try {
        const leaderboardResponse = await squadsApi.getLeaderboard(selectedTourId);
        if (leaderboardResponse.success && leaderboardResponse.data) {
          const entry = leaderboardResponse.data.find(e => e.squad_id === squadId);
          setViewTourPoints(entry?.tour_points || 0);
        }
      } finally {
        setIsLoadingTourPoints(false);
      }
    };

    loadTourPoints();
  }, [selectedTourId, squadId, selectedSnapshot]);

  // Load player statuses for selected tour
  useEffect(() => {
    if (!selectedTourNumber) {
      setTourPlayerStatuses([]);
      return;
    }

    const loadStatuses = async () => {
      try {
        const statusesResponse = await playerStatusesApi.getByTourNumber(selectedTourNumber);
        if (statusesResponse.success && statusesResponse.data) {
          setTourPlayerStatuses(statusesResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch player statuses:', err);
      }
    };

    loadStatuses();
  }, [selectedTourNumber]);

  // Create a map for quick status lookup by player_id
  const playerStatusMap = useMemo(() => {
    const map = new Map<number, { hasRedCard: boolean; isInjured: boolean; hasLeftLeague: boolean }>();
    for (const status of tourPlayerStatuses) {
      const existing = map.get(status.player_id) || {
        hasRedCard: false,
        isInjured: false,
        hasLeftLeague: false,
      };
      if (status.status_type === STATUS_RED_CARD) {
        existing.hasRedCard = true;
      } else if (status.status_type === STATUS_INJURED) {
        existing.isInjured = true;
      } else if (status.status_type === STATUS_LEFT_LEAGUE) {
        existing.hasLeftLeague = true;
      }
      map.set(status.player_id, existing);
    }
    return map;
  }, [tourPlayerStatuses]);

  // Navigate to previous tour
  const goToPreviousTour = () => {
    const currentIndex = allTours.findIndex(t => t.id === selectedTourId);
    if (currentIndex > 0) {
      const prevTour = allTours[currentIndex - 1];
      setSelectedTourId(prevTour.id);
      setSelectedTourNumber(prevTour.number);
    }
  };

  // Navigate to next tour
  const goToNextTour = () => {
    const currentIndex = allTours.findIndex(t => t.id === selectedTourId);
    if (currentIndex < allTours.length - 1 && currentIndex !== -1) {
      const nextTour = allTours[currentIndex + 1];
      setSelectedTourId(nextTour.id);
      setSelectedTourNumber(nextTour.number);
    }
  };

  const canGoPrevious = () => {
    const currentIndex = allTours.findIndex(t => t.id === selectedTourId);
    return currentIndex > 0;
  };

  const canGoNext = () => {
    const currentIndex = allTours.findIndex(t => t.id === selectedTourId);
    return currentIndex < allTours.length - 1 && currentIndex !== -1;
  };

  // Convert TourHistoryPlayer to EnrichedPlayer format with status lookup
  const convertHistoryPlayer = (p: TourHistoryPlayer, slotIndex: number): EnrichedPlayer => {
    const statusFlags = playerStatusMap.get(p.id);
    return {
      id: p.id,
      name: p.name,
      team_id: p.team_id,
      team_name: p.team_name,
      team_name_rus: p.team_name_rus,
      team_logo: p.team_logo || "",
      photo: p.photo || "",
      position: mapPosition(p.position),
      price: p.market_value,
      points: p.tour_points,
      total_points: p.total_points,
      tour_points: p.tour_points,
      slotIndex,
      nextOpponent: p.next_opponent_team_name || "",
      nextOpponentHome: p.next_opponent_is_home ?? false,
      hasRedCard: statusFlags?.hasRedCard,
      isInjured: statusFlags?.isInjured,
      hasLeftLeague: statusFlags?.hasLeftLeague,
    };
  };

  // Apply statuses to current (non-historical) players
  const applyStatusesToPlayer = (p: EnrichedPlayer): EnrichedPlayer => {
    const statusFlags = playerStatusMap.get(p.id);
    if (!statusFlags) return p;
    return {
      ...p,
      hasRedCard: statusFlags.hasRedCard || p.hasRedCard,
      isInjured: statusFlags.isInjured || p.isInjured,
      hasLeftLeague: statusFlags.hasLeftLeague || p.hasLeftLeague,
    };
  };

  // Get display players - either from history snapshot or current squad
  // IMPORTANT: match /team-management behavior — keep incoming order and only assign slotIndex sequentially per position.
  const displayMainPlayers = useMemo((): EnrichedPlayer[] => {
    if (selectedSnapshot && selectedSnapshot.main_players) {
      const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

      return selectedSnapshot.main_players.map((p) => {
        const position = mapPosition(p.position);
        const slotIndex = positionCounters[position] || 0;
        positionCounters[position] = slotIndex + 1;
        return convertHistoryPlayer(p, slotIndex);
      });
    }

    // Apply tour-specific statuses to current players
    return mainPlayers.map(applyStatusesToPlayer);
  }, [selectedSnapshot, mainPlayers, playerStatusMap]);

  const displayBenchPlayers = useMemo((): EnrichedPlayer[] => {
    let baseBench: EnrichedPlayer[];
    
    if (selectedSnapshot && selectedSnapshot.bench_players) {
      // Position order priority for bench (ВР always first)
      const positionOrder: Record<string, number> = { "ВР": 0, "Goalkeeper": 0, "ЗЩ": 1, "Defender": 1, "ПЗ": 2, "Midfielder": 2, "НП": 3, "Attacker": 3, "Forward": 3 };
      
      // Sort bench players by position order first
      const sortedBench = [...selectedSnapshot.bench_players].sort((a, b) => {
        const orderA = positionOrder[a.position] ?? 99;
        const orderB = positionOrder[b.position] ?? 99;
        return orderA - orderB;
      });
      
      const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
      baseBench = sortedBench.map((p) => {
        const position = mapPosition(p.position);
        const slotIndex = positionCounters[position] || 0;
        positionCounters[position] = slotIndex + 1;
        return convertHistoryPlayer(p, slotIndex);
      });
    } else {
      // Apply tour-specific statuses to current players
      baseBench = benchPlayers.map(applyStatusesToPlayer);
    }
    
    // Apply saved bench order from localStorage (same logic as /team-management)
    if (squadId && baseBench.length > 0) {
      const benchOrderKey = `benchOrder_${squadId}`;
      const savedOrder = localStorage.getItem(benchOrderKey);
      if (savedOrder) {
        try {
          const orderIds: number[] = JSON.parse(savedOrder);
          // Sort bench players according to saved order
          const orderedBench = [...baseBench].sort((a, b) => {
            const indexA = orderIds.indexOf(a.id);
            const indexB = orderIds.indexOf(b.id);
            // If player not in saved order, put them at the end
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          baseBench = orderedBench;
        } catch {
          // If parsing fails, continue with original order
        }
      }
    }
    
    // Ensure GK is always in the leftmost (first) slot
    const gkIndex = baseBench.findIndex(p => p.position === "ВР");
    if (gkIndex > 0) {
      const [gk] = baseBench.splice(gkIndex, 1);
      baseBench.unshift(gk);
    }
    
    return baseBench;
  }, [selectedSnapshot, benchPlayers, squadId, playerStatusMap]);

  // Get captain/vice-captain IDs
  const displayCaptainId = selectedSnapshot?.captain_id ?? squadTourData?.captain_id ?? null;
  const displayViceCaptainId = selectedSnapshot?.vice_captain_id ?? squadTourData?.vice_captain_id ?? null;

  // Convert EnrichedPlayer to PlayerData for FormationField
  const mainSquadForField = useMemo((): PlayerData[] => {
    return displayMainPlayers.map(p => {
      return {
        id: p.id,
        name: p.name,
        team: p.team_name,
        team_rus: p.team_name_rus,
        photo: p.photo,
        position: p.position,
        price: p.price,
        points: p.tour_points ?? p.points ?? 0,
        slotIndex: p.slotIndex,
        isCaptain: displayCaptainId === p.id,
        isViceCaptain: displayViceCaptainId === p.id,
        nextOpponent: p.nextOpponent || "",
        nextOpponentHome: p.nextOpponentHome ?? false,
        hasRedCard: p.hasRedCard,
        isInjured: p.isInjured,
        hasLeftLeague: p.hasLeftLeague,
      };
    });
  }, [displayMainPlayers, displayCaptainId, displayViceCaptainId]);

  // Bench order should match user-defined substitution priority (same as /team-management)
  const benchForField = useMemo((): PlayerData[] => {
    return displayBenchPlayers.map(p => {
      return {
        id: p.id,
        name: p.name,
        team: p.team_name,
        team_rus: p.team_name_rus,
        photo: p.photo,
        position: p.position,
        price: p.price,
        points: p.tour_points ?? p.points ?? 0,
        slotIndex: p.slotIndex,
        nextOpponent: p.nextOpponent || "",
        nextOpponentHome: p.nextOpponentHome ?? false,
        hasRedCard: p.hasRedCard,
        isInjured: p.isInjured,
        hasLeftLeague: p.hasLeftLeague,
      };
    });
  }, [displayBenchPlayers]);

  const handlePlayerClick = (player: PlayerData) => {
    const enrichedPlayer = displayMainPlayers.find(p => p.id === player.id) || 
                           displayBenchPlayers.find(p => p.id === player.id);
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

  // Display points - use snapshot data for historical tours, otherwise current data
  // IMPORTANT: For historical tours, use penalty_points from snapshot only (not from current squad)
  // If no snapshot exists for a historical tour, penalty is 0 (no data)
  const isCurrentTour = selectedTourId === currentTourId || !selectedTourId;
  
  const displayPenaltyPoints = useMemo(() => {
    if (selectedSnapshot) {
      // Historical tour with snapshot - use snapshot's penalty
      return selectedSnapshot.penalty_points ?? 0;
    }
    if (isViewingHistoricalTour) {
      // Historical tour without snapshot - no penalty data available
      return 0;
    }
    // Current tour - use squad's current penalty
    return squadTourData?.penalty_points ?? 0;
  }, [selectedSnapshot, isViewingHistoricalTour, squadTourData?.penalty_points]);

  // Calculate points displayed in the header.
  // - For history snapshots: points are GROSS, so NET = points - penalty_points.
  // - For leaderboard/squad tour points: backend already returns NET (penalty already applied).
  const displayPoints = useMemo(() => {
    if (isLoadingTourPoints && !selectedSnapshot) {
      return 0; // Show 0 while loading to prevent flashing
    }

    if (selectedSnapshot) {
      return (selectedSnapshot.points ?? 0) - displayPenaltyPoints;
    }

    return selectedTourId ? viewTourPoints : tourPoints;
  }, [isLoadingTourPoints, selectedSnapshot, selectedTourId, viewTourPoints, tourPoints, displayPenaltyPoints]);
  
  const displayTourNumber = selectedTourNumber || currentTour;

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
      <div className="px-4 mt-2 flex items-center justify-center gap-2">
        <h1 className="text-foreground text-2xl font-display">{squad.name}</h1>
      </div>

      {/* Tour Navigation */}
      <div className="px-4 mt-1 flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousTour}
          disabled={!canGoPrevious()}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-muted-foreground/30" />
          <span className="text-muted-foreground text-sm font-medium min-w-[80px] text-center">
            {displayTourNumber ? `${displayTourNumber} тур` : "—"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-muted-foreground/30" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextTour}
          disabled={!canGoNext()}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Points Block */}
      <div className="px-4 mt-2 flex flex-col items-center gap-1">
        <div className="bg-primary rounded-xl px-6 py-2 flex items-center justify-center gap-2 min-w-[200px]">
          {isLoadingTourPoints && !selectedSnapshot ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" />
          ) : (
            <>
              <span className="text-2xl font-bold text-primary-foreground">{displayPoints}</span>
              <span className="text-primary-foreground/80 text-sm">очков</span>
            </>
          )}
        </div>
        {displayPenaltyPoints > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xs text-red-500 flex items-center gap-1 hover:underline">
                (-{displayPenaltyPoints} штраф за трансферы)
                <Info className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 text-sm" side="bottom">
              <p className="text-foreground">
                Итоговые очки за тур уже учитывают штраф за дополнительные трансферы. Каждый трансфер сверх бесплатного лимита снимает 4 очка.
              </p>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-3">
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
        <div className="mt-10">
          <FormationField
            mode="view"
            mainSquadPlayers={mainSquadForField}
            benchPlayers={benchForField}
            showBench={true}
            onPlayerClick={handlePlayerClick}
            captain={displayCaptainId}
            viceCaptain={displayViceCaptainId}
            showPrice={false}
            showPointsInsteadOfTeam={true}
          />
        </div>
      )}

      {/* List View */}
      {activeTab === "list" && (
        <div className="px-4 mt-6 pb-6">
          {/* Main Squad */}
          <h2 className="text-foreground text-xl font-display mb-4">Основной состав</h2>

          {/* Grouped by position */}
          {(["ВР", "ЗЩ", "ПЗ", "НП"] as const).map((position) => {
            const playersInPosition = displayMainPlayers.filter(p => p.position === position);
            if (playersInPosition.length === 0) return null;

            return (
              <div className="mb-6" key={position}>
                <h3 className="text-primary font-medium mb-2">
                  {getPositionLabel(position, playersInPosition.length)}
                </h3>
                <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
                  <span className="flex-1">Игрок</span>
                  <div className="w-12 flex justify-center"><PointsColumnHeader type="tour" /></div>
                  <div className="w-10 flex justify-center">Цена</div>
                </div>
                <div className="space-y-2">
                  {playersInPosition.map((player) => {
                    const isCaptain = displayCaptainId === player.id;
                    const isViceCaptain = displayViceCaptainId === player.id;

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
                          {(clubLogos[player.team_name] || player.team_logo) && (
                            <img
                              src={clubLogos[player.team_name] || player.team_logo}
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
                          {player.hasRedCard && (
                            <img src={redCardBadge} alt="red card" className="w-4 h-4 flex-shrink-0" />
                          )}
                          {player.isInjured && !player.hasRedCard && (
                            <img src={injuryBadge} alt="injury" className="w-4 h-4 flex-shrink-0" />
                          )}
                        </div>
                        <div className="w-12 flex-shrink-0 flex justify-center text-foreground text-sm">
                          {(() => {
                            const basePoints = player.tour_points ?? player.points ?? 0;
                            // Captain gets 2x points
                            if (isCaptain) return basePoints * 2;
                            // Vice-captain gets 2x only if captain has 0 points
                            const captainPlayer = displayMainPlayers.find(p => p.id === displayCaptainId);
                            const captainPoints = captainPlayer?.tour_points ?? captainPlayer?.points ?? 0;
                            if (isViceCaptain && captainPoints === 0) return basePoints * 2;
                            return basePoints;
                          })()}
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
          <h2 className="text-foreground text-xl font-display mb-4 mt-8">Замены</h2>
          <div className="flex items-center px-4 py-1 text-xs text-muted-foreground">
            <span className="flex-1">Игрок</span>
            <div className="w-12 flex justify-center"><PointsColumnHeader type="tour" /></div>
            <div className="w-10 flex justify-center">Цена</div>
          </div>
          <div className="space-y-2">
            {/* Bench order matches user-defined substitution priority (same as formation view) */}
            {displayBenchPlayers.map((player) => {
              const isCaptain = displayCaptainId === player.id;
              const isViceCaptain = displayViceCaptainId === player.id;
              
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
                    {(clubLogos[player.team_name] || player.team_logo) && (
                      <img
                        src={clubLogos[player.team_name] || player.team_logo}
                        alt={player.team_name}
                        className="w-5 h-5 object-contain flex-shrink-0"
                      />
                    )}
                    <span className="text-foreground font-medium truncate flex-1">{player.name}</span>
                    <span className="text-muted-foreground/50 text-[10px]">({player.position})</span>
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
                    {player.hasRedCard && (
                      <img src={redCardBadge} alt="red card" className="w-4 h-4 flex-shrink-0" />
                    )}
                    {player.isInjured && !player.hasRedCard && (
                      <img src={injuryBadge} alt="injury" className="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                  <div className="w-12 flex-shrink-0 flex justify-center text-foreground text-sm">
                    {(() => {
                      const basePoints = player.tour_points ?? player.points ?? 0;
                      // Captain gets 2x points
                      if (isCaptain) return basePoints * 2;
                      // Vice-captain gets 2x only if captain has 0 points
                      const captainPlayer = displayMainPlayers.find(p => p.id === displayCaptainId);
                      const captainPoints = captainPlayer?.tour_points ?? captainPlayer?.points ?? 0;
                      if (isViceCaptain && captainPoints === 0) return basePoints * 2;
                      return basePoints;
                    })()}
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
                total_points: selectedPlayer.total_points,
                tour_points: selectedPlayer.tour_points,
              }
            : null
        }
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
        variant="view"
        showTourPoints={true}
      />

      {/* Home Button */}
      {/* <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}
    </div>
  );
};

export default ViewTeam;
