import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocusChange?: (focused: boolean) => void;
}

const SearchBar = ({ value, onChange, onFocusChange }: SearchBarProps) => {
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsActive(true);
    onFocusChange?.(true);
    // Scroll input into view when keyboard appears
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleBlur = () => {
    setIsActive(false);
    onFocusChange?.(false);
  };

  const handleClear = () => {
    onChange?.("");
    inputRef.current?.focus();
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
          className={`pl-11 pr-10 text-[12px] h-10 transition-colors duration-200 ${
            isActive ? "text-white placeholder:text-white/70" : "text-foreground placeholder:text-[#4B485F]"
          }`}
          style={{
            backgroundColor: "#1A1924",
            borderColor: isActive ? "rgba(255, 255, 255, 0.2)" : "#2D2B3E",
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {value && value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
