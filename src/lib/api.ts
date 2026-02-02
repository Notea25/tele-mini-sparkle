import { supabase } from "@/integrations/supabase/client";
import { getAccessToken, getRefreshToken, setTokens } from "./authStorage";

export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  statusText?: string;
  data?: T;
  error?: string;
  headers?: Record<string, string>;
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Нужно ли автоматически подставлять access токен и пытаться обновлять его по refresh токену.
   * По умолчанию включено.
   */
  auth?: boolean;
  /**
   * Если true — тело передаётся на бэкенд как есть (строка), без JSON.stringify.
   * Используется, например, для Telegram initData.
   */
  rawBody?: boolean;
  /**
   * Явный Content-Type для бэкенда (например, "text/plain").
   */
  contentType?: string;
}

async function callBackend<T>(
  endpoint: string,
  options: ApiOptions,
  accessToken?: string | null
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, rawBody = false, contentType } = options;

  const finalHeaders: Record<string, string> = { ...headers };

  // Добавляем Authorization, если есть токен и включен auth
  if (options.auth !== false && accessToken) {
    finalHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const { data, error } = await supabase.functions.invoke("api-proxy", {
      method: "POST",
      body: {
        path: endpoint,
        method,
        body,
        headers: finalHeaders,
        rawBody,
        contentType,
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
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { data, error } = await supabase.functions.invoke("api-proxy", {
      method: "POST",
      body: {
        path: "/api/users/refresh",
        method: "POST",
        body: { refresh_token: refreshToken },
      },
    });

    if (error || !data) {
      return false;
    }

    const response = data as ApiResponse<unknown>;
    if (!response.success || !response.data) return false;

    const anyData = response.data as any;
    const newAccessToken = anyData.access_token as string | undefined;
    const newRefreshToken = (anyData.refresh_token as string | undefined) ?? refreshToken;

    if (!newAccessToken) return false;

    setTokens(newAccessToken, newRefreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const authEnabled = options.auth !== false;

  // Первая попытка — с текущим access токеном (если есть)
  const accessToken = authEnabled ? getAccessToken() : null;
  let response = await callBackend<T>(endpoint, options, accessToken);

  // Если авторизация включена и бэкенд вернул 401/403 — пробуем обновить токен и повторить запрос
  if (
    authEnabled &&
    (response.status === 401 || response.status === 403) &&
    (await refreshTokens())
  ) {
    const newAccessToken = getAccessToken();
    response = await callBackend<T>(endpoint, options, newAccessToken);
  }

  return response;
}

// Методы для работы с лигами
export const leaguesApi = {
  getMainPage: (id: number) => apiRequest<unknown>(`/api/leagues/main_page_id_${id}`),
};

// Типы для туров
export interface TourDeadline {
  deadline: string;
}

export interface TourInfo {
  id: number;
  number: number;
  league_id: number;
  start_date: string;
  end_date: string;
  deadline: string;
  type: 'previous' | 'current' | 'next';
}

export interface ToursResponse {
  previous_tour: TourInfo | null;
  current_tour: TourInfo | null;
  next_tour: TourInfo | null;
}

// Методы для работы с турами
export const toursApi = {
  getDeadlineForNextTour: (leagueId: number) => apiRequest<TourDeadline>(`/api/tours/get_deadline_for_next_tour/${leagueId}`),
  getPreviousCurrentNextTour: (leagueId: number) => apiRequest<ToursResponse>(`/api/tours/get_previous_current_next_tour/${leagueId}`),
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
  captain_id?: number | null;
  vice_captain_id?: number | null;
}

export interface CreateSquadResponse {
  id: number;
  name: string;
  league_id: number;
  fav_team_id: number;
  main_player_ids: number[];
  bench_player_ids: number[];
}

// Типы для игрока в скводе
export interface SquadPlayer {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string;
  market_value: number;
  photo: string;
  points: number; // Оставлено для обратной совместимости
  total_points: number; // Общие очки за все туры
  tour_points: number; // Очки за последний/текущий тур
}

// NEW ARCHITECTURE: Squad metadata only
export interface Squad {
  id: number;
  name: string;
  user_id: number;
  username: string;
  league_id: number;
  fav_team_id: number;
}

// NEW ARCHITECTURE: Squad state for a specific tour (snapshot)
export interface SquadTourData {
  tour_id: number;
  tour_number: number;
  budget: number;
  replacements: number;
  captain_id: number | null;
  vice_captain_id: number | null;
  main_players?: SquadPlayer[];
  bench_players?: SquadPlayer[];
  points: number;
  penalty_points: number;
  used_boost: string | null;
  is_finalized: boolean;
}

// NEW ARCHITECTURE: Combined response from API
export interface SquadWithTourData {
  squad: Squad;
  current_tour: SquadTourData;
}

// DEPRECATED: Legacy type for backward compatibility
// Use SquadWithTourData for new code
export interface UserSquad {
  id: number;
  name: string;
  user_id: number;
  username: string;
  league_id: number;
  fav_team_id: number;
  budget: number;
  replacements: number;
  points: number;
  penalty_points: number;
  next_tour_penalty_points: number;  // DEPRECATED - no longer used in backend
  captain_id: number | null;
  vice_captain_id: number | null;
  main_players: SquadPlayer[];
  bench_players: SquadPlayer[];
}

// Типы для лидерборда
export interface LeaderboardEntry {
  place: number;
  squad_id: number;
  squad_name: string;
  user_id: number;
  username: string;
  tour_points: number;
  total_points: number;
  penalty_points: number; // Штраф за текущий тур
  total_penalty_points: number; // Сумма штрафов за все туры
}

// Типы для обновления игроков в скваде
export interface UpdateSquadPlayersRequest {
  captain_id?: number | null;
  vice_captain_id?: number | null;
  main_player_ids?: number[];
  bench_player_ids?: number[];
}

export interface UpdateSquadPlayersResponse {
  id: number;
  captain_id: number | null;
  vice_captain_id: number | null;
  main_player_ids: number[];
  bench_player_ids: number[];
}

// Типы для замены игроков (трансферы)
export interface ReplacePlayersRequest {
  main_player_ids: number[];
  bench_player_ids: number[];
}

export interface ReplacePlayersResponse {
  id: number;
  main_player_ids: number[];
  bench_player_ids: number[];
}

// Типы для истории туров
export interface TourHistoryPlayer {
  id: number;
  name: string;
  position: string;
  team_id: number;
  team_name: string;
  team_logo: string | null;
  market_value: number;
  photo: string | null;
  total_points: number; // Общие очки игрока за все туры
  tour_points: number; // Очки игрока за этот конкретный тур
}

export interface TourHistorySnapshot {
  tour_id: number;
  tour_number: number;
  budget: number;
  replacements: number;
  points: number; // Очки команды за этот тур
  penalty_points: number; // Штрафные очки за этот тур
  used_boost: string | null;
  captain_id: number | null;
  vice_captain_id: number | null;
  main_players?: TourHistoryPlayer[];
  bench_players?: TourHistoryPlayer[];
  is_finalized: boolean;
}

// Методы для работы со сквадами
export const squadsApi = {
  create: (data: CreateSquadRequest) => apiRequest<CreateSquadResponse>('/api/squads/create', {
    method: 'POST',
    body: data,
  }),
  // NEW API: Returns Squad metadata only
  getMySquads: () => apiRequest<Squad[]>('/api/squads/my_squads'),
  // NEW API: Returns Squad metadata only
  getSquadById: (squadId: number) => apiRequest<Squad>(`/api/squads/get_squad_${squadId}`),
  // Публичная версия, без привязки к текущему пользователю (используется в BackendTest)
  getSquadByIdPublic: (squadId: number) => apiRequest<Squad>(`/api/squads/get_squad_by_id/${squadId}`),
  // NEW API: Get Squad with current tour data
  getSquadWithTourData: (squadId: number, tourId?: number) => {
    const path = tourId 
      ? `/api/squads/${squadId}/tours?tour_id=${tourId}`
      : `/api/squads/${squadId}/tours?current=true`;
    return apiRequest<SquadWithTourData>(path);
  },
  rename: (squadId: number, name: string) => {
    const query = new URLSearchParams({ new_name: name }).toString();
    return apiRequest<{ id: number; name: string }>(`/api/squads/${squadId}/rename?${query}`, {
      method: 'PATCH',
    });
  },
  getLeaderboard: (tourId: number) => apiRequest<LeaderboardEntry[]>(`/api/squads/leaderboard/${tourId}`),
  /** @deprecated Use replacePlayers instead - this endpoint returns HTTP 410 Gone */
  updatePlayers: (squadId: number, data: UpdateSquadPlayersRequest) => 
    apiRequest<UpdateSquadPlayersResponse>(`/api/squads/update_players/${squadId}`, {
      method: 'PUT',
      body: data,
    }),
  replacePlayers: (
    squadId: number, 
    data: ReplacePlayersRequest, 
    captainId?: number | null, 
    viceCaptainId?: number | null
  ) => {
    const queryParams = new URLSearchParams();
    if (captainId !== undefined && captainId !== null) {
      queryParams.append('captain_id', captainId.toString());
    }
    if (viceCaptainId !== undefined && viceCaptainId !== null) {
      queryParams.append('vice_captain_id', viceCaptainId.toString());
    }
    const queryString = queryParams.toString();
    // NEW: Use squad_tours endpoint
    const path = `/api/squad_tours/squad/${squadId}/replace_players${queryString ? `?${queryString}` : ''}`;
    return apiRequest<ReplacePlayersResponse>(path, {
      method: 'POST',
      body: data,
    });
  },
  // NEW API: Returns full tour history with budget/replacements
  getHistory: (squadId: number) => 
    apiRequest<TourHistorySnapshot[]>(`/api/squad_tours/squad/${squadId}`),
};

// Типы и методы для работы с пользователями
export interface UserProfile {
  id: number;
  username: string;
  tg_username?: string | null;
  photo_url?: string | null;
  birth_date?: string | null;
  registration_date?: string | null;
  referrer_id?: number | null;
}

export interface ProtectedUserResponse {
  message: string;
  user_id: number;
  authenticated: boolean;
  user?: UserProfile;
}

export interface UserReferrer {
  id: number;
  username: string;
}

export interface UserReferral {
  id: number;
  username: string;
  registration_date?: string | null;
}

export interface UserReferralsResponse {
  total: number;
  page: number;
  page_size: number;
  referrals: UserReferral[];
}

export const usersApi = {
  getProtected: () => apiRequest<ProtectedUserResponse>('/api/users/protected'),
  getById: (id: number) => apiRequest<UserProfile>(`/api/users/${id}`),
  update: (
    userId: number,
    data: Partial<Pick<UserProfile, 'username' | 'birth_date' | 'photo_url' | 'referrer_id'>>,
  ) =>
    apiRequest<{ status: string; user: UserProfile }>(`/api/users/update?user_id=${userId}`, {
      method: 'PUT',
      body: data,
    }),
  getReferrer: (userId: number) => 
    apiRequest<UserReferrer | null>(`/api/users/${userId}/referrer`),
  getReferrals: (userId: number, page: number = 1, pageSize: number = 10) =>
    apiRequest<UserReferralsResponse>(`/api/users/${userId}/referrals?page=${page}&page_size=${pageSize}`),
};

// Типы для статусов игроков
export type PlayerStatusType = 'red_card' | 'injured' | 'left_league';

export const STATUS_RED_CARD = 'red_card';
export const STATUS_INJURED = 'injured';
export const STATUS_LEFT_LEAGUE = 'left_league';

export interface PlayerStatus {
  id: number;
  player_id: number;
  status_type: PlayerStatusType;
  tour_start: number;
  tour_end: number | null; // null = indefinite
  description?: string | null;
  created_at: string;
}

export interface PlayerStatusCreate {
  status_type: PlayerStatusType;
  tour_start: number;
  tour_end?: number | null;
  description?: string | null;
}

export interface PlayerStatusUpdate {
  status_type?: PlayerStatusType;
  tour_start?: number;
  tour_end?: number | null;
  description?: string | null;
}

// Типы для игроков
export interface Player {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string; // "Defender", "Attacker", "Midfielder", "Goalkeeper"
  market_value: number;
  points: number; // total_points - общие очки за все туры с бэкенда
  current_status?: PlayerStatusType | null; // Active status for current tour
  statuses?: PlayerStatus[]; // Full status history
  // Deprecated fields (for backward compatibility)
  is_injured?: boolean;
  has_red_card?: boolean;
  has_left_league?: boolean;
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

// Методы для работы со статусами игроков
export const playerStatusesApi = {
  getById: (statusId: number) =>
    apiRequest<PlayerStatus>(`/api/player-statuses/${statusId}`),
  
  getPlayerStatuses: (playerId: number) =>
    apiRequest<PlayerStatus[]>(`/api/player-statuses/players/${playerId}/statuses`),
  
  getStatusForTour: (playerId: number, tourNumber: number) =>
    apiRequest<PlayerStatus[]>(`/api/player-statuses/players/${playerId}/statuses/tour/${tourNumber}`),
  
  createStatus: (playerId: number, data: PlayerStatusCreate) =>
    apiRequest<PlayerStatus>(`/api/player-statuses/players/${playerId}/statuses`, {
      method: 'POST',
      body: data,
    }),
  
  updateStatus: (statusId: number, data: PlayerStatusUpdate) =>
    apiRequest<PlayerStatus>(`/api/player-statuses/${statusId}`, {
      method: 'PUT',
      body: data,
    }),
  
  deleteStatus: (statusId: number) =>
    apiRequest<void>(`/api/player-statuses/${statusId}`, {
      method: 'DELETE',
    }),
};

// Типы для бустов
export type BoostType = 'bench_boost' | 'triple_captain' | 'transfers_plus' | 'gold_tour' | 'double_bet';

export interface BoostInfo {
  type: BoostType;
  available: boolean;
  used_in_tour_number?: number | null; // Номер тура, в котором использован буст
}

export interface AvailableBoostsResponse {
  used_for_next_tour: boolean;
  boosts: BoostInfo[];
}

// Типы для применения буста
export interface ApplyBoostRequest {
  squad_id: number;
  tour_id: number;
  type: BoostType;
}

export interface ApplyBoostResponse {
  success: boolean;
  message?: string;
}

// Методы для работы с бустами
export const boostsApi = {
  getAvailable: (squadId: number, tourId: number) =>
    apiRequest<AvailableBoostsResponse>(`/api/boosts/available/${squadId}/${tourId}`),
  apply: (data: ApplyBoostRequest) =>
    apiRequest<ApplyBoostResponse>('/api/boosts/apply', {
      method: 'POST',
      body: data,
    }),
  remove: (squadId: number, tourId: number) =>
    apiRequest<ApplyBoostResponse>(`/api/boosts/remove/${squadId}/${tourId}`, {
      method: 'DELETE',
    }),
};

// Типы для кастомных лиг
export interface CustomLeague {
  id: number;
  name: string;
  league_id: number;
  owner_id: number;
  is_commercial: boolean;
  invite_code?: string;
  created_at?: string;
}

// Типы для коммерческих лиг от API
export interface CommercialLeagueTour {
  id: number;
  number: number;
}

export interface CommercialLeagueSquad {
  squad_id: number;
  squad_name?: string;
}

export interface CommercialLeague {
  id: number;
  name: string;
  league_id: number;
  prize: string;
  logo: string; // base64 image
  winner_id: number | null;
  winner_name: string | null;
  registration_start: string;
  registration_end: string;
  tours: CommercialLeagueTour[];
  squads: CommercialLeagueSquad[];
}

export interface CreateCustomLeagueRequest {
  name: string;
  league_id: number;
  is_commercial?: boolean;
}

export interface CreateCustomLeagueResponse {
  id: number;
  name: string;
  league_id: number;
  owner_id: number;
  is_commercial: boolean;
  invite_code: string;
}

// Тип для клубной лиги
export interface ClubLeague {
  id: number;
  name: string;
  description: string | null;
  league_id: number;
  type: string;
  is_public: boolean;
  invitation_only: boolean;
  creator_id: number | null;
  team_id: number;
  registration_start: string;
  registration_end: string;
}

// Тип для лидерборда кастомной лиги
export interface CustomLeagueLeaderboardEntry {
  place: number;
  squad_id: number;
  squad_name: string;
  user_id: number;
  username: string;
  tour_points: number;
  total_points: number;
  penalty_points?: number; // Штраф за текущий тур
  total_penalty_points?: number; // Сумма штрафов за все туры
  fav_team_id?: number;
  fav_team_name?: string;
}

// Тип для пользовательских лиг (my-squad-leagues)
export interface MySquadLeague {
  user_league_id: number;
  user_league_name: string;
  total_players: number;
  squad_place: number;
  is_creator: boolean;
  squad_id: number;
  squad_name: string;
}

export interface CreateUserLeagueRequest {
  name: string;
  league_id: number;
}

export interface CreateUserLeagueResponse {
  id: number;
  name: string;
  league_id: number;
  creator_id: number;
  tours: unknown[];
  squads: unknown[];
}

export interface UserLeagueDetails {
  id: number;
  name: string;
  league_id: number;
  creator_id: number;
  tours: unknown[];
  squads: Array<{
    squad_id: number;
    squad_name: string;
    total_points: number;
    tour_points: number;
    penalty_points?: number;
    place: number;
  }>;
}

// Тип для лидерборда пользовательской лиги
export interface UserLeagueLeaderboardEntry {
  place: number;
  squad_id: number;
  squad_name: string;
  user_id: number;
  username: string;
  tour_points: number;
  total_points: number;
  penalty_points?: number; // Штраф за текущий тур
  total_penalty_points?: number; // Сумма штрафов за все туры
}

// Методы для работы с кастомными лигами
export const customLeaguesApi = {
  getMySquadLeagues: () =>
    apiRequest<MySquadLeague[]>('/api/user_leagues/list/my_squad_leagues'),
  getUserLeagueById: (id: number) =>
    apiRequest<UserLeagueDetails>(`/api/user_leagues/${id}`),
  getUserLeagueLeaderboard: (userLeagueId: number, tourId: number) =>
    apiRequest<UserLeagueLeaderboardEntry[]>(`/api/user_leagues/${userLeagueId}/leaderboard/${tourId}`),
  deleteUserLeague: (userLeagueId: number) =>
    apiRequest<{ success: boolean }>(`/api/user_leagues/${userLeagueId}/delete`, {
      method: 'DELETE',
    }),
  leaveUserLeague: (userLeagueId: number, squadId: number) =>
    apiRequest<{ success: boolean }>(`/api/user_leagues/${userLeagueId}/squads/${squadId}/leave`, {
      method: 'DELETE',
    }),
  joinUserLeague: (userLeagueId: number, squadId: number) =>
    apiRequest<{ success: boolean }>(`/api/user_leagues/${userLeagueId}/squads/${squadId}/join`, {
      method: 'POST',
    }),
  createUserLeague: (data: CreateUserLeagueRequest) =>
    apiRequest<CreateUserLeagueResponse>('/api/user_leagues/create', {
      method: 'POST',
      body: data,
    }),
  getByType: (leagueType: string) =>
    apiRequest<CustomLeague[]>(`/api/custom_leagues/by_type/${leagueType}`),
  getByLeague: (leagueId: number) =>
    apiRequest<CustomLeague[]>(`/api/custom_leagues/by_league/${leagueId}`),
  create: (data: CreateCustomLeagueRequest) =>
    apiRequest<CreateCustomLeagueResponse>('/api/custom_leagues/', {
      method: 'POST',
      body: data,
    }),
  delete: (customLeagueId: number) =>
    apiRequest<{ success: boolean }>(`/api/custom_leagues/${customLeagueId}`, {
      method: 'DELETE',
    }),
  getClubByTeam: (teamId: number) =>
    apiRequest<ClubLeague>(`/api/custom_leagues/club/by_team/${teamId}`),
  getLeaderboard: (customLeagueId: number, tourId: number) =>
    apiRequest<CustomLeagueLeaderboardEntry[]>(`/api/custom_leagues/${customLeagueId}/leaderboard/${tourId}`),
  getClubLeaderboard: (tourId: number, favTeamId: number) =>
    apiRequest<CustomLeagueLeaderboardEntry[]>(`/api/squads/leaderboard/${tourId}/by-fav-team/${favTeamId}`),
};

// Тип для лидерборда коммерческой лиги
export interface CommercialLeagueLeaderboardEntry {
  place: number;
  squad_id: number;
  squad_name: string;
  user_id: number;
  username: string;
  tour_points: number;
  total_points: number;
  penalty_points?: number; // Штраф за текущий тур
  total_penalty_points?: number; // Сумма штрафов за все туры
}

// Методы для работы с коммерческими лигами
export const commercialLeaguesApi = {
  getByLeague: (leagueId: number) =>
    apiRequest<CommercialLeague[]>(`/api/commercial_leagues/?league_id=${leagueId}`),
  getById: (commercialLeagueId: number) =>
    apiRequest<CommercialLeague>(`/api/commercial_leagues/${commercialLeagueId}`),
  join: (commercialLeagueId: number, squadId: number) =>
    apiRequest<{ success: boolean }>(`/api/commercial_leagues/join/${commercialLeagueId}/${squadId}`, {
      method: 'POST',
    }),
  getLeaderboard: (commercialLeagueId: number, tourId: number) =>
    apiRequest<CommercialLeagueLeaderboardEntry[]>(`/api/commercial_leagues/${commercialLeagueId}/leaderboard/${tourId}`),
};

// =============================================================================
// Squad Tours API — новая архитектура для получения данных сквада по туру
// =============================================================================

// Типы для Squad Tours API
export interface SquadTourPlayer {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string;
  market_value: number;
  photo: string;
  points: number;
  total_points: number;
  tour_points: number;
}

export interface SquadTourResponse {
  id: number;
  squad_id: number;
  tour_id: number;
  tour_number: number;
  budget: number;
  replacements: number;
  captain_id: number | null;
  vice_captain_id: number | null;
  main_players: SquadTourPlayer[];
  bench_players: SquadTourPlayer[];
  points: number;
  penalty_points: number;
  used_boost: string | null;
  is_finalized: boolean;
}

// Методы для работы со Squad Tours
export const squadToursApi = {
  // GET /api/squad_tours/squad/{squad_id}/tour/{tour_id} - получить данные сквада за конкретный тур
  getBySquadAndTour: (squadId: number, tourId: number) =>
    apiRequest<SquadTourResponse>(`/api/squad_tours/squad/${squadId}/tour/${tourId}`),
  
  // GET /api/squad_tours/squad/{squad_id} - получить все туры сквада
  getAllBySquad: (squadId: number) =>
    apiRequest<SquadTourResponse[]>(`/api/squad_tours/squad/${squadId}`),
  
  // GET /api/squad_tours/tour/{tour_id} - получить все сквады для тура
  getAllByTour: (tourId: number) =>
    apiRequest<SquadTourResponse[]>(`/api/squad_tours/tour/${tourId}`),
  
  // GET /api/squad_tours/all - получить все записи
  getAll: () =>
    apiRequest<SquadTourResponse[]>(`/api/squad_tours/all`),
};
