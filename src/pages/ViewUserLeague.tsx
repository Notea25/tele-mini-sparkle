import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, User } from "lucide-react";
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
import { customLeaguesApi, UserLeagueDetails, UserLeagueLeaderboardEntry } from "@/lib/api";
import { useSquadData } from "@/hooks/useSquadData";
import { safeGetItem } from "@/lib/safeStorage";

import arrowDownGreen from "@/assets/arrow-down-green.png";
import arrowUpRed from "@/assets/arrow-up-red.png";
import arrowSame from "@/assets/arrow-same.png";
import arrowDownBlack from "@/assets/arrow-down-black.png";
import trophyGold from "@/assets/trophy-gold.png";
import trophySilver from "@/assets/trophy-silver.png";
import trophyBronze from "@/assets/trophy-bronze.png";

const ViewUserLeague = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  // Parse league ID from URL params
  const leagueId = useMemo(() => {
    const numericId = parseInt(id || "", 10);
    return Number.isFinite(numericId) ? numericId : null;
  }, [id]);
  
  // Check owner from URL query param (fallback)
  const ownerFromUrl = searchParams.get("owner") === "true";
  
  // Get league ID from localStorage (default 116)
  const sportLeagueId = parseInt(localStorage.getItem('fantasySelectedLeagueId') || '116', 10);
  
  // Get current squad and tour info
  const { squad, currentTour, currentTourId } = useSquadData(sportLeagueId);
  
  // Fetch league details from API
  const { data: leagueResponse, isLoading: leagueLoading } = useQuery({
    queryKey: ['userLeagueDetails', leagueId],
    queryFn: async () => {
      if (!leagueId) return null;
      return customLeaguesApi.getUserLeagueById(leagueId);
    },
    enabled: !!leagueId,
  });

  // Fetch leaderboard from user leagues API
  const { data: leaderboardResponse, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['userLeagueLeaderboard', leagueId, currentTourId],
    queryFn: async () => {
      if (!leagueId || !currentTourId) return null;
      return customLeaguesApi.getUserLeagueLeaderboard(leagueId, currentTourId);
    },
    enabled: !!leagueId && !!currentTourId,
    staleTime: 0,
    gcTime: 0,
  });

  // Extract league data
  const leagueData = leagueResponse?.data;
  const leagueName = leagueData?.name || "Лига";
  
  // Check if current user is creator
  const profileData = safeGetItem<{ oddsGeneralId?: number; userName?: string }>("fantasyUserProfile", {});
  const isOwnerFromApi = leagueData?.creator_id === profileData.oddsGeneralId;
  const isOwner = isOwnerFromApi || ownerFromUrl;
  const participants = leagueData?.squads?.length || 0;
  const userName = profileData.userName || "user";

  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [showLeaveConfirmDrawer, setShowLeaveConfirmDrawer] = useState(false);
  const [showDeleteConfirmDrawer, setShowDeleteConfirmDrawer] = useState(false);

  // Process leaderboard data from API
  const leagueStandings = useMemo((): Array<{
    id: string;
    position: number;
    change: "up" | "down" | "same";
    name: string;
    tourPoints: number;
    totalPoints: number;
    totalPenaltyPoints: number;
    penaltyPoints: number;
    isUser: boolean;
  }> => {
    // Priority: use leaderboard API if available
    if (leaderboardResponse?.success && leaderboardResponse.data && leaderboardResponse.data.length > 0) {
      const userSquadId = squad?.id;
      
      return leaderboardResponse.data.map((entry: UserLeagueLeaderboardEntry) => {
        // TEMPORARY FIX: Calculate net points if backend returns gross
        let totalPoints = entry.total_points;
        const totalPenalty = entry.total_penalty_points || 0;
        
        if (totalPoints > 0 && totalPenalty > 0) {
          const netPoints = totalPoints - totalPenalty;
          if (netPoints < 0) {
            totalPoints = netPoints;
          }
        }
        
        return {
          id: entry.squad_id.toString(),
          position: entry.place,
          change: "same" as const,
          name: entry.squad_name,
          tourPoints: entry.tour_points,
          totalPoints,
          totalPenaltyPoints: totalPenalty,
          penaltyPoints: entry.penalty_points || 0,
          isUser: entry.squad_id === userSquadId,
        };
      });
    }
    
    // Fallback to squads from league details
    if (!leagueData?.squads || !Array.isArray(leagueData.squads) || leagueData.squads.length === 0) {
      return [];
    }
    
    const userSquadId = squad?.id;
    
    return leagueData.squads
      .filter((entry) => entry && entry.squad_id !== undefined)
      .map((entry, index) => {
        // TEMPORARY FIX: Calculate net points if backend returns gross
        let totalPoints = entry.total_points ?? 0;
        const totalPenalty = (entry as any).total_penalty_points || entry.penalty_points || 0;
        
        if (totalPoints > 0 && totalPenalty > 0) {
          const netPoints = totalPoints - totalPenalty;
          if (netPoints < 0) {
            totalPoints = netPoints;
          }
        }
        
        return {
          id: String(entry.squad_id || index),
          position: entry.place ?? index + 1,
          change: "same" as const,
          name: entry.squad_name || "Команда",
          tourPoints: entry.tour_points ?? 0,
          totalPoints,
          totalPenaltyPoints: totalPenalty,
          penaltyPoints: entry.penalty_points || 0,
          isUser: entry.squad_id === userSquadId,
        };
      });
  }, [leaderboardResponse, leagueData, squad?.id]);

  // Current tour number for display
  const currentTourNumber = currentTour || 29;

  // Restore scroll position when returning to this page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("viewUserLeagueScrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  // Save scroll position before navigating away
  const handleNavigate = (path: string) => {
    sessionStorage.setItem("viewUserLeagueScrollPosition", window.scrollY.toString());
    navigate(path);
  };


  const getInviteLink = () => {
    // Telegram mini app link to bot with startapp parameter
    // Use base64 encoding to safely pass Cyrillic and special characters
    const inviteData = {
      leagueId: leagueId?.toString() || '',
      leagueName,
      inviter: userName,
      userId: profileData.oddsGeneralId?.toString() || ''
    };
    const encodedData = btoa(encodeURIComponent(JSON.stringify(inviteData)));
    return `https://t.me/fantasyby_bot?startapp=invite_${encodedData}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteLink());
    toast.success("Ссылка скопирована");
  };

  const handleLeaveLeague = () => {
    setShowLeaveConfirmDrawer(true);
  };

  const [isLeaving, setIsLeaving] = useState(false);

  const confirmLeaveLeague = async () => {
    if (!leagueId || !squad?.id) {
      toast.error("Не удалось покинуть лигу");
      return;
    }
    
    setIsLeaving(true);
    try {
      const response = await customLeaguesApi.leaveUserLeague(leagueId, squad.id);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['mySquadLeagues'] });
        toast.success("Вы покинули лигу");
        navigate("/league");
      } else {
        toast.error(response.error || "Ошибка при выходе из лиги");
      }
    } catch (error) {
      toast.error("Ошибка при выходе из лиги");
    } finally {
      setIsLeaving(false);
      setShowLeaveConfirmDrawer(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLeague = async () => {
    if (!leagueId) return;
    
    setIsDeleting(true);
    try {
      const response = await customLeaguesApi.deleteUserLeague(leagueId);
      if (response.success) {
        // Invalidate my squad leagues cache so list refreshes
        queryClient.invalidateQueries({ queryKey: ['mySquadLeagues'] });
        toast.success("Лига удалена");
        navigate("/league");
      } else {
        toast.error(response.error || "Ошибка при удалении лиги");
      }
    } catch (error) {
      toast.error("Ошибка при удалении лиги");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmDrawer(false);
    }
  };

  const handleInviteFriend = () => {
    setShowInviteDrawer(true);
  };

  const handleClose = () => {
    navigate("/league");
  };

  const handleTeamClick = (team: typeof leagueStandings[0]) => {
    if (team.isUser && squad?.id) {
      handleNavigate(`/view-team?id=${squad.id}`);
      return;
    }

    const numericFromId = Number.parseInt(String(team.id).replace(/[^0-9]/g, ""), 10);
    const safeTeamId = Number.isFinite(numericFromId) && numericFromId > 0 ? numericFromId : team.position;

    handleNavigate(`/view-team?id=${safeTeamId}&name=${encodeURIComponent(team.name)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SportHeader backTo="/league" />
      
      <main className="flex-1 px-4 pb-6">
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
            <span className="text-xs block whitespace-nowrap">{currentTourNumber}-й тур</span>
            <span className="text-[10px] italic block">(очки)</span>
          </span>
          <span className="col-span-2 text-right">
            <span className="text-xs block">Всего</span>
            <span className="text-[10px] italic block">(очков)</span>
          </span>
        </div>

        {/* League Standings */}
        <div className="space-y-2 mb-6">
          {(leagueLoading || leaderboardLoading) ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : leagueStandings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Нет участников</div>
          ) : (
            leagueStandings.map((row) => (
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
            ))
          )}
        </div>

        {/* Participants count */}
        <div className="mb-6 bg-secondary/20 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Участников:</span>
            <span className="text-sm font-medium text-foreground">{leagueStandings.length || participants}</span>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-2 space-y-3">
        <Button
          onClick={handleInviteFriend}
          className="w-full rounded-lg py-6 font-semibold bg-primary text-primary-foreground"
        >
          Пригласить друзей
        </Button>
        {leagueData ? (
          isOwner ? (
            <>
              <Button
                onClick={() => setShowDeleteConfirmDrawer(true)}
                variant="outline"
                className="w-full rounded-lg py-6 font-semibold border-destructive text-destructive hover:bg-destructive/10"
              >
                Удалить лигу
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
              >
                Закрыть
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleLeaveLeague}
                variant="outline"
                className="w-full rounded-lg py-6 font-semibold border-destructive text-destructive hover:bg-destructive/10"
              >
                Покинуть лигу
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
              >
                Закрыть
              </Button>
            </>
          )
        ) : (
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
          >
            Закрыть
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
              className="w-full rounded-lg py-6 font-semibold bg-primary text-primary-foreground"
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
              Весь твой прогресс в данной лиге будет безвозвратно удален.
            </p>

            <div className="space-y-3">
              <Button
                onClick={confirmLeaveLeague}
                disabled={isLeaving}
                variant="destructive"
                className="w-full rounded-lg py-6 font-semibold"
              >
                {isLeaving ? 'Выход...' : 'Покинуть лигу'}
              </Button>
              <Button
                onClick={() => setShowLeaveConfirmDrawer(false)}
                variant="outline"
                className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete League Confirmation Drawer */}
      <Drawer open={showDeleteConfirmDrawer} onOpenChange={setShowDeleteConfirmDrawer}>
        <DrawerContent className="bg-background border-t border-border">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl font-bold text-foreground">
              Удалить лигу?
            </DrawerTitle>
          </DrawerHeader>
          
          <div className="px-6 pb-6 space-y-6">
            <p className="text-center text-muted-foreground">
              Лига «{leagueName}» будет безвозвратно удалена.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleDeleteLeague}
                disabled={isDeleting}
                variant="destructive"
                className="w-full rounded-lg py-6 font-semibold"
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirmDrawer(false)}
                variant="outline"
                className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Home Button */}
      {/* <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}
    </div>
  );
};

export default ViewUserLeague;
