import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsActive(true);
    // Scroll input into view when keyboard appears
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="px-4 mt-4">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            isActive ? "text-white" : "text-[#4B485F]"
          }`}
        />
        <Input
          ref={inputRef}
          placeholder="Поиск"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`pl-11 text-[12px] h-10 transition-colors duration-200 ${
            isActive ? "text-white placeholder:text-white/70" : "text-foreground placeholder:text-[#4B485F]"
          }`}
          style={{
            backgroundColor: "#1A1924",
            borderColor: isActive ? "rgba(255, 255, 255, 0.2)" : "#2D2B3E",
          }}
          onFocus={handleFocus}
          onBlur={() => setIsActive(false)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
