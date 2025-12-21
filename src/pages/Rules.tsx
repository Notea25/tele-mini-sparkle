import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, ChevronLeft } from "lucide-react";
import SportHeader from "@/components/SportHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import FooterNav from "@/components/FooterNav";
import InfinitePlayerCarousel from "@/components/InfinitePlayerCarousel";
import InfiniteClubCarousel from "@/components/InfiniteClubCarousel";
import scoringExample from "@/assets/scoring-example.png";
import leaderboardExample from "@/assets/leaderboard-example.png";
import prize3rdPlace from "@/assets/prize-3rd-place.png";
import prize2ndPlace from "@/assets/prize-2nd-place.png";
import prize1stPlace from "@/assets/prize-1st-place.png";
import playerBykov from "@/assets/player-bykov.png";
import playerKozlov from "@/assets/player-kozlov.png";
import clubDinamoBrest from "@/assets/club-dinamo-brest.png";
import clubNeman from "@/assets/club-neman.png";

const Rules = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SportHeader />

      <div className="px-4 mt-4">
        <Breadcrumbs
          items={[
            { label: "Футбол", path: "/" },
            { label: "Беларусь", path: "/league" },
            { label: "Правила" },
          ]}
        />
      </div>

      {/* Page Title */}
      <div className="px-4 mt-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Правила</h1>
        <p className="text-muted-foreground text-sm">
          Всё, что нужно знать о Fantasy Sports Беларуси
        </p>
      </div>

      {/* Table of Contents */}
      <div className="px-4 mt-6">
        <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
          <p className="text-foreground font-semibold text-sm mb-3">Содержание:</p>
          <a href="#team" className="block text-primary text-sm hover:underline">1. Собирай команду</a>
          <a href="#points" className="block text-primary text-sm hover:underline">2. Набирай очки</a>
          <a href="#scoring" className="block text-primary text-sm hover:underline">3. Система начисления очков</a>
          <a href="#transfers" className="block text-primary text-sm hover:underline">4. Трансферы</a>
          <a href="#deadlines" className="block text-primary text-sm hover:underline">5. Дедлайны</a>
          <a href="#leagues" className="block text-primary text-sm hover:underline">6. Лиги и соревнования</a>
          <a href="#prizes" className="block text-primary text-sm hover:underline">7. Призы</a>
          <a href="#boosts" className="block text-primary text-sm hover:underline">8. Бусты и бонусы</a>
        </div>
      </div>

      {/* Section 1: Collect Team */}
      <div id="team" className="mt-8 text-center scroll-mt-20">
        <div className="px-4">
          <h3 className="text-foreground text-2xl font-bold mb-4">1. Собирай команду</h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            Воспользуйся бюджетом в <span className="text-primary font-semibold">100 миллионов</span>
            <br />и собери команду лучших игроков чемпионата
          </p>
        </div>

        <div className="mt-6">
          <InfinitePlayerCarousel />
        </div>

        <div className="px-4 mt-4">
          <div className="bg-secondary/30 rounded-xl p-4 text-left">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="text-foreground font-semibold">Состав команды:</span>
              <br />• 1 вратарь (ВР)
              <br />• 3-5 защитников (ЗЩ)
              <br />• 3-5 полузащитников (ПЗ)
              <br />• 1-3 нападающих (НП)
              <br />• 4 запасных игрока на скамейке
              <br /><br />
              <span className="text-foreground font-semibold">Ограничения:</span>
              <br />• Максимум 3 игрока из одного клуба
              <br />• Бюджет: 100 миллионов
            </p>
          </div>
        </div>

        <div className="mt-4">
          <InfiniteClubCarousel />
        </div>
      </div>

      {/* Section 2: Score Points */}
      <div id="points" className="px-4 mt-10 text-center scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4">2. Набирай очки</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Каждый игрок будет получать или терять
          <br />
          очки за свои действия в реальных матчах.
          <br />
          Количество очков может отличаться, в
          <br />
          зависимости от амплуа футболиста.
        </p>

        <div className="mt-6">
          <img src={scoringExample} alt="Scoring Example" className="w-full rounded-xl" />
        </div>
      </div>

      {/* Section 3: Scoring System */}
      <div id="scoring" className="px-4 mt-10 scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4 text-center">3. Система начисления очков</h3>
        
        <div className="space-y-4">
          {/* Goals */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-foreground font-semibold text-sm mb-2">Голы:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Гол вратаря</span>
                <span className="text-primary font-semibold">+10 очков</span>
              </div>
              <div className="flex justify-between">
                <span>Гол защитника</span>
                <span className="text-primary font-semibold">+6 очков</span>
              </div>
              <div className="flex justify-between">
                <span>Гол полузащитника</span>
                <span className="text-primary font-semibold">+5 очков</span>
              </div>
              <div className="flex justify-between">
                <span>Гол нападающего</span>
                <span className="text-primary font-semibold">+4 очка</span>
              </div>
            </div>
          </div>

          {/* Assists */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-foreground font-semibold text-sm mb-2">Голевые передачи:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Голевая передача</span>
                <span className="text-primary font-semibold">+3 очка</span>
              </div>
            </div>
          </div>

          {/* Clean Sheets */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-foreground font-semibold text-sm mb-2">Сухой матч (0 пропущенных):</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Вратарь</span>
                <span className="text-primary font-semibold">+4 очка</span>
              </div>
              <div className="flex justify-between">
                <span>Защитник</span>
                <span className="text-primary font-semibold">+4 очка</span>
              </div>
              <div className="flex justify-between">
                <span>Полузащитник</span>
                <span className="text-primary font-semibold">+1 очко</span>
              </div>
            </div>
          </div>

          {/* Playing Time */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-foreground font-semibold text-sm mb-2">Игровое время:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Выход на поле (до 60 мин)</span>
                <span className="text-primary font-semibold">+1 очко</span>
              </div>
              <div className="flex justify-between">
                <span>Игра 60+ минут</span>
                <span className="text-primary font-semibold">+2 очка</span>
              </div>
            </div>
          </div>

          {/* Penalties */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-foreground font-semibold text-sm mb-2">Штрафы:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Жёлтая карточка</span>
                <span className="text-destructive font-semibold">-1 очко</span>
              </div>
              <div className="flex justify-between">
                <span>Красная карточка</span>
                <span className="text-destructive font-semibold">-3 очка</span>
              </div>
              <div className="flex justify-between">
                <span>Автогол</span>
                <span className="text-destructive font-semibold">-2 очка</span>
              </div>
              <div className="flex justify-between">
                <span>Незабитый пенальти</span>
                <span className="text-destructive font-semibold">-2 очка</span>
              </div>
              <div className="flex justify-between">
                <span>2 пропущенных гола (ВР/ЗЩ)</span>
                <span className="text-destructive font-semibold">-1 очко</span>
              </div>
            </div>
          </div>

          {/* Bonus */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <p className="text-foreground font-semibold text-sm mb-2">Бонусы:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Лучший игрок матча</span>
                <span className="text-primary font-semibold">+3 очка</span>
              </div>
              <div className="flex justify-between">
                <span>2-й лучший игрок матча</span>
                <span className="text-primary font-semibold">+2 очка</span>
              </div>
              <div className="flex justify-between">
                <span>3-й лучший игрок матча</span>
                <span className="text-primary font-semibold">+1 очко</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Transfers */}
      <div id="transfers" className="px-4 mt-10 text-center scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4">4. Трансферы</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Если кто-то из футболистов твоей команды
          <br />
          получил травму или просто плохо играет, не
          <br />
          набирая очки — каждый тур ты сможешь сделать
          <br />
          <span className="text-primary font-semibold">до 3-х бесплатных трансферов</span>
        </p>

        {/* Transfers Player Cards */}
        <div className="mt-6 flex justify-center items-center gap-2">
          {/* Bykov Card */}
          <div
            className="relative flex-shrink-0 rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            style={{ width: "140px", height: "180px" }}
          >
            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center overflow-hidden">
              <img src={clubDinamoBrest} alt="Club" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full flex-1 flex items-center justify-center">
              <img src={playerBykov} alt="Быков" className="w-full h-full object-contain object-bottom" />
            </div>
            <div className="px-3 py-2">
              <p className="text-foreground font-semibold text-sm truncate">Быков</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground text-xs">9 очков</span>
                <span className="text-muted-foreground text-xs">ЗЩ</span>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
          </div>

          {/* Kozlov Card */}
          <div
            className="relative flex-shrink-0 rounded-2xl bg-card border border-border overflow-hidden flex flex-col"
            style={{ width: "140px", height: "180px" }}
          >
            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center overflow-hidden">
              <img src={clubNeman} alt="Club" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="w-full flex-1 flex items-center justify-center">
              <img src={playerKozlov} alt="Козлов" className="w-full h-full object-contain object-bottom" />
            </div>
            <div className="px-3 py-2">
              <p className="text-foreground font-semibold text-sm truncate">Козлов</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-muted-foreground text-xs">7 очков</span>
                <span className="text-muted-foreground text-xs">ПЗ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-secondary/30 rounded-xl p-4 text-left">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="text-foreground font-semibold">Правила трансферов:</span>
              <br />• 3 бесплатных трансфера каждый тур
              <br />• Неиспользованные трансферы не накапливаются
              <br />• Дополнительные трансферы: -4 очка каждый
              <br />• Трансферы закрываются за 1 час до первого матча тура
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Deadlines */}
      <div id="deadlines" className="px-4 mt-10 scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4 text-center">5. Дедлайны</h3>
        
        <div className="bg-secondary/30 rounded-xl p-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="text-foreground font-semibold">Дедлайн тура:</span>
            <br />Трансферы и изменения состава закрываются за <span className="text-primary font-semibold">1 час</span> до начала первого матча игровой недели.
            <br /><br />
            <span className="text-foreground font-semibold">Капитан и вице-капитан:</span>
            <br />Выбор капитана и вице-капитана также должен быть сделан до дедлайна. Капитан получает <span className="text-primary font-semibold">x2 очков</span>, вице-капитан — <span className="text-primary font-semibold">x1.5 очков</span>.
            <br /><br />
            <span className="text-foreground font-semibold">Автозамены:</span>
            <br />Если игрок из основного состава не вышел на поле, его автоматически заменит игрок со скамейки запасных (в порядке приоритета).
          </p>
        </div>
      </div>

      {/* Section 6: Leagues */}
      <div id="leagues" className="px-4 mt-10 text-center scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4">6. Лиги и соревнования</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          Соревнуйся с другими пользователями в общей
          <br />
          лиге или создай свою собственную лигу для
          <br />
          друзей, где вы сможете бороться за первое место
          <br />
          только между собой
        </p>

        <div className="mt-6">
          <img src={leaderboardExample} alt="Leaderboard Example" className="w-full rounded-xl" />
        </div>

        <div className="mt-6">
          <div className="bg-secondary/30 rounded-xl p-4 text-left">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="text-foreground font-semibold">Типы лиг:</span>
              <br />• <span className="text-primary">Общая лига</span> — соревнуйся со всеми участниками
              <br />• <span className="text-primary">Клубные лиги</span> — лиги болельщиков каждого клуба
              <br />• <span className="text-primary">Приватные лиги</span> — создай свою лигу для друзей
              <br />• <span className="text-primary">Коммерческие лиги</span> — лиги с призами от спонсоров
              <br /><br />
              <span className="text-foreground font-semibold">Как создать лигу:</span>
              <br />Перейди в раздел "Лиги" → "Создать лигу" и пригласи друзей по ссылке или QR-коду.
            </p>
          </div>
        </div>
      </div>

      {/* Section 7: Prizes */}
      <div id="prizes" className="px-4 mt-10 text-center scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4">7. Призы</h3>
        <p className="text-muted-foreground text-base leading-relaxed mb-6">
          Пользователи, набравшие наибольшее количество
          <br />
          очков, получат призы от <span className="text-primary font-semibold">Fantasy.sports.by</span>
        </p>

        <div className="space-y-4">
          <img src={prize3rdPlace} alt="3rd Place Prize" className="w-full rounded-xl" />
          <img src={prize2ndPlace} alt="2nd Place Prize" className="w-full rounded-xl" />
          <img src={prize1stPlace} alt="1st Place Prize" className="w-full rounded-xl" />
        </div>

        <div className="mt-6">
          <div className="bg-secondary/30 rounded-xl p-4 text-left">
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="text-foreground font-semibold">Условия получения призов:</span>
              <br />• Призы выдаются по итогам сезона
              <br />• Необходимо сыграть минимум 75% туров
              <br />• Победители уведомляются через Telegram
              <br />• Призы нельзя обменять на денежный эквивалент
            </p>
          </div>
        </div>
      </div>

      {/* Section 8: Boosts */}
      <div id="boosts" className="px-4 mt-10 mb-8 scroll-mt-20">
        <h3 className="text-foreground text-2xl font-bold mb-4 text-center">8. Бусты и бонусы</h3>
        
        <div className="space-y-4">
          <div className="bg-secondary/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎯</span>
              <p className="text-foreground font-semibold text-sm">Тройной капитан (x3)</p>
            </div>
            <p className="text-muted-foreground text-sm">
              Капитан получает x3 очков вместо x2. Можно использовать 1 раз за сезон.
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔄</span>
              <p className="text-foreground font-semibold text-sm">Безлимитные трансферы</p>
            </div>
            <p className="text-muted-foreground text-sm">
              Неограниченные бесплатные трансферы на один тур. Можно использовать 1 раз за сезон.
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⭐</span>
              <p className="text-foreground font-semibold text-sm">Скамейка в игре</p>
            </div>
            <p className="text-muted-foreground text-sm">
              Очки всех 15 игроков учитываются (включая запасных). Можно использовать 1 раз за сезон.
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏆</span>
              <p className="text-foreground font-semibold text-sm">Двойной тур</p>
            </div>
            <p className="text-muted-foreground text-sm">
              Все очки команды удваиваются за один тур. Можно использовать 1 раз за сезон.
            </p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-4 mb-24">
        <div
          className="w-full h-12 bg-secondary rounded-xl flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-all gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
          <span className="text-foreground font-medium text-base">Назад</span>
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default Rules;