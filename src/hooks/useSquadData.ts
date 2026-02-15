import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { squadsApi, playersApi, toursApi, squadToursApi, playerStatusesApi, Squad, SquadTourResponse, Player, ToursResponse, PlayerStatus, STATUS_INJURED, STATUS_RED_CARD, STATUS_LEFT_LEAGUE } from "@/lib/api";

export interface EnrichedPlayer {
  id: number;
  name: string;
  name_rus?: string; // Русское имя игрока
  team_id: number;
  team_name: string;
  team_name_rus?: string; // Русское название команды
  team_logo: string;
  field_player_jersey?: string; // Jersey URL for field players
  goalkeeper_jersey?: string; // Jersey URL for goalkeepers
  photo?: string; // Фото игрока
  position: string; // "ВР", "ЗЩ", "ПЗ", "НП"
  price: number;
  points: number; // Legacy field for backward compatibility
  total_points: number; // Total points across all tours
  tour_points: number; // Points for current/last tour
  slotIndex?: number;
  hasRedCard?: boolean;
  isInjured?: boolean;
  hasLeftLeague?: boolean; // Игрок покинул чемпионат
  // Next opponent info for card footer (comes from squad_tours API)
  nextOpponent?: string;
  nextOpponentHome?: boolean;
}

interface UseSquadDataResult {
  squad: Squad | null;
  squadTourData: SquadTourResponse | null; // NEW: tour-specific state from squad_tours API
  mainPlayers: EnrichedPlayer[];
  benchPlayers: EnrichedPlayer[];
  previousTour: number | null; // Номер предыдущего тура
  currentTour: number | null;
  currentTourId: number | null;
  nextTour: number | null; // Номер следующего тура
  nextTourId: number | null;
  boostTourId: number | null; // ID тура для бустов (next_tour.id или current_tour.id)
  leaderboardTourId: number | null; // ID тура для лидербордов (current ?? previous ?? next)
  leaderboardTourNumber: number | null; // Номер тура для отображения в лидербордах
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

  // Extract tours data FIRST (before using it)
  const toursData = useMemo(() => {
    if (toursResponse?.success && toursResponse.data) {
      return toursResponse.data;
    }
    return null;
  }, [toursResponse]);

  // Extract squad metadata
  const squad = useMemo(() => {
    if (squadsResponse?.success && squadsResponse.data) {
      return squadsResponse.data.find(s => s.league_id === leagueId) || null;
    }
    return null;
  }, [squadsResponse, leagueId]);

  // Determine target tour ID for squad_tours API
  // Priority: next_tour.id, then current_tour.id if deadline passed
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

  // Determine target tour NUMBER for fetching player statuses
  const targetTourNumber = useMemo(() => {
    if (toursData?.next_tour?.number) return toursData.next_tour.number;
    if (toursData?.current_tour?.number) {
      const deadline = toursData.current_tour.deadline ? new Date(toursData.current_tour.deadline) : null;
      if (deadline && deadline <= new Date()) {
        return toursData.current_tour.number;
      }
    }
    return null;
  }, [toursData]);

