import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

interface LeagueInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueName: string;
  inviterName: string;
  hasTeam: boolean;
  isJoining?: boolean;
  alreadyInLeague?: boolean;
  onJoin: () => void;
}

const LeagueInviteModal = ({ 
  open, 
  onOpenChange, 
  leagueName, 
  inviterName, 
  hasTeam,
  isJoining = false,
  alreadyInLeague = false,
  onJoin 
}: LeagueInviteModalProps) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onOpenChange(false);
    // Clear the invite from localStorage when user explicitly closes
    localStorage.removeItem("fantasyLeagueInvite");
    // Clear the invite from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('leagueInvite');
    url.searchParams.delete('inviter');
    window.history.replaceState({}, '', url.toString());
  };

  const handleAction = () => {
    if (hasTeam) {
      // User has a team, join the league
      onJoin();
    } else {
      // User needs to create a team first
      onOpenChange(false);
      navigate('/create-team');
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-secondary border-t border-border rounded-t-3xl">
        <div className="px-6 py-8 space-y-6 text-center">
          {alreadyInLeague ? (
            // Already in league state
            <>
              <h2 
                className="text-2xl font-bold text-foreground italic"
                style={{ fontFamily: "Unbounded, sans-serif" }}
              >
                {leagueName}
              </h2>

              <p className="text-muted-foreground text-lg">
                Вы уже вступили в данную лигу
              </p>

              <Button
                onClick={handleClose}
                className="w-full rounded-full h-14 bg-primary text-primary-foreground text-lg"
              >
                OK
              </Button>
            </>
          ) : (
            // Normal invite state
            <>
              <h2 
                className="text-2xl font-bold text-foreground italic"
                style={{ fontFamily: "Unbounded, sans-serif" }}
              >
                Добро пожаловать в {leagueName}
              </h2>

              <p className="text-muted-foreground">
                Пользователь @{inviterName}
                <br />
                приглашает тебя вступить в частную лигу
              </p>

              {!hasTeam && (
                <p className="text-muted-foreground">
                  Для того, чтобы вступить в лигу, необходимо создать
                  <br />
                  команду в Высшей лиге Беларуси
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1 rounded-full h-14 border-border text-foreground hover:bg-background text-lg"
                >
                  Закрыть
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={isJoining}
                  className="flex-1 rounded-full h-14 bg-primary text-primary-foreground text-lg"
                >
                  {isJoining ? "Вступление..." : hasTeam ? "Вступить" : "Создать команду"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default LeagueInviteModal;
