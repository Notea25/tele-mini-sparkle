import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trophy, User, TrendingUp, Award, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import bannerBg from "@/assets/beterra-banner-bg.png";
import playersExample from "@/assets/players-example.png";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState("");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate("/")} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="text-primary text-2xl">⚽</div>
            <div>
              <h1 className="text-foreground text-lg font-bold">ВЫСШАЯ ЛИГА</h1>
              <p className="text-muted-foreground text-xs">БЕЛАРУСЬ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-6 rounded-xl overflow-hidden border border-border">
        <img src={bannerBg} alt="Banner" className="w-full h-full object-cover rounded-xl" />
      </div>

      {/* Team Creation Form */}
      <div className="px-4 mt-6 space-y-3">
        {/* Team Name Input */}
        <Input
          placeholder="Название команды"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full h-14 bg-card/80 border-border text-foreground placeholder:text-muted-foreground rounded-xl"
        />

        {/* Favorite Team Select */}
        <Select value={favoriteTeam} onValueChange={setFavoriteTeam}>
          <SelectTrigger className="w-full h-14 bg-card/80 border-border text-foreground rounded-xl">
            <SelectValue placeholder="За какую команду болеешь" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="dinamo-minsk">Динамо Минск</SelectItem>
            <SelectItem value="bate">БАТЭ</SelectItem>
            <SelectItem value="shakhtyor">Шахтер</SelectItem>
            <SelectItem value="neman">Неман</SelectItem>
            <SelectItem value="energetik">Энергетик-БГУ</SelectItem>
            <SelectItem value="torpedo">Торпедо-БелАЗ</SelectItem>
            <SelectItem value="slavia">Славия</SelectItem>
            <SelectItem value="isloch">Ислочь</SelectItem>
          </SelectContent>
        </Select>

        {/* Create Team Button */}
        <Button 
          onClick={() => navigate("/team-builder")}
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          style={{ boxShadow: "0 0 20px hsl(var(--primary) / 0.5)" }}
        >
          Создать команду
        </Button>
      </div>


      {/* Collect Team Section */}
      <div className="px-4 mt-8 text-center">
        <h3 className="text-foreground text-3xl font-bold mb-4">Собирай команду</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Воспользуйся бюджетом в <span className="text-primary font-semibold">100 миллионов</span>
          <br />
          и собери команду лучших игроков чемпионата
        </p>

        {/* Player Cards Image */}
        <div className="mt-6">
          <img 
            src={playersExample} 
            alt="Players" 
            className="w-full rounded-xl" 
          />
        </div>
      </div>

      {/* Score Points Section */}
      <div className="px-4 mt-8">
        <h3 className="text-foreground text-2xl font-bold mb-3">Набирай очки</h3>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground text-sm">
                  Твои игроки получают очки за действия в реальных матчах: голы, передачи, сейвы и другие ключевые моменты.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Details Section */}
      <div className="px-4 mt-8">
        <h3 className="text-foreground text-2xl font-bold mb-3">Детали трансферов</h3>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <div className="p-6">
            <p className="text-muted-foreground text-sm mb-4">
              Есть два трансферных окна - до старта и посередине сезона. Меняй состав перед каждым туром, но помни: у тебя только 3 трансфера за тур без штрафов.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-foreground font-semibold text-sm">Игрок 1</div>
                  <div className="text-muted-foreground text-xs">7.5</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-foreground font-semibold text-sm">Игрок 2</div>
                  <div className="text-muted-foreground text-xs">8.0</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Compete Section */}
      <div className="px-4 mt-8">
        <h3 className="text-foreground text-2xl font-bold mb-3">Соревнуйся</h3>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <div className="p-6">
            <p className="text-muted-foreground text-sm mb-4">
              Соревнуйся с другими игроками в общей лиге, создавай или вступай в мини-лиги с друзьями.
            </p>
            <div className="space-y-3">
              {[
                { name: "Команда 1", points: 202 },
                { name: "Команда 2", points: 197 },
                { name: "Ваша команда", points: 192, highlight: true },
              ].map((team, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${team.highlight ? 'bg-primary/10 border border-primary/30' : 'bg-muted/20'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground font-semibold">{idx + 1}</div>
                    <div className="text-foreground font-semibold">{team.name}</div>
                  </div>
                  <div className={`font-bold ${team.highlight ? 'text-primary' : 'text-foreground'}`}>
                    {team.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Prizes Section */}
      <div className="px-4 mt-8">
        <h3 className="text-foreground text-2xl font-bold mb-3">Получай призы</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Борись за топ позиции и получай ценные призы по итогам сезона.
        </p>

        {/* Prize Cards */}
        <div className="space-y-4">
          <Card className="bg-card/60 backdrop-blur-xl border-border/50">
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-foreground font-bold">Спорт Мастерить</span>
                </div>
                <div className="text-muted-foreground text-sm">Главный приз сезона</div>
              </div>
              <div className="text-primary text-2xl font-bold">3 место</div>
            </div>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl border-border/50">
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  <span className="text-foreground font-bold">Абонементы</span>
                </div>
                <div className="text-muted-foreground text-sm">На все матчи сезона</div>
              </div>
              <div className="text-primary text-2xl font-bold">2 место</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary/30 to-primary/10 border-primary/50">
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-bold">Apple iPhone</span>
                </div>
                <div className="text-muted-foreground text-sm">Последняя модель</div>
              </div>
              <div className="text-primary text-3xl font-bold">1 место</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
