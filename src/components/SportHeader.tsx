import { MoreVertical, X, Check } from "lucide-react";
import logo from "@/assets/logo.png";

const SportHeader = () => {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 pt-3 pb-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-full transition-colors">
          <X className="w-5 h-5 text-foreground" />
          <span className="text-foreground font-medium">Close</span>
        </button>

        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-secondary/50 hover:bg-secondary rounded-full transition-colors">
            <Check className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2.5 bg-secondary/50 hover:bg-secondary rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
        </div>
      </div>
      
      <div className="flex justify-start px-4 pb-4">
        <img src={logo} alt="Fantasy Sports" className="h-12" />
      </div>
    </header>
  );
};

export default SportHeader;
