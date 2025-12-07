import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTelegram } from "@/providers/TelegramProvider";
import logo from "@/assets/logo.png";

const SportHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useTelegram();

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

  return (
    <header
      className={`bg-background sticky top-0 z-50 transition-opacity duration-300 ${isScrolled ? "opacity-30" : "opacity-100"}`}
    >
      {/* Этот div теперь будет видимым */}
      <div className="flex justify-between items-center px-4 pt-3 pb-4">
        <button onClick={handleRefresh}>
          <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
        </button>
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
