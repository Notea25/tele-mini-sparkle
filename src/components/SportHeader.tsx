import { X, ChevronDown, MoreHorizontal, Share, RefreshCw, Home, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SportHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href });
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAddToHome = () => {
    alert("Добавьте сайт на главный экран через меню браузера");
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <header className={`bg-background sticky top-0 z-50 transition-opacity duration-300 ${isScrolled ? 'opacity-30' : 'opacity-100'}`}>
      <div className="flex items-center justify-between px-4 pt-3 pb-4">
        <button 
          onClick={handleClose}
          className="flex items-center justify-center gap-1 w-[79px] h-[28px] bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
          <span className="text-foreground font-medium text-sm">Close</span>
        </button>

        <div className="flex items-center bg-secondary/50 rounded-full overflow-hidden w-[74px] h-[28px]">
          <button 
            onClick={handleClose}
            className="flex-1 flex items-center justify-center hover:bg-secondary transition-colors h-full"
          >
            <ChevronDown className="w-6 h-6 text-foreground" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex-1 flex items-center justify-center hover:bg-secondary transition-colors h-full">
                <MoreHorizontal className="w-6 h-6 text-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border-border">
              <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
                <Share className="w-4 h-4" />
                Поделиться
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefresh} className="gap-2 cursor-pointer">
                <RefreshCw className="w-4 h-4" />
                Обновить страницу
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToHome} className="gap-2 cursor-pointer">
                <Home className="w-4 h-4" />
                Добавить на экран "домой"
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                Условия использования
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Shield className="w-4 h-4" />
                Политика конфиденциальности
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 pb-4">
        <button onClick={handleRefresh}>
          <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
        </button>
        <Link to="/profile">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
        </Link>
      </div>
    </header>
  );
};

export default SportHeader;
