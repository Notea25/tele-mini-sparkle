import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Copy, User, ArrowRight } from "lucide-react";
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
import Breadcrumbs from "@/components/Breadcrumbs";
import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import prize1stPlace from "@/assets/prize-1st-place.png";
import prize2ndPlace from "@/assets/prize-2nd-place.png";
import prize3rdPlace from "@/assets/prize-3rd-place.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";

const ViewLeague = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leagueId = searchParams.get("id") || "";
  const leagueName = searchParams.get("name") || "Лига";
  const isOwner = searchParams.get("owner") === "true";
  const isCommercial = searchParams.get("commercial") === "true";
  const deadline = searchParams.get("deadline") || "";
  const startTour = parseInt(searchParams.get("startTour") || "1");
  const isRegistrationOpen = searchParams.get("registrationOpen") === "true";
  const isBeforeRegistration = searchParams.get("beforeRegistration") === "true";
  
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [showLeaveConfirmDrawer, setShowLeaveConfirmDrawer] = useState(false);

  // Restore scroll position when returning to this page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("viewLeagueScrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  // Save scroll position before navigating away
  const handleNavigate = (path: string) => {
    sessionStorage.setItem("viewLeagueScrollPosition", window.scrollY.toString());
    navigate(path);
  };

  // Get user ID for invite link
  const profileData = localStorage.getItem("fantasyUserProfile");
  const userName = profileData ? JSON.parse(profileData).userName || "user" : "user";

  // Check if user participates in this commercial league
  const userCommercialLeagues = JSON.parse(localStorage.getItem("userCommercialLeagues") || "[]");
  const isParticipating = userCommercialLeagues.includes(leagueId);

  const getInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?leagueInvite=${leagueId}&leagueName=${encodeURIComponent(leagueName)}&inviter=${encodeURIComponent(userName)}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    toast.success("Ссылка скопирована");
  };

  const handleLeaveLeague = () => {
    setShowLeaveConfirmDrawer(true);
  };

  const confirmLeaveLeague = () => {
    setShowLeaveConfirmDrawer(false);
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

  const handleParticipate = () => {
    const updatedLeagues = [...userCommercialLeagues, leagueId];
    localStorage.setItem("userCommercialLeagues", JSON.stringify(updatedLeagues));
    toast.success("Вы присоединились к лиге");
    navigate("/league");
  };

  const handleClose = () => {
    navigate("/league");
  };

  // Prize data for commercial leagues
  const commercialPrizes: Record<string, { prize: string; description: string; image: string }> = {
    "betera": { prize: "100 Freebet", description: "Получите 100 фрибетов на ставки в Betera для лучших игроков турнира!", image: prize1stPlace },
    "bnb": { prize: "1000 BYN", description: "Денежный приз 1000 белорусских рублей для победителя лиги!", image: prize2ndPlace },
    "atlant-m": { prize: "iPhone 17", description: "Новейший iPhone 17 Pro Max для чемпиона лиги Atlant-M!", image: prize3rdPlace },
    "abff": { prize: "VIP-ложа", description: "Эксклюзивное посещение VIP-ложи на матче сборной Беларуси!", image: prize1stPlace },
    "bcs": { prize: "MacBook", description: "Ноутбук MacBook Air M3 для победителя турнира BCS!", image: prize2ndPlace },
    "hc-dinamo": { prize: "Абонемент", description: "Годовой абонемент на все матчи ХК Динамо Минск!", image: prize3rdPlace },
    "maxline": { prize: "250 Free Spin", description: "250 бесплатных вращений в казино Maxline для лидеров!", image: prize1stPlace },
    "papa-doner": { prize: "100 BYN", description: "Сертификат на 100 BYN в сети ресторанов Papa Doner!", image: prize2ndPlace },
    "zubr": { prize: "AirPods", description: "Беспроводные наушники Apple AirPods Pro 2 для победителя!", image: prize3rdPlace },
    "hello": { prize: "1000 минут", description: "1000 минут на связь в сети Hello для лучшего менеджера!", image: prize1stPlace },
  };

  const currentPrize = commercialPrizes[leagueId];

  // Current championship tour (should come from API/state in real implementation)
  const currentTour = 29;

  // Mock standings data
  const leagueStandings = [
    { id: "team-1", position: 1, change: "up", name: "Dream team", tourPoints: 32, totalPoints: 3123, isUser: false },
    { id: "team-2", position: 2, change: "down", name: "Lucky Team", tourPoints: 32, totalPoints: 3108, isUser: false },
    { id: "team-3", position: 3, change: "same", name: "Stayki", tourPoints: 32, totalPoints: 3093, isUser: false },
    { id: "team-4", position: 4, change: "same", name: "Champions", tourPoints: 32, totalPoints: 3050, isUser: false },
    { id: "team-5", position: 5, change: "up", name: "Football Pro", tourPoints: 32, totalPoints: 3020, isUser: false },
    { id: "team-6", position: 6, change: "down", name: "Winners", tourPoints: 32, totalPoints: 3010, isUser: false },
    { id: "team-7", position: 7, change: "same", name: "Best Team", tourPoints: 32, totalPoints: 3005, isUser: false },
    { id: "team-8", position: 8, change: "up", name: "Legends", tourPoints: 32, totalPoints: 3000, isUser: false },
    { id: "user-team", position: 9, change: "down", name: "Alepyz", tourPoints: 32, totalPoints: 2995, isUser: true },
    { id: "team-10", position: 10, change: "same", name: "Dragons", tourPoints: 32, totalPoints: 2990, isUser: false },
  ];

  const handleTeamClick = (team: typeof leagueStandings[0]) => {
    if (team.isUser) {
      handleNavigate("/your-team");
    } else {
      handleNavigate(`/view-team?id=${team.id}&name=${encodeURIComponent(team.name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader backTo="/league" />
      
      <main className="flex-1 px-4 pb-6">
        {/* Breadcrumb */}
        <div className="py-4">
          <Breadcrumbs
            items={[
              { label: "Футбол", path: "/" },
              { label: "Беларусь", path: "/" },
              { label: "Лига", path: "/league" },
              { label: leagueName },
            ]}
          />
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

        {/* Table header */}
        <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
          <span className="col-span-3 text-xs">Место</span>
          <span className="col-span-4 text-xs">Название</span>
          <span className="col-span-3 text-center">
            <span className="text-xs block whitespace-nowrap">{currentTour}-й тур</span>
            <span className="text-[10px] italic block">(очки)</span>
          </span>
          <span className="col-span-2 text-right">
            <span className="text-xs block">Всего</span>
            <span className="text-[10px] italic block">(очков)</span>
          </span>
        </div>

        {/* League Standings */}
        <div className="space-y-2 mb-6">
          {leagueStandings.map((row) => (
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

        {/* Prize Section for Commercial Leagues */}
        {isCommercial && currentPrize && (
          <div className="mb-6 bg-secondary/30 rounded-2xl p-4 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Главный приз</h3>
            <div className="flex items-center gap-4">
              <img 
                src={currentPrize.image} 
                alt={currentPrize.prize}
                className="w-24 h-24 object-contain rounded-xl"
              />
              <div className="flex-1">
                <span className="text-primary font-bold text-xl block mb-2">
                  {currentPrize.prize}
                </span>
                <p className="text-muted-foreground text-sm">
                  {currentPrize.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-2 space-y-3">
        {isCommercial ? (
          // Commercial league buttons
          isParticipating ? (
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full rounded-full py-6 font-semibold border-border text-foreground"
            >
              Закрыть
            </Button>
          ) : isBeforeRegistration ? (
            <>
              <Button
                disabled
                className="w-full rounded-full py-6 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
              >
                Регистрация ещё не началась
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full rounded-full py-6 font-semibold border-border text-foreground"
              >
                Закрыть
              </Button>
            </>
          ) : isRegistrationOpen ? (
            <>
              <Button
                onClick={handleParticipate}
                className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground"
              >
                Участвовать
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full rounded-full py-6 font-semibold border-border text-foreground"
              >
                Закрыть
              </Button>
            </>
          ) : (
            <>
              <Button
                disabled
                className="w-full rounded-full py-6 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
              >
                Регистрация закрыта
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full rounded-full py-6 font-semibold border-border text-foreground"
              >
                Закрыть
              </Button>
            </>
          )
        ) : (
          // Personal league buttons
          <>
            <Button
              onClick={handleInviteFriend}
              className="w-full rounded-full py-6 font-semibold bg-primary text-primary-foreground"
            >
              Пригласить друга
            </Button>
            {isOwner ? (
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full rounded-full py-6 font-semibold border-border text-foreground"
              >
                Закрыть
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleLeaveLeague}
                  variant="outline"
                  className="w-full rounded-full py-6 font-semibold border-destructive text-destructive hover:bg-destructive/10"
                >
                  Покинуть лигу
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full rounded-full py-6 font-semibold border-border text-foreground"
                >
                  Закрыть
                </Button>
              </>
            )}
          </>
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

      {/* Leave League Confirmation Drawer */}
      <Drawer open={showLeaveConfirmDrawer} onOpenChange={setShowLeaveConfirmDrawer}>
        <DrawerContent className="bg-background border-t border-border">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-bold text-foreground">
              Покинуть лигу?
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-6 pb-6 space-y-6">
            <p className="text-center text-muted-foreground">
              Весь ваш прогресс в данной лиге будет безвозвратно удален.
            </p>

            <div className="space-y-3">
              <Button
                onClick={confirmLeaveLeague}
                variant="destructive"
                className="w-full rounded-full py-6 font-semibold"
              >
                Покинуть лигу
              </Button>
              <Button
                onClick={() => setShowLeaveConfirmDrawer(false)}
                variant="outline"
                className="w-full rounded-full py-6 font-semibold border-border text-foreground"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ViewLeague;
