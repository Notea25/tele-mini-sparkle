import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SportHeader from "@/components/SportHeader";
import { squadsApi, toursApi, LeaderboardEntry } from "@/lib/api";

import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";

const TournamentTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = sessionStorage.getItem("tournamentTableCurrentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const itemsPerPage = 10;

  // Get league_id from localStorage
  const leagueId = parseInt(localStorage.getItem("selectedLeagueId") || "116", 10);

  // Fetch tours to get current tour id
  const { data: toursData, isLoading: toursLoading } = useQuery({
    queryKey: ['tours', leagueId],
    queryFn: async () => {
      const result = await toursApi.getPreviousCurrentNextTour(leagueId);
      return result.success ? result.data : null;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    placeholderData: (prev) => prev,
  });

  // Fetch my squads to determine which team is the user's
  const { data: mySquadsData, isLoading: squadsLoading } = useQuery({
    queryKey: ['mySquads'],
    queryFn: async () => {
      const result = await squadsApi.getMySquads();
      return result.success ? result.data : null;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    placeholderData: (prev) => prev,
  });

  // Если есть текущий тур — показываем его.
  // Если текущего тура нет (сезон ещё не начался или уже закончился) — используем предыдущий.
  const targetTourId = toursData?.current_tour?.id ?? toursData?.previous_tour?.id;
  const currentTourNumber = toursData?.current_tour?.number ?? toursData?.previous_tour?.number;
  const mySquadId = mySquadsData?.[0]?.id;

  // Fetch leaderboard data
  // ВНИМАНИЕ: используем отдельный queryKey, чтобы не конфликтовать с кэшем
  // на странице /league и в хуке useSquadData, где под ключом ['leaderboard', tourId]
  // хранится объект ApiResponse, а здесь — уже распакованный массив.
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['tournament-leaderboard', targetTourId],
    queryFn: async () => {
      if (!targetTourId) return [];
      const result = await squadsApi.getLeaderboard(targetTourId);
      // API returns array directly in result.data
      return result.success && Array.isArray(result.data) ? result.data : [];
    },
    enabled: !!targetTourId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    placeholderData: (prev) => prev, // Keep previous data while loading new
  });

  const allTeams = useMemo(() => {
    if (!leaderboardData || !Array.isArray(leaderboardData)) return [];
    return leaderboardData.map((entry: LeaderboardEntry) => ({
      id: entry.squad_id,
      position: entry.place,
      name: entry.squad_name,
      // Backend already returns net tour points (tour_earned - tour_penalty)
      tourPoints: entry.tour_points,
      totalPoints: entry.total_points,
      totalPenaltyPoints: entry.total_penalty_points || 0,
      isUser: entry.squad_id === mySquadId,
      change: "same" as "up" | "down" | "same", // API doesn't provide change info yet
    }));
  }, [leaderboardData, mySquadId]);

  const totalPages = Math.max(1, Math.ceil(allTeams.length / itemsPerPage));
  
  // Restore scroll position when returning to this page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("tournamentTableScrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  // Save scroll position and current page before navigating away
  const handleNavigate = (path: string) => {
    sessionStorage.setItem("tournamentTableScrollPosition", window.scrollY.toString());
    sessionStorage.setItem("tournamentTableCurrentPage", currentPage.toString());
    navigate(path);
  };

  // Get current page data
  const currentPageData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allTeams.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, allTeams]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleTeamClick = (team: typeof allTeams[0]) => {
    if (team.isUser && mySquadId) {
      handleNavigate(`/view-team?id=${mySquadId}`);
    } else {
      handleNavigate(`/view-team?id=${team.id}&name=${encodeURIComponent(team.name)}`);
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          className="px-3 py-1 rounded-xl bg-secondary/50 text-foreground text-sm disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ←
        </button>
        <span className="text-foreground text-sm">
          {currentPage} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded-xl bg-secondary/50 text-foreground text-sm disabled:opacity-40"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader />

      <main className="flex-1 px-4 pb-6">

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-6">Турнирная таблица</h1>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
          <span className="col-span-3 text-xs">Место</span>
          <span className="col-span-4 text-xs">Название</span>
          <span className="col-span-3 text-center">
            <span className="text-xs block whitespace-nowrap">{currentTourNumber ? `${currentTourNumber}-й тур` : 'Тур'}</span>
            <span className="text-[10px] italic block">(очки)</span>
          </span>
          <span className="col-span-2 text-right">
            <span className="text-xs block">Всего</span>
            <span className="text-[10px] italic block">(очков)</span>
          </span>
        </div>

        {/* Loading state - show skeleton only when no data yet */}
        {isLoading && allTeams.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-xl bg-secondary/50 animate-pulse">
                <div className="col-span-3 flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted rounded-full" />
                  <div className="w-4 h-4 bg-muted rounded" />
                </div>
                <div className="col-span-4">
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
                <div className="col-span-3 flex justify-center">
                  <div className="h-4 bg-muted rounded w-8" />
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className="h-4 bg-muted rounded w-10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && allTeams.length === 0 && (
          <div className="text-center text-muted-foreground py-8">Нет данных</div>
        )}

        {/* Table rows */}
        <div className="space-y-2">
          {currentPageData.map((row) => (
            <div
              key={row.id}
              className={`grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-xl cursor-pointer transition-colors hover:bg-secondary/70 ${
                row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
              }`}
              onClick={() => handleTeamClick(row)}
            >
              <div className="col-span-3 flex items-center gap-1">
                {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                {row.change === "down" && !row.isUser && <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />}
                {row.change === "down" && row.isUser && <img src={arrowDownBlack} alt="down" className="w-3 h-3" />}
                {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                <span className={`text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.position}</span>
                {row.position === 1 && <img src={trophyGold} alt="1st" className="w-4 h-4" />}
                {row.position === 2 && <img src={trophySilver} alt="2nd" className="w-4 h-4" />}
                {row.position === 3 && <img src={trophyBronze} alt="3rd" className="w-4 h-4" />}
              </div>
              <span className={`col-span-4 text-sm truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.name}</span>
              <span className={`col-span-3 text-center text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.tourPoints}</span>
              <span className={`col-span-2 text-right font-bold text-sm ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>
                {(row.totalPoints - (row.totalPenaltyPoints || 0)).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {allTeams.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            {renderPagination()}
          </div>
        )}

        {/* Home Button */}
        {/* <div className="mt-8">
          <button
            onClick={() => navigate("/")}
            className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
          >
            На главную
          </button>
        </div> */}
      </main>
    </div>
  );
};

export default TournamentTable;
