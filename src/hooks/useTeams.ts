import { useState, useEffect } from 'react';
import { teamsApi, Team } from '@/lib/api';

interface TeamsCache {
  leagueId: string;
  teams: Team[];
  cachedAt: number;
}

const CACHE_KEY = 'fantasyTeamsCache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export function useTeams(leagueId: string | null) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) {
      setIsLoading(false);
      return;
    }

    const loadTeams = async () => {
      // Check cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const cacheData: TeamsCache = JSON.parse(cached);
          const now = Date.now();
          
          // Use cache if it's for the same league and not expired
          if (
            cacheData.leagueId === leagueId &&
            cacheData.teams &&
            now - cacheData.cachedAt < CACHE_DURATION
          ) {
            setTeams(cacheData.teams);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to parse teams cache:', e);
      }

      // Fetch from API
      try {
        const response = await teamsApi.getByLeague(parseInt(leagueId));
        if (response.success && response.data) {
          setTeams(response.data);
          
          // Save to cache
          const cacheData: TeamsCache = {
            leagueId,
            teams: response.data,
            cachedAt: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
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
