import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Link to="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Профиль</h1>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Пользователь</h2>
            <p className="text-muted-foreground">user@example.com</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground">Команд создано</p>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground">Очков набрано</p>
            <p className="text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground">Место в рейтинге</p>
            <p className="text-2xl font-bold text-foreground">—</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
