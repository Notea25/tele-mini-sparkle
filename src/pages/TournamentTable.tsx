import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SportHeader from "@/components/SportHeader";

import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";
import { tournamentTeams } from "@/lib/tournamentData";

const TournamentTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const allTeams = tournamentTeams;

  const totalPages = Math.ceil(allTeams.length / itemsPerPage);
  
  // Restore scroll position when returning to this page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("tournamentTableScrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  // Save scroll position before navigating away
  const handleNavigate = (path: string) => {
    sessionStorage.setItem("tournamentTableScrollPosition", window.scrollY.toString());
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
    if (team.isUser) {
      handleNavigate("/your-team");
    } else {
      handleNavigate(`/view-team?id=${team.id}&name=${encodeURIComponent(team.name)}`);
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          className="px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ←
        </button>
        <span className="text-foreground text-sm">
          {currentPage} / {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm disabled:opacity-40"
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
      <SportHeader backTo="/league" />

      <main className="flex-1 px-4 pb-6">

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-6">Турнирная таблица</h1>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
          <span className="col-span-3 text-xs">Место</span>
          <span className="col-span-4 text-xs">Название</span>
          <span className="col-span-3 text-center">
            <span className="text-xs block whitespace-nowrap">29-й тур</span>
            <span className="text-[10px] italic block">(очки)</span>
          </span>
          <span className="col-span-2 text-right">
            <span className="text-xs block">Всего</span>
            <span className="text-[10px] italic block">(очков)</span>
          </span>
        </div>

        {/* Table rows */}
        <div className="space-y-2">
          {currentPageData.map((row) => (
            <div
              key={row.id}
              className={`grid grid-cols-12 gap-1 items-center px-3 py-3 rounded-full cursor-pointer transition-colors hover:bg-secondary/70 ${
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
                {row.totalPoints.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1 mt-8">
          {renderPagination()}
        </div>
      </main>
    </div>
  );
};

export default TournamentTable;
