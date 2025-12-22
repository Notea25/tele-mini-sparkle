import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import scoringExample from "@/assets/scoring-example.png";

interface RulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesDrawer = ({ isOpen, onClose }: RulesDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background border-t border-border max-h-[90vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-foreground text-xl font-bold text-center">
            Правила игры
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 py-4 max-h-[calc(90vh-80px)]">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {/* How to play section */}
            <AccordionItem value="how-to-play" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-medium">Как играть</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <div>
                    <h4 className="text-foreground font-medium mb-2">1. Собирай команду</h4>
                    <p>
                      Воспользуйся бюджетом в <span className="text-primary font-semibold">100 миллионов</span> и
                      собери команду лучших игроков чемпионата. Команда состоит из 15 игроков: 11 в основном
                      составе и 4 на скамейке запасных.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium mb-2">2. Выбери капитана</h4>
                    <p>
                      Капитан получает <span className="text-primary font-semibold">×2 очков</span> за свои
                      действия. Вице-капитан получит ×2 очков, если капитан не выйдет на поле.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-foreground font-medium mb-2">3. Соревнуйся</h4>
                    <p>
                      Соревнуйся с другими пользователями в общей лиге или создай свою собственную лигу для
                      друзей.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Points scoring section */}
            <AccordionItem value="points" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-medium">Начисление очков</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Каждый игрок получает или теряет очки за свои действия в реальных матчах. Количество очков
                    зависит от амплуа футболиста.
                  </p>

                  <img src={scoringExample} alt="Scoring Example" className="w-full rounded-xl" />

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-foreground font-medium mb-1">Голы</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: 10 очков</li>
                        <li>• Защитник: 6 очков</li>
                        <li>• Полузащитник: 5 очков</li>
                        <li>• Нападающий: 4 очка</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Голевые передачи</h4>
                      <p>• Все позиции: 3 очка</p>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Сухой матч (без пропущенных голов)</h4>
                      <ul className="space-y-1">
                        <li>• Вратарь: 4 очка</li>
                        <li>• Защитник: 4 очка</li>
                        <li>• Полузащитник: 1 очко</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Штрафы</h4>
                      <ul className="space-y-1">
                        <li>• Желтая карточка: -1 очко</li>
                        <li>• Красная карточка: -3 очка</li>
                        <li>• Пенальти не забит: -2 очка</li>
                        <li>• Автогол: -2 очка</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-foreground font-medium mb-1">Бонусы</h4>
                      <ul className="space-y-1">
                        <li>• Выход на поле: 1-2 очка</li>
                        <li>• MVP матча: 3 очка</li>
                        <li>• 3+ сейва (ВР): 1 очко</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Transfers section */}
            <AccordionItem value="transfers" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-medium">Трансферы</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Если кто-то из футболистов твоей команды получил травму или плохо играет — каждый тур ты
                    можешь сделать <span className="text-primary font-semibold">до 3-х бесплатных трансферов</span>.
                  </p>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Правила трансферов</h4>
                    <ul className="space-y-2">
                      <li>• 3 бесплатных трансфера каждый тур</li>
                      <li>• Неиспользованные трансферы не переносятся</li>
                      <li>• За каждый дополнительный трансфер: -4 очка</li>
                      <li>• Максимум 3 игрока из одного клуба</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Дедлайн</h4>
                    <p>
                      Все трансферы должны быть сделаны до начала первого матча тура. После дедлайна изменения
                      невозможны.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Substitutions section */}
            <AccordionItem value="substitutions" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-medium">Замены</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Игроки со скамейки могут автоматически заменить игроков основного состава, если те не вышли
                    на поле.
                  </p>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Автозамены</h4>
                    <ul className="space-y-2">
                      <li>• Замены происходят автоматически после матчей тура</li>
                      <li>• Заменяющий игрок должен соответствовать позиции</li>
                      <li>• Приоритет замен: по порядку на скамейке</li>
                      <li>• Схема должна остаться валидной (мин. 1 ВР, 3 ЗЩ, 1 НП)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Ручные замены</h4>
                    <p>
                      До дедлайна вы можете вручную менять местами игроков основного состава и скамейки в разделе
                      «Моя команда».
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Boosts section */}
            <AccordionItem value="boosts" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-medium">Бусты</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Бусты — это специальные усиления, которые можно использовать один раз за сезон. Каждый буст
                    активируется на один тур.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-card rounded-xl border border-border">
                      <h4 className="text-foreground font-medium mb-1">🔥 3× Капитан</h4>
                      <p className="text-xs">Капитан получает ×3 очков вместо ×2 в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <h4 className="text-foreground font-medium mb-1">⚡ Двойная сила</h4>
                      <p className="text-xs">И капитан, и вице-капитан получают ×2 очков в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <h4 className="text-foreground font-medium mb-1">🪑 Скамейка+</h4>
                      <p className="text-xs">Очки игроков со скамейки засчитываются в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <h4 className="text-foreground font-medium mb-1">⭐ Трансферы+</h4>
                      <p className="text-xs">Неограниченное количество бесплатных трансферов в этом туре</p>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border">
                      <h4 className="text-foreground font-medium mb-1">🏆 Золотой тур</h4>
                      <p className="text-xs">Очки удваиваются для всей команды в этом туре</p>
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
                <span className="text-foreground font-medium">Лиги</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <div>
                    <h4 className="text-foreground font-medium mb-2">Общая лига</h4>
                    <p>
                      Все пользователи автоматически участвуют в общей лиге. Соревнуйся со всеми игроками
                      фэнтези-футбола.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Частные лиги</h4>
                    <p>
                      Создай свою лигу и пригласи друзей по уникальному коду. Соревнуйтесь только между собой!
                    </p>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Коммерческие лиги</h4>
                    <p>
                      Участвуй в специальных лигах от спонсоров с реальными призами: фрибеты, техника, VIP-абонементы
                      и многое другое.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Клубные лиги</h4>
                    <p>
                      Соревнуйся с другими болельщиками твоей любимой команды в специальной клубной лиге.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Prizes section */}
            <AccordionItem value="prizes" className="border border-border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                <span className="text-foreground font-medium">Призы</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                  <p>
                    Пользователи, набравшие наибольшее количество очков, получат призы от{" "}
                    <span className="text-primary font-semibold">Fantasy.sports.by</span>
                  </p>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Призы сезона</h4>
                    <ul className="space-y-2">
                      <li>🥇 1 место: Главный приз сезона</li>
                      <li>🥈 2 место: Ценный приз</li>
                      <li>🥉 3 место: Памятный приз</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Еженедельные призы</h4>
                    <p>
                      Лучший менеджер каждого тура получает специальный приз. Следи за коммерческими лигами для
                      дополнительных возможностей!
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Bottom padding */}
          <div className="h-6" />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default RulesDrawer;
