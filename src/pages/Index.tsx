import SportHeader from "@/components/SportHeader";
import PromoBanner from "@/components/PromoBanner";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import SportCard from "@/components/SportCard";
import FooterNav from "@/components/FooterNav";
import { ChevronDown } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SportHeader />
      <PromoBanner />

      <div className="px-4 mt-6">
        <h2 className="text-foreground text-2xl font-bold mb-4">Лиги</h2>
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
          icon="⚽"
          league="Беларусь"
          date="04.04"
          time="19:00"
          glowColor="120 85% 55%"
          href="/create-team"
        />

        <SportCard
          title="Баскетбол"
          icon="🏀"
          comingSoon
          comingSoonYear="2026"
          glowColor="35 85% 55%"
        />

        <SportCard
          title="Хоккей"
          icon="🏒"
          comingSoon
          comingSoonYear="2028"
          glowColor="200 85% 55%"
        />

        <SportCard
          title="Counter-Strike 2"
          icon="🎮"
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
