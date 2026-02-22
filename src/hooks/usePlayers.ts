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
  name_rus: string;
  team: string;        // team_name из API
  team_rus: string;    // team_name_rus из API
  team_id: number;
  team_logo: string;   // URL логотипа из API
  field_player_jersey?: string; // URL майки полевого игрока
  goalkeeper_jersey?: string;   // URL майки вратаря
  position: string;    // Преобразовано в ВР/ЗЩ/ПЗ/НП
  points: number;
  price: number;       // market_value as-is from backend
  hasRedCard?: boolean;
  isInjured?: boolean;
  hasLeftLeague?: boolean;
}

export function usePlayers(leagueId: string | null) {
  const [players, setPlayers] = useState<TransformedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) {
      setIsLoading(false);
      return;
    }

    const loadPlayers = async () => {
      setIsLoading(true);
      try {
        const response = await playersApi.getByLeague(Number(leagueId));
        if (response.success && response.data) {
          const transformedPlayers: TransformedPlayer[] = response.data.map((player: Player) => ({
            id: player.id,
            name: player.name,
            name_rus: player.name_rus,
            team: player.team_name,
            team_rus: player.team_name_rus || player.team_name,
            team_id: player.team_id,
            team_logo: player.team_logo,
            field_player_jersey: player.field_player_jersey,
            goalkeeper_jersey: player.goalkeeper_jersey,
            position: POSITION_MAP[player.position] || player.position,
            points: player.points,
            price: player.market_value,
            hasRedCard: player.has_red_card,
            isInjured: player.is_injured,
            hasLeftLeague: player.has_left_league,
          }));
          // Debug: log first player's price
          if (transformedPlayers.length > 0) {
            console.log('[usePlayers] Sample player price from API:', {
              name: transformedPlayers[0].name_rus,
              market_value: response.data[0].market_value,
              price: transformedPlayers[0].price
            });
          }
          setPlayers(transformedPlayers);
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