  // NEW: Fetch SquadTour data using the new squad_tours API endpoint
  const { data: squadTourResponse, isLoading: squadTourLoading } = useQuery({
    queryKey: ['squad-tour-new', squad?.id, targetTourId],
    queryFn: () => 
      squad && targetTourId 
        ? squadToursApi.getBySquadAndTour(squad.id, targetTourId)
        : Promise.resolve(null),
    enabled: !!squad && !!targetTourId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Fetch player statuses for the target tour
  const { data: playerStatusesResponse, isLoading: statusesLoading } = useQuery({
    queryKey: ['player-statuses-tour', targetTourNumber],
    queryFn: () => 
      targetTourNumber 
        ? playerStatusesApi.getByTourNumber(targetTourNumber)
        : Promise.resolve(null),
    enabled: !!targetTourNumber,
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Create a map for quick status lookup by player_id
  const playerStatusMap = useMemo(() => {
    const map = new Map<number, PlayerStatus[]>();
    if (playerStatusesResponse?.success && playerStatusesResponse.data) {
      for (const status of playerStatusesResponse.data) {
        const existing = map.get(status.player_id) || [];
        existing.push(status);
        map.set(status.player_id, existing);
      }
    }
    return map;
  }, [playerStatusesResponse]);
  const squadTourData = useMemo((): SquadTourResponse | null => {
    if (squadTourResponse?.success && squadTourResponse.data) {
      return squadTourResponse.data;
    }
    return null;
  }, [squadTourResponse]);

  const allPlayers = useMemo(() => {
    if (playersResponse?.success && playersResponse.data) {
      return playersResponse.data;
    }
    return [];
  }, [playersResponse]);

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

    // Position order priority for correct field positioning
    const positionOrder: Record<string, number> = { "ВР": 0, "ЗЩ": 1, "ПЗ": 2, "НП": 3 };

    // First, map all players with their positions
    const playersWithPositions = squadTourData.main_players.map((sp) => {
      const fullPlayer = playerMap.get(sp.id);
      const statusFlags = getPlayerStatusFlags(sp.id);
        return {
        id: sp.id,
        name: sp.name,
        name_rus: sp.name_rus || fullPlayer?.name_rus,
        team_id: sp.team_id,
        team_name: sp.team_name || fullPlayer?.team_name || "",
        team_name_rus: sp.team_name_rus || fullPlayer?.team_name_rus,
        team_logo: sp.team_logo || fullPlayer?.team_logo || "",
        field_player_jersey: sp.field_player_jersey,
        goalkeeper_jersey: sp.goalkeeper_jersey,
        photo: sp.photo || "",
        position: mapPosition(sp.position || fullPlayer?.position || "Midfielder"),
        price: sp.market_value ?? fullPlayer?.market_value ?? 0,
        points: sp.points,
        total_points: sp.total_points ?? 0,
        tour_points: sp.tour_points ?? 0,
        slotIndex: 0, // Will be assigned below
        hasRedCard: statusFlags.hasRedCard,
        isInjured: statusFlags.isInjured,
        hasLeftLeague: statusFlags.hasLeftLeague,
        nextOpponent: sp.next_opponent_team_name || "",
        nextOpponentHome: sp.next_opponent_is_home ?? false,
      };
    });

    // Sort by position order to ensure correct slotIndex assignment
    playersWithPositions.sort((a, b) => {
      const orderA = positionOrder[a.position] ?? 99;
      const orderB = positionOrder[b.position] ?? 99;
      return orderA - orderB;
    });

    // Assign slotIndex per position
    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };
    
    return playersWithPositions.map(player => {
      const slotIndex = positionCounters[player.position] || 0;
      positionCounters[player.position] = slotIndex + 1;
      return { ...player, slotIndex };
    });
  }, [squadTourData, playerMap, playerStatusMap]);

  // Enrich bench players with full data
  // Now using squadTourData from squad_tours API which already contains player details
  const benchPlayers = useMemo((): EnrichedPlayer[] => {
    if (!squadTourData || !squadTourData.bench_players) return [];

    // Assign slotIndex per position for bench too
    const positionCounters: Record<string, number> = { "ВР": 0, "ЗЩ": 0, "ПЗ": 0, "НП": 0 };

    return squadTourData.bench_players.map((sp) => {
      const fullPlayer = playerMap.get(sp.id);
      const statusFlags = getPlayerStatusFlags(sp.id);
      const position = mapPosition(sp.position || fullPlayer?.position || "Midfielder");
      const slotIndex = positionCounters[position] || 0;
      positionCounters[position] = slotIndex + 1;

      return {
        id: sp.id,
        name: sp.name,
        name_rus: sp.name_rus || fullPlayer?.name_rus,
        team_id: sp.team_id,
        team_name: sp.team_name || fullPlayer?.team_name || "",
        team_name_rus: sp.team_name_rus || fullPlayer?.team_name_rus,
        team_logo: sp.team_logo || fullPlayer?.team_logo || "",
        field_player_jersey: sp.field_player_jersey,
        goalkeeper_jersey: sp.goalkeeper_jersey,
        photo: sp.photo || "",
        position,
        price: sp.market_value ?? fullPlayer?.market_value ?? 0,
        points: sp.points,
        total_points: sp.total_points ?? 0,
        tour_points: sp.tour_points ?? 0,
        slotIndex,
        hasRedCard: statusFlags.hasRedCard,
        isInjured: statusFlags.isInjured,
        hasLeftLeague: statusFlags.hasLeftLeague,
        nextOpponent: sp.next_opponent_team_name || "",
        nextOpponentHome: sp.next_opponent_is_home ?? false,
      };
    });
  }, [squadTourData, playerMap, playerStatusMap]);

  const previousTour = toursData?.previous_tour?.number || null;
  const currentTour = toursData?.current_tour?.number || null;
  const nextTour = toursData?.next_tour?.number || null;
  const nextTourId = toursData?.next_tour?.id || null;
  
  // For boosts: бусты можно использовать ТОЛЬКО для следующего тура
  const boostTourId = nextTourId;
  
  // For leaderboards: current_tour ?? previous_tour ?? next_tour
  // This ensures we always have a valid tour ID for leaderboard queries
  const leaderboardTourId = toursData?.current_tour?.id 
    ?? toursData?.previous_tour?.id 
    ?? toursData?.next_tour?.id 
    ?? null;
  
  // Tour NUMBER for leaderboard display (matches leaderboardTourId)
  const leaderboardTourNumber = toursData?.current_tour?.id 
    ? toursData.current_tour.number
    : toursData?.previous_tour?.id 
      ? toursData.previous_tour.number
      : toursData?.next_tour?.number ?? null;

  const isLoading = squadsLoading || playersLoading || toursLoading || squadTourLoading || statusesLoading;
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
    previousTour,
    currentTour,
    currentTourId,
    nextTour,
    nextTourId,
    boostTourId,
    leaderboardTourId,
    leaderboardTourNumber,
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
