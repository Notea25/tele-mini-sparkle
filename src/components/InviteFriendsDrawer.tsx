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
      <DrawerContent className="bg-secondary border-t border-border rounded-t-3xl">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-2xl font-display text-foreground">
            Пригласить друзей
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-8 space-y-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-muted-foreground text-sm">QR</span>
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG 
                value={inviteLink} 
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Invite Link Section */}
          <div className="space-y-2">
            <span className="text-foreground text-sm">Ссылка приглашения</span>
            <div 
              onClick={handleCopyLink}
              className="flex items-center justify-between bg-background rounded-xl px-4 py-3 cursor-pointer hover:bg-background/80 transition-colors"
            >
              <span className="text-muted-foreground text-sm truncate pr-2">
                {inviteLink}
              </span>
              <Copy className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full rounded-lg h-12 border-border text-foreground hover:bg-background"
          >
            Закрыть
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default InviteFriendsDrawer;
