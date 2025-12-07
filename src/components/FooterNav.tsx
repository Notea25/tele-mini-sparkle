import { Instagram, Send, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const FooterNav = () => {
  return (
    <footer className="mt-8 pb-8 px-4">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="Fantasy Sports" className="h-8" />
      </div>

      <div className="flex justify-center gap-6">
        <button className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center">
          <Instagram className="w-6 h-6 text-foreground" />
        </button>
        <button className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center">
          <Send className="w-6 h-6 text-foreground" />
        </button>
        <button className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center">
          <Youtube className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </footer>
  );
};

export default FooterNav;
