import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import SportHeader from "@/components/SportHeader";

import InfiniteClubCarousel from "@/components/InfiniteClubCarousel";
import { useState, useMemo, useRef } from "react";
import { Filter } from "bad-words";
import { toast } from "sonner";
import bannerBg from "@/assets/beterra-banner-bg-2.webp";
import createTeamBannerLogo from "@/assets/create-team-banner-logo.png";
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

// Player card images for carousel
import playerVakulich from "@/assets/player-vakulich.png";
import playerKozlovCard from "@/assets/player-kozlov-card.png";
import playerBykovCard from "@/assets/player-bykov-card.png";
import playerKarpovich from "@/assets/player-karpovich.png";
import playerKhvashchinsky from "@/assets/player-khvashchinsky.png";
import playerGutor from "@/assets/player-gutor.png";

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

      {/* Hero Banner с подложкой для bannerBg и текста */}
      <div className="relative mt-6">
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
          <div className="text-white font-unbounded font-normal not-italic text-[28px] leading-[130%] tracking-[0%]">
            Создавай свою команду <br />в Высшей лиге <br />
            Беларуси
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
            {TEAM_OPTIONS.map((option) => (
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
            ))}
          </SelectContent>
        </Select>

        {/* Create Team Button */}
        <Button
          ref={buttonRef}
          onClick={validateAndNavigate}
          disabled={!isFormValid}
          className="w-full h-[44px] font-rubik text-[16px] font-bold bg-primary hover:bg-primary/90 text-[#212121] disabled:opacity-50 disabled:cursor-not-allowed rounded-[24px]"
          style={{ boxShadow: isFormValid ? "0 0 20px hsl(var(--primary) / 0.5)" : "none" }}
        >
          Создать команду
        </Button>
        <InfiniteClubCarousel />
      </div>

      {/* Create Team Section */}
      <div className="mt-8 text-center">
        <div className="px-4">
          <h3 className="text-foreground text-3xl font-bold mb-4">Создавай команду</h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            Мы выделим тебе бюджет в <span className="text-primary font-semibold">100 миллионов</span> — собери команду своей мечты!
          </p>
        </div>

        {/* Scrollable Player Cards */}
        <div className="mt-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-4 pb-2" style={{ width: "max-content" }}>
            {[
              playerVakulich,
              playerKozlovCard,
              playerBykovCard,
              playerKarpovich,
              playerKhvashchinsky,
              playerGutor,
            ].map((playerImg, index) => (
              <img
                key={index}
                src={playerImg}
                alt={`Player ${index + 1}`}
                className="w-40 h-auto rounded-xl flex-shrink-0"
              />
            ))}
          </div>
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
