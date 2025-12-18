import { Play, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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
  isFavorite?: boolean;
  onToggleFavorite?: (leagueId: string) => void;
  hasTeam?: boolean;
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
  isFavorite = false,
  onToggleFavorite,
  hasTeam = false,
}: SportCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href && !comingSoon) {
      navigate(href);
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
        <h3 className="text-foreground text-lg font-bold">{title}</h3>
      </div>

      <Card
        className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50 transition-all duration-300 cursor-pointer group"
        onClick={handleClick}
      >

        {comingSoon ? (
          <div className="relative p-6 flex flex-col items-center justify-center min-h-[180px]">
            <div className="relative text-center">
              <p className="text-foreground text-xl font-bold mb-2">Скоро запустим</p>
              <p className="text-primary text-2xl font-black">{comingSoonYear}</p>
            </div>
          </div>
        ) : (
          <div className="relative p-4 flex items-center justify-between min-h-[100px]">
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
                className="w-20 h-20 rounded-full flex items-center justify-center"
              >
                {leagueIcon ? (
                  <img src={leagueIcon} alt={league} className="w-20 h-20 object-contain" />
                ) : (
                  <span className="text-3xl">{icon}</span>
                )}
              </div>
              <div>
                <h4 className="text-foreground font-bold text-xl">{league}</h4>
                {participants !== undefined && (
                  <p className="text-sm">
                    {hasTeam && userRank !== undefined ? (
                      <>
                        <span className="text-primary font-semibold">{formatParticipants(userRank)}</span>
                        <span className="text-muted-foreground"> из {formatParticipants(participants)} участников</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">{formatParticipants(participants)} участников</span>
                    )}
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-muted-foreground">Дедлайн: </span>
                  <span className="text-foreground">{date} в {time}</span>
                </p>
              </div>
            </div>
            {/* Play button in bottom-right corner */}
            <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full border border-muted-foreground/30 flex items-center justify-center">
              <Play className={`w-3 h-3 fill-current ${hasTeam ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            {hasTeam && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-lg" />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SportCard;
