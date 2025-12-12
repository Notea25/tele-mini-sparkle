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
const TEAM_DATA_KEY = "fantasyTeamData";

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

  const sortOptions = ["Избранные", "Сначала ТОП-лиги", "От А до Я", "От Я до А"];

  // Scroll detection for active category
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerOffset = 200; // Account for header height
      
      // Check sections from bottom to top to find the first visible one
      const sectionsToCheck = categories.filter(c => c.scrollTo).reverse();
      
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
    const teamData = localStorage.getItem(TEAM_DATA_KEY);
    if (teamData) {
      try {
        const parsed = JSON.parse(teamData);
        setHasTeam(parsed.selectedPlayers && parsed.selectedPlayers.length > 0);
      } catch {
        setHasTeam(false);
      }
    }
  }, []);

  // Check for league invite
  useEffect(() => {
    const storedInvite = localStorage.getItem('fantasyLeagueInvite');
    if (storedInvite) {
      try {
        const invite = JSON.parse(storedInvite);
        setLeagueInviteData(invite);
        setShowLeagueInvite(true);
        // Clear the stored invite
        localStorage.removeItem('fantasyLeagueInvite');
      } catch {
        // Invalid data
      }
    }
  }, []);

  // Check if this is a referral link and user is already registered
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      // Check if user is already registered
      const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (profileData) {
        try {
          const profile = JSON.parse(profileData);
          if (profile.userName && profile.birthDate) {
            // User is registered, redirect to /create-team
            navigate('/create-team', { replace: true });
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
      const userLeagues = JSON.parse(localStorage.getItem('userJoinedLeagues') || '[]');
      if (!userLeagues.find((l: { id: string }) => l.id === leagueInviteData.leagueId)) {
        userLeagues.push({
          id: leagueInviteData.leagueId,
          name: leagueInviteData.leagueName,
          joinedAt: new Date().toISOString()
        });
        localStorage.setItem('userJoinedLeagues', JSON.stringify(userLeagues));
      }
      toast.success(`Вы вступили в лигу "${leagueInviteData.leagueName}"`);
      navigate('/league');
    }
  };

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

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
              className="font-medium"
              style={{
                fontSize: "14px",
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
        <div id="section-football">
          <SportCard
            title="Футбол"
            iconImage={iconFootball}
            leagueIcon={leagueLogo}
            league="Беларусь"
            participants={26130}
            date="04.04"
            time="19.00"
            glowColor="120 85% 55%"
            href="/create-team"
          />
        </div>

        <div id="section-basketball">
          <SportCard
            title="Баскетбол"
            iconImage={iconBasketball}
            comingSoon
            comingSoonYear="2026"
            glowColor="35 85% 55%"
          />
        </div>

        <div id="section-hockey">
          <SportCard 
            title="Хоккей" 
            iconImage={iconHockey} 
            comingSoon 
            comingSoonYear="2028" 
            glowColor="200 85% 55%" 
          />
        </div>

        <div id="section-cs2">
          <SportCard
            title="Counter-Strike 2"
            iconImage={iconCs2}
            comingSoon
            comingSoonYear="2029"
            glowColor="0 85% 55%"
          />
        </div>
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
