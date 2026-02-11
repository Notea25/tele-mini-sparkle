import { useState, useRef, useEffect } from "react";
import { Play, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { squadsApi } from "@/lib/api";

interface SportCardProps {
  title: string;
  icon?: string;
  iconImage?: string;
  leagueIcon?: string;
  league?: string;
  date?: string;
  time?: string;
  participants?: number;
  userRank?: number;
  comingSoon?: boolean;
  comingSoonYear?: string;
  glowColor?: string;
  href?: string;
  leagueId?: string;
  apiLeagueId?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (leagueId: string) => void;
  hasTeam?: boolean;
  isLoading?: boolean;
}

const SportCard = ({
  title,
  icon,
  iconImage,
  leagueIcon,
  league,
  date,
  time,
  participants,
  userRank,
  comingSoon,
  comingSoonYear,
  glowColor = "88 85% 55%",
  href,
  leagueId,
  apiLeagueId,
  isFavorite = false,
  onToggleFavorite,
  hasTeam = false,
  isLoading = false,
}: SportCardProps) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup navigation timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    // Prevent multiple simultaneous clicks using ref (more reliable than state)
    if (href && !comingSoon && !isNavigatingRef.current) {
      console.log('[SportCard] handleClick started', { href, apiLeagueId });
      
      isNavigatingRef.current = true;
      setIsNavigating(true);
      
      // Safety timeout: auto-reset after 5 seconds in case something goes wrong
      navigationTimeoutRef.current = setTimeout(() => {
        console.warn('[SportCard] Navigation timeout - resetting state');
        isNavigatingRef.current = false;
        setIsNavigating(false);
      }, 5000);
      
      if (apiLeagueId) {
        localStorage.setItem('fantasySelectedLeagueId', apiLeagueId.toString());
      }
      
      try {
        const response = await squadsApi.getMySquads();
        const squadsArray = response.data;
        
        console.log('[SportCard] getMySquads response:', response);
        console.log('[SportCard] Looking for league_id:', apiLeagueId);
        
        if (response.success && squadsArray && Array.isArray(squadsArray)) {
          console.log('[SportCard] Squads array:', squadsArray.map(s => ({ id: s.id, league_id: s.league_id })));
          
          const existingSquad = squadsArray.find(squad => 
            Number(squad.league_id) === Number(apiLeagueId)
          );
          
          console.log('[SportCard] Found existing squad:', existingSquad);
          
          if (existingSquad) {
            localStorage.setItem('fantasyUserSquad', JSON.stringify(existingSquad));
            localStorage.setItem('fantasyHasTeam', 'true');
            console.log('[SportCard] Navigating to /league');
            navigate('/league');
          } else {
            localStorage.removeItem('fantasyUserSquad');
            console.log('[SportCard] Navigating to /create-team (no squad)');
            navigate('/create-team');
          }
        } else {
          console.log('[SportCard] No squads found or response failed');
          localStorage.removeItem('fantasyUserSquad');
          navigate('/create-team');
        }
      } catch (error) {
        console.error('[SportCard] Error checking squads:', error);
        navigate('/create-team');
      } finally {
        // Clear timeout and reset state
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
          navigationTimeoutRef.current = null;
        }
        isNavigatingRef.current = false;
        setIsNavigating(false);
        console.log('[SportCard] handleClick finished');
      }
    } else if (isNavigatingRef.current) {
      console.log('[SportCard] Click ignored - already navigating');
    }
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (leagueId && onToggleFavorite) {
      onToggleFavorite(leagueId);
    }
  };

  const formatParticipants = (count: number) => {
    return count.toLocaleString('ru-RU');
  };

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {iconImage ? (
          <img src={iconImage} alt={title} className="w-7 h-7 object-contain" />
        ) : (
          <span className="text-2xl">{icon}</span>
        )}
        <h3 className="text-foreground text-xl font-display">{title}</h3>
      </div>

      <Card
        className={`relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50 transition-all duration-300 group ${
          isNavigating ? 'cursor-wait opacity-70' : 'cursor-pointer'
        }`}
        onClick={handleClick}
      >

        {comingSoon ? (
          <div className="relative p-6 flex flex-col items-center justify-center min-h-[180px]">
            <div className="relative text-center">
              <p className="text-foreground text-lg font-normal font-display mb-2">Скоро запустим</p>
              <p className="text-primary text-lg font-normal font-display">{comingSoonYear}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="relative p-4 flex items-center justify-between min-h-[100px]">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative p-4 flex flex-col min-h-[100px]">
            {/* Star in top-right corner */}
            <button
              onClick={handleStarClick}
              className="absolute top-3 right-3 p-2 -m-2 touch-manipulation z-10"
              aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            >
              <Star 
                className={`w-5 h-5 transition-colors ${
                  isFavorite 
                    ? "text-primary fill-primary" 
                    : "text-muted-foreground hover:text-primary/70"
                }`} 
              />
            </button>

            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
              >
                {leagueIcon ? (
                  <img src={leagueIcon} alt={league} className="w-20 h-20 object-contain" />
                ) : (
                  <span className="text-3xl">{icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-foreground font-normal font-display text-lg">{league}</h4>
                {hasTeam && participants !== undefined && userRank !== undefined && userRank !== null && (
                  <p className="text-sm">
                    <span className="text-primary font-semibold">{formatParticipants(userRank)}</span>
                    <span className="text-muted-foreground"> из {formatParticipants(participants)} участников</span>
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Дедлайн: </span>
                  <span className="text-foreground">{date} в {time}</span>
                </p>
              </div>
            </div>
            
            {/* CTA Button for users without a team */}
            {!hasTeam && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (apiLeagueId) {
                    localStorage.setItem('fantasySelectedLeagueId', apiLeagueId.toString());
                  }
                  navigate('/create-team');
                }}
                className="mt-4 w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:bg-primary/90 transition-colors active:scale-[0.98]"
              >
                Создать команду
              </button>
            )}
            
            {/* Play button in bottom-right corner - only show when user has team */}
            {hasTeam && (
              <>
                <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-current text-primary" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-lg" />
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SportCard;
