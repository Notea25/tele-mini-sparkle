import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { usersApi } from "@/lib/api";
import type { UserReferrer, UserReferral, UserReferralsResponse } from "@/lib/api";
import { toast } from "sonner";

interface ReferralStatsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

const ReferralStatsDrawer = ({ open, onOpenChange, userId }: ReferralStatsDrawerProps) => {
  const [referrer, setReferrer] = useState<UserReferrer | null>(null);
  const [referralsData, setReferralsData] = useState<UserReferralsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, currentPage]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load referrer info
      const referrerResponse = await usersApi.getReferrer(userId);
      if (referrerResponse.success && referrerResponse.data) {
        setReferrer(referrerResponse.data);
      } else {
        setReferrer(null);
      }

      // Load referrals list
      const referralsResponse = await usersApi.getReferrals(userId, currentPage, pageSize);
      if (referralsResponse.success && referralsResponse.data) {
        setReferralsData(referralsResponse.data);
      } else {
        setReferralsData(null);
      }
    } catch (error) {
      console.error("Failed to load referral stats:", error);
      toast.error("Не удалось загрузить статистику приглашений");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = referralsData ? Math.ceil(referralsData.total / pageSize) : 1;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background border-border max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4 relative">
          <DrawerTitle className="text-xl font-display text-foreground text-center">
            Статистика приглашений
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Загрузка...
            </div>
          ) : (
            <>
              {/* Referrer section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Пригласивший пользователь
                </h3>
                <div className="bg-card rounded-lg p-4 border border-border">
                  {referrer ? (
                    <p className="text-base font-medium">{referrer.username}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет данных</p>
                  )}
                </div>
              </div>

              {/* Referrals section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Приглашенные пользователи ({referralsData?.total || 0})
                </h3>
                
                {referralsData && referralsData.referrals.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {referralsData.referrals.map((referral: UserReferral) => (
                        <div
                          key={referral.id}
                          className="bg-card rounded-lg p-3 border border-border"
                        >
                          <p className="text-base font-medium">{referral.username}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 pt-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="h-9 w-9"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-sm text-muted-foreground">
                          Страница {currentPage} из {totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="h-9 w-9"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-card rounded-lg p-8 border border-border text-center">
                    <p className="text-sm text-muted-foreground">
                      Вы еще никого не пригласили
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReferralStatsDrawer;
