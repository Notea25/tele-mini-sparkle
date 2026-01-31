import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { squadsApi, playersApi, toursApi, Squad, SquadTourData, Player, ToursResponse } from "@/lib/api";

export interface EnrichedPlayer {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string; // "ВР", "ЗЩ", "ПЗ", "НП"
  price: number;
  points: number; // Legacy field for backward compatibility
  total_points: number; // Total points across all tours
  tour_points: number; // Points for current/last tour
  slotIndex?: number;
  hasRedCard?: boolean;
  isInjured?: boolean;
}

interface UseSquadDataResult {
  squad: Squad | null;
  squadTourData: SquadTourData | null; // NEW: tour-specific state
  mainPlayers: EnrichedPlayer[];
  benchPlayers: EnrichedPlayer[];
  currentTour: number | null;
  currentTourId: number | null;
  nextTour: number | null; // Номер следующего тура
  nextTourId: number | null;
  boostTourId: number | null; // ID тура для бустов (next_tour.id или current_tour.id)
  tourPoints: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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
  const queryClient = useQueryClient();

  // Fetch squads with react-query - always fetch fresh from API, no caching
  const { data: squadsResponse, isLoading: squadsLoading, error: squadsError, refetch: refetchSquads } = useQuery({
    queryKey: ['my-squads'],
    queryFn: () => squadsApi.getMySquads(),
    staleTime: 0, // Data is immediately stale
    gcTime: 0, // Don't cache at all - always fetch fresh
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when reconnecting
  });

  // Fetch players with react-query - no caching
  const { data: playersResponse, isLoading: playersLoading } = useQuery({
    queryKey: ['players', leagueId],
    queryFn: () => playersApi.getByLeague(leagueId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Fetch tours with react-query - no caching
  const { data: toursResponse, isLoading: toursLoading } = useQuery({
    queryKey: ['tours', leagueId],
    queryFn: () => toursApi.getPreviousCurrentNextTour(leagueId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Extract squad metadata
  const squad = useMemo(() => {
    if (squadsResponse?.success && squadsResponse.data) {
      return squadsResponse.data.find(s => s.league_id === leagueId) || null;
    }
    return null;
  }, [squadsResponse, leagueId]);

  // NEW ARCHITECTURE: Fetch SquadTour data for next/current tour
  // This contains budget, replacements, players, captain, points, etc.
  const targetTourId = useMemo(() => {
    if (toursData?.next_tour?.id) return toursData.next_tour.id;
    if (toursData?.current_tour?.id) {
      const deadline = toursData.current_tour.deadline ? new Date(toursData.current_tour.deadline) : null;
      if (deadline && deadline <= new Date()) {
        return toursData.current_tour.id;
      }
    }
    return null;
  }, [toursData]);

  const { data: squadTourResponse, isLoading: squadTourLoading } = useQuery({
    queryKey: ['squad-tour', squad?.id, targetTourId],
    queryFn: () => 
      squad && targetTourId 
        ? squadsApi.getSquadWithTourData(squad.id, targetTourId)
        : Promise.resolve(null),
    enabled: !!squad && !!targetTourId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const squadTourData = useMemo(() => {
    if (squadTourResponse?.success && squadTourResponse.data) {
      return squadTourResponse.data.current_tour;
    }
    return null;
  }, [squadTourResponse]);

  const allPlayers = useMemo(() => {
    if (playersResponse?.success && playersResponse.data) {
      return playersResponse.data;
    }
    return [];
  }, [playersResponse]);

  const toursData = useMemo(() => {
    if (toursResponse?.success && toursResponse.data) {
      return toursResponse.data;
    }
    return null;
  }, [toursResponse]);

  // Ищем актуальный тур для отображения очков:
  // если есть current_tour — используем его, иначе previous_tour.
  const currentTourId = (toursData?.current_tour?.id ?? toursData?.previous_tour?.id) || null;
  const { data: leaderboardResponse } = useQuery({
    queryKey: ['leaderboard', currentTourId],
    queryFn: () => currentTourId ? squadsApi.getLeaderboard(currentTourId) : Promise.resolve(null),
    enabled: !!currentTourId && !!squad,
    staleTime: 0,
    gcTime: 0,
  });

  const tourPoints = useMemo(() => {
    if (leaderboardResponse?.success && leaderboardResponse.data && squad) {
      const userEntry = leaderboardResponse.data.find(entry => entry.squad_id === squad.id);
      return userEntry?.tour_points || 0;
    }
    return 0;
  }, [leaderboardResponse, squad]);

  // Create a map for quick player lookup
  const playerMap = useMemo(() => {
    const map = new Map<number, Player>();
    allPlayers.forEach(p => map.set(p.id, p));
    return map;
  }, [allPlayers]);

  // Enrich main players with full data and assign slotIndex per position
  const mainPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squadTourData || !squadTourData.main_players) return [];

    // First, map all players with their positions
    const playersWithPositions = squadTourData.main_players.map((sp) => {
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
        total_points: sp.total_points ?? 0,
        tour_points: sp.tour_points ?? 0,
        slotIndex: 0, // Will be assigned below
        hasRedCard: fullPlayer?.has_red_card,
        isInjured: fullPlayer?.is_injured,
      };
    });

    // Assign slotIndex per position
    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
    
    return playersWithPositions.map(player => {
      const slotIndex = positionCounters[player.position] || 0;
      positionCounters[player.position] = slotIndex + 1;
      return { ...player, slotIndex };
    });
  }, [squadTourData, playerMap]);

  // Enrich bench players with full data
  const benchPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squadTourData || !squadTourData.bench_players) return [];

    // Assign slotIndex per position for bench too
    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

    return squadTourData.bench_players.map((sp) => {
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
        total_points: sp.total_points ?? 0,
        tour_points: sp.tour_points ?? 0,
        slotIndex,
        hasRedCard: fullPlayer?.has_red_card,
        isInjured: fullPlayer?.is_injured,
      };
    });
  }, [squadTourData, playerMap]);

  const currentTour = toursData?.current_tour?.number || null;
  const nextTour = toursData?.next_tour?.number || null;
  const nextTourId = toursData?.next_tour?.id || null;
  
  // For boosts: бусты можно использовать ТОЛЬКО для следующего тура
  const boostTourId = nextTourId;

  const isLoading = squadsLoading || playersLoading || toursLoading || squadTourLoading;
  const error = squadsError ? (squadsError instanceof Error ? squadsError.message : 'Unknown error') : null;

  const refetch = async () => {
    // Invalidate squad cache to force refetch
    await queryClient.invalidateQueries({ queryKey: ['my-squads'] });
    await refetchSquads();
  };

  return {
    squad,
    squadTourData,
    mainPlayers,
    benchPlayers,
    currentTour,
    currentTourId,
    nextTour,
    nextTourId,
    boostTourId,
    tourPoints,
    isLoading,
    error,
    refetch,
  };
}

// Export a function to invalidate squad cache from anywhere
export const invalidateSquadCache = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['my-squads'] });
};
