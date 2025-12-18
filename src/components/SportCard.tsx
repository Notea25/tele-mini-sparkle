import { ChevronRight, Star } from "lucide-react";
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
        className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50 shadow-card hover:shadow-neon transition-all duration-300 cursor-pointer group"
        style={{
          boxShadow: `0 8px 32px hsl(${glowColor} / 0.15)`,
        }}
        onClick={handleClick}
      >
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
          style={{
            background: `radial-gradient(circle at 50% 120%, hsl(${glowColor} / 0.4), transparent 70%)`,
          }}
        />

        {comingSoon ? (
          <div className="relative p-6 flex flex-col items-center justify-center min-h-[180px]">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `radial-gradient(circle at center, hsl(${glowColor} / 0.3), transparent)`,
              }}
            />
            <div className="relative text-center">
              <p className="text-foreground text-xl font-bold mb-2">Скоро запустим</p>
              <p className="text-primary text-2xl font-black">{comingSoonYear}</p>
            </div>
          </div>
        ) : (
          <div className="relative p-6 flex items-center justify-between min-h-[180px]">
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
                className={`w-20 h-20 rounded-full flex items-center justify-center ${hasTeam ? 'ring-2 ring-primary' : ''}`}
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
            <div className="flex items-center">
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>

            {/* Green bottom line when user has team */}
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
