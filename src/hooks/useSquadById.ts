import { useState, useEffect, useMemo } from "react";
import { squadsApi, playersApi, toursApi, squadToursApi, playerStatusesApi, Squad, SquadTourResponse, Player, ToursResponse, PlayerStatus, STATUS_INJURED, STATUS_RED_CARD, STATUS_LEFT_LEAGUE } from "@/lib/api";

export interface EnrichedPlayer {
  id: number;
  name: string; // Имя уже переведено на бэкэнде (русское)
  team_id: number;
  team_name: string;
  team_name_rus?: string; // Русское название команды
  team_logo: string;
  field_player_jersey?: string; // URL майки полевого игрока
  goalkeeper_jersey?: string; // URL майки вратаря
  photo?: string; // Фото игрока
  position: string; // "ВР", "ЗЩ", "ПЗ", "НП"
  price: number;
  points: number; // Оставлено для обратной совместимости
  total_points?: number; // Общие очки за все туры
  tour_points?: number; // Очки за последний/текущий тур
  final_tour_points?: number; // Финальные очки за тур с учетом капитанства/буста
  slotIndex?: number;
  hasRedCard?: boolean;
  isInjured?: boolean;
  hasLeftLeague?: boolean; // Игрок покинул чемпионат
  // Информация о следующем сопернике для подписи на плитке
  nextOpponent?: string;
  nextOpponentHome?: boolean;
}

interface UseSquadByIdResult {
  squad: Squad | null;
  squadTourData: SquadTourResponse | null;
  mainPlayers: EnrichedPlayer[];
  benchPlayers: EnrichedPlayer[];
  currentTour: number | null;
  tourPoints: number;
  isLoading: boolean;
  error: string | null;
}

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

