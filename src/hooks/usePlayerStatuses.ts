import { useState, useEffect, useMemo } from 'react';
import { playerStatusesApi, toursApi, PlayerStatus, STATUS_INJURED, STATUS_RED_CARD, STATUS_LEFT_LEAGUE } from '@/lib/api';

interface PlayerStatusFlags {
  hasRedCard: boolean;
  isInjured: boolean;
  hasLeftLeague: boolean;
}

interface UsePlayerStatusesResult {
  playerStatusMap: Map<number, PlayerStatusFlags>;
  isLoading: boolean;
  targetTourNumber: number | null;
}

/**
 * Хук для загрузки статусов игроков (травма, красная карточка, покинул лигу) для указанного тура.
 * Если tourNumber не указан, загружает статусы для следующего активного тура (next_tour).
 */
export function usePlayerStatuses(
  leagueId: string | null,
  tourNumber?: number | null
): UsePlayerStatusesResult {
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetTourNumber, setTargetTourNumber] = useState<number | null>(tourNumber ?? null);

  useEffect(() => {
    if (!leagueId) {
      setIsLoading(false);
      return;
    }

    const loadStatuses = async () => {
      setIsLoading(true);
      try {
        let effectiveTourNumber = tourNumber;

        // Если номер тура не указан, получаем следующий тур
        if (!effectiveTourNumber) {
          const toursResponse = await toursApi.getPreviousCurrentNextTour(Number(leagueId));
          if (toursResponse.success && toursResponse.data) {
            // Приоритет: next_tour для TeamBuilder (показываем актуальные статусы для сборки)
            effectiveTourNumber = toursResponse.data.next_tour?.number 
              ?? toursResponse.data.current_tour?.number 
              ?? toursResponse.data.previous_tour?.number
              ?? null;
          }
        }

        setTargetTourNumber(effectiveTourNumber ?? null);

        if (effectiveTourNumber) {
          const statusesResponse = await playerStatusesApi.getByTourNumber(effectiveTourNumber);
          if (statusesResponse.success && statusesResponse.data) {
            setPlayerStatuses(statusesResponse.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch player statuses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatuses();
  }, [leagueId, tourNumber]);

  // Создаём карту статусов для быстрого поиска
  const playerStatusMap = useMemo(() => {
    const map = new Map<number, PlayerStatusFlags>();
    
    for (const status of playerStatuses) {
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
  }, [playerStatuses]);

  return { playerStatusMap, isLoading, targetTourNumber };
}
