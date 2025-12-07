// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";

// const categories = [
//   { id: "all", label: "Все лиги", icon: "⚡" },
//   { id: "football", label: "Футбол", icon: "⚽" },
//   { id: "basketball", label: "Баскетбол", icon: "🏀" },
//   { id: "Counter-Strike 2", label: "Counter-Strike 2", icon: "🏀" },
// ];

// const CategoryFilter = () => {
//   return (
//     <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//       {categories.map((category) => (
//         <Button
//           key={category.id}
//           variant={category.id === "all" ? "default" : "secondary"}
//           className={`flex items-center gap-2 rounded-full whitespace-nowrap ${
//             category.id === "all"
//               ? "bg-primary text-primary-foreground hover:bg-primary/90"
//               : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
//           }`}
//         >
//           <span>{category.icon}</span>
//           <span>{category.label}</span>
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
  { id: "cs2", label: "Counter-Strike 2", icon: "🎯" },
];

const CategoryFilter = () => {
  return (
    <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={category.id === "all" ? "default" : "secondary"}
          className="flex items-center gap-2 rounded-full whitespace-nowrap h-8 px-3"
        >
          <span className="text-[20px] w-5 h-5 flex items-center justify-center">{category.icon}</span>
          <span className="text-[12px] font-medium" style={{ color: "#6D6A88" }}>
            {category.label}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
