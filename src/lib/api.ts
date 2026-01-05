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
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
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
}

export interface CreateSquadResponse {
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
};

// Методы для работы с пользователями
export const usersApi = {
  getProtected: () => apiRequest<unknown>('/api/users/protected'),
};
