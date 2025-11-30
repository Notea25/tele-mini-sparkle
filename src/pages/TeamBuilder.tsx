import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, ChevronDown, Search, Plus, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SportHeader from "@/components/SportHeader";
import jerseyIcon from "@/assets/jersey-icon.png";

const TeamBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"formation" | "list">("formation");
  const [activeFilter, setActiveFilter] = useState("Все");

  const filters = ["Все", "Вратари", "Защитники", "Полузащитники"];

  const players = Array(6).fill(null).map((_, i) => ({
    name: "Вакулич",
    team: "Динамо Минск",
    position: "НП",
    points: 79,
  }));

  const leaderboard = Array(10).fill(null).map((_, i) => ({
    rank: i + 1,
    name: "Lucky Team",
    games: 32,
    points: 2125,
    trend: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "same",
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <SportHeader />

      {/* Team Header */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>🏠</span>
            <span>⚽ Футбол</span>
            <span>•</span>
            <span>Беларусь</span>
            <span>•</span>
            <span className="text-primary">Lucky Team</span>
          </div>
        </div>
        <h1 className="text-foreground text-3xl font-bold mb-2">Lucky Team</h1>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Дедлайн: 04.04 в 19:00</span>
          <span className="text-foreground">3 дня 08:36:53</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6 flex gap-2">
        <Button
          onClick={() => setActiveTab("formation")}
          className={`flex-1 ${
            activeTab === "formation"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Расстановка
        </Button>
        <Button
          onClick={() => setActiveTab("list")}
          className={`flex-1 ${
            activeTab === "list"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Список
        </Button>
      </div>

      {activeTab === "formation" && (
        <>
          {/* Football Field */}
          <div className="px-4 mt-6">
            <div className="relative bg-gradient-to-b from-[#5a9c3f] to-[#4a8030] rounded-3xl overflow-hidden border-[5px] border-white/60 shadow-2xl" style={{ minHeight: '700px', paddingBottom: '40px' }}>
              {/* Field Lines */}
              <div className="absolute inset-0">
                {/* Outer border */}
                <div className="absolute inset-5 border-2 border-white/80 rounded-2xl"></div>
                
                {/* Top penalty area (small) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-5 w-36 h-14 border-2 border-white/80 border-t-0 rounded-b-xl"></div>
                
                {/* Center line (horizontal) */}
                <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-0.5 bg-white/80"></div>
                
                {/* Center circle */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white/80 rounded-full"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/90 rounded-full"></div>
                
                {/* Bottom penalty area (visible) */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-36 h-14 border-2 border-white/80 border-b-0 rounded-t-xl"></div>
              </div>

              {/* Formation 2-5-5-3 */}
              <div className="relative py-8 px-6">
                {/* Top - Forwards (ВР - 2 players) */}
                <div className="flex justify-center gap-8 mb-16">
                  {[1, 2].map((i) => (
                    <div key={`vp-${i}`} className="flex flex-col items-center">
                      <div className="relative w-14 h-16">
                        <img src={jerseyIcon} alt="Jersey" className="w-full h-full object-contain drop-shadow-md" />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 mt-1">ВР</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Second row - Midfielders (ЗЩ - 5 players) */}
                <div className="flex justify-between mb-16 px-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={`zsh-${i}`} className="flex flex-col items-center">
                      <div className="relative w-14 h-16">
                        <img src={jerseyIcon} alt="Jersey" className="w-full h-full object-contain drop-shadow-md" />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 mt-1">ЗЩ</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Third row - Defenders (ПЗ - 5 players) */}
                <div className="flex justify-between mb-16 px-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={`pz-${i}`} className="flex flex-col items-center">
                      <div className="relative w-14 h-16">
                        <img src={jerseyIcon} alt="Jersey" className="w-full h-full object-contain drop-shadow-md" />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 mt-1">ПЗ</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fourth row - Defenders (НП - 3 players) */}
                <div className="flex justify-center gap-16 mb-8">
                  {[1, 2, 3].map((i) => (
                    <div key={`np-${i}`} className="flex flex-col items-center">
                      <div className="relative w-14 h-16">
                        <img src={jerseyIcon} alt="Jersey" className="w-full h-full object-contain drop-shadow-md" />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-600 mt-1">НП</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Filters */}
          <div className="px-4 mt-6 flex gap-2">
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-foreground text-sm">Команды</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-foreground text-sm">Очки</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Price Range */}
          <div className="px-4 mt-4 flex gap-2">
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Цена</span>
              <span className="text-foreground text-sm">от</span>
              <span className="text-foreground text-sm font-semibold">4.5</span>
            </div>
            <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Цена</span>
              <span className="text-foreground text-sm">до</span>
              <span className="text-foreground text-sm font-semibold">9</span>
            </div>
          </div>
        </>
      )}

      {/* Position Filters */}
      <div className="px-4 mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            size="sm"
            className={`flex-shrink-0 ${
              activeFilter === filter
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск"
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Players List Header */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-xs text-muted-foreground pb-2">
          <span>Игрок</span>
          <span>Клуб</span>
          <span>Очки</span>
          <span>Цена</span>
          <span></span>
        </div>
      </div>

      {/* Players List */}
      <div className="px-4 space-y-2">
        {players.map((player, idx) => (
          <Card key={idx} className="bg-card/60 backdrop-blur-xl border-border/50">
            <div className="p-3 grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
              <div>
                <div className="text-foreground font-semibold">{player.name}</div>
                <div className="text-muted-foreground text-xs">{player.position}</div>
              </div>
              <div className="text-foreground text-sm">{player.team}</div>
              <div className="flex items-center gap-1">
                <span className="text-foreground font-semibold">{player.points}</span>
                <TrendingUp className="w-3 h-3 text-orange-500" />
              </div>
              <div className="text-foreground font-semibold">9</div>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-4 mt-6 flex items-center justify-center gap-2">
        <button className="p-2 hover:bg-accent rounded transition-colors">
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        {[1, 2, 3, "...", 10].map((page, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              page === 1 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
            }`}
          >
            {page}
          </button>
        ))}
        <button className="p-2 hover:bg-accent rounded transition-colors">
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Captain Selection */}
      <div className="px-4 mt-6 flex gap-2">
        <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
          <span className="text-foreground text-sm">Капитан</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between">
          <span className="text-foreground text-sm">Вице капитан</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Warning */}
      <div className="px-4 mt-4">
        <div className="bg-muted/30 border border-border rounded-lg p-3 flex gap-3">
          <div className="text-muted-foreground">ℹ️</div>
          <p className="text-muted-foreground text-sm">
            Вы не можете добавить больше 2-х игроков из одного клуба в свою команду
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 flex gap-3">
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          Автосбор
        </Button>
        <Button variant="secondary" className="flex-1">
          Сбросить
        </Button>
      </div>

      {/* Leaderboard */}
      <div className="px-4 mt-8">
        <h2 className="text-foreground text-2xl font-bold mb-4">Топ-10 общей лиги</h2>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <div className="divide-y divide-border">
            {leaderboard.map((team) => (
              <div key={team.rank} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {team.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {team.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {team.trend === "same" && <Minus className="w-4 h-4 text-muted-foreground" />}
                    <span className={`font-bold ${team.rank <= 3 ? "text-primary" : "text-foreground"}`}>
                      {team.rank}
                    </span>
                  </div>
                  <span className="text-foreground font-semibold">🏆</span>
                  <span className="text-foreground">{team.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-sm">{team.games}</span>
                  <span className="text-foreground font-bold">{team.points}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team Balance */}
      <div className="px-4 mt-8 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-muted-foreground text-sm mb-1">Стоимость команды</div>
            <div className="text-foreground text-3xl font-bold">0</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-sm mb-1">Баланс</div>
            <div className="text-foreground text-3xl font-bold">100</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBuilder;
