import { useState, useEffect } from 'react';
import { teamsApi, Team } from '@/lib/api';

export function useTeams(leagueId: string | null) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) {
      setIsLoading(false);
      return;
    }

    const loadTeams = async () => {
      try {
        const response = await teamsApi.getByLeague(parseInt(leagueId));
        if (response.success && response.data) {
          setTeams(response.data);
        }
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, [leagueId]);

  return { teams, isLoading };
}
