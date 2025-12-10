import { Button } from "@/components/ui/button";
import iconCup from "@/assets/icon-cup.png";
import iconFootball from "@/assets/icon-football.png";
import iconHockey from "@/assets/icon-hockey.png";
import iconBasketball from "@/assets/icon-basketball.png";
import iconCs2 from "@/assets/icon-cs2.png";

const categories = [
  { id: "all", label: "Все лиги", icon: iconCup, scrollTo: null },
  { id: "football", label: "Футбол", icon: iconFootball, scrollTo: "section-football" },
  { id: "basketball", label: "Баскетбол", icon: iconBasketball, scrollTo: "section-basketball" },
  { id: "hockey", label: "Хоккей", icon: iconHockey, scrollTo: "section-hockey" },
  { id: "cs2", label: "Counter-Strike 2", icon: iconCs2, scrollTo: "section-cs2" },
];

const CategoryFilter = () => {
  const handleClick = (scrollTo: string | null) => {
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
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={category.id === "all" ? "default" : "secondary"}
            className={`flex items-center gap-2 rounded-full whitespace-nowrap px-4 h-10 ${
              category.id !== "all" ? "border border-[#363546] bg-[#1D1C25]" : ""
            }`}
            onClick={() => handleClick(category.scrollTo)}
          >
            <img src={category.icon} alt={category.label} className="w-5 h-5 object-contain" />
            <span className="text-[12px] font-medium text-[#6D6A88]">{category.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
