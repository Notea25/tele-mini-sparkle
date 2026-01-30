import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, UserPlus, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { Button } from "@/components/ui/button";
import InviteFriendsDrawer from "@/components/InviteFriendsDrawer";
import ImageCropDrawer from "@/components/ImageCropDrawer";
import EditUsernameModal from "@/components/EditUsernameModal";
import { usersApi, UserProfile } from "@/lib/api";


const PROFILE_STORAGE_KEY = "fantasyUserProfile";

interface ProfileData {
  userName: string;
  birthDate: string;
  profileImage: string | null;
  createdAt: string;
}

const getDefaultProfile = (): ProfileData => ({
  userName: "Ричард Хенсон",
  birthDate: "",
  profileImage: null,
  createdAt: new Date().toLocaleDateString("ru-RU"),
});

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [cropDrawerOpen, setCropDrawerOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditUsernameModalOpen, setIsEditUsernameModalOpen] = useState(false);
  
  // Load saved profile
  const [savedProfile, setSavedProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultProfile();
      }
    }
    return getDefaultProfile();
  });

  // Current editable profile state
  const [profile, setProfile] = useState<ProfileData>(savedProfile);

  // Подтягиваем данные пользователя с бэка (имя, дата рождения, дата регистрации)
  useEffect(() => {
    const loadBackendProfile = async () => {
      try {
        const response = await usersApi.getProtected();
        if (response.success && response.data) {
          const anyData = response.data as any;
          const user = anyData.user as UserProfile | undefined;
          if (user) {
            setBackendUser(user);

            const registrationDate = user.registration_date
              ? new Date(user.registration_date).toLocaleDateString("ru-RU")
              : savedProfile.createdAt;

            const birthDateFromBackend = (() => {
              const value = user.birth_date;
              if (!value || typeof value !== "string") return savedProfile.birthDate;
              const parts = value.split("-");
              if (parts.length === 3) {
                const [year, month, day] = parts;
                return `${day}.${month}.${year}`;
              }
              return savedProfile.birthDate;
            })();

            const nameFromBackend = user.username || savedProfile.userName;
            const photoFromBackend = user.photo_url || savedProfile.profileImage;

            const updated: ProfileData = {
              userName: nameFromBackend,
              birthDate: birthDateFromBackend,
              profileImage: photoFromBackend,
              createdAt: registrationDate,
            };

            setSavedProfile(updated);
            setProfile(updated);
          }
        }
      } catch {
        // Если запрос не удался, просто остаёмся на локальном профиле
      }
    };

    void loadBackendProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if there are unsaved changes (only image now, username is edited via modal)
  const hasUnsavedChanges = 
    profile.profileImage !== savedProfile.profileImage;

  // Save username changes to backend
  const handleSaveUsername = async (newUsername: string) => {
    if (!backendUser) {
      toast.error("Пользователь не найден");
      throw new Error("No user");
    }

    const response = await usersApi.update(backendUser.id, {
      username: newUsername,
    });

    if (!response.success) {
      toast.error("Не удалось сохранить имя");
      throw new Error("Update failed");
    }

    const updatedUser = (response.data as any)?.user as UserProfile | undefined;
    if (updatedUser) {
      setBackendUser(updatedUser);
    }

    const updatedProfile = { ...profile, userName: newUsername };
    setProfile(updatedProfile);
    setSavedProfile(updatedProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    
    toast.success("Имя пользователя обновлено");
    window.dispatchEvent(new Event('profileUpdated'));
  };

  // Save image changes to backend and localStorage
  const handleSaveChanges = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      if (backendUser && profile.profileImage !== savedProfile.profileImage) {
        const response = await usersApi.update(backendUser.id, {
          photo_url: profile.profileImage,
        });

        if (!response.success) {
          toast.error("Не удалось сохранить фото");
          return;
        }

        const updatedUser = (response.data as any)?.user as UserProfile | undefined;
        if (updatedUser) {
          setBackendUser(updatedUser);
        }
      }

      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      setSavedProfile(profile);
      toast.success("Фото обновлено");
      
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error("Profile save failed", error);
      toast.error("Ошибка при сохранении фото");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setProfile(savedProfile);
  };


  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выбери изображение");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Open crop drawer instead of directly setting image
      setTempImageSrc(base64);
      setCropDrawerOpen(true);
    };
    reader.onerror = () => {
      toast.error("Ошибка при загрузке изображения");
    };
    reader.readAsDataURL(file);
    
    // Reset file input so the same file can be selected again
    e.target.value = "";
  };

  const handleCropComplete = (croppedImage: string) => {
    setProfile(prev => ({ ...prev, profileImage: croppedImage }));
    setTempImageSrc(null);
  };

  const handleCropClose = () => {
    setCropDrawerOpen(false);
    setTempImageSrc(null);
  };

  const handleRemoveImage = () => {
    setProfile(prev => ({ ...prev, profileImage: null }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SportHeader 
        hasUnsavedChanges={hasUnsavedChanges}
        onDiscardChanges={handleDiscardChanges}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />


      <div className="px-4 space-y-6">
        {/* Profile Header Section */}
        <div className="flex items-start gap-4">
          {/* Profile Image with Edit Button */}
          <div className="relative">
            <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 overflow-hidden">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
            </div>
            {/* Edit button */}
            <button 
              onClick={handleImageClick}
              className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border border-border shadow-lg hover:bg-secondary transition-colors"
            >
              <Pencil className="w-4 h-4 text-foreground" />
            </button>
            {/* Remove button - only show when there's an image */}
            {profile.profileImage && (
              <button 
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center shadow-lg hover:opacity-80 transition-opacity"
              >
                <X className="w-3 h-3 text-destructive-foreground" />
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display text-foreground">{profile.userName || "Не указано"}</h1>
              <Pencil
                className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setIsEditUsernameModalOpen(true)}
              />
            </div>
            {backendUser?.tg_username && (
              <span className="text-muted-foreground text-sm text-regular">@{backendUser.tg_username}</span>
            )}
            <span className="text-muted-foreground text-sm mt-1 text-regular">Создан {profile.createdAt}</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-foreground text-medium">Дата рождения</label>
            <input
              type="text"
              value={profile.birthDate}
              readOnly
              disabled
              placeholder="12.12.2000"
              className="w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none placeholder:text-[#4B485F] opacity-70 cursor-not-allowed"
              style={{
                borderColor: "#363546",
                color: profile.birthDate ? "#FFFFFF" : "#4B485F",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            />
          </div>

          {/* Save Changes Button - only visible when there are changes */}
          {hasUnsavedChanges && (
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-lg h-12 shadow-neon disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          )}

          {/* Invite Friends Button */}
          <Button
            onClick={() => setInviteDrawerOpen(true)}
            variant={hasUnsavedChanges ? "outline" : "default"}
            className={`w-full font-semibold rounded-lg h-12 flex items-center justify-center gap-2 ${
              hasUnsavedChanges 
                ? "border-border text-foreground hover:bg-secondary" 
                : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
            }`}
          >
            <UserPlus className="w-5 h-5" />
            Пригласить друзей
          </Button>

          {/* Feedback Button */}
          <Button
            asChild
            variant="outline"
            className="w-full font-semibold rounded-lg h-12 flex items-center justify-center gap-2 border-border text-foreground hover:bg-secondary"
          >
            <a 
              href="https://t.me/aplbyfeedback" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              Обратная связь
            </a>
          </Button>
        </div>
      </div>

      {/* Invite Friends Drawer */}
      <InviteFriendsDrawer 
        open={inviteDrawerOpen} 
        onOpenChange={setInviteDrawerOpen}
      />

      {/* Home Button */}
      {/* <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/")}
          className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
        >
          На главную
        </button>
      </div> */}

      {/* Edit Username Modal */}
      <EditUsernameModal
        isOpen={isEditUsernameModalOpen}
        onClose={() => setIsEditUsernameModalOpen(false)}
        currentName={profile.userName}
        onSave={handleSaveUsername}
      />

      {/* Image Crop Drawer */}
      {tempImageSrc && (
        <ImageCropDrawer
          isOpen={cropDrawerOpen}
          onClose={handleCropClose}
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default Profile;
