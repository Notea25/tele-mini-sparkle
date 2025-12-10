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
  comingSoon?: boolean;
  comingSoonYear?: string;
  glowColor?: string;
  href?: string;
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
  comingSoon,
  comingSoonYear,
  glowColor = "88 85% 55%",
  href,
}: SportCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (href && !comingSoon) {
      navigate(href);
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
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{
                  background: `radial-gradient(circle, hsl(${glowColor} / 0.3), hsl(${glowColor} / 0.1))`,
                  boxShadow: `0 0 20px hsl(${glowColor} / 0.4)`,
                }}
              >
                {leagueIcon ? (
                  <img src={leagueIcon} alt={league} className="w-14 h-14 object-contain" />
                ) : (
                  icon
                )}
              </div>
              <div>
                <h4 className="text-foreground font-bold text-xl">{league}</h4>
                {participants !== undefined && (
                  <p className="text-muted-foreground text-base">
                    {formatParticipants(participants)} участников
                  </p>
                )}
                <p className="text-muted-foreground text-base">
                  Дедлайн: {date} в {time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-muted-foreground" />
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SportCard;
