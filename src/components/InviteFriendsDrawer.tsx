import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface InviteFriendsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

const InviteFriendsDrawer = ({ open, onOpenChange, userId = "user231" }: InviteFriendsDrawerProps) => {
  // Telegram mini app referral link
  const inviteLink = `https://t.me/fantasyby_bot?startapp=ref_${userId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-t border-border">
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-xl font-display text-foreground">
            Пригласить друзей
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground">QR</span>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={inviteLink} 
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Invite Link Section */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Ссылка приглашения</span>
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
              <span className="flex-1 text-foreground text-sm truncate">
                {inviteLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-lg py-6 font-semibold bg-primary text-primary-foreground"
          >
            Закрыть
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default InviteFriendsDrawer;
