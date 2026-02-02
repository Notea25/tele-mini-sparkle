import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";

import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import SportHeader from "@/components/SportHeader";

import InfiniteClubCarousel from "@/components/InfiniteClubCarousel";
import { useState, useMemo, useRef, useEffect } from "react";
import { squadsApi, Team } from "@/lib/api";
import { useTeams } from "@/hooks/useTeams";
import { usePrefetchLeagueData } from "@/hooks/usePrefetchLeagueData";
import { Filter } from "bad-words";
import { toast } from "sonner";
import bannerBg from "@/assets/beterra-banner-bg-2.webp";
import createTeamBannerLogo from "@/assets/create-team-banner-logo.png";
import scoringExample from "@/assets/scoring-example-new.png";
import leaderboardExample from "@/assets/leaderboard-example-new.png";
import prizesBanner from "@/assets/prizes-banner-new.png";
import playerBykov from "@/assets/player-bykov.png";
import playerKozlov from "@/assets/player-kozlov.png";
import clubDinamoBrest from "@/assets/club-dinamo-brest.png";
import clubNeman from "@/assets/club-neman.png";
import bgImage from "@/assets/bg_image.png";

// Transfer section images
import karpovichTransferCard from "@/assets/cards/karpovich-transfer.png";
import vakulichTransferCard from "@/assets/cards/vakulich-transfer.png";
import swapArrowsPurple from "@/assets/swap-arrows-purple.png";

// Player card images for carousel
import vakulichCard from "@/assets/cards/vakulich-card.png";
import kozlovCard from "@/assets/cards/kozlov-card.png";
import bykovCard from "@/assets/cards/bykov-card.png";
import karpovichCard from "@/assets/cards/karpovich-card.png";
import khvashchinskyCard from "@/assets/cards/khvashchinsky-card.png";
import gutorCard from "@/assets/cards/gutor-card.png";

// Club logo imports
import arsenalLogo from "@/assets/clubs/arsenalLogo.png";
import baranovichiLogo from "@/assets/clubs/baranovichiLogo.png";
import bateLogo from "@/assets/clubs/bateLogo.png";
import belshinaLogo from "@/assets/clubs/belshinaLogo.png";
import vitebskLogo from "@/assets/clubs/vitebskLogo.png";
import gomelLogo from "@/assets/clubs/gomelLogo.png";
import brestLogo from "@/assets/clubs/brestLogo.png";
import dinamoLogo from "@/assets/clubs/dinamoLogo.png";
import dneprLogo from "@/assets/clubs/dneprLogo.png";
import islochLogo from "@/assets/clubs/islochLogo.png";
import minskLogo from "@/assets/clubs/minskLogo.png";
import mlLogo from "@/assets/clubs/mlLogo.png";
import naftanLogo from "@/assets/clubs/naftanLogo.png";
import nemanLogo from "@/assets/clubs/nemanLogo.png";
import slaviaLogo from "@/assets/clubs/slaviaLogo.png";
import torpedoLogo from "@/assets/clubs/torpedoLogo.png";

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

