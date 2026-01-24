import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTelegram } from "@/providers/TelegramProvider";
import logo from "@/assets/logo-new.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PROFILE_STORAGE_KEY = "fantasyUserProfile";

interface SportHeaderProps {
  backTo?: string;
  onBackClick?: () => boolean | void; // Return true to prevent default navigation
  hasUnsavedChanges?: boolean;
  onSaveChanges?: () => void;
  onDiscardChanges?: () => void;
}

const SportHeader = ({
  backTo,
  onBackClick,
  hasUnsavedChanges = false,
  onSaveChanges,
  onDiscardChanges,
}: SportHeaderProps = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<"home" | "back" | "profile" | null>(null);
  const { user } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  // Get profile image from localStorage
  const getProfileImage = (): string | null => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const profile = JSON.parse(saved);
        return profile.profileImage || null;
      }
    } catch {
      return null;
    }
    return null;
  };

  const profileImage = getProfileImage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const executeNavigation = (target: "home" | "back" | "profile") => {
    if (target === "home") {
      navigate("/");
    } else if (target === "profile") {
      navigate("/profile");
    } else if (target === "back") {
      if (backTo) {
        navigate(backTo);
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  const handleLogoClick = () => {
    if (isHomePage) return;

    if (hasUnsavedChanges) {
      setPendingNavigation("home");
      setShowUnsavedDialog(true);
    } else {
      navigate("/");
    }
  };

  const handleBack = () => {
    // If onBackClick is provided and returns true, prevent default navigation
    if (onBackClick && onBackClick() === true) {
      return;
    }

    if (hasUnsavedChanges) {
      setPendingNavigation("back");
      setShowUnsavedDialog(true);
    } else {
      executeNavigation("back");
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setPendingNavigation("profile");
      setShowUnsavedDialog(true);
    }
  };

  const handleSave = () => {
    onSaveChanges?.();
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleDiscard = () => {
    onDiscardChanges?.();
    setShowUnsavedDialog(false);
    if (pendingNavigation) {
      executeNavigation(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  return (
    <>
      <header
        className="bg-background sticky top-0 z-50"
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
            <button onClick={handleLogoClick}>
              <img src={logo} alt="Fantasy Sports" className="w-[175px] h-6" />
            </button>
          </div>
          <Link to="/profile" onClick={handleProfileClick}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : user?.photo_url ? (
              <img src={user.photo_url} alt={user.first_name || "User"} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent" />
            )}
          </Link>
        </div>
      </header>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-display">Несохраненные изменения</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-medium">
              У тебя есть несохраненные изменения. Что ты хочешь сделать?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Сохранить
            </AlertDialogAction>
            <AlertDialogAction
              onClick={handleDiscard}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Не сохранять
            </AlertDialogAction>
            <AlertDialogCancel onClick={handleContinueEditing} className="w-full border-border text-foreground">
              Продолжить редактирование
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SportHeader;
