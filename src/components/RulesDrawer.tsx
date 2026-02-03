import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import scoringExample from "@/assets/scoring-example-new.png";
import boostCaptain3x from "@/assets/boost-captain3x.png";
import boostDouble from "@/assets/boost-double.png";
import boostBench from "@/assets/boost-bench.png";
import boostTransfers from "@/assets/boost-transfers.png";
import boostGolden from "@/assets/boost-golden.png";
import prizes from "@/assets/prizes.png";

interface RulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
const RulesDrawer = ({ isOpen, onClose }: RulesDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-t border-border max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b border-border pb-4 flex-shrink-0">
          <DrawerTitle className="text-foreground text-xl font-display text-center">Правила игры</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* How to play section */}
            <AccordionItem value="how-to-play" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Создавай команду</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    Мы выделим тебе бюджет в <span className="text-primary font-semibold">100 миллионов</span> — собери
                    команду своей мечты!
                  </p>
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Состав команды</h4>
                    <ul className="space-y-1">
                      <li>• 15 игроков в команде</li>
                      <li>• 11 в основном составе</li>
                      <li>• 4 на скамейке запасных</li>
                      <li>• Максимум 3 игрока из одного клуба</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Капитан и вице-капитан</h4>
                    <p>
                      Капитан получает <span className="text-primary font-semibold">×2 очков</span> за свои действия.
                      Вице-капитан получит ×2 очков, если капитан не выйдет на поле.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Points scoring section */}
            <AccordionItem value="points" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Набирай очки</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    Каждый игрок на своей позиции получает виртуальные очки за{" "}
                    <span className="text-primary font-semibold">реальные действия</span> на футбольном поле. Количество
                    очков зависит от амплуа.
                  </p>

                  <img src={scoringExample} alt="Scoring Example" className="w-full rounded-xl" />

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-foreground font-medium mb-1">Время на поле</h4>
                      <ul className="space-y-1">
                        <li>• 60 и более минут: +2 очка (все позиции)</li>
                        <li>• Менее 60 минут: +1 очко (все позиции)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Голы</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: +6 очков</li>
                        <li>• Защитник: +6 очков</li>
                        <li>• Полузащитник: +5 очков</li>
                        <li>• Нападающий: +4 очка</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Голевые передачи</h4>
                      <p>• Все позиции: +3 очка</p>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Сухой матч (более 60 минут на поле)</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: +4 очка</li>
                        <li>• Защитник: +4 очка</li>
                        <li>• Полузащитник: +1 очко</li>
                        <li>• Нападающий: 0 очков</li>
                      </ul>
                      <p className="text-xs text-muted-foreground/70 italic mt-1">
                        *Матч, в котором команда не пропустила ни одного гола
                      </p>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Отраженный пенальти</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: +5 очков</li>
                        <li>• Остальные позиции: 0 очков</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Каждый сэйв</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: +0.5 очка</li>
                        <li>• Остальные позиции: 0 очков</li>
                      </ul>
                      <p className="text-xs text-muted-foreground/70 italic mt-1">
                        *Если, условно, 1.5 — считается за 2
                      </p>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Штрафы</h4>
                      <ul className="space-y-1">
                        <li>• Незабитый пенальти: −2 очка (все позиции)</li>
                        <li>• Привоз пенальти: −1 очко (все позиции)</li>
                        <li>• Желтая карточка: −1 очко (все позиции)</li>
                        <li>• Прямая красная карточка: −3 очка (все позиции)</li>
                      </ul>
                      <p className="text-xs text-muted-foreground/70 italic mt-1">
                        *Если первая желтая −1 очко, вторая желтая=красная еще −2 очка. Итого: желтая + желтая = красная
                        (−3 очка)
                      </p>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Каждые 2 пропущенных мяча</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: −1 очко</li>
                        <li>• Защитник: −1 очко</li>
                      </ul>
                      <p className="text-xs text-muted-foreground/70 italic mt-1">
                        *Если пропущен 1 мяч — очки не отнимаются. Например: 1 пропущен (нет минуса), 2 пропущено (−1
                        очко), 3 пропущено (−1 очко), 4 пропущено (−2 очка)
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Transfers section */}
            <AccordionItem value="transfers" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Делай трансферы</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    Не нравится игрок? Смело отправляй его на скамейку или продавай. Перед каждым туром у тебя есть{" "}
                    <span className="text-primary font-semibold">2 бесплатных трансфера</span>. Если команда совсем не
                    радует — активируй буст и меняй всех, кого подскажет сердце и интуиция.
                  </p>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Правила трансферов</h4>
                    <ul className="space-y-2">
                      <li>• 2 бесплатных трансфера каждый тур</li>
                      <li>• Неиспользованные трансферы не переносятся</li>
                      <li>• За каждый дополнительный трансфер: −4 очка</li>
                      <li>• Максимум 3 игрока из одного клуба</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Дедлайн</h4>
                    <p>
                      Все изменения в составе и трансферы необходимо совершить до наступления дедлайна игрового тура. Обычно дедлайн устанавливается за 2 часа до начала первого матча тура. После наступления дедлайна все внесённые изменения не применяются к текущему туру, а автоматически переносятся на следующий игровой тур. Планируйте состав заранее: после дедлайна изменить его для текущего тура уже нельзя.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Substitutions section */}
            <AccordionItem value="substitutions" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Замены</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    Игроки со скамейки могут автоматически заменить игроков основного состава, если те не вышли на поле.
                  </p>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Автозамены</h4>
                    <ul className="space-y-2">
                      <li>• Замены происходят автоматически после матчей тура</li>
                      <li>• Приоритет замен: по порядку на скамейке</li>
                      <li>• Схема должна остаться валидной (мин. 1 ВР, 3 ЗЩ, 2 ПЗ, 1 НП)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Ручные замены</h4>
                    <p>
                      До дедлайна вы можете вручную менять местами игроков основного состава и скамейки в разделе «Моя
                      команда».
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Boosts section */}
            <AccordionItem value="boosts" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Бусты</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    Бусты — это специальные усиления, которые можно использовать один раз за сезон. Каждый буст
                    активируется на один тур.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={boostCaptain3x} alt="3× Капитан" className="w-5 h-5 object-contain" />
                        <h4 className="text-foreground font-medium text-medium">3× Капитан</h4>
                      </div>
                      <p className="text-xs text-regular">Капитан получает ×3 очков вместо ×2 в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={boostDouble} alt="Двойная сила" className="w-5 h-5 object-contain" />
                        <h4 className="text-foreground font-medium text-medium">Двойная сила</h4>
                      </div>
                      <p className="text-xs text-regular">И капитан, и вице-капитан получают ×2 очков в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={boostBench} alt="Скамейка+" className="w-5 h-5 object-contain" />
                        <h4 className="text-foreground font-medium text-medium">Скамейка+</h4>
                      </div>
                      <p className="text-xs text-regular">Очки игроков со скамейки засчитываются в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={boostTransfers} alt="Трансферы+" className="w-5 h-5 object-contain" />
                        <h4 className="text-foreground font-medium text-medium">Трансферы+</h4>
                      </div>
                      <p className="text-xs text-regular">Неограниченные трансферы без штрафа. Изменения постоянные</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <img src={boostGolden} alt="Золотой тур" className="w-5 h-5 object-contain" />
                        <h4 className="text-foreground font-medium text-medium">Золотой тур</h4>
                      </div>
                      <p className="text-xs text-regular">
                        Неограниченные трансферы на один тур. После тура состав возвращается
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    * Можно использовать только один буст за тур. Бусты активируются до дедлайна.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Leagues section */}
            <AccordionItem value="leagues" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Лиги</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    В игре доступно несколько типов лиг. Все лиги используют одинаковые правила подсчёта очков, но отличаются форматом участия, таблицами и призами.
                  </p>

                  {/* Общая лига */}
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Общая лига</h4>
                    <p className="mb-2">
                      Общая лига — это основная лига сезона, в которой участвуют все пользователи, собравшие команду.
                    </p>
                    <p className="font-medium text-foreground mb-1">Особенности:</p>
                    <ul className="space-y-1 mb-2">
                      <li>• Участие происходит автоматически, вступать вручную не нужно</li>
                      <li>• Все пользователи соревнуются в одной таблице</li>
                      <li>• Рейтинг формируется на основе общего количества очков за все игровые туры</li>
                    </ul>
                    <p className="font-medium text-foreground mb-1">Главные призы сезона:</p>
                    <ul className="space-y-1">
                      <li>🥇 1 место — iPhone 17 Pro</li>
                      <li>🥈 2 место — PS5</li>
                      <li>🥉 3 место — AirPods Max</li>
                    </ul>
                    <p className="text-xs text-muted-foreground/70 italic mt-2">
                      Цель общей лиги — определить лучших менеджеров сезона.
                    </p>
                  </div>

                  {/* Мои лиги */}
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Мои лиги (частные лиги)</h4>
                    <p className="mb-2">
                      Мои лиги — это частные лиги, создаваемые пользователями для игры с друзьями, коллегами или знакомыми.
                    </p>
                    <p className="font-medium text-foreground mb-1">Особенности:</p>
                    <ul className="space-y-1">
                      <li>• Лига создаётся пользователем</li>
                      <li>• Вступление возможно только по приглашению (ссылка или QR-код)</li>
                      <li>• Участниками могут быть только пользователи с уже собранной командой</li>
                      <li>• Очки считаются по стандартным правилам игры</li>
                      <li>• Участие в частных лигах не влияет на участие и результаты в общей лиге</li>
                    </ul>
                    <p className="text-xs text-muted-foreground/70 italic mt-2">
                      Цель частных лиг — соревноваться в узком кругу и сравнивать результаты с конкретными людьми.
                    </p>
                  </div>

                  {/* Лига по клубам */}
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Лига по клубам</h4>
                    <p className="mb-2">
                      Лига по клубам — это рейтинг пользователей, сгруппированных по выбранному клубу.
                    </p>
                    <p className="font-medium text-foreground mb-1">Особенности:</p>
                    <ul className="space-y-1">
                      <li>• Пользователь автоматически попадает в лигу выбранного клуба</li>
                      <li>• В таблице отображаются только пользователи, относящиеся к одному клубу</li>
                      <li>• Очки считаются по стандартным правилам игры</li>
                      <li>• Лига носит фанатский и соревновательный характер</li>
                    </ul>
                    <p className="text-xs text-muted-foreground/70 italic mt-2">
                      Цель лиги по клубам — определить лучших менеджеров среди болельщиков конкретного клуба.
                    </p>
                  </div>

                  {/* Коммерческие лиги */}
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Коммерческие лиги</h4>
                    <p className="mb-2">
                      Коммерческие лиги — это специальные лиги, создаваемые партнёрами или организаторами с дополнительными призами.
                    </p>
                    <p className="font-medium text-foreground mb-1">Формат:</p>
                    <ul className="space-y-1 mb-2">
                      <li>• Весь чемпионат делится на 10 отрезков по 3 игровых тура</li>
                      <li>• Каждый отрезок соответствует отдельной коммерческой лиге и партнёру</li>
                      <li>• Пример: 1–3 тур — лига партнёра №1; 4–6 тур — лига партнёра №2 и т.д.</li>
                    </ul>
                    <p className="font-medium text-foreground mb-1">Регистрация:</p>
                    <ul className="space-y-1 mb-2">
                      <li>• Пользователь не добавляется в коммерческую лигу автоматически</li>
                      <li>• Для каждой лиги открывается отдельное окно регистрации</li>
                      <li>• Регистрация обычно открывается примерно за 1 неделю до начала отрезка</li>
                      <li>• Участие в коммерческой лиге бесплатное</li>
                    </ul>
                    <p className="font-medium text-foreground mb-1">Определение победителя:</p>
                    <ul className="space-y-1">
                      <li>• В коммерческой лиге учитываются только очки, набранные за соответствующие 3 тура</li>
                      <li>• Победителем становится пользователь, набравший наибольшее количество очков за этот период</li>
                    </ul>
                  </div>

                  {/* Общие принципы */}
                  <div className="bg-card border border-border/50 rounded-lg p-3">
                    <h4 className="text-foreground font-medium text-medium mb-2">Общие принципы</h4>
                    <ul className="space-y-1">
                      <li>• Один пользователь может одновременно участвовать: в общей лиге, в нескольких частных лигах, в лиге по клубам и в коммерческих лигах</li>
                      <li>• Очки пользователя во всех лигах берутся из одного источника</li>
                      <li>• Различия между лигами заключаются только в формате таблицы и призах, а не в правилах игры</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="prizes" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-display">Призы</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-3">🏆 Призы по итогам сезона</h4>
                    <div className="space-y-3 pl-1">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold min-w-[20px]">1</span>
                        <span className="text-foreground font-medium">место - iPhone 17 Pro</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold min-w-[20px]">2</span>
                        <span className="text-foreground font-medium">место - PlayStation 5</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold min-w-[20px]">3</span>
                        <span className="text-foreground font-medium">место - AirPods Max</span>
                      </div>
                    </div>
                    <img src={prizes} alt="Призы за сезон" className="w-full rounded-xl mt-2 mb-4" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">
                      🎯 Дополнительные призы по ходу сезона
                    </h4>
                    <p className="mb-3">
                      Помимо основных призов, в разделе коммерческих лиг проходят мини-турниры внутри сезона:
                    </p>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Сезон состоит из <strong>30 туров</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Каждый отрезок из <strong>3 туров</strong> - это отдельный мини-турнир
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Победитель каждого отрезка получает приз</span>
                      </div>
                    </div>

                    <div className="bg-card border border-border/50 rounded-lg p-3">
                      <div className="text-center font-bold text-foreground mb-1">Итого:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-background rounded">
                          <div className="text-lg font-bold text-primary">30 туров</div>
                          <div className="text-xs">весь сезон</div>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <div className="text-lg font-bold text-primary">10 мини-турниров</div>
                          <div className="text-xs">по 3 тура каждый</div>
                        </div>
                        <div className="p-2 bg-background rounded">
                          <div className="text-lg font-bold text-primary">10 шансов</div>
                          <div className="text-xs">на победу</div>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-foreground font-medium">
                      Даже если старт сезона был неудачным - каждый новый отрезок начинается с нуля и даёт новый шанс на
                      победу!
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Bottom padding */}
          <div className="h-6" />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
export default RulesDrawer;
