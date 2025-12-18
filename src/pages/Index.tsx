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
import leagueLogo from "@/assets/league-logo.png";
import iconFootball from "@/assets/icon-football.png";
import iconBasketball from "@/assets/icon-basketball.png";
import iconHockey from "@/assets/icon-hockey.png";
import iconCs2 from "@/assets/icon-cs2.png";

const PROFILE_STORAGE_KEY = "fantasyUserProfile";
const TEAM_PLAYERS_KEY = "fantasyTeamPlayers";
const FAVORITES_STORAGE_KEY = "fantasyFavoriteLeagues";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  // Check if user has a team
  useEffect(() => {
    const teamPlayers = localStorage.getItem(TEAM_PLAYERS_KEY);
    if (teamPlayers) {
      try {
        const parsed = JSON.parse(teamPlayers);
        setHasTeam(Array.isArray(parsed) && parsed.length > 0);
      } catch {
        setHasTeam(false);
      }
    }
  }, []);

  // Check for league invite
  useEffect(() => {
    const storedInvite = localStorage.getItem("fantasyLeagueInvite");
    if (storedInvite) {
      try {
        const invite = JSON.parse(storedInvite);
        setLeagueInviteData(invite);
        setShowLeagueInvite(true);
        // Clear the stored invite
        localStorage.removeItem("fantasyLeagueInvite");
      } catch {
        // Invalid data
      }
    }
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

  const handleJoinLeague = () => {
    if (leagueInviteData) {
      // Add user to league
      const userLeagues = JSON.parse(localStorage.getItem("userJoinedLeagues") || "[]");
      if (!userLeagues.find((l: { id: string }) => l.id === leagueInviteData.leagueId)) {
        userLeagues.push({
          id: leagueInviteData.leagueId,
          name: leagueInviteData.leagueName,
          joinedAt: new Date().toISOString(),
        });
        localStorage.setItem("userJoinedLeagues", JSON.stringify(userLeagues));
      }
      toast.success(`Вы вступили в лигу "${leagueInviteData.leagueName}"`);
      navigate("/league");
    }
  };

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  const sortOptions = ["Избранные", "ТОП-лиги", "От А до Я", "От Я до А"];

  // Define all leagues data for sorting
  const allLeagues = [
    {
      id: "football-belarus",
      title: "Футбол",
      section: "section-football",
      iconImage: iconFootball,
      leagueIcon: leagueLogo,
      league: "Беларусь",
      participants: 26.13,
      date: "04.04",
      time: "19.00",
      glowColor: "120 85% 55%",
      href: "/create-team",
      comingSoon: false,
    },
    {
      id: "basketball",
      title: "Баскетбол",
      section: "section-basketball",
      iconImage: iconBasketball,
      glowColor: "35 85% 55%",
      comingSoon: true,
      comingSoonYear: "2026",
    },
    {
      id: "hockey",
      title: "Хоккей",
      section: "section-hockey",
      iconImage: iconHockey,
      glowColor: "200 85% 55%",
      comingSoon: true,
      comingSoonYear: "2028",
    },
    {
      id: "cs2",
      title: "Counter-Strike 2",
      section: "section-cs2",
      iconImage: iconCs2,
      glowColor: "0 85% 55%",
      comingSoon: true,
      comingSoonYear: "2029",
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
        <h2
          className="text-foreground text-[28px] font-normal leading-[130%] tracking-normal mb-4"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Чемпионаты
        </h2>
      </div>

      <SearchBar />

      <div className="px-4 mt-4">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            style={{
              height: "40px",
              backgroundColor: "#1A1924",
              borderColor: isDropdownOpen ? "rgba(255, 255, 255, 0.2)" : "#2D2B3E",
            }}
          >
            <span
              className="font-medium text-[12px]"
              style={{
                color: isDropdownOpen ? "#FFFFFF" : "#4B485F",
              }}
            >
              {selectedSort}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              style={{
                color: isDropdownOpen ? "#FFFFFF" : "#4B485F",
              }}
            />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

              <div
                className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50"
                style={{
                  backgroundColor: "#1A1924",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-accent/10 ${
                      selectedSort === option ? "font-medium" : ""
                    } ${option !== sortOptions[sortOptions.length - 1] ? "border-b border-border" : ""}`}
                    style={{
                      fontSize: "14px",
                      color: "#FFFFFF",
                      borderBottomColor: "rgba(255, 255, 255, 0.1)",
                    }}
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
            <SportCard
              title={leagueData.title}
              iconImage={leagueData.iconImage}
              leagueIcon={leagueData.leagueIcon}
              league={leagueData.league}
              participants={leagueData.participants}
              userRank={leagueData.id === "football-belarus" && hasTeam ? 21.953 : undefined}
              date={leagueData.date}
              time={leagueData.time}
              glowColor={leagueData.glowColor}
              href={leagueData.href}
              comingSoon={leagueData.comingSoon}
              comingSoonYear={leagueData.comingSoonYear}
              leagueId={leagueData.id}
              isFavorite={favorites.includes(leagueData.id)}
              onToggleFavorite={toggleFavorite}
              hasTeam={leagueData.id === "football-belarus" && hasTeam}
            />
          </div>
        ))}
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
          onJoin={handleJoinLeague}
        />
      )}
    </div>
  );
};

export default Index;
