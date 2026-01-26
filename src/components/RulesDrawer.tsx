import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X } from "lucide-react";
import scoringExample from "@/assets/scoring-example-new.png";
import boostCaptain3x from "@/assets/boost-captain3x.png";
import boostDouble from "@/assets/boost-double.png";
import boostBench from "@/assets/boost-bench.png";
import boostTransfers from "@/assets/boost-transfers.png";
import boostGolden from "@/assets/boost-golden.png";

interface RulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
const RulesDrawer = ({ isOpen, onClose }: RulesDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background border-t border-border max-h-[90vh] flex flex-col">
        <DrawerHeader className="border-b border-border pb-4 flex-shrink-0 relative">
          <DrawerTitle className="text-foreground text-xl font-display text-center">Правила игры</DrawerTitle>
          <button
            onClick={() => onClose()}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
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
                <span className="text-foreground font-display">Соревнуйся</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 bg-card/50">
                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed text-left text-regular">
                  <p>
                    Играй против других пользователей в общей лиге,{" "}
                    <span className="text-primary font-semibold">борись с друзьями</span> в частных лигах и выигрывай
                    призы в коммерческих.
                  </p>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Общая лига</h4>
                    <p>
                      Все пользователи автоматически участвуют в общей лиге. Соревнуйся со всеми игроками
                      фэнтези-футбола.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Частные лиги</h4>
                    <p>Создай свою лигу и пригласи друзей по уникальному коду. Соревнуйтесь только между собой!</p>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Коммерческие лиги</h4>
                    <p>
                      Участвуй в специальных лигах от спонсоров с реальными призами: фрибеты, техника, VIP-абонементы и
                      многое другое.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium text-medium mb-2">Клубные лиги</h4>
                    <p>Мы добавим тебя в лигу твоего любимого клуба — там свои.</p>
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
