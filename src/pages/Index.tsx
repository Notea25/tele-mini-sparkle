import SportHeader from "@/components/SportHeader";
import PromoBanner from "@/components/PromoBanner";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import SportCard from "@/components/SportCard";
import FooterNav from "@/components/FooterNav";
import { ChevronDown } from "lucide-react";
import leagueLogo from "@/assets/league-logo.png";
import footballIcon from "@/assets/football-icon.png";
import basketballIcon from "@/assets/basketball-icon.png";
import hockeyIcon from "@/assets/hockey-icon.png";
import csgoIcon from "@/assets/csgo-icon.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SportHeader />
      <PromoBanner />

      {/* <div className="px-4 mt-6">
        <h2 className="text-foreground text-2xl font-bold mb-4">Чемпионаты</h2>
      </div> */}
      <div className="px-4 mt-6">
        <h2
          className="text-foreground text-[28px] font-normal leading-[130%] tracking-normal mb-4"
          style={{ fontFamily: "Unbounded, sans-serif" }}
        >
          Чемпионаты
        </h2>
      </div>

      <SearchBar />

      <div className="px-4 mt-4 flex items-center justify-between">
        <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <span className="font-medium">Сначала топ лиги</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <CategoryFilter />

      <div className="mt-6">
        <SportCard
          title="Футбол"
          iconImage={footballIcon}
          leagueIcon={leagueLogo}
          league="Беларусь"
          date="04.04"
          time="19:00"
          glowColor="120 85% 55%"
          href="/create-team"
        />

        <SportCard
          title="Баскетбол"
          iconImage={basketballIcon}
          comingSoon
          comingSoonYear="2026"
          glowColor="35 85% 55%"
        />

        <SportCard title="Хоккей" iconImage={hockeyIcon} comingSoon comingSoonYear="2028" glowColor="200 85% 55%" />

        <SportCard
          title="Counter-Strike 2"
          iconImage={csgoIcon}
          comingSoon
          comingSoonYear="2029"
          glowColor="0 85% 55%"
        />
      </div>

      <FooterNav />
    </div>
  );
};

export default Index;
