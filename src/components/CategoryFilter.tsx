import { Button } from "@/components/ui/button";
import iconCup from "@/assets/icon-cup.png";
import iconFootball from "@/assets/icon-football.png";
import iconHockey from "@/assets/icon-hockey.png";
import iconBasketball from "@/assets/icon-basketball.png";
import iconCs2 from "@/assets/icon-cs2.png";

export const categories = [
  { id: "all", label: "Все лиги", icon: iconCup, scrollTo: null },
  { id: "football", label: "Футбол", icon: iconFootball, scrollTo: "section-football" },
  { id: "hockey", label: "Хоккей", icon: iconHockey, scrollTo: "section-hockey" },
  { id: "cs2", label: "Counter-Strike 2", icon: iconCs2, scrollTo: "section-cs2" },
  { id: "basketball", label: "Баскетбол", icon: iconBasketball, scrollTo: "section-basketball" },
];

interface CategoryFilterProps {
  activeCategory?: string;
  onCategoryClick?: (categoryId: string) => void;
}

const CategoryFilter = ({ activeCategory = "all", onCategoryClick }: CategoryFilterProps) => {
  const handleClick = (categoryId: string, scrollTo: string | null) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }

    if (scrollTo) {
      const element = document.getElementById(scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="hide-scrollbar flex gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "secondary"}
              className={`flex items-center gap-2 rounded-xl whitespace-nowrap px-4 h-10 ${
                !isActive ? "border border-[#363546] bg-[#1D1C25]" : ""
              }`}
              onClick={() => handleClick(category.id, category.scrollTo)}
            >
              <img src={category.icon} alt={category.label} className={`w-5 h-5 object-contain ${isActive ? "brightness-0 invert" : ""}`} />
              <span className={`text-[12px] font-medium ${isActive ? "text-primary-foreground" : "text-[#6D6A88]"}`}>
                {category.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
