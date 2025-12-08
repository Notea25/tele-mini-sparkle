// import { Button } from "@/components/ui/button";

// const categories = [
//   { id: "all", label: "Все лиги", icon: "⚡" },
//   { id: "football", label: "Футбол", icon: "⚽" },
//   { id: "basketball", label: "Баскетбол", icon: "🏀" },
//   { id: "cs2", label: "Counter-Strike 2", icon: "🎯" },
// ];

// const CategoryFilter = () => {
//   return (
//     <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//       {categories.map((category) => (
//         <Button
//           key={category.id}
//           variant={category.id === "all" ? "default" : "secondary"}
//           className={`flex items-center gap-2 rounded-full whitespace-nowrap px-4 h-10 ${
//             category.id !== "all" ? "border border-[#363546] bg-[#1D1C25]" : ""
//           }`}
//         >
//           <span className="text-[20px] w-5 h-5 flex items-center justify-center">{category.icon}</span>
//           <span className="text-[12px] font-medium text-[#6D6A88]">{category.label}</span>
//         </Button>
//       ))}
//     </div>
//   );
// };

// export default CategoryFilter;
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", label: "Все лиги", icon: "⚡" },
  { id: "football", label: "Футбол", icon: "⚽" },
  { id: "basketball", label: "Баскетбол", icon: "🏀" },
  { id: "hockey", label: "Хоккей", icon: "🏒" },
  { id: "dota2", label: "Dota 2", icon: "🎮" },
  { id: "cs2", label: "Counter-Strike 2", icon: "🎯" },
];

const CategoryFilter = () => {
  return (
    <div
      className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2"
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
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
          >
            <span className="text-[20px] w-5 h-5 flex items-center justify-center">{category.icon}</span>
            <span className="text-[12px] font-medium text-[#6D6A88]">{category.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
