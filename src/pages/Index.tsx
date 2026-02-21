import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SportHeader from "@/components/SportHeader";
import PromoBanner from "@/components/PromoBanner";
import SearchBar from "@/components/SearchBar";
import CategoryFilter, { categories } from "@/components/CategoryFilter";
import SportCard from "@/components/SportCard";
import FooterNav from "@/components/FooterNav";
import LeagueInviteModal from "@/components/LeagueInviteModal";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { hasCreatedTeam } from "@/lib/onboardingUtils";
import { leaguesApi, customLeaguesApi, squadsApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { usePrefetchLeagueData } from "@/hooks/usePrefetchLeagueData";
import { useDeadline } from "@/hooks/useDeadline";
import leagueLogo from "@/assets/belarus-league-logo.png";
import iconFootball from "@/assets/icon-football.png";
import iconBasketball from "@/assets/icon-basketball.png";
import iconHockey from "@/assets/icon-hockey.png";
import iconCs2 from "@/assets/icon-cs2.png";
import championsLeagueLogo from "@/assets/champions-league-logo-white.png";
import europaLeagueLogo from "@/assets/europa-league-logo.png";
import vtbLeagueLogo from "@/assets/vtb-league-logo.png";
import nbaLogo from "@/assets/nba-logo.png";
import khlLogo from "@/assets/khl-logo.png";
import nhlLogo from "@/assets/nhl-logo.png";
import pglLogo from "@/assets/pgl-logo.png";
import fastcupLogo from "@/assets/fastcup-logo.png";
import eslLogo from "@/assets/esl-logo.png";
import extraligaLogo from "@/assets/extraliga-logo.png";
import aplLogo from "@/assets/apl-logo.png";
import beteraBasketballLogo from "@/assets/betera-basketball-logo.png";
import { Card } from "@/components/ui/card";
//
interface LeagueData {
  id: number;
  name: string;
  logo: string;
  country: string;
  sport: string;
  all_squads_quantity: number;
  your_place: number | null;
  deadline: string | null;
}

const PROFILE_STORAGE_KEY = "fantasyUserProfile";
const FAVORITES_STORAGE_KEY = "fantasyFavoriteLeagues";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { prefetchLeagueData } = usePrefetchLeagueData();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Сначала ТОП-лиги");
  const [showLeagueInvite, setShowLeagueInvite] = useState(false);
  const [leagueInviteData, setLeagueInviteData] = useState<{
    leagueId: string;
    leagueName: string;
    inviter: string;
  } | null>(null);
  const [hasTeam, setHasTeam] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [belarusLeague, setBelarusLeague] = useState<LeagueData | null>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const [alreadyInLeague, setAlreadyInLeague] = useState(false);
  
  // Use deadline hook to get fresh deadline data (same source as other pages)
  const { deadlineDate, hasNextTour } = useDeadline('116');
  // Season is over when API confirmed there is no next tour
  const isSeasonOver = hasNextTour === false;

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = useCallback((leagueId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Scroll detection for active category
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerOffset = 200; // Account for header height

      // Check sections from bottom to top to find the first visible one
      const sectionsToCheck = categories.filter((c) => c.scrollTo).reverse();

      for (const category of sectionsToCheck) {
        if (category.scrollTo) {
          const element = document.getElementById(category.scrollTo);
          if (element) {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY - headerOffset;

            if (scrollY >= elementTop) {
              setActiveCategory(category.id);
              return;
            }
          }
        }
      }

      // If we're at the top, set to "all"
      setActiveCategory("all");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if user has a complete team (15 players)
  useEffect(() => {
    setHasTeam(hasCreatedTeam());
  }, []);

  // Fetch Belarus league data from API and prefetch league page data
  useEffect(() => {
    const fetchLeagueData = async () => {
      setIsLoadingLeague(true);
      try {
        const response = await leaguesApi.getMainPage(116);
        if (response.success && response.data) {
          setBelarusLeague(response.data as LeagueData);
        }
      } catch (error) {
        console.error("Failed to fetch league data:", error);
      } finally {
        setIsLoadingLeague(false);
      }
    };
    fetchLeagueData();

    // Prefetch league data in background for instant navigation
    prefetchLeagueData();
  }, [prefetchLeagueData]);

  // Check for league invite and if user is already in the league
  useEffect(() => {
    const checkLeagueInvite = async () => {
      const storedInvite = localStorage.getItem("fantasyLeagueInvite");
      if (!storedInvite) return;

      try {
        const invite = JSON.parse(storedInvite);
        setLeagueInviteData(invite);

        // Check if user already in this league
        const userLeagueId = parseInt(invite.leagueId, 10);
        if (Number.isFinite(userLeagueId)) {
          const myLeaguesResponse = await customLeaguesApi.getMySquadLeagues();
          if (myLeaguesResponse.success && myLeaguesResponse.data) {
            const isInLeague = myLeaguesResponse.data.some((league: any) => league.user_league_id === userLeagueId);
            setAlreadyInLeague(isInLeague);
          }
        }

        setShowLeagueInvite(true);
        // Don't remove invite here - only remove after successful join or explicit close
      } catch {
        // Invalid data, remove it
        localStorage.removeItem("fantasyLeagueInvite");
      }
    };

    void checkLeagueInvite();
  }, []);

  // Check if this is a referral link and user is already registered
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      // Check if user is already registered
      const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (profileData) {
        try {
          const profile = JSON.parse(profileData);
          if (profile.userName && profile.birthDate) {
            // User is registered, redirect to /create-team
            navigate("/create-team", { replace: true });
          }
        } catch {
          // Invalid profile data, continue normally
        }
      }
    }
  }, [searchParams, navigate]);

  const handleSelect = (option: string) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  };

  const handleJoinLeague = async () => {
    if (!leagueInviteData) return;

    setIsJoiningLeague(true);
    try {
      // Get user's squad
      const squadsResponse = await squadsApi.getMySquads();
      if (!squadsResponse.success || !squadsResponse.data || squadsResponse.data.length === 0) {
        // User doesn't have a team yet — explain and redirect to team creation
        setShowLeagueInvite(false);
        toast.info("Чтобы вступить в лигу, нужно сначала создать команду в Высшей лиге Беларуси", {
          duration: 4000,
        });
        navigate("/create-team");
        return;
      }

      const squadId = squadsResponse.data[0].id;
      const userLeagueId = parseInt(leagueInviteData.leagueId, 10);

      if (!Number.isFinite(userLeagueId)) {
        toast.error("Неверный ID лиги");
        return;
      }

      const response = await customLeaguesApi.joinUserLeague(userLeagueId, squadId);

      if (response.success) {
        // Remove invite from localStorage after successful join
        localStorage.removeItem("fantasyLeagueInvite");
        // Invalidate cache so league list refreshes
        queryClient.invalidateQueries({ queryKey: ["mySquadLeagues"] });
        toast.success(`Вы вступили в лигу "${leagueInviteData.leagueName}"`);
        setShowLeagueInvite(false);
        // Navigate to the league page to show the user they joined
        navigate(`/view-user-league/${userLeagueId}`);
      } else {
        // Check if user is already in the league
        if (response.error && (response.error.includes("уже") || response.error.includes("already"))) {
          // User is already in this league
          localStorage.removeItem("fantasyLeagueInvite");
          toast.success(`Вы уже вступили в лигу по данной ссылке-приглашению`);
          setShowLeagueInvite(false);
          // Navigate to the league page
          navigate(`/view-user-league/${userLeagueId}`);
        } else {
          toast.error(response.error || "Ошибка при вступлении в лигу");
        }
      }
    } catch (error) {
      toast.error("Ошибка при вступлении в лигу");
    } finally {
      setIsJoiningLeague(false);
    }
  };

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  const sortOptions = ["Избранные", "ТОП-лиги", "От А до Я", "От Я до А"];

  // Format deadline from useDeadline hook (always fresh from API)
  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return { date: "—", time: "—" };
    try {
      const day = String(deadline.getDate()).padStart(2, "0");
      const month = String(deadline.getMonth() + 1).padStart(2, "0");
      const hours = String(deadline.getHours()).padStart(2, "0");
      const minutes = String(deadline.getMinutes()).padStart(2, "0");
      return { date: `${day}.${month}`, time: `${hours}.${minutes}` };
    } catch {
      return { date: "—", time: "—" };
    }
  };

  const belarusDeadline = formatDeadline(deadlineDate);

  // Define all leagues data for sorting
  const allLeagues = [
    {
      id: "football-belarus",
      title: "Футбол",
      section: "section-football",
      iconImage: iconFootball,
      leagueIcon: leagueLogo, // Always use local logo, ignore API
      league: belarusLeague?.country || "Беларусь",
      participants: belarusLeague?.all_squads_quantity ?? 0,
      userRank: belarusLeague?.your_place ?? undefined,
      date: belarusDeadline.date,
      time: belarusDeadline.time,
      glowColor: "120 85% 55%",
      href: "/create-team",
      comingSoon: false,
      comingSoonYear: "2026",
      isLoading: isLoadingLeague,
      apiLeagueId: belarusLeague?.id ?? 116, // Fallback to 116 if API fails
    },
    {
      id: "hockey",
      title: "Хоккей",
      section: "section-hockey",
      iconImage: iconHockey,
      glowColor: "200 85% 55%",
      comingSoon: true,
      comingSoonYear: "2026",
      hideCard: true,
    },
    {
      id: "cs2",
      title: "Counter-Strike 2",
      section: "section-cs2",
      iconImage: iconCs2,
      glowColor: "0 85% 55%",
      comingSoon: true,
      comingSoonYear: "2027",
      hideCard: true,
    },
    {
      id: "basketball",
      title: "Баскетбол",
      section: "section-basketball",
      iconImage: iconBasketball,
      glowColor: "35 85% 55%",
      comingSoon: true,
      comingSoonYear: "2027",
      hideCard: true,
    },
  ];

  // Sort leagues based on selected option
  const getSortedLeagues = () => {
    const leagues = [...allLeagues];

    switch (selectedSort) {
      case "Избранные":
        return leagues.sort((a, b) => {
          const aFav = favorites.includes(a.id) ? 1 : 0;
          const bFav = favorites.includes(b.id) ? 1 : 0;
          return bFav - aFav;
        });
      case "От А до Я":
        return leagues.sort((a, b) => a.league?.localeCompare(b.league || a.title) || a.title.localeCompare(b.title));
      case "От Я до А":
        return leagues.sort((a, b) => b.league?.localeCompare(a.league || b.title) || b.title.localeCompare(a.title));
      default:
        return leagues;
    }
  };

  const sortedLeagues = getSortedLeagues();

  return (
    <div className="min-h-screen bg-background">
      <SportHeader />
      <PromoBanner />

      <div className="px-4 mt-6">
        <h2 className="text-foreground text-[24px] font-display font-normal leading-[130%] tracking-normal mb-4">
          Чемпионаты
        </h2>
      </div>

      <div className="px-4 mt-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center justify-between w-full px-4 py-2.5 bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
              isDropdownOpen ? "border-border" : "border-border/50"
            }`}
          >
            <span className={`font-medium text-sm ${isDropdownOpen ? "text-foreground" : "text-muted-foreground"}`}>
              {selectedSort}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180 text-foreground" : "text-muted-foreground"}`}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {sortOptions.map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-secondary ${
                      selectedSort === option ? "text-primary font-medium" : "text-foreground"
                    } ${idx !== sortOptions.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <CategoryFilter activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />

      <div className="mt-6">
        {sortedLeagues.map((leagueData) => (
          <div key={leagueData.id} id={leagueData.section}>
            {leagueData.hideCard ? (
              // Only show header for items with hideCard
              <div className="px-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <img src={leagueData.iconImage} alt={leagueData.title} className="w-7 h-7 object-contain" />
                  <h3 className="text-foreground text-xl font-display">{leagueData.title}</h3>
                </div>
              </div>
            ) : (
              <SportCard
                title={leagueData.title}
                iconImage={leagueData.iconImage}
                leagueIcon={leagueData.leagueIcon}
                league={leagueData.league}
                participants={leagueData.participants}
                userRank={leagueData.userRank}
                date={leagueData.date}
                time={leagueData.time}
                glowColor={leagueData.glowColor}
                href={leagueData.href}
                comingSoon={leagueData.comingSoon}
                comingSoonYear={leagueData.comingSoonYear}
                leagueId={leagueData.id}
                apiLeagueId={"apiLeagueId" in leagueData ? leagueData.apiLeagueId : undefined}
                isFavorite={favorites.includes(leagueData.id)}
                onToggleFavorite={toggleFavorite}
              hasTeam={leagueData.id === "football-belarus" && (hasTeam || (belarusLeague?.your_place !== null && belarusLeague?.your_place !== undefined))}
                isLoading={"isLoading" in leagueData ? leagueData.isLoading : false}
                seasonOver={leagueData.id === "football-belarus" ? isSeasonOver : false}
              />
            )}

            {/* UEFA Leagues Coming Soon - shown after Football Belarus */}
            {leagueData.id === "football-belarus" && (
              <div className="px-4 mb-4">
                <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
                  {/* Blurred league cards container */}
                  <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[180px]">
                    {/* Blurred league cards - stacked like Belarus card */}
                    <div className="opacity-25 blur-[4px] flex flex-col gap-6">
                      {/* Champions League card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={championsLeagueLogo} alt="Champions League" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">Лига Чемпионов</h4>
                          <p className="text-white/50 text-sm">54 230 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">17.09 в 22.00</span>
                          </p>
                        </div>
                      </div>

                      {/* Europa League card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={europaLeagueLogo} alt="Europa League" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">Лига Европы</h4>
                          <p className="text-white/50 text-sm">32 450 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">17.09 в 19.00</span>
                          </p>
                        </div>
                      </div>

                      {/* APL card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={aplLogo} alt="APL" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">АПЛ</h4>
                          <p className="text-white/50 text-sm">67 320 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">16.08 в 15.00</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Overlay text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-foreground text-lg font-normal font-display mb-2">Скоро запустим</p>
                       <p className="text-primary text-lg font-normal font-display">2026</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Basketball Leagues Coming Soon - shown after Basketball */}
            {leagueData.id === "basketball" && (
              <div className="px-4 mb-4">
                <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
                  {/* Blurred league cards container */}
                  <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[180px]">
                    {/* Blurred league cards - stacked like Belarus card */}
                    <div className="opacity-25 blur-[4px] flex flex-col gap-6">
                      {/* VTB League card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={vtbLeagueLogo} alt="VTB League" className="w-16 h-16 object-contain rounded-full" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">Лига ВТБ</h4>
                          <p className="text-white/50 text-sm">18 340 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">15.10 в 20.00</span>
                          </p>
                        </div>
                      </div>

                      {/* NBA card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={nbaLogo} alt="NBA" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">НБА</h4>
                          <p className="text-white/50 text-sm">45 120 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">22.10 в 03.00</span>
                          </p>
                        </div>
                      </div>

                      {/* BETERA Championship card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={beteraBasketballLogo} alt="BETERA" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">BETERA-Чемпионат</h4>
                          <p className="text-white/50 text-sm">12 580 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">01.11 в 19.00</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Overlay text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-foreground text-lg font-normal font-display mb-2">Скоро запустим</p>
                       <p className="text-primary text-lg font-normal font-display">2027</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Hockey Leagues Coming Soon - shown after Hockey */}
            {leagueData.id === "hockey" && (
              <div className="px-4 mb-4">
                <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
                  {/* Blurred league cards container */}
                  <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[180px]">
                    {/* Blurred league cards - stacked like Belarus card */}
                    <div className="opacity-25 blur-[4px] flex flex-col gap-6">
                      {/* Extraliga card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={extraligaLogo} alt="Extraliga" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">Экстралига</h4>
                          <p className="text-white/50 text-sm">8 450 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">25.08 в 18.00</span>
                          </p>
                        </div>
                      </div>

                      {/* KHL card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={khlLogo} alt="KHL" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">КХЛ</h4>
                          <p className="text-white/50 text-sm">21 890 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">01.09 в 19.30</span>
                          </p>
                        </div>
                      </div>

                      {/* NHL card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={nhlLogo} alt="NHL" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">НХЛ</h4>
                          <p className="text-white/50 text-sm">38 760 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">10.10 в 03.00</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Overlay text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-foreground text-lg font-normal font-display mb-2">Скоро запустим</p>
                       <p className="text-primary text-lg font-normal font-display">2026</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* CS2 Leagues Coming Soon - shown after CS2 */}
            {leagueData.id === "cs2" && (
              <div className="px-4 mb-4">
                <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
                  {/* Blurred league cards container */}
                  <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[220px]">
                    {/* Blurred league cards */}
                    <div className="opacity-25 blur-[4px] flex flex-col gap-5">
                      {/* PGL card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={pglLogo} alt="PGL" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">PGL</h4>
                          <p className="text-white/50 text-sm">15 420 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">05.03 в 18.00</span>
                          </p>
                        </div>
                      </div>

                      {/* FASTCUP card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={fastcupLogo} alt="FASTCUP" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">FASTCUP</h4>
                          <p className="text-white/50 text-sm">28 910 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">12.03 в 21.00</span>
                          </p>
                        </div>
                      </div>

                      {/* ESL card */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center">
                          <img src={eslLogo} alt="ESL" className="w-16 h-16 object-contain" />
                        </div>
                        <div className="blur-[1px]">
                          <h4 className="text-white/70 font-bold text-lg">ESL</h4>
                          <p className="text-white/50 text-sm">42 650 участников</p>
                          <p className="text-sm">
                            <span className="text-white/50">Дедлайн: </span>
                            <span className="text-white/60">20.03 в 20.00</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Overlay text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <p className="text-foreground text-lg font-normal font-display mb-2">Скоро запустим</p>
                       <p className="text-primary text-lg font-normal font-display">2027</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Backtest Button */}
      <div className="px-4 mb-8">
        <button
          onClick={() => navigate("/backtest")}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Backtest
        </button>
      </div>

      <FooterNav />

      {/* League Invite Modal */}
      {leagueInviteData && (
        <LeagueInviteModal
          open={showLeagueInvite}
          onOpenChange={setShowLeagueInvite}
          leagueName={leagueInviteData.leagueName}
          inviterName={leagueInviteData.inviter}
          hasTeam={hasTeam}
          isJoining={isJoiningLeague}
          alreadyInLeague={alreadyInLeague}
          onJoin={handleJoinLeague}
        />
      )}
    </div>
  );
};

export default Index;
