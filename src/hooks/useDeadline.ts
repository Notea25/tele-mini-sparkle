import { useState, useEffect } from 'react';
import { toursApi } from '@/lib/api';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

export function useDeadline(leagueId: string = '116') {
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0 });

  // Fetch deadline from API (always fetch fresh data, no caching)
  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const response = await toursApi.getDeadlineForNextTour(Number(leagueId));
        if (response.success && response.data?.deadline) {
          const deadline = new Date(response.data.deadline);
          setDeadlineDate(deadline);
        }
      } catch (error) {
        console.error('Error fetching deadline:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeadline();
  }, [leagueId]);

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

  // Format deadline to match Index.tsx format: "DD.MM в HH.MM"
  const formattedDeadline = deadlineDate
    ? (() => {
        const day = String(deadlineDate.getDate()).padStart(2, '0');
        const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
        const hours = String(deadlineDate.getHours()).padStart(2, '0');
        const minutes = String(deadlineDate.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${deadlineDate.getFullYear()} в ${hours}:${minutes}`;
      })()
    : null;

  return {
    deadlineDate,
    isLoading,
    timeLeft,
    formattedDeadline,
  };
}
