import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const SearchBar = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="px-4 mt-4">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            isActive ? "text-white" : "text-[#4B485F]"
          }`}
        />
        <Input
          placeholder="Поиск"
          className={`pl-11 text-[12px] h-10 transition-colors duration-200 ${
            isActive ? "text-white placeholder:text-white/70" : "text-foreground placeholder:text-[#4B485F]"
          }`}
          style={{
            backgroundColor: "#1A1924",
            borderColor: isActive ? "rgba(255, 255, 255, 0.2)" : "#2D2B3E",
          }}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
