import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import SportHeader from "@/components/SportHeader";
import homeIcon from "@/assets/home-icon.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";

const TournamentTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  // Full tournament table data
  const allTableData = [
    { position: 1, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 2, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 3, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 4, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 5, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 6, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 7, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 8, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 9, change: "down", name: "Моя команда", tourPoints: 32, totalPoints: 3123, isUser: true },
    { position: 10, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
  ];

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    
    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center text-muted-foreground disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    );

    // Page numbers
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full ${
              currentPage === i ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // First 3 pages
      for (let i = 1; i <= 3; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full ${
              currentPage === i ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {i}
          </button>
        );
      }
      
      // Ellipsis
      pages.push(
        <span key="ellipsis" className="w-8 h-8 flex items-center justify-center text-muted-foreground">
          ...
        </span>
      );
      
      // Last page
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-full ${
            currentPage === totalPages ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center text-muted-foreground disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    );

    return pages;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader />

      <main className="flex-1 px-4 pb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4 text-muted-foreground text-sm">
          <img 
            src={homeIcon} 
            alt="Home" 
            className="w-4 h-4 cursor-pointer hover:opacity-80" 
            onClick={() => navigate("/")}
          />
          <ChevronRight className="w-3 h-3" />
          <span>Футбол</span>
          <ChevronRight className="w-3 h-3" />
          <span>Беларусь</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">Турнирная таблица</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-6">Турнирная таблица</h1>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
          <span className="col-span-2">Позиция</span>
          <span className="col-span-4">Команда</span>
          <span className="col-span-3 text-center">Очки / тур<br/>29</span>
          <span className="col-span-3 text-center">Всего очков</span>
        </div>

        {/* Table rows */}
        <div className="space-y-2">
          {allTableData.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-full ${
                  row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                }`}
                style={{ width: 'calc(100% - 24px)' }}
              >
                <div className="col-span-2 flex items-center gap-1">
                  {row.change === "up" && <img src={arrowUpRed} alt="up" className="w-3 h-3" />}
                  {row.change === "down" && !row.isUser && <img src={arrowDownGreen} alt="down" className="w-3 h-3" />}
                  {row.change === "down" && row.isUser && <img src={arrowDownBlack} alt="down" className="w-3 h-3" />}
                  {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                  <span className={`font-medium ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.position}</span>
                  {row.position === 1 && <img src={trophyGold} alt="1st" className="w-4 h-4" />}
                  {row.position === 2 && <img src={trophySilver} alt="2nd" className="w-4 h-4" />}
                  {row.position === 3 && <img src={trophyBronze} alt="3rd" className="w-4 h-4" />}
                </div>
                <span className={`col-span-4 font-medium truncate ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.name}</span>
                <span className={`col-span-3 text-center ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.tourPoints}</span>
                <span className={`col-span-3 text-center font-bold ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.totalPoints.toLocaleString().replace(",", " ")}</span>
              </div>
              {row.isUser ? (
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                  Ты
                </span>
              ) : (
                <span className="w-8" />
              )}
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
