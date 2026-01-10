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
}

interface UseSquadDataResult {
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

export function useSquadData(leagueId: number): UseSquadDataResult {
  const [squad, setSquad] = useState<UserSquad | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [toursData, setToursData] = useState<ToursResponse | null>(null);
  const [tourPoints, setTourPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [squadsResponse, playersResponse, toursResponse] = await Promise.all([
          squadsApi.getMySquads(),
          playersApi.getByLeague(leagueId),
          toursApi.getPreviousCurrentNextTour(leagueId),
        ]);

        // Handle squads
        if (squadsResponse.success && squadsResponse.data) {
          const userSquad = squadsResponse.data.find(s => s.league_id === leagueId);
          if (userSquad) {
            setSquad(userSquad);
          }
        } else if (squadsResponse.error) {
          console.error("Failed to fetch squads:", squadsResponse.error);
        }

        // Handle players
        if (playersResponse.success && playersResponse.data) {
          setAllPlayers(playersResponse.data);
        } else if (playersResponse.error) {
          console.error("Failed to fetch players:", playersResponse.error);
        }

        // Handle tours
        if (toursResponse.success && toursResponse.data) {
          setToursData(toursResponse.data);

          // Fetch leaderboard for current tour
          const currentTourId = toursResponse.data.current_tour?.id;
          if (currentTourId) {
            const leaderboardResponse = await squadsApi.getLeaderboard(currentTourId);
            if (leaderboardResponse.success && leaderboardResponse.data) {
              const squadsData = squadsResponse.data;
              if (squadsData) {
                const userSquad = squadsData.find(s => s.league_id === leagueId);
                if (userSquad) {
                  const userEntry = leaderboardResponse.data.find(
                    entry => entry.squad_id === userSquad.id
                  );
                  if (userEntry) {
                    setTourPoints(userEntry.tour_points);
                  }
                }
              }
            }
          }
        } else if (toursResponse.error) {
          console.error("Failed to fetch tours:", toursResponse.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  // Create a map for quick player lookup
  const playerMap = useMemo(() => {
    const map = new Map<number, Player>();
    allPlayers.forEach(p => map.set(p.id, p));
    return map;
  }, [allPlayers]);

  // Enrich main players with full data
  const mainPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squad) return [];

    return squad.main_players.map((sp, index) => {
      const fullPlayer = playerMap.get(sp.id);
      return {
        id: sp.id,
        name: sp.name,
        team_id: sp.team_id,
        team_name: fullPlayer?.team_name || "",
        team_logo: fullPlayer?.team_logo || "",
        position: fullPlayer ? mapPosition(fullPlayer.position) : "ПЗ",
        price: fullPlayer?.market_value || 0,
        points: sp.points,
        slotIndex: index,
      };
    });
  }, [squad, playerMap]);

  // Enrich bench players with full data
  const benchPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squad) return [];

    return squad.bench_players.map((sp, index) => {
      const fullPlayer = playerMap.get(sp.id);
      return {
        id: sp.id,
        name: sp.name,
        team_id: sp.team_id,
        team_name: fullPlayer?.team_name || "",
        team_logo: fullPlayer?.team_logo || "",
        position: fullPlayer ? mapPosition(fullPlayer.position) : "ПЗ",
        price: fullPlayer?.market_value || 0,
        points: sp.points,
        slotIndex: index,
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
