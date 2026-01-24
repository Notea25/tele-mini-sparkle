import { useState, useEffect } from 'react';
import { toursApi } from '@/lib/api';

const CACHE_KEY = 'fantasyDeadlineCache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface DeadlineCache {
  deadline: string;
  leagueId: string;
  cachedAt: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

export function useDeadline(leagueId: string = '116') {
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { deadline, leagueId: cachedLeagueId, cachedAt } = JSON.parse(cached) as DeadlineCache;
        const cacheAge = Date.now() - cachedAt;
        // Cache valid for 1 hour and same league
        if (cacheAge < CACHE_DURATION && cachedLeagueId === leagueId) {
          return new Date(deadline);
        }
      } catch {
        // Invalid cache, ignore
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(!deadlineDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

  // Fetch deadline from API (only if not cached)
  useEffect(() => {
    if (deadlineDate) {
      setIsLoading(false);
      return;
    }
    
    const fetchDeadline = async () => {
      try {
        const response = await toursApi.getDeadlineForNextTour(Number(leagueId));
        if (response.success && response.data?.deadline) {
          const deadline = new Date(response.data.deadline);
          setDeadlineDate(deadline);
          // Cache the deadline
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            deadline: response.data.deadline,
            leagueId,
            cachedAt: Date.now(),
          }));
        }
      } catch (error) {
        console.error('Error fetching deadline:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeadline();
  }, [deadlineDate, leagueId]);

  // Calculate time left
  useEffect(() => {
    if (!deadlineDate) return;

    const tournamentStartDate = new Date(deadlineDate.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days before deadline

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = deadlineDate.getTime() - now.getTime();
      const totalDuration = deadlineDate.getTime() - tournamentStartDate.getTime();
      const elapsed = now.getTime() - tournamentStartDate.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        setTimeLeft({ days, hours, minutes, seconds, progress });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 100 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadlineDate]);

  const formattedDeadline = deadlineDate
    ? `${deadlineDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })} в ${deadlineDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
    : null;

  return {
    deadlineDate,
    isLoading,
    timeLeft,
    formattedDeadline,
  };
}
