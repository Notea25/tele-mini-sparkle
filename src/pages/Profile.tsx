import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import SportHeader from "@/components/SportHeader";
import { Input } from "@/components/ui/input";
import homeIcon from "@/assets/home-icon.png";

const Profile = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Ричард Хенсон");
  const [birthDate, setBirthDate] = useState("");

  const handleBackClick = () => {
    navigate("/");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <SportHeader 
        onBackClick={handleBackClick}
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
              <div className="w-full h-full bg-secondary flex items-center justify-center text-4xl">
                👤
              </div>
            </div>
            <button className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-full flex items-center justify-center border border-border shadow-lg">
              <Pencil className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex flex-col pt-2">
            <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
            <span className="text-muted-foreground text-sm">@riches</span>
            <span className="text-muted-foreground text-sm mt-1">Создан 10.08.2025</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-foreground">Имя пользователя</label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-secondary border-0 rounded-xl h-12 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground">Дата рождения</label>
            <Input
              type="text"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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
