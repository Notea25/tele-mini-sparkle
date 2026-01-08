import { supabase } from "@/integrations/supabase/client";

export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  statusText?: string;
  data?: T;
  error?: string;
  headers?: Record<string, string>;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', body } = options;

  try {
    const { data, error } = await supabase.functions.invoke('api-proxy', {
      method: 'POST',
      body: {
        path: endpoint,
        method,
        body,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return data as ApiResponse<T>;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// Методы для работы с лигами
export const leaguesApi = {
  getMainPage: (id: number) => apiRequest<unknown>(`/api/leagues/main_page_id_${id}`),
};

// Типы для туров
export interface TourDeadline {
  deadline: string;
}

// Методы для работы с турами
export const toursApi = {
  getDeadlineForNextTour: (leagueId: number) => apiRequest<TourDeadline>(`/api/tours/get_deadline_for_next_tour/${leagueId}`),
};

// Типы для команд
export interface Team {
  id: number;
  name: string;
  logo: string;
}

// Методы для работы с командами
export const teamsApi = {
  getByLeague: (leagueId: number) => apiRequest<Team[]>(`/api/teams/league_${leagueId}`),
};

// Типы для создания команды
export interface CreateSquadRequest {
  name: string;
  league_id: number;
  fav_team_id: number;
  main_player_ids: number[];
  bench_player_ids: number[];
}

export interface CreateSquadResponse {
  id: number;
  name: string;
  league_id: number;
  fav_team_id: number;
  main_player_ids: number[];
  bench_player_ids: number[];
}

// Типы для получения сквадов пользователя
export interface UserSquad {
  id: number;
  name: string;
  league_id: number;
  fav_team_id: number;
}

// Методы для работы со сквадами
export const squadsApi = {
  create: (data: CreateSquadRequest) => apiRequest<CreateSquadResponse>('/api/squads/create', {
    method: 'POST',
    body: data,
  }),
  getMySquads: () => apiRequest<UserSquad[]>('/api/squads/my_squads'),
  rename: (squadId: number, name: string) => apiRequest<{ id: number; name: string }>(`/api/squads/${squadId}/rename`, {
    method: 'PATCH',
    body: { name },
  }),
};

// Методы для работы с пользователями
export const usersApi = {
  getProtected: () => apiRequest<unknown>('/api/users/protected'),
};

// Типы для игроков
export interface Player {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string; // "Defender", "Attacker", "Midfielder", "Goalkeeper"
  market_value: number;
  points: number;
}

// Типы для полной информации об игроке
export interface PlayerFullInfoMatch {
  match_id: number;
  is_home: boolean;
  opponent_team_id: number;
  opponent_team_name: string;
  opponent_team_logo: string;
  player_points: number | null;
}

export interface PlayerFullInfoTour {
  tour_id: number;
  tour_number: number;
  matches: PlayerFullInfoMatch[];
}

export interface PlayerFullInfoResponse {
  base_info: {
    id: number;
    name: string;
    photo: string;
    team_id: number;
    team_name: string;
    team_logo: string;
    position: string;
  };
  extended_info: {
    total_players_in_league: number;
    market_value_rank: number;
    avg_points_all_matches: number;
    avg_points_all_matches_rank: number;
    avg_points_last_5_matches: number;
    avg_points_last_5_matches_rank: number;
    squad_presence_percentage: number;
    squad_presence_rank: number;
  };
  last_3_tours: PlayerFullInfoTour[];
  next_3_tours: PlayerFullInfoTour[];
}

// Методы для работы с игроками
export const playersApi = {
  getByLeague: (leagueId: number) => 
    apiRequest<Player[]>(`/api/players/league/${leagueId}/players_with_points`),
  getFullInfo: (playerId: number) =>
    apiRequest<PlayerFullInfoResponse>(`/api/players/${playerId}/full-info`),
};
