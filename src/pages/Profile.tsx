import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import SportHeader from "@/components/SportHeader";
import { Input } from "@/components/ui/input";
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
  
  const [profile, setProfile] = useState<ProfileData>(() => {
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

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const handleBackClick = () => {
    navigate("/");
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
      toast.success("Фото профиля обновлено");
    };
    reader.onerror = () => {
      toast.error("Ошибка при загрузке изображения");
    };
    reader.readAsDataURL(file);
  };

  const handleUserNameChange = (value: string) => {
    setProfile(prev => ({ ...prev, userName: value }));
  };

  const handleBirthDateChange = (value: string) => {
    setProfile(prev => ({ ...prev, birthDate: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <SportHeader 
        onBackClick={handleBackClick}
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
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-foreground">Имя пользователя</label>
            <Input
              value={profile.userName}
              onChange={(e) => handleUserNameChange(e.target.value)}
              className="bg-secondary border-0 rounded-xl h-12 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground">Дата рождения</label>
            <Input
              type="text"
              value={profile.birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              placeholder="12.12.2000"
              className="bg-secondary border-0 rounded-xl h-12 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
