import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { squadsApi, toursApi, customLeaguesApi, commercialLeaguesApi } from "@/lib/api";

const SELECTED_LEAGUE_ID_KEY = "fantasySelectedLeagueId";

/**
 * Hook to prefetch league-related data for faster navigation
 * Call this on pages that users visit before /league or /tournament-table
 */
export const usePrefetchLeagueData = () => {
  const queryClient = useQueryClient();

  const prefetchLeagueData = useCallback(async () => {
    const leagueId = parseInt(localStorage.getItem(SELECTED_LEAGUE_ID_KEY) || "116", 10);

    // Prefetch all data in parallel
    const prefetchPromises = [
      // User squads
      queryClient.prefetchQuery({
        queryKey: ["mySquads"],
        queryFn: () => squadsApi.getMySquads(),
      }),

      // Tours info
      queryClient.prefetchQuery({
        queryKey: ["tours", leagueId],
        queryFn: () => toursApi.getPreviousCurrentNextTour(leagueId),
      }),

      // Commercial leagues
      queryClient.prefetchQuery({
        queryKey: ["commercialLeagues", leagueId],
        queryFn: () => commercialLeaguesApi.getByLeague(leagueId),
      }),

      // User's leagues
      queryClient.prefetchQuery({
        queryKey: ["mySquadLeagues"],
        queryFn: () => customLeaguesApi.getMySquadLeagues(),
      }),
    ];

    await Promise.all(prefetchPromises);

    // After tours are loaded, prefetch leaderboard
    const toursData = queryClient.getQueryData<any>(["tours", leagueId]);
    if (toursData?.data) {
      const currentTourDeadline = toursData.data.current_tour?.deadline
        ? new Date(toursData.data.current_tour.deadline)
        : null;
      const useCurrentTour = currentTourDeadline && currentTourDeadline <= new Date();

      const tourId = useCurrentTour
        ? toursData.data.current_tour?.id
        : toursData.data.previous_tour?.id;

      if (tourId) {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["leaderboard", tourId],
            queryFn: () => squadsApi.getLeaderboard(tourId),
          }),
          queryClient.prefetchQuery({
            queryKey: ["tournament-leaderboard", tourId],
            queryFn: async () => {
              const result = await squadsApi.getLeaderboard(tourId);
              return result.success && Array.isArray(result.data) ? result.data : [];
            },
          }),
        ]);
      }
    }
  }, [queryClient]);

  return { prefetchLeagueData };
};
