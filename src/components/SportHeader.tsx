import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTelegram } from "@/providers/TelegramProvider";
import { usersApi, UserProfile } from "@/lib/api";
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

interface SportHeaderProps {
  backTo?: string;
  onBackClick?: () => boolean | void; // Return true to prevent default navigation
  hasUnsavedChanges?: boolean;
  onDiscardChanges?: () => void;
}

const SportHeader = ({
  backTo,
  onBackClick,
  hasUnsavedChanges = false,
  onDiscardChanges,
}: SportHeaderProps = {}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<"home" | "back" | "profile" | null>(null);
  const [backendUser, setBackendUser] = useState<UserProfile | null>(null);
  const { user } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  // Load user profile from backend
  useEffect(() => {
    const loadBackendProfile = async () => {
      try {
        const response = await usersApi.getProtected();
        if (response.success && response.data) {
          const anyData = response.data as any;
          const user = anyData.user as UserProfile | undefined;
          if (user) {
            setBackendUser(user);
          }
        }
      } catch {
        // Silently fail if backend request fails
      }
    };

    void loadBackendProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      void loadBackendProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

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
            {backendUser?.photo_url ? (
              <img src={backendUser.photo_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xl">
                👤
              </div>
            )}
          </Link>
        </div>
      </header>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-display">Несохранённые изменения</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-medium">
              Изменения не сохранены. При выходе они будут потеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogCancel 
              onClick={handleContinueEditing} 
              className="w-full border-border text-foreground bg-secondary hover:bg-secondary/80"
            >
              Остаться
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscard}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SportHeader;
