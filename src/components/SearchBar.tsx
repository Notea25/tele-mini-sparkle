import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  return (
    <div className="px-4 mt-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск"
          className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
};

export default SearchBar;
