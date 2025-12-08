import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trophy, User, TrendingUp, Award, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import SportHeader from "@/components/SportHeader";
import { useState, useMemo } from "react";
import { Filter } from "bad-words";
import { toast } from "sonner";
import bannerBg from "@/assets/beterra-banner-bg.png";
import playersExample from "@/assets/players-example.png";
import scoringExample from "@/assets/scoring-example.png";
import transfersExample from "@/assets/transfers-example.png";
import leaderboardExample from "@/assets/leaderboard-example.png";
import prize3rdPlace from "@/assets/prize-3rd-place.png";
import prize2ndPlace from "@/assets/prize-2nd-place.png";
import prize1stPlace from "@/assets/prize-1st-place.png";

const MAX_NAME_LENGTH = 15;

const russianBadWords = [
  "хуй", "хуя", "хуе", "хуи", "пизд", "блять", "бля", "блядь", "ебать", "еба", 
  "ебу", "ебан", "ебл", "сука", "суки", "сучк", "мудак", "мудил", "пидор", 
  "пидар", "гандон", "залупа", "шлюх", "дрочи", "хер", "жопа", "срань", 
  "говно", "дерьмо", "засранец", "уебан", "уёб", "ёб", "долбоёб", "мразь"
];

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");

  const filter = useMemo(() => {
    const f = new Filter();
    f.addWords(...russianBadWords);
    return f;
  }, []);

  const handleNameChange = (value: string) => {
    setTeamName(value.slice(0, MAX_NAME_LENGTH));
  };

  const validateAndNavigate = () => {
    const name = teamName.trim() || "Lucky Team";
    
    try {
      if (filter.isProfane(name.toLowerCase())) {
        toast.error("Название содержит недопустимые слова");
        return;
      }
    } catch {
      // If filter fails, allow navigation
    }
    
    navigate("/team-builder", { state: { teamName: name } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SportHeader />
      
      {/* Back Button */}
      <div className="px-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-6 rounded-xl overflow-hidden border border-border">
        <img src={bannerBg} alt="Banner" className="w-full h-full object-cover rounded-xl" />
      </div>

      {/* Team Creation Form */}
      <div className="px-4 mt-6 space-y-3">
        {/* Team Name Input */}
        <div className="relative">
          <Input
            placeholder="Название команды"
            value={teamName}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            className="w-full h-14 bg-card/80 border-border text-foreground placeholder:text-muted-foreground rounded-xl"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">
            {teamName.length}/{MAX_NAME_LENGTH}
          </div>
        </div>

        {/* Favorite Team Select */}
        <Select value={favoriteTeam} onValueChange={setFavoriteTeam}>
          <SelectTrigger className="w-full h-14 bg-card/80 border-border text-foreground rounded-xl">
            <SelectValue placeholder="За какую команду болеешь" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="dinamo-minsk">Динамо Минск</SelectItem>
            <SelectItem value="bate">БАТЭ</SelectItem>
            <SelectItem value="shakhtyor">Шахтер</SelectItem>
            <SelectItem value="neman">Неман</SelectItem>
            <SelectItem value="energetik">Энергетик-БГУ</SelectItem>
            <SelectItem value="torpedo">Торпедо-БелАЗ</SelectItem>
            <SelectItem value="slavia">Славия</SelectItem>
            <SelectItem value="isloch">Ислочь</SelectItem>
          </SelectContent>
        </Select>

        {/* Create Team Button */}
        <Button 
          onClick={validateAndNavigate}
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
        >
          Создать команду
        </Button>
      </div>


      {/* Collect Team Section */}
      <div className="px-4 mt-8 text-center">
        <h3 className="text-foreground text-3xl font-bold mb-4">Собирай команду</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Воспользуйся бюджетом в <span className="text-primary font-semibold">100 миллионов</span>
          <br />
          и собери команду лучших игроков чемпионата
        </p>

        {/* Player Cards Image */}
        <div className="mt-6">
          <img 
            src={playersExample} 
            alt="Players" 
            className="w-full rounded-xl" 
          />
        </div>
      </div>

      {/* Score Points Section */}
      <div className="px-4 mt-8 text-center">
        <h3 className="text-foreground text-3xl font-bold mb-4">Набирай очки</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Каждый игрок будет получать или терять
          <br />
          очки за свои действия в реальных матчах.
          <br />
          Количество очков может отличаться, в
          <br />
          зависимости от амплуа футболиста.
          <br />
          Например, защитник получит за гол — 6
          <br />
          очков, а нападающий — 4 очка
        </p>

        {/* Scoring Example Image */}
        <div className="mt-6">
          <img 
            src={scoringExample} 
            alt="Scoring Example" 
            className="w-full rounded-xl" 
          />
        </div>
      </div>

      {/* Transfer Details Section */}
      <div className="px-4 mt-8 text-center">
        <h3 className="text-foreground text-3xl font-bold mb-4">Делай трансферы</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Если кто-то из футболистов твоей команды
          <br />
          получил травму или просто плохо играет, не
          <br />
          набирая очки — каждый тур ты сможешь сделать
          <br />
          <span className="text-primary font-semibold">до 3-х трансферов</span>, чтобы изменить состав на
          <br />
          более оптимальный
        </p>

        {/* Transfers Example Image */}
        <div className="mt-6">
          <img 
            src={transfersExample} 
            alt="Transfers Example" 
            className="w-full rounded-xl" 
          />
        </div>
      </div>

      {/* Compete Section */}
      <div className="px-4 mt-8 text-center">
        <h3 className="text-foreground text-3xl font-bold mb-4">Соревнуйся</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Соревнуйся с другими пользователями в общей
          <br />
          лиге или создай свою собственную лигу для
          <br />
          друзей, где вы сможете бороться за первое место
          <br />
          только между собой
        </p>

        {/* Leaderboard Example Image */}
        <div className="mt-6">
          <img 
            src={leaderboardExample} 
            alt="Leaderboard Example" 
            className="w-full rounded-xl" 
          />
        </div>
      </div>

      {/* Prizes Section */}
      <div className="px-4 mt-8 text-center">
        <h3 className="text-foreground text-3xl font-bold mb-4">Получай призы</h3>
        <p className="text-muted-foreground text-base leading-relaxed mb-6">
          Пользователи, набравшие наибольшее количество
          <br />
          очков, получат призы от <span className="text-primary font-semibold">Fantasy.sports.by</span>
        </p>

        {/* Prize Cards */}
        <div className="space-y-4">
          <img 
            src={prize3rdPlace} 
            alt="3rd Place Prize" 
            className="w-full rounded-xl" 
          />
          <img 
            src={prize2ndPlace} 
            alt="2nd Place Prize" 
            className="w-full rounded-xl" 
          />
          <img 
            src={prize1stPlace} 
            alt="1st Place Prize" 
            className="w-full rounded-xl" 
          />
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default CreateTeam;
