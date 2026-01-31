/**
 * Adapter для обратной совместимости между новой и старой архитектурой Squad.
 * 
 * NEW ARCHITECTURE:
 * - Squad: только метаданные (id, name, user_id, etc.)
 * - SquadTourData: полное состояние для конкретного тура
 * - SquadWithTourData: комбинация Squad + current_tour
 * 
 * OLD ARCHITECTURE:
 * - UserSquad: плоская структура со всеми полями
 * 
 * USAGE:
 * Используйте adaptSquadData для преобразования новых типов в старый формат
 * во время миграции компонентов. После полной миграции этот файл можно удалить.
 */

import type { Squad, SquadTourData, SquadWithTourData, UserSquad } from './api';

/**
 * Преобразует новую архитектуру (SquadWithTourData) в старый формат (UserSquad)
 * для обратной совместимости с существующими компонентами.
 * 
 * @param squadWithTour - Данные в новом формате
 * @returns Данные в старом плоском формате
 */
export function adaptSquadData(squadWithTour: SquadWithTourData): UserSquad {
  const { squad, current_tour } = squadWithTour;
  
  return {
    // Metadata from Squad
    id: squad.id,
    name: squad.name,
    user_id: squad.user_id,
    username: squad.username,
    league_id: squad.league_id,
    fav_team_id: squad.fav_team_id,
    
    // State from SquadTourData
    budget: current_tour.budget,
    replacements: current_tour.replacements,
    points: current_tour.points,
    penalty_points: current_tour.penalty_points,
    captain_id: current_tour.captain_id,
    vice_captain_id: current_tour.vice_captain_id,
    main_players: current_tour.main_players,
    bench_players: current_tour.bench_players,
    
    // Deprecated field (no longer used in backend)
    next_tour_penalty_points: 0,
  };
}

/**
 * Преобразует только Squad метаданные в плоский формат.
 * Используется когда нет данных о текущем туре.
 * 
 * @param squad - Метаданные команды
 * @returns Частичный UserSquad с только метаданными
 */
export function adaptSquadMetadata(squad: Squad): Partial<UserSquad> {
  return {
    id: squad.id,
    name: squad.name,
    user_id: squad.user_id,
    username: squad.username,
    league_id: squad.league_id,
    fav_team_id: squad.fav_team_id,
  };
}

/**
 * Проверяет, является ли объект новым форматом (SquadWithTourData)
 * или старым форматом (UserSquad).
 * 
 * @param data - Данные для проверки
 * @returns true если новый формат, false если старый
 */
export function isSquadWithTourData(
  data: SquadWithTourData | UserSquad
): data is SquadWithTourData {
  return 'squad' in data && 'current_tour' in data;
}

/**
 * Универсальный helper для получения UserSquad из любого формата.
 * Автоматически определяет формат и делает адаптацию если нужно.
 * 
 * @param data - Данные в любом формате
 * @returns UserSquad
 */
export function ensureUserSquad(data: SquadWithTourData | UserSquad): UserSquad {
  if (isSquadWithTourData(data)) {
    return adaptSquadData(data);
  }
  return data;
}

/**
 * Helper для получения бюджета независимо от формата данных
 */
export function getSquadBudget(data: SquadWithTourData | UserSquad): number {
  if (isSquadWithTourData(data)) {
    return data.current_tour.budget;
  }
  return data.budget;
}

/**
 * Helper для получения количества замен независимо от формата данных
 */
export function getSquadReplacements(data: SquadWithTourData | UserSquad): number {
  if (isSquadWithTourData(data)) {
    return data.current_tour.replacements;
  }
  return data.replacements;
}

/**
 * Helper для получения очков независимо от формата данных
 */
export function getSquadPoints(data: SquadWithTourData | UserSquad): number {
  if (isSquadWithTourData(data)) {
    return data.current_tour.points;
  }
  return data.points;
}

/**
 * Helper для получения штрафных очков независимо от формата данных
 */
export function getSquadPenaltyPoints(data: SquadWithTourData | UserSquad): number {
  if (isSquadWithTourData(data)) {
    return data.current_tour.penalty_points;
  }
  return data.penalty_points;
}

/**
 * Helper для получения чистых очков (points - penalty_points)
 */
export function getSquadNetPoints(data: SquadWithTourData | UserSquad): number {
  return getSquadPoints(data) - getSquadPenaltyPoints(data);
}

/**
 * Helper для получения состава игроков независимо от формата данных
 */
export function getSquadPlayers(data: SquadWithTourData | UserSquad) {
  if (isSquadWithTourData(data)) {
    return {
      main: data.current_tour.main_players,
      bench: data.current_tour.bench_players,
      captain_id: data.current_tour.captain_id,
      vice_captain_id: data.current_tour.vice_captain_id,
    };
  }
  return {
    main: data.main_players,
    bench: data.bench_players,
    captain_id: data.captain_id,
    vice_captain_id: data.vice_captain_id,
  };
}
