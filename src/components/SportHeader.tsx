import { MoreVertical, X } from "lucide-react";
import logo from "@/assets/logo.png";

const SportHeader = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 pt-3">
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
        </div>
      </div>
      
      <div className="flex justify-start px-4 pb-3">
        <img src={logo} alt="Fantasy Sports" className="h-12" />
      </div>
    </header>
  );
};

export default SportHeader;
