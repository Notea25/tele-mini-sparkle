import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import SportHeader from "@/components/SportHeader";
import InfinitePlayerCarousel from "@/components/InfinitePlayerCarousel";
import { useState, useMemo } from "react";
import { Filter } from "bad-words";
import { toast } from "sonner";
import bannerBg from "@/assets/beterra-banner-bg-2.webp";
import scoringExample from "@/assets/scoring-example.png";
import leaderboardExample from "@/assets/leaderboard-example.png";
import prize3rdPlace from "@/assets/prize-3rd-place.png";
import prize2ndPlace from "@/assets/prize-2nd-place.png";
import prize1stPlace from "@/assets/prize-1st-place.png";
import playerBykov from "@/assets/player-bykov.png";
import playerKozlov from "@/assets/player-kozlov.png";
import clubDinamoBrest from "@/assets/club-dinamo-brest.png";
import clubNeman from "@/assets/club-neman.png";
import bgImage from "@/assets/bg_image.png";

const MAX_NAME_LENGTH = 15;

const russianBadWords = [
  "хуй",
  "хуя",
  "хуе",
  "хуи",
  "пизд",
  "блять",
  "бля",
  "блядь",
  "ебать",
  "еба",
  "ебу",
  "ебан",
  "ебл",
  "сука",
  "суки",
  "сучк",
  "мудак",
  "мудил",
  "пидор",
  "пидар",
  "гандон",
  "залупа",
  "шлюх",
  "дрочи",
  "хер",
  "жопа",
  "срань",
  "говно",
  "дерьмо",
  "засранец",
  "уебан",
  "уёб",
  "ёб",
  "долбоёб",
  "мразь",
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

  const isFormValid = teamName.trim().length > 0 && favoriteTeam.length > 0;

  const validateAndNavigate = () => {
    if (!isFormValid) {
      toast.error("Заполните все поля");
      return;
    }

    const name = teamName.trim();

    try {
      if (filter.isProfane(name.toLowerCase())) {
        toast.error("Название содержит недопустимые слова");
        return;
      }
    } catch {
      // If filter fails, allow navigation
    }

    // Save favorite team to localStorage for club league display
    localStorage.setItem("fantasyFavoriteTeam", favoriteTeam);

    navigate("/team-builder", { state: { teamName: name } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SportHeader />

      {/* Breadcrumbs */}
      <div className="px-4 mt-4">
        <Breadcrumbs
          items={[{ label: "Футбол", path: "/" }, { label: "Беларусь", path: "/" }, { label: "Создание команды" }]}
        />
      </div>

      {/* Hero Banner */}

      {/* <div className="mx-4 mt-6 rounded-xl overflow-hidden">
        <img src={bannerBg} alt="Banner" className="w-full h-full object-cover rounded-xl" />
      </div> */}
      {/* Hero Banner */}
      <div className="relative">
        {/* Подложка */}
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt="Background" className="w-full h-full object-cover rounded-xl" />
        </div>

        {/* Контент поверх подложки */}
        <div className="relative z-10 mx-4 mt-6">
          <img
            src={bannerBg}
            alt="Banner"
            className="w-full rounded-xl"
            style={{ maxHeight: "200px", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Team Creation Form */}
      <div className="px-4 mt-6 space-y-3">
        <div className="font-unbounded font-normal not-italic text-2xl leading-[130%] tracking-normal text-white">
          Создай свою команду <br />в Высшей лиге <br />
          Беларуси
        </div>
        <div className="relative">
          <Input
            placeholder="Название команды"
            value={teamName}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={MAX_NAME_LENGTH}
            className="w-full h-[40px] font-rubik font-normal not-italic text-[12px] leading-[130%] tracking-normal text-[#4B485F] placeholder:text-[#4B485F] rounded-xl bg-[#1A1924] border border-[#363546]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 font-rubik font-normal not-italic text-[12px] tracking-normal text-[#4B485F] pointer-events-none">
            {teamName.length}/{MAX_NAME_LENGTH}
          </div>
        </div>

        {/* Favorite Team Select */}
        <Select value={favoriteTeam} onValueChange={setFavoriteTeam}>
          <SelectTrigger className="w-full h-[40px] font-rubik font-normal not-italic text-[12px] leading-[130%] tracking-normal text-[#4B485F] placeholder:text-[#4B485F] rounded-xl bg-[#1A1924] border border-[#363546]">
            <SelectValue placeholder="За какую команду болеешь?" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="arsenal">Арсенал</SelectItem>
            <SelectItem value="baranovichi">Барановичи</SelectItem>
            <SelectItem value="bate">БАТЭ</SelectItem>
            <SelectItem value="belshina">Белшина</SelectItem>
            <SelectItem value="vitebsk">Витебск</SelectItem>
            <SelectItem value="gomel">Гомель</SelectItem>
            <SelectItem value="dinamo-brest">Динамо-Брест</SelectItem>
            <SelectItem value="dinamo-minsk">Динамо-Минск</SelectItem>
            <SelectItem value="dnepr-mogilev">Днепр-Могилев</SelectItem>
            <SelectItem value="isloch">Ислочь</SelectItem>
            <SelectItem value="minsk">Минск</SelectItem>
            <SelectItem value="ml">МЛ Витебск</SelectItem>
            <SelectItem value="naftan-novopolotsk">Нафтан-Новополоцк</SelectItem>
            <SelectItem value="neman">Неман</SelectItem>
            <SelectItem value="slavia">Славия-Мозырь</SelectItem>
            <SelectItem value="torpedo">Торпедо-БелАЗ</SelectItem>
          </SelectContent>
        </Select>

        {/* Create Team Button */}
        {/* <Button
          onClick={validateAndNavigate}
          disabled={!isFormValid}
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: isFormValid ? "0 0 20px hsl(var(--primary) / 0.5)" : "none" }}
        >
          Создать команду
        </Button> */}
        <Button
          onClick={validateAndNavigate}
          disabled={!isFormValid}
          className="w-full h-[44px] text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-[24px]"
          style={{ boxShadow: isFormValid ? "0 0 20px hsl(var(--primary) / 0.5)" : "none" }}
        >
          Создать команду
        </Button>
      </div>

      {/* Collect Team Section */}
      <div className="mt-8 text-center">
        <div className="px-4">
          <h3 className="text-foreground text-3xl font-bold mb-4">Собирай команду</h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            Воспользуйся бюджетом в <span className="text-primary font-semibold">100 миллионов</span>
            <br />и собери команду лучших игроков чемпионата
          </p>
        </div>

        {/* Infinite Player Carousel */}
        <div className="mt-6">
          <InfinitePlayerCarousel />
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
          <img src={scoringExample} alt="Scoring Example" className="w-full rounded-xl" />
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

        {/* Transfers Player Cards */}
        <div className="mt-6 flex justify-center items-center gap-2">
          {/* Bykov Card */}
          <div
            className="relative flex-shrink-0 rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            style={{ width: "140px", height: "180px" }}
          >
            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center overflow-hidden">
              <img src={clubDinamoBrest} alt="Club" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full flex-1 flex items-center justify-center">
              <img src={playerBykov} alt="Быков" className="w-full h-full object-contain object-bottom" />
            </div>
            <div className="px-3 py-2">
              <p className="text-foreground font-semibold text-sm truncate">Быков</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground text-xs">9 очков</span>
                <span className="text-muted-foreground text-xs">ЗЩ</span>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
          </div>

          {/* Kozlov Card */}
          <div
            className="relative flex-shrink-0 rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            style={{ width: "140px", height: "180px" }}
          >
            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center overflow-hidden">
              <img src={clubNeman} alt="Club" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full flex-1 flex items-center justify-center">
              <img src={playerKozlov} alt="Козлов" className="w-full h-full object-contain object-bottom" />
            </div>
            <div className="px-3 py-2">
              <p className="text-foreground font-semibold text-sm truncate">Козлов</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground text-xs">7 очков</span>
                <span className="text-muted-foreground text-xs">ПЗ</span>
              </div>
            </div>
          </div>
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
          <img src={leaderboardExample} alt="Leaderboard Example" className="w-full rounded-xl" />
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
          <img src={prize3rdPlace} alt="3rd Place Prize" className="w-full rounded-xl" />
          <img src={prize2ndPlace} alt="2nd Place Prize" className="w-full rounded-xl" />
          <img src={prize1stPlace} alt="1st Place Prize" className="w-full rounded-xl" />
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default CreateTeam;
