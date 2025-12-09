import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTelegram } from "@/providers/TelegramProvider";
import logo from "@/assets/logo.png";

interface SportHeaderProps {
  backTo?: string;
  onBackClick?: () => boolean | void; // Return true to prevent default navigation
}

const SportHeader = ({ backTo, onBackClick }: SportHeaderProps = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBack = () => {
    // If onBackClick is provided and returns true, prevent default navigation
    if (onBackClick && onBackClick() === true) {
      return;
    }
    
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`bg-background sticky top-0 z-50 transition-opacity duration-300 ${isScrolled ? "opacity-30" : "opacity-100"}`}
    >
      <div className="flex justify-between items-center px-4 pt-3 pb-4">
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <button 
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <button onClick={handleRefresh}>
            <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
          </button>
        </div>
        <Link to="/profile">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={user.first_name || "User"} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          )}
        </Link>
      </div>
    </header>
  );
};

export default SportHeader;