export function useSquadById(squadId: number | null): UseSquadByIdResult {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [squadTourData, setSquadTourData] = useState<SquadTourResponse | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [toursData, setToursData] = useState<ToursResponse | null>(null);
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [tourPoints, setTourPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!squadId) {
      setIsLoading(false);
      return;
    }

    // Reset state synchronously so old squad data is never shown during loading
    setSquad(null);
    setSquadTourData(null);
    setAllPlayers([]);
    setToursData(null);
    setPlayerStatuses([]);
    setTourPoints(0);
    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // NEW ARCHITECTURE: First fetch squad metadata
        let squadMetadataResponse = await squadsApi.getSquadById(squadId);

        // If squad not found or does not belong to current user, try public endpoint
        if (!squadMetadataResponse.success && squadMetadataResponse.status === 404) {
          const publicResponse = await squadsApi.getSquadByIdPublic(squadId);
          if (!publicResponse.success || !publicResponse.data) {
            setError(publicResponse.error || squadMetadataResponse.error || "Squad not found");
            setIsLoading(false);
            return;
          }
          squadMetadataResponse = publicResponse;
        } else if (!squadMetadataResponse.success || !squadMetadataResponse.data) {
          setError(squadMetadataResponse.error || "Squad not found");
          setIsLoading(false);
          return;
        }

        const squadData = squadMetadataResponse.data;
        setSquad(squadData);

        // Now fetch players and tours for this squad's league
        const leagueId = squadData.league_id;

        const [playersResponse, toursResponse] = await Promise.all([
          playersApi.getByLeague(leagueId),
          toursApi.getPreviousCurrentNextTour(leagueId),
        ]);

        // Handle players
        if (playersResponse.success && playersResponse.data) {
          setAllPlayers(playersResponse.data);
        } else if (playersResponse.error) {
          console.error("Failed to fetch players:", playersResponse.error);
        }

        // Handle tours and get current tour data from SquadTour
        if (toursResponse.success && toursResponse.data) {
          setToursData(toursResponse.data);

          // NEW ARCHITECTURE: Fetch SquadTour data using the new squad_tours API
          // ViewTeam always shows the CURRENT running tour so the player cards
          // display live points.  Use current_tour first (regardless of deadline),
          // then fall back to previous, then next.
          let targetTourId: number | undefined;
          let targetTourNumber: number | undefined;
          
          if (toursResponse.data.current_tour?.id) {
            targetTourId = toursResponse.data.current_tour.id;
            targetTourNumber = toursResponse.data.current_tour.number;
          } else if (toursResponse.data.previous_tour?.id) {
            targetTourId = toursResponse.data.previous_tour.id;
            targetTourNumber = toursResponse.data.previous_tour.number;
          } else if (toursResponse.data.next_tour?.id) {
            // Fallback to next tour if no current or previous tour available
            targetTourId = toursResponse.data.next_tour.id;
            targetTourNumber = toursResponse.data.next_tour.number;
          }

          // Fetch player statuses for this tour
          if (targetTourNumber) {
            try {
              const statusesResponse = await playerStatusesApi.getByTourNumber(targetTourNumber);
              if (statusesResponse.success && statusesResponse.data) {
                setPlayerStatuses(statusesResponse.data);
              }
            } catch (err) {
              console.error('Failed to fetch player statuses:', err);
            }
          }

          if (targetTourId) {
            try {
              // Use the new squad_tours API endpoint
              const squadTourResponse = await squadToursApi.getBySquadAndTour(squadId, targetTourId);
              if (squadTourResponse.success && squadTourResponse.data) {
                setSquadTourData(squadTourResponse.data);
                setTourPoints(squadTourResponse.data.points);
              }
            } catch (err) {
              console.error('Failed to fetch squad tour data:', err);
              // Fallback: get points from leaderboard
              const leaderboardResponse = await squadsApi.getLeaderboard(targetTourId);
              if (leaderboardResponse.success && leaderboardResponse.data) {
                const entry = leaderboardResponse.data.find((e) => e.squad_id === squadId);
                if (entry) {
                  setTourPoints(entry.tour_points);
                }
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [squadId]);

  // Create a map for quick player lookup
  const playerMap = useMemo(() => {
    const map = new Map<number, Player>();
    allPlayers.forEach((p) => map.set(p.id, p));
    return map;
  }, [allPlayers]);

  // Create a map for quick status lookup by player_id
  const playerStatusMap = useMemo(() => {
    const map = new Map<number, PlayerStatus[]>();
    for (const status of playerStatuses) {
      const existing = map.get(status.player_id) || [];
      existing.push(status);
      map.set(status.player_id, existing);
    }
    return map;
  }, [playerStatuses]);

  // Helper function to get player status flags from status map
  const getPlayerStatusFlags = (playerId: number) => {
    const statuses = playerStatusMap.get(playerId) || [];
    return {
      hasRedCard: statuses.some(s => s.status_type === STATUS_RED_CARD),
      isInjured: statuses.some(s => s.status_type === STATUS_INJURED),
      hasLeftLeague: statuses.some(s => s.status_type === STATUS_LEFT_LEAGUE),
    };
  };

  // Enrich main players with full data and assign slotIndex per position
  // Now using squadTourData from squad_tours API which already contains player details
  // IMPORTANT: Sort by position order first, then assign slotIndex to match FormationField slot detection
  const mainPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squadTourData || !squadTourData.main_players) return [];

    // IMPORTANT: keep backend order (TeamManagement assigns slotIndex in the incoming order).
    // We only map positions to RU codes and then assign slotIndex sequentially per position.
    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

    return squadTourData.main_players.map((sp) => {
      const fullPlayer = playerMap.get(sp.id);
      const statusFlags = getPlayerStatusFlags(sp.id);
      const position = mapPosition(sp.position || fullPlayer?.position || "Midfielder");
      const slotIndex = positionCounters[position] || 0;
      positionCounters[position] = slotIndex + 1;

      return {
        id: sp.id,
        name: sp.name || fullPlayer?.name || "",
        team_id: sp.team_id,
        team_name: sp.team_name || fullPlayer?.team_name || "",
        team_name_rus: sp.team_name_rus || fullPlayer?.team_name_rus,
        team_logo: sp.team_logo || fullPlayer?.team_logo || "",
        field_player_jersey: sp.field_player_jersey || fullPlayer?.field_player_jersey,
        goalkeeper_jersey: sp.goalkeeper_jersey || fullPlayer?.goalkeeper_jersey,
        photo: sp.photo || "",
        position,
        price: sp.market_value ?? fullPlayer?.market_value ?? 0,
        points: sp.points,
        total_points: sp.total_points,
        tour_points: sp.tour_points,
        final_tour_points: sp.final_tour_points,
        slotIndex,
        hasRedCard: statusFlags.hasRedCard,
        isInjured: statusFlags.isInjured,
        hasLeftLeague: statusFlags.hasLeftLeague,
        nextOpponent: sp.next_opponent_team_name || "",
        nextOpponentHome: sp.next_opponent_is_home ?? false,
      };
    });
  }, [squadTourData, playerMap, playerStatusMap]);

  // Enrich bench players with full data
  // Now using squadTourData from squad_tours API which already contains player details
  const benchPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squadTourData || !squadTourData.bench_players) return [];

    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

    return squadTourData.bench_players.map((sp) => {
      const fullPlayer = playerMap.get(sp.id);
      const statusFlags = getPlayerStatusFlags(sp.id);
      const position = mapPosition(sp.position || fullPlayer?.position || "Midfielder");
      const slotIndex = positionCounters[position] || 0;
      positionCounters[position] = slotIndex + 1;

      return {
        id: sp.id,
        name: sp.name || fullPlayer?.name || "",
        team_id: sp.team_id,
        team_name: sp.team_name || fullPlayer?.team_name || "",
        team_name_rus: sp.team_name_rus || fullPlayer?.team_name_rus,
        team_logo: sp.team_logo || fullPlayer?.team_logo || "",
        field_player_jersey: sp.field_player_jersey || fullPlayer?.field_player_jersey,
        goalkeeper_jersey: sp.goalkeeper_jersey || fullPlayer?.goalkeeper_jersey,
        photo: sp.photo || "",
        position,
        price: sp.market_value ?? fullPlayer?.market_value ?? 0,
        points: sp.points,
        total_points: sp.total_points,
        tour_points: sp.tour_points,
        final_tour_points: sp.final_tour_points,
        slotIndex,
        hasRedCard: statusFlags.hasRedCard,
        isInjured: statusFlags.isInjured,
        hasLeftLeague: statusFlags.hasLeftLeague,
        nextOpponent: sp.next_opponent_team_name || "",
        nextOpponentHome: sp.next_opponent_is_home ?? false,
      };
    });
  }, [squadTourData, playerMap, playerStatusMap]);

  const currentTour

  return {
    squad,
    squadTourData,
    mainPlayers,
    benchPlayers,
    currentTour,
    tourPoints,
    isLoading,
    error,
  };
}
