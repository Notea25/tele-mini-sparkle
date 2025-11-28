import { Instagram, MessageCircle, Youtube } from "lucide-react";

const FooterNav = () => {
  return (
    <footer className="mt-8 pb-8 px-4">
      <div className="flex justify-center items-center gap-2 mb-6">
        <span className="text-primary text-2xl italic font-bold">f</span>
        <span className="text-foreground text-lg font-bold">FANTASY SPORTS</span>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center">
          <Instagram className="w-5 h-5 text-foreground" />
        </button>
        <button className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-foreground" />
        </button>
        <button className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center">
          <Youtube className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="text-center text-muted-foreground text-xs space-y-1">
        <p>Fantasy sports · Cookie files</p>
        <p>Политика конфиденциальности</p>
      </div>
    </footer>
  );
};

export default FooterNav;
