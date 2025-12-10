import SportHeader from "@/components/SportHeader";
import PromoBanner from "@/components/PromoBanner";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import SportCard from "@/components/SportCard";
import FooterNav from "@/components/FooterNav";
import { ChevronDown } from "lucide-react";
import leagueLogo from "@/assets/league-logo.png";
import iconFootball from "@/assets/icon-football.png";
import iconBasketball from "@/assets/icon-basketball.png";
import iconHockey from "@/assets/icon-hockey.png";
import iconCs2 from "@/assets/icon-cs2.png";
import { useState } from "react";

const Index = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Сначала ТОП-лиги");

  const sortOptions = ["Избранные", "Сначала ТОП-лиги", "От А до Я", "От Я до А"];

  const handleSelect = (option: string) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  };

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

      <CategoryFilter />

      <div className="mt-6">
        <div id="section-football">
          <SportCard
            title="Футбол"
            iconImage={iconFootball}
            leagueIcon={leagueLogo}
            league="Беларусь"
            date="04.04"
            time="19:00"
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
    </div>
  );
};

export default Index;
