import { Menu, MoreVertical, X } from "lucide-react";

const SportHeader = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
      <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
        <X className="w-5 h-5 text-foreground" />
      </button>
      
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold">
          <span className="text-primary italic">f</span>
          <span className="text-foreground"> FANTASY </span>
          <span className="text-primary font-black">SPORTS</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
      </div>
    </header>
  );
};

export default SportHeader;
