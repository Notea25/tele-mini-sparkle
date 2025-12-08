import { useState, useMemo } from "react";
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

// Random team names
const teamNames = [
  "FC Phoenix", "Red Bulls", "Golden Eagles", "Thunder FC", "Storm United",
  "Blue Lions", "Silver Hawks", "Dark Knights", "Fire Dragons", "Ice Warriors",
  "Royal Tigers", "Electric City", "Shadow Wolves", "Crimson Kings", "Emerald Stars",
  "Diamond FC", "Platinum United", "Bronze Legends", "Copper Chiefs", "Steel Titans",
  "Galaxy FC", "Cosmic Stars", "Meteor United", "Comet FC", "Asteroid FC",
  "Ocean Waves", "River Flow", "Lake City", "Mountain FC", "Valley United",
  "Forest Rangers", "Desert Hawks", "Tundra Bears", "Jungle Cats", "Savanna Lions",
  "Arctic Foxes", "Tropical Storm", "Volcano FC", "Canyon City", "Prairie Dogs",
  "Night Owls", "Dawn Breakers", "Sunset FC", "Twilight United", "Midnight FC",
  "Victory FC", "Champion Stars", "Glory United", "Honor FC", "Pride City",
  "Spirit FC", "Soul United", "Heart FC", "Mind Warriors", "Power FC",
  "Speed Demons", "Flash FC", "Lightning FC", "Bolt United", "Spark City",
  "Alpha FC", "Beta United", "Gamma FC", "Delta City", "Omega FC",
  "Zenith Stars", "Apex United", "Summit FC", "Peak City", "Pinnacle FC",
  "Nova FC", "Quantum United", "Fusion FC", "Energy City", "Dynamo FC",
  "Rocket FC", "Jet United", "Turbo FC", "Nitro City", "Boost FC",
  "Legend FC", "Myth United", "Epic FC", "Hero City", "Champion FC",
  "Elite Stars", "Premier United", "Supreme FC", "Ultimate City", "Max FC",
  "Prime FC", "Core United", "Base FC", "Root City", "Origin FC",
  "Future FC", "Next United", "Forward FC", "Ahead City", "Beyond FC"
];

const TournamentTable = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Generate 100 random teams
  const allTeams = useMemo(() => {
    const teams = [];
    const changes = ["up", "down", "same"];
    
    for (let i = 1; i <= 100; i++) {
      const isUser = i === 17;
      teams.push({
        id: i,
        position: i,
        change: changes[Math.floor(Math.random() * 3)],
        name: isUser ? "Моя команда" : teamNames[(i - 1) % teamNames.length],
        tourPoints: Math.floor(Math.random() * 40) + 15,
        totalPoints: Math.floor(Math.random() * 2000) + 1500,
        isUser
      });
    }
    
    // Sort by total points descending
    teams.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Update positions after sorting
    teams.forEach((team, idx) => {
      team.position = idx + 1;
    });
    
    // Find and move user to position 17
    const userTeamIndex = teams.findIndex(t => t.isUser);
    if (userTeamIndex !== -1) {
      const userTeam = teams.splice(userTeamIndex, 1)[0];
      teams.splice(16, 0, userTeam);
      // Recalculate positions
      teams.forEach((team, idx) => {
        team.position = idx + 1;
      });
    }
    
    return teams;
  }, []);

  const totalPages = Math.ceil(allTeams.length / itemsPerPage);
  
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
      navigate("/your-team");
    } else {
      navigate(`/view-team/${team.id}`);
    }
  };

  const renderPagination = () => {
    const pages = [];
    
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
      
      pages.push(
        <span key="ellipsis" className="w-8 h-8 flex items-center justify-center text-muted-foreground">
          ...
        </span>
      );
      
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
      <SportHeader backTo="/league" />

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
          {currentPageData.map((row) => (
            <div 
              key={row.id} 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleTeamClick(row)}
            >
              <div
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-full transition-opacity hover:opacity-80 ${
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
