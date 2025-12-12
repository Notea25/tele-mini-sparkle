import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, Copy, User } from "lucide-react";
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
import prize3rdPlace from "@/assets/prize-3rd-place.png";
import prize2ndPlace from "@/assets/prize-2nd-place.png";
import prize1stPlace from "@/assets/prize-1st-place.png";

const ViewLeague = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leagueId = searchParams.get("id") || "";
  const leagueName = searchParams.get("name") || "Лига";
  const isOwner = searchParams.get("owner") === "true";
  const isCommercial = searchParams.get("commercial") === "true";
  const prizeDescription = searchParams.get("prize") || "Спорт инвентарь";
  
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);

  // Get user ID for invite link
  const profileData = localStorage.getItem("fantasyUserProfile");
  const userName = profileData ? JSON.parse(profileData).userName || "user" : "user";

  const getInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?leagueInvite=${leagueId}&leagueName=${encodeURIComponent(leagueName)}&inviter=${encodeURIComponent(userName)}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    toast.success("Ссылка скопирована");
  };

  const handleLeaveLeague = () => {
    toast.success("Вы покинули лигу");
    navigate("/league");
  };

  const handleDeleteLeague = () => {
    // Remove from localStorage if it's a user-created league
    const existingLeagues = JSON.parse(localStorage.getItem("userCreatedLeagues") || "[]");
    const updatedLeagues = existingLeagues.filter((l: { id: string }) => l.id !== leagueId);
    localStorage.setItem("userCreatedLeagues", JSON.stringify(updatedLeagues));
    toast.success("Лига удалена");
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

        {/* League Title with Owner Badge */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">{leagueName}</h1>
          {isOwner && (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>

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

        {/* Prizes Section - Only for commercial leagues */}
        {isCommercial && (
          <div className="mb-6">
            <h2 
              className="text-2xl font-bold text-foreground mb-3"
              style={{ fontFamily: "Unbounded, sans-serif" }}
            >
              Получай призы
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Пользователи, набравшие наибольшее количество очков, получат призы от{" "}
              <span className="text-primary">Fantasy.sports.by</span>
            </p>

            {/* Prize Cards */}
            <div className="space-y-4">
              {/* 3rd Place */}
              <div className="relative bg-secondary/30 rounded-2xl overflow-hidden">
                <img 
                  src={prize3rdPlace} 
                  alt="3 место" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                  <div className="flex items-end justify-between">
                    <span className="text-foreground font-semibold text-lg">{prizeDescription}</span>
                    <span className="text-primary font-bold text-xl">3 место</span>
                  </div>
                </div>
              </div>

              {/* 2nd Place */}
              <div className="relative bg-secondary/30 rounded-2xl overflow-hidden">
                <img 
                  src={prize2ndPlace} 
                  alt="2 место" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                  <div className="flex items-end justify-between">
                    <span className="text-foreground font-semibold text-lg">{prizeDescription}</span>
                    <span className="text-primary font-bold text-xl">2 место</span>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="relative bg-secondary/30 rounded-2xl overflow-hidden">
                <img 
                  src={prize1stPlace} 
                  alt="1 место" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                  <div className="flex items-end justify-between">
                    <span className="text-foreground font-semibold text-lg">{prizeDescription}</span>
                    <span className="text-primary font-bold text-xl">1 место</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-2 space-y-3">
        <Button
          onClick={handleInviteFriend}
          className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground"
        >
          Пригласить друга
        </Button>
        {isOwner ? (
          <Button
            onClick={handleDeleteLeague}
            variant="outline"
            className="w-full rounded-full py-6 font-semibold border-border text-foreground"
          >
            ✕ Удалить лигу
          </Button>
        ) : (
          <Button
            onClick={handleLeaveLeague}
            variant="outline"
            className="w-full rounded-full py-6 font-semibold border-border text-foreground"
          >
            Покинуть лигу
          </Button>
        )}
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
