import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowSame from "@/assets/arrow-same.png";
import leagueCreationPlayers from "@/assets/league-creation-players.png";

const MAX_CREATED_LEAGUES = 5;
const MAX_JOINED_LEAGUES = 10;

interface CreatedLeague {
  id: string;
  name: string;
  participants: number;
  isOwner: boolean;
  createdAt: string;
}

const CreateLeague = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leagueIdFromUrl = searchParams.get("id");

  const [leagueName, setLeagueName] = useState("");
  const [viewingLeague, setViewingLeague] = useState<CreatedLeague | null>(null);
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [userLeaguesCount, setUserLeaguesCount] = useState(0);

  // Check if viewing a specific league or creating new
  useEffect(() => {
    const savedLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
    setUserLeaguesCount(savedLeagues.length);

    if (leagueIdFromUrl) {
      const league = savedLeagues.find((l: CreatedLeague) => l.id === leagueIdFromUrl);
      if (league) {
        setViewingLeague(league);
      }
    } else {
      setViewingLeague(null);
    }
  }, [leagueIdFromUrl]);

  // Generate invite link
  const getInviteLink = () => {
    if (!viewingLeague) return "";
    return `https://fantasy-sports/liga-rb/${viewingLeague.id}/invite`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    toast.success("Ссылка скопирована");
  };

  const isLimitReached = userLeaguesCount >= MAX_CREATED_LEAGUES;

  const handleCreateLeague = () => {
    if (isLimitReached) {
      toast.error("Ты не можешь создать более 5 лиг, где являешься владельцем");
      return;
    }

    if (leagueName.trim()) {
      const newLeague: CreatedLeague = {
        id: `league-${Date.now()}`,
        name: leagueName.trim(),
        participants: 1,
        isOwner: true,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existingLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
      localStorage.setItem("userCreatedLeagues", JSON.stringify([...existingLeagues, newLeague]));

      // Navigate to view the created league
      navigate(`/create-league?id=${newLeague.id}`);
    }
  };

  const handleDeleteLeague = () => {
    if (viewingLeague) {
      const existingLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
      const updatedLeagues = existingLeagues.filter((l: CreatedLeague) => l.id !== viewingLeague.id);
      localStorage.setItem("userCreatedLeagues", JSON.stringify(updatedLeagues));
      navigate("/league");
    }
  };

  const handleInviteFriend = () => {
    setShowInviteDrawer(true);
  };

  // Get team name from localStorage
  const teamName = localStorage.getItem("fantasyTeamName") || "Моя команда";

  // League standings - for a new league, only the user is there
  const getUserLeagueStandings = (): Array<{
    position: number;
    change: "up" | "down" | "same";
    name: string;
    tourPoints: number;
    totalPoints: number;
    isUser: boolean;
  }> => {
    if (!viewingLeague) return [];
    // For a newly created league, only the owner (user) is a participant
    return [
      { position: 1, change: "same", name: teamName, tourPoints: 55, totalPoints: 3123, isUser: true },
    ];
  };

  const leagueStandings = getUserLeagueStandings();

  // If viewing a specific league, show the league management view
  if (viewingLeague) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SportHeader />

        <main className="flex-1 px-4 pb-6">

          {/* League Title with Owner Badge */}
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-3xl font-display text-foreground">{viewingLeague.name}</h1>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground text-regular">
            <span className="col-span-2">Позиция</span>
            <span className="col-span-4">Команда</span>
            <span className="col-span-3 text-center">Очки / тур 29</span>
            <span className="col-span-3 text-right">Всего очков</span>
          </div>

          {/* League Standings */}
          <div className="space-y-2 mb-6">
            {leagueStandings.map((row, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-xl ${
                  row.isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50"
                }`}
              >
                <div className="col-span-2 flex items-center gap-1">
                  {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                  {row.change === "down" && <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />}
                  {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                  <span className={`font-medium ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.position}</span>
                </div>
                <span className={`col-span-4 text-sm truncate text-medium ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.name}</span>
                <span className={`col-span-3 text-center text-sm text-regular ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>{row.tourPoints}</span>
                <span className={`col-span-3 text-right text-sm font-medium text-medium ${row.isUser ? "text-primary-foreground" : "text-foreground"}`}>
                  {row.totalPoints.toLocaleString().replace(",", " ")}
                </span>
              </div>
            ))}
          </div>
        </main>

        {/* Fixed Bottom Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-2 space-y-3">
          <Button
            onClick={handleInviteFriend}
            className="w-full rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
          >
            Пригласить друзей
          </Button>
          <Button
            onClick={() => navigate("/league")}
            className="w-full rounded-lg h-12 font-medium bg-secondary hover:bg-secondary/80 text-foreground"
          >
            Закрыть
          </Button>
        </div>

        {/* Invite Friends Drawer */}
        <Drawer open={showInviteDrawer} onOpenChange={setShowInviteDrawer}>
          <DrawerContent className="bg-background border-t border-border">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-xl font-display text-foreground">Пригласить друзей</DrawerTitle>
            </DrawerHeader>

            <div className="px-6 pb-6 space-y-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm text-muted-foreground text-regular">QR</span>
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={getInviteLink()} size={180} level="M" />
                </div>
              </div>

              {/* Invite Link Section */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground text-regular">Ссылка приглашения</span>
                <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
                  <span className="flex-1 text-foreground text-sm truncate">{getInviteLink()}</span>
                  <button onClick={handleCopyLink} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowInviteDrawer(false)}
                className="w-full rounded-lg h-12 font-medium bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
              >
                Закрыть
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Initial creation form
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader />

      <main className="flex-1 px-4 pb-6">

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-6 px-4 font-display">
          Создай свою лигу
        </h1>

        {/* Players Image */}
        <div className="flex justify-center mb-8">
          <img src={leagueCreationPlayers} alt="League players" className="w-full max-w-md object-contain" />
        </div>

        {/* League Name Input */}
        <div className="space-y-3 mb-8">
          <input
            type="text"
            placeholder="Название лиги"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value.slice(0, 30))}
            maxLength={30}
            className="w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F]"
            style={{
              borderColor: leagueName ? "rgba(255, 255, 255, 0.2)" : "#363546",
              color: leagueName ? "#FFFFFF" : "#4B485F",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          />
        </div>

        {/* Create Button */}
        <Button
          onClick={handleCreateLeague}
          disabled={!leagueName.trim()}
          className={`w-full rounded-lg h-12 font-medium ${
            !leagueName.trim()
              ? "bg-primary/30 text-muted-foreground opacity-50 cursor-not-allowed"
              : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
          }`}
        >
          Создать лигу
        </Button>
      </main>
    </div>
  );
};

export default CreateLeague;