const TEAM_OPTIONS = [
  { value: "arsenal", label: "Арсенал", logo: arsenalLogo },
  { value: "baranovichi", label: "Барановичи", logo: baranovichiLogo },
  { value: "bate", label: "БАТЭ", logo: bateLogo },
  { value: "belshina", label: "Белшина", logo: belshinaLogo },
  { value: "vitebsk", label: "Витебск", logo: vitebskLogo },
  { value: "gomel", label: "Гомель", logo: gomelLogo },
  { value: "dinamo-brest", label: "Динамо-Брест", logo: brestLogo },
  { value: "dinamo-minsk", label: "Динамо-Минск", logo: dinamoLogo },
  { value: "dnepr-mogilev", label: "Днепр-Могилев", logo: dneprLogo },
  { value: "isloch", label: "Ислочь", logo: islochLogo },
  { value: "minsk", label: "Минск", logo: minskLogo },
  { value: "ml", label: "МЛ Витебск", logo: mlLogo },
  { value: "naftan-novopolotsk", label: "Нафтан-Новополоцк", logo: naftanLogo },
  { value: "neman", label: "Неман", logo: nemanLogo },
  { value: "slavia", label: "Славия-Мозырь", logo: slaviaLogo },
  { value: "torpedo", label: "Торпедо-БелАЗ", logo: torpedoLogo },
];

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const leagueId = localStorage.getItem('fantasySelectedLeagueId');
  const { teams: apiTeams, isLoading: isLoadingTeams } = useTeams(leagueId);
  const [isCreating, setIsCreating] = useState(false);
  const { prefetchLeagueData } = usePrefetchLeagueData();

  // Prefetch league data in background for instant navigation after team creation
  useEffect(() => {
    prefetchLeagueData();
  }, [prefetchLeagueData]);

  const scrollToButton = () => {
    setTimeout(() => {
      buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const filter = useMemo(() => {
    const f = new Filter();
    f.addWords(...russianBadWords);
    return f;
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamName(e.target.value.slice(0, MAX_NAME_LENGTH));
  };

  const isFormValid = teamName.trim().length > 0 && favoriteTeam.length > 0;

  const validateAndNavigate = async () => {
    if (!isFormValid) {
      toast.error("Заполни все поля");
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

    // Save team data to localStorage and navigate to team builder
    localStorage.setItem("fantasyTeamName", name);
    localStorage.setItem("fantasyFavoriteTeam", favoriteTeam);

    toast.success("Перейдите к выбору игроков!");
    navigate("/team-builder", { state: { teamName: name } });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SportHeader />


      {/* Hero Banner с подложкой для bannerBg и текста */}
      <div className="relative mt-3">
        {/* Подложка bgImage - на всю ширину экрана */}
        <img src={bgImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />

        {/* Контент поверх подложки с отступами */}
        <div className="relative z-10 px-4 py-6">
          {/* Баннер bannerBg с отступами */}
          <img
            src={createTeamBannerLogo}
            alt="Banner"
            className="w-full rounded-xl mb-6"
            style={{ maxHeight: "200px", objectFit: "contain" }}
          />

          {/* Текст с отступами */}
          <div className="text-white font-display font-normal not-italic text-[24px] leading-[130%] tracking-[0%]">
            <span className="hidden sm:inline">Создай свою команду в Высшей лиге Беларуси</span>
            <span className="sm:hidden">Создай свою команду<br />в Высшей лиге Беларуси</span>
          </div>
        </div>
      </div>

      {/* Team Creation Form */}
      <div className="px-4 mt-0 space-y-3">
        {/* Поле для названия команды */}
        <div className="relative">
          <input
            placeholder="Название команды"
            value={teamName}
            onChange={handleNameChange}
            maxLength={MAX_NAME_LENGTH}
            onFocus={() => { setIsNameFocused(true); scrollToButton(); }}
            onBlur={() => setTimeout(() => setIsNameFocused(false), 150)}
            className="w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F]"
            style={{
              borderColor: isNameFocused ? "rgba(255, 255, 255, 0.2)" : "#363546",
              color: isNameFocused ? "#FFFFFF" : teamName ? "#FFFFFF" : "#4B485F",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 font-rubik font-normal text-sm text-[#4B485F] pointer-events-none">
            {teamName.length}/{MAX_NAME_LENGTH}
          </div>
        </div>

        {/* Select для любимой команды */}
        <Select value={favoriteTeam} onValueChange={setFavoriteTeam} onOpenChange={(open) => setIsSelectFocused(open)}>
          <SelectTrigger
            className="w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:ring-2 focus:ring-ring"
            style={{
              borderColor: isSelectFocused ? "rgba(255, 255, 255, 0.2)" : "#363546",
              color: isSelectFocused || favoriteTeam ? "#FFFFFF" : "#4B485F",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <SelectValue placeholder="За какую команду болеешь?" />
          </SelectTrigger>
          <SelectContent
            className="bg-[#1A1924] border border-white/20 text-white"
            style={{
              backgroundColor: "#1A1924",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            {isLoadingTeams ? (
              <div className="px-4 py-2 text-muted-foreground">Загрузка...</div>
            ) : apiTeams.length > 0 ? (
              apiTeams.map((team) => (
                <SelectItem
                  key={team.id}
                  value={team.id.toString()}
                  className="focus:bg-white/10 focus:text-white data-[state=checked]:text-primary"
                >
                  <div className="flex items-center gap-2">
                    <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                    <span>{team.name}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              TEAM_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="focus:bg-white/10 focus:text-white data-[state=checked]:text-primary"
                >
                  <div className="flex items-center gap-2">
                    <img src={option.logo} alt={option.label} className="w-5 h-5 object-contain" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Create Team Button */}
        <Button
          ref={buttonRef}
          onClick={validateAndNavigate}
          disabled={!isFormValid || isCreating}
          className="w-full h-[44px] font-rubik text-[16px] font-medium bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          style={{ boxShadow: isFormValid && !isCreating ? "0 0 20px hsl(var(--primary) / 0.5)" : "none" }}
        >
          {isCreating ? "Создание..." : "Создать команду"}
        </Button>
        <InfiniteClubCarousel />
      </div>

      {/* Create Team Section */}
      <div className="mt-8">
        <div className="px-4">
          <h3 className="text-foreground text-xl font-display mb-4 text-left">Создавай команду</h3>
          <p className="text-muted-foreground text-base leading-relaxed text-left text-regular">
            Мы выделим тебе бюджет в <span className="text-primary font-medium">100 миллионов</span> — собери команду своей мечты!
          </p>
        </div>

        {/* Scrollable Player Cards */}
        <div className="mt-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-4 pb-2" style={{ width: "max-content" }}>
            {[
              vakulichCard,
              kozlovCard,
              bykovCard,
              karpovichCard,
              khvashchinskyCard,
              gutorCard,
            ].map((cardImg, index) => (
              <img
                key={index}
                src={cardImg}
                alt={`Player ${index + 1}`}
                className="w-40 h-auto rounded-xl flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Score Points Section */}
      <div className="px-4 mt-8 text-left">
        <h3 className="text-foreground text-xl font-display mb-4">Набирай очки</h3>
        <p className="text-muted-foreground text-base leading-relaxed text-regular">
          Каждый игрок на своей позиции получает виртуальные очки за <span className="text-primary font-medium">реальные действия</span> на футбольном поле. Количество очков зависит от амплуа: например, защитник за гол получает 6 очков, а нападающий — 4.
        </p>

        {/* Scoring Example Image */}
        <div className="mt-6">
          <img src={scoringExample} alt="Scoring Example" className="w-full rounded-xl" />
        </div>
      </div>

      {/* Transfer Details Section */}
      <div className="px-4 mt-8 text-left">
        <h3 className="text-foreground text-xl font-display mb-4">Делай трансферы</h3>
        <p className="text-muted-foreground text-base leading-relaxed text-regular">
          Не нравится игрок? Смело отправляй его на скамейку или продавай. Перед каждым туром у тебя есть <span className="text-primary font-medium">2 бесплатных трансфера</span>. Если команда совсем не радует — активируй буст и меняй всех, кого подскажет сердце и интуиция.
        </p>

        {/* Transfer Player Cards with Arrows */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <img 
            src={karpovichTransferCard} 
            alt="Карпович" 
            className="w-32 h-auto rounded-xl flex-shrink-0"
          />
          <img 
            src={swapArrowsPurple} 
            alt="Swap" 
            className="w-8 h-auto flex-shrink-0"
          />
          <img 
            src={vakulichTransferCard} 
            alt="Вакулич" 
            className="w-32 h-auto rounded-xl flex-shrink-0"
          />
        </div>
      </div>

      {/* Compete Section */}
      <div className="px-4 mt-8 text-left">
        <h3 className="text-foreground text-xl font-display mb-4">Соревнуйся</h3>
        <p className="text-muted-foreground text-base leading-relaxed text-regular">
          Играй против других пользователей в общей лиге, <span className="text-primary font-medium">борись с друзьями</span> в частных лигах и выигрывай призы в коммерческих. Мы также добавим тебя в лигу твоего любимого клуба — там свои.
        </p>

        {/* Leaderboard Example Image */}
        <div className="mt-6">
          <img src={leaderboardExample} alt="Leaderboard Example" className="w-full rounded-xl" />
        </div>
      </div>

      {/* Prizes Section */}
      <div className="px-4 mt-8 text-left">
        <h3 className="text-foreground text-xl font-display mb-4">Получай призы</h3>
        <p className="text-muted-foreground text-base leading-relaxed mb-6 text-regular">
          Самые успешные менеджеры получат крутые призы от <span className="text-primary font-medium">Fantasy Sports</span>.
        </p>

        {/* Prize Image */}
        <img src={prizesBanner} alt="Prizes" className="w-full rounded-xl" />
      </div>

      {/* Home Button */}
      {/* <div className="px-4 mb-8">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}

      <FooterNav />
    </div>
  );
};

export default CreateTeam;
