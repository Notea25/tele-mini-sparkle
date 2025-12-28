import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { Button } from "@/components/ui/button";
import InviteFriendsDrawer from "@/components/InviteFriendsDrawer";
import homeIcon from "@/assets/home-icon.png";

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

  // Check if there are unsaved changes
  const hasUnsavedChanges = 
    profile.userName !== savedProfile.userName || 
    profile.profileImage !== savedProfile.profileImage;

  // Save changes to localStorage
  const handleSaveChanges = () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setSavedProfile(profile);
    toast.success("Изменения сохранены");
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setProfile(savedProfile);
  };

  const handleHomeClick = () => {
    navigate("/");
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
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfile(prev => ({ ...prev, profileImage: base64 }));
    };
    reader.onerror = () => {
      toast.error("Ошибка при загрузке изображения");
    };
    reader.readAsDataURL(file);
  };

  const handleUserNameChange = (value: string) => {
    setProfile(prev => ({ ...prev, userName: value.slice(0, 15) }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SportHeader 
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveChanges={handleSaveChanges}
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

      {/* Breadcrumb */}
      <div className="px-4 py-3 flex items-center gap-2 text-sm">
        <button onClick={handleHomeClick}>
          <img src={homeIcon} alt="Home" className="w-5 h-5" />
        </button>
        <span className="text-muted-foreground">▸</span>
        <span className="text-muted-foreground">Профиль</span>
      </div>

      <div className="px-4 space-y-6">
        {/* Profile Header Section */}
        <div className="flex items-start gap-4">
          {/* Profile Image with Edit Button */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 overflow-hidden">
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
            <button 
              onClick={handleImageClick}
              className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border border-border shadow-lg hover:bg-secondary transition-colors"
            >
              <Pencil className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex flex-col pt-2">
            <h1 className="text-2xl font-bold text-foreground">{profile.userName}</h1>
            <span className="text-muted-foreground text-sm">@riches</span>
            <span className="text-muted-foreground text-sm mt-1">Создан {profile.createdAt}</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm text-foreground">Имя пользователя</label>
            <div className="relative">
              <input
                value={profile.userName}
                onChange={(e) => handleUserNameChange(e.target.value)}
                maxLength={15}
                placeholder="Придумай имя пользователя"
                className="w-full h-[40px] px-4 font-rubik font-normal text-sm leading-[130%] rounded-xl bg-[#1A1924] border transition-colors focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-[#4B485F]"
                style={{
                  borderColor: profile.userName ? "rgba(255, 255, 255, 0.2)" : "#363546",
                  color: profile.userName ? "#FFFFFF" : "#4B485F",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 font-rubik font-normal text-sm text-[#4B485F] pointer-events-none">
                {profile.userName.length}/15
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground">Дата рождения</label>
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
              className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-2xl h-12 shadow-neon"
            >
              Сохранить изменения
            </Button>
          )}

          {/* Invite Friends Button */}
          <Button
            onClick={() => setInviteDrawerOpen(true)}
            variant={hasUnsavedChanges ? "outline" : "default"}
            className={`w-full font-semibold rounded-2xl h-12 flex items-center justify-center gap-2 ${
              hasUnsavedChanges 
                ? "border-border text-foreground hover:bg-secondary" 
                : "bg-primary hover:opacity-90 text-primary-foreground shadow-neon"
            }`}
          >
            <UserPlus className="w-5 h-5" />
            Пригласить друзей
          </Button>
        </div>
      </div>

      {/* Invite Friends Drawer */}
      <InviteFriendsDrawer 
        open={inviteDrawerOpen} 
        onOpenChange={setInviteDrawerOpen}
      />
    </div>
  );
};

export default Profile;
