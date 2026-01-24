import { useState, useEffect, useMemo } from "react";
import { squadsApi, playersApi, toursApi, UserSquad, Player, ToursResponse } from "@/lib/api";

export interface EnrichedPlayer {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string; // "ВР", "ЗЩ", "ПЗ", "НП"
  price: number;
  points: number;
  slotIndex?: number;
  hasRedCard?: boolean;
  isInjured?: boolean;
}

interface UseSquadByIdResult {
  squad: UserSquad | null;
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
  const [squad, setSquad] = useState<UserSquad | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [toursData, setToursData] = useState<ToursResponse | null>(null);
  const [tourPoints, setTourPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!squadId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try to fetch squad by ID with user validation
        let squadResponse = await squadsApi.getSquadById(squadId);

        // If squad not found or does not belong to current user, try public endpoint
        if (!squadResponse.success && squadResponse.status === 404) {
          const publicResponse = await squadsApi.getSquadByIdPublic(squadId);
          if (!publicResponse.success || !publicResponse.data) {
            setError(publicResponse.error || squadResponse.error || "Squad not found");
            setIsLoading(false);
            return;
          }
          squadResponse = publicResponse;
        } else if (!squadResponse.success || !squadResponse.data) {
          setError(squadResponse.error || "Squad not found");
          setIsLoading(false);
          return;
        }

        const squadData = squadResponse.data;
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

        // Handle tours and get tour points from leaderboard
        if (toursResponse.success && toursResponse.data) {
          setToursData(toursResponse.data);

          // Если есть текущий тур — берём его. Иначе используем предыдущий тур.
          const targetTourId = toursResponse.data.current_tour?.id ?? toursResponse.data.previous_tour?.id;
          if (targetTourId) {
            const leaderboardResponse = await squadsApi.getLeaderboard(targetTourId);
            if (leaderboardResponse.success && leaderboardResponse.data) {
              const entry = leaderboardResponse.data.find(
                (e) => e.squad_id === squadId
              );
              if (entry) {
                setTourPoints(entry.tour_points);
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

  // Enrich main players with full data and assign slotIndex per position
  const mainPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squad) return [];

    const playersWithPositions = squad.main_players.map((sp) => {
      const fullPlayer = playerMap.get(sp.id);
      return {
        id: sp.id,
        name: sp.name,
        team_id: sp.team_id,
        team_name: fullPlayer?.team_name || "",
        team_logo: fullPlayer?.team_logo || "",
        position: fullPlayer ? mapPosition(fullPlayer.position) : "ПЗ",
        price: fullPlayer ? Math.round((fullPlayer.market_value / 1000) * 10) / 10 : 0,
        points: sp.points,
        slotIndex: 0,
        hasRedCard: fullPlayer?.has_red_card,
        isInjured: fullPlayer?.is_injured,
      };
    });

    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

    return playersWithPositions.map((player) => {
      const slotIndex = positionCounters[player.position] || 0;
      positionCounters[player.position] = slotIndex + 1;
      return { ...player, slotIndex };
    });
  }, [squad, playerMap]);

  // Enrich bench players with full data
  const benchPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squad) return [];

    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

    return squad.bench_players.map((sp) => {
      const fullPlayer = playerMap.get(sp.id);
      const position = fullPlayer ? mapPosition(fullPlayer.position) : "ПЗ";
      const slotIndex = positionCounters[position] || 0;
      positionCounters[position] = slotIndex + 1;

      return {
        id: sp.id,
        name: sp.name,
        team_id: sp.team_id,
        team_name: fullPlayer?.team_name || "",
        team_logo: fullPlayer?.team_logo || "",
        position,
        price: fullPlayer ? Math.round((fullPlayer.market_value / 1000) * 10) / 10 : 0,
        points: sp.points,
        slotIndex,
        hasRedCard: fullPlayer?.has_red_card,
        isInjured: fullPlayer?.is_injured,
      };
    });
  }, [squad, playerMap]);

  const currentTour = toursData?.current_tour?.number || null;

  return {
    squad,
    mainPlayers,
    benchPlayers,
    currentTour,
    tourPoints,
    isLoading,
    error,
  };
}
