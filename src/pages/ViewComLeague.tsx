import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SportHeader from "@/components/SportHeader";
import { commercialLeaguesApi, CommercialLeagueLeaderboardEntry } from "@/lib/api";
import { useSquadData } from "@/hooks/useSquadData";
import { useQueryClient } from "@tanstack/react-query";

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

const ViewComLeague = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL parameters for commercial league
  const leagueId = searchParams.get("id") || "";
  const leagueName = searchParams.get("name") || "Коммерческая лига";
  const prize = searchParams.get("prize") || "";
  const deadline = searchParams.get("deadline") || "";
  const isRegistrationOpen = searchParams.get("registrationOpen") === "true";
  const isBeforeRegistration = searchParams.get("beforeRegistration") === "true";
  const isFinished = searchParams.get("finished") === "true";
  
  // Extract custom_league_id from URL param (numeric part)
  const customLeagueId = useMemo(() => {
    const numericId = parseInt(leagueId, 10);
    return Number.isFinite(numericId) ? numericId : null;
  }, [leagueId]);
  
  // Fetch full commercial league data for tour information
  const { data: commercialLeagueResponse } = useQuery({
    queryKey: ['commercialLeague', customLeagueId],
    queryFn: async () => {
      if (!customLeagueId) return null;
      return commercialLeaguesApi.getById(customLeagueId);
    },
    enabled: !!customLeagueId,
    staleTime: 0,
    gcTime: 0,
  });
  
  // Get league ID from localStorage (default 116)
  const sportLeagueId = parseInt(localStorage.getItem('fantasySelectedLeagueId') || '116', 10);
  
  // Get current squad and tour info
  const { squad, currentTour, currentTourId, isLoading: squadLoading } = useSquadData(sportLeagueId);

  const queryClient = useQueryClient();

  // Fetch leaderboard from commercial leagues API
  const { data: leaderboardResponse, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['commercialLeagueLeaderboard', customLeagueId, currentTourId],
    queryFn: async () => {
      if (!customLeagueId || !currentTourId) return null;
      return commercialLeaguesApi.getLeaderboard(customLeagueId, currentTourId);
    },
    enabled: !!customLeagueId && !!currentTourId,
    staleTime: 0,
    gcTime: 0,
  });

  // Check if user is participating based on leaderboard data
  const isParticipating = useMemo(() => {
    if (!squad?.id) return false;
    
    // Check in leaderboard data
    if (leaderboardResponse?.success && leaderboardResponse.data) {
      return leaderboardResponse.data.some(entry => entry.squad_id === squad.id);
    }
    
    return false;
  }, [leaderboardResponse, squad?.id]);

  // Process leaderboard data
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
    if (!leaderboardResponse?.success || !leaderboardResponse.data) {
      return [];
    }
    
    const userSquadId = squad?.id;
    
    return leaderboardResponse.data.map((entry: CommercialLeagueLeaderboardEntry) => ({
      id: entry.squad_id.toString(),
      position: entry.place,
      change: "same" as const,
      name: entry.squad_name,
      // Backend already returns net tour points (tour_earned - tour_penalty)
      tourPoints: entry.tour_points,
      totalPoints: entry.total_points,
      totalPenaltyPoints: entry.total_penalty_points || 0,
      penaltyPoints: entry.penalty_points || 0,
      isUser: entry.squad_id === userSquadId,
    }));
  }, [leaderboardResponse, squad?.id]);

  // Calculate tour period from commercial league data
  const tourPeriod = useMemo(() => {
    const league = commercialLeagueResponse?.data;
    if (!league || !league.tours || league.tours.length === 0) {
      return null;
    }
    
    const tours = league.tours;
    const tourNumbers = tours.map(t => t.number).sort((a, b) => a - b);
    const startTour = tourNumbers[0];
    const endTour = tourNumbers[tourNumbers.length - 1];
    
    if (tourNumbers.length > 1) {
      return `${startTour} тур - ${endTour} тур`;
    } else if (tourNumbers.length === 1) {
      return `${startTour} тур`;
    }
    return null;
  }, [commercialLeagueResponse?.data]);
  
  // Current tour number for display
  const currentTourNumber = currentTour || 29;

  // Restore scroll position when returning to this page
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem("viewComLeagueScrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
      }, 0);
    }
  }, []);

  // Save scroll position before navigating away
  const handleNavigate = (path: string) => {
    sessionStorage.setItem("viewComLeagueScrollPosition", window.scrollY.toString());
    navigate(path);
  };

  const [isJoining, setIsJoining] = useState(false);

  const handleParticipate = async () => {
    if (!squad?.id) {
      toast.error("Сквад не найден. Создайте команду сначала.");
      return;
    }
    
    const commercialLeagueIdNum = parseInt(leagueId, 10);
    if (!Number.isFinite(commercialLeagueIdNum)) {
      toast.error("Неверный ID лиги");
      return;
    }
    
    setIsJoining(true);
    try {
      const response = await commercialLeaguesApi.join(commercialLeagueIdNum, squad.id);
      if (response.success) {
        // Invalidate leaderboard query to refresh participation status
        queryClient.invalidateQueries({ queryKey: ['commercialLeagueLeaderboard', customLeagueId] });
        toast.success("Вы присоединились к лиге");
        navigate("/league");
      } else {
        toast.error(response.error || "Ошибка при присоединении к лиге");
      }
    } catch (error) {
      toast.error("Ошибка при присоединении к лиге");
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    navigate("/league");
  };
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

  const currentPrize = commercialPrizes[leagueId] || (prize ? { prize, description: `Главный приз: ${prize}`, image: prize1stPlace } : null);

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
      <SportHeader />
      
      <main className="flex-1 px-4 pb-6">
        {/* League Title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">{leagueName}</h1>
          {isFinished && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
              Завершена
            </span>
          )}
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-1 items-center px-3 py-2 text-muted-foreground">
          <span className="col-span-3 text-xs">Место</span>
          <span className="col-span-4 text-xs">Название</span>
          <span className="col-span-3 text-center">
            {tourPeriod ? (
              <span className="text-xs block whitespace-nowrap">{tourPeriod}</span>
            ) : (
              <span className="text-xs block whitespace-nowrap">{currentTourNumber}-й тур</span>
            )}
            <span className="text-[10px] italic block">(очки)</span>
          </span>
          <span className="col-span-2 text-right">
            <span className="text-xs block">Всего</span>
            <span className="text-[10px] italic block">(очков)</span>
          </span>
        </div>

        {/* League Standings */}
        <div className="space-y-2 mb-6">
          {leaderboardLoading ? (
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
                  {row.totalPoints.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Prize Section */}
        {currentPrize && (
          <div className="mb-6 bg-secondary/30 rounded-xl p-4 border border-border">
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

        {/* Registration Info */}
        {!isFinished && deadline && (
          <div className="mb-6 bg-secondary/20 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Дедлайн регистрации:</span>
              <span className="text-sm font-medium text-foreground">{deadline}</span>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Buttons */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 pb-6 pt-2 space-y-3">
        {isFinished ? (
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
          >
            Закрыть
          </Button>
        ) : isParticipating ? (
          <>
            <Button
              disabled
              className="w-full rounded-lg py-6 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
            >
              Вы уже участвуете
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
            >
              Закрыть
            </Button>
          </>
        ) : isBeforeRegistration ? (
          <>
            <Button
              disabled
              className="w-full rounded-lg py-6 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
            >
              Регистрация ещё не началась
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
            >
              Закрыть
            </Button>
          </>
        ) : isRegistrationOpen ? (
          <>
            <Button
              onClick={handleParticipate}
              disabled={isJoining}
              className="w-full rounded-lg py-6 font-semibold bg-primary text-primary-foreground"
            >
              {isJoining ? 'Присоединение...' : 'Участвовать'}
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
              disabled
              className="w-full rounded-lg py-6 font-semibold bg-muted text-muted-foreground cursor-not-allowed"
            >
              Регистрация закрыта
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full rounded-lg py-6 font-semibold border-border text-foreground"
            >
              Закрыть
            </Button>
          </>
        )}

        {/* Home Button */}
        {/* <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button> */}
      </div>
    </div>
  );
};

export default ViewComLeague;
