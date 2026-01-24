import { useState, useEffect } from 'react';
import { playersApi, Player } from '@/lib/api';

// Маппинг позиций из английских в русские
const POSITION_MAP: Record<string, string> = {
  'Goalkeeper': 'ВР',
  'Defender': 'ЗЩ',
  'Midfielder': 'ПЗ',
  'Attacker': 'НП',
};

// Преобразованный тип игрока для использования в приложении
export interface TransformedPlayer {
  id: number;
  name: string;
  team: string;        // team_name из API
  team_id: number;
  team_logo: string;   // URL логотипа из API
  position: string;    // Преобразовано в ВР/ЗЩ/ПЗ/НП
  points: number;
  price: number;       // market_value / 1000
}

interface PlayersCache {
  leagueId: string;
  players: TransformedPlayer[];
  cachedAt: number;
}

const CACHE_KEY = 'fantasyPlayersCache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function usePlayers(leagueId: string | null) {
  const [players, setPlayers] = useState<TransformedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) {
      setIsLoading(false);
      return;
    }

    const loadPlayers = async () => {
      // Проверяем кэш
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: PlayersCache = JSON.parse(cached);
          const now = Date.now();
          if (
            parsedCache.leagueId === leagueId &&
            now - parsedCache.cachedAt < CACHE_DURATION &&
            parsedCache.players.length > 0
          ) {
            setPlayers(parsedCache.players);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading players cache:', e);
      }

      // Загружаем с сервера
      setIsLoading(true);
      try {
        const response = await playersApi.getByLeague(Number(leagueId));
        if (response.success && response.data) {
          const transformedPlayers: TransformedPlayer[] = response.data.map((player: Player) => ({
            id: player.id,
            name: player.name,
            team: player.team_name,
            team_id: player.team_id,
            team_logo: player.team_logo,
            position: POSITION_MAP[player.position] || player.position,
            points: player.points,
            price: Math.round((player.market_value / 1000) * 10) / 10, // 8224 → 8.2
          }));

          setPlayers(transformedPlayers);

          // Сохраняем в кэш
          const cacheData: PlayersCache = {
            leagueId,
            players: transformedPlayers,
            cachedAt: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }
      } catch (e) {
        console.error('Error loading players:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, [leagueId]);

  return { players, isLoading };
}
