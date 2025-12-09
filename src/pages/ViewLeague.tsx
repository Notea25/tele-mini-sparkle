import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SportHeader from "@/components/SportHeader";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import homeIcon from "@/assets/home-icon.png";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowSame from "@/assets/arrow-same.png";

const ViewLeague = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leagueId = searchParams.get("id") || "";
  const leagueName = searchParams.get("name") || "Лига";
  
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);

  const getInviteLink = () => {
    return `https://fantasy-sports/liga-rb/${leagueId}/invite`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    toast.success("Ссылка скопирована");
  };

  const handleLeaveLeague = () => {
    toast.success("Вы покинули лигу");
    navigate("/league");
  };

  const handleInviteFriend = () => {
    setShowInviteDrawer(true);
  };

  // Mock standings data
  const leagueStandings = [
    { position: 1, change: "up", name: "Dream team", tourPoints: 32, totalPoints: 3123 },
    { position: 2, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 3, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 4, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 5, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 6, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 7, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 8, change: "up", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 9, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
    { position: 10, change: "same", name: "Lucky Team", tourPoints: 32, totalPoints: 3123 },
  ];

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
          <span>{leagueName}</span>
        </div>

        {/* League Title */}
        <h1 className="text-3xl font-bold text-foreground mb-6">{leagueName}</h1>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-muted-foreground">
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
              className="grid grid-cols-12 gap-2 items-center px-4 py-3 bg-secondary/50 rounded-full"
            >
              <div className="col-span-2 flex items-center gap-1">
                {row.change === "up" && <img src={arrowDownGreen} alt="up" className="w-3 h-3 rotate-180" />}
                {row.change === "down" && <img src={arrowUpRed} alt="down" className="w-3 h-3 rotate-180" />}
                {row.change === "same" && <img src={arrowSame} alt="same" className="w-3 h-3" />}
                <span className="text-foreground font-medium">{row.position}</span>
                {row.position <= 3 && <span className="text-yellow-500">🏆</span>}
              </div>
              <span className="col-span-4 text-foreground text-sm truncate">{row.name}</span>
              <span className="col-span-3 text-center text-foreground text-sm">{row.tourPoints}</span>
              <span className="col-span-3 text-right text-foreground text-sm font-medium">
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
          className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground"
        >
          Пригласить друга
        </Button>
        <Button
          onClick={handleLeaveLeague}
          variant="outline"
          className="w-full rounded-full py-6 font-semibold border-border text-foreground"
        >
          Покинуть лигу
        </Button>
      </div>

      {/* Invite Friends Drawer */}
      <Drawer open={showInviteDrawer} onOpenChange={setShowInviteDrawer}>
        <DrawerContent className="bg-background border-t border-border">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-bold text-foreground">
              Пригласить друзей
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-6 pb-6 space-y-6">
            {/* QR Code Section */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm text-muted-foreground">QR</span>
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={getInviteLink()}
                  size={180}
                  level="M"
                />
              </div>
            </div>

            {/* Invite Link Section */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Ссылка приглашения</span>
              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
                <span className="flex-1 text-foreground text-sm truncate">
                  {getInviteLink()}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowInviteDrawer(false)}
              className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground"
            >
              Закрыть
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ViewLeague;
