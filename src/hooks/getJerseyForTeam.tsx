import jerseyDinamoMinsk from "@/assets/jerseys/dinamoJersey.png";
import jerseyDinamoMinskGk from "@/assets/jerseys/goalkeeperJerseys/dinamoGoalkeeperJersey.png";
import jerseyBate from "@/assets/jerseys/bateJersey.png";
import jerseyBateGk from "@/assets/jerseys/goalkeeperJerseys/bateGoalkeeperJersey.png";
import jerseyDinamoBrest from "@/assets/jerseys/brestJersey.png";
import jerseyDinamoBrestGk from "@/assets/jerseys/goalkeeperJerseys/brestGoalkeeperJersey.png";
import jerseyMlVitebsk from "@/assets/jerseys/mlJersey.png";
import jerseyMlVitebskGk from "@/assets/jerseys/goalkeeperJerseys/mlGoalkeeperJersey.png";
import jerseySlavia from "@/assets/jerseys/slaviaJersey.png";
import jerseySlaviaGk from "@/assets/jerseys/goalkeeperJerseys/slaviaGoalkeeperJersey.png";
import jerseyNeman from "@/assets/jerseys/nemanJersey.png";
import jerseyNemanGk from "@/assets/jerseys/goalkeeperJerseys/nemanGoalkeeperJersey.png";
import jerseyMinsk from "@/assets/jerseys/minskJersey.png";
import jerseyMinskGk from "@/assets/jerseys/goalkeeperJerseys/minskGoalkeeperJersey.png";
import jerseyTorpedo from "@/assets/jerseys/torpedoJersey.png";
import jerseyTorpedoGk from "@/assets/jerseys/goalkeeperJerseys/torpedoGoalkeeperJersey.png";
import jerseyVitebsk from "@/assets/jerseys/vitebskJersey.png";
import jerseyVitebskGk from "@/assets/jerseys/goalkeeperJerseys/vitebskGoalkeeperJersey.png";
import jerseyArsenal from "@/assets/jerseys/arsenalJersey.png";
import jerseyArsenalGk from "@/assets/jerseys/goalkeeperJerseys/arsenalGoalkeeperJersey.png";
import jerseyBaranovichi from "@/assets/jerseys/baranovichiJersey.png";
import jerseyBaranovichiGk from "@/assets/jerseys/goalkeeperJerseys/baranovichiGoalkeeperJersey.png";
import jerseyBelshina from "@/assets/jerseys/belshinaJersey.png";
import jerseyBelshinaGk from "@/assets/jerseys/goalkeeperJerseys/belshinaGoalkeeperJersey.png";
import jerseyDnepr from "@/assets/jerseys/dneprJersey.png";
import jerseyDneprGk from "@/assets/jerseys/goalkeeperJerseys/dneprGoalkeeperJersey.png";
import jerseyGomel from "@/assets/jerseys/gomelJersey.png";
import jerseyGomelGk from "@/assets/jerseys/goalkeeperJerseys/gomelGoalkeeperJersey.png";
import jerseyIsloch from "@/assets/jerseys/islochJersey.png";
import jerseyIslochGk from "@/assets/jerseys/goalkeeperJerseys/islochGoalkeeperJersey.png";
import jerseyNaftan from "@/assets/jerseys/naftanJersey.png";
import jerseyNaftanGk from "@/assets/jerseys/goalkeeperJerseys/naftanGoalkeeperJersey.png";

// Маппинг названий команд с бэкенда на футболки
const TEAM_JERSEY_MAP: Record<string, { regular: string; gk: string }> = {
  // Названия с бэкенда (английские)
  "Dinamo Minsk": { regular: jerseyDinamoMinsk, gk: jerseyDinamoMinskGk },
  "Dinamo-Minsk": { regular: jerseyDinamoMinsk, gk: jerseyDinamoMinskGk },
  "Bate Borisov": { regular: jerseyBate, gk: jerseyBateGk },
  "BATE": { regular: jerseyBate, gk: jerseyBateGk },
  "Dinamo Brest": { regular: jerseyDinamoBrest, gk: jerseyDinamoBrestGk },
  "Dinamo-Brest": { regular: jerseyDinamoBrest, gk: jerseyDinamoBrestGk },
  "ML Vitebsk": { regular: jerseyMlVitebsk, gk: jerseyMlVitebskGk },
  "Slavia Mozyr": { regular: jerseySlavia, gk: jerseySlaviaGk },
  "Slavia-Mozyr": { regular: jerseySlavia, gk: jerseySlaviaGk },
  "Arsenal": { regular: jerseyArsenal, gk: jerseyArsenalGk },
  "Neman": { regular: jerseyNeman, gk: jerseyNemanGk },
  "FC Minsk": { regular: jerseyMinsk, gk: jerseyMinskGk },
  "Minsk": { regular: jerseyMinsk, gk: jerseyMinskGk },
  "Torpedo Zhodino": { regular: jerseyTorpedo, gk: jerseyTorpedoGk },
  "Torpedo-Zhodino": { regular: jerseyTorpedo, gk: jerseyTorpedoGk },
  "FC Vitebsk": { regular: jerseyVitebsk, gk: jerseyVitebskGk },
  "Vitebsk": { regular: jerseyVitebsk, gk: jerseyVitebskGk },
  "FC Gomel": { regular: jerseyGomel, gk: jerseyGomelGk },
  "Gomel": { regular: jerseyGomel, gk: jerseyGomelGk },
  "FC Isloch Minsk R.": { regular: jerseyIsloch, gk: jerseyIslochGk },
  "Isloch": { regular: jerseyIsloch, gk: jerseyIslochGk },
  "Naftan": { regular: jerseyNaftan, gk: jerseyNaftanGk },
  "Baranovichi": { regular: jerseyBaranovichi, gk: jerseyBaranovichiGk },
  "Belshina": { regular: jerseyBelshina, gk: jerseyBelshinaGk },
  "Dnepr Mogilev": { regular: jerseyDnepr, gk: jerseyDneprGk },
  "FC Dnepr Mogilev": { regular: jerseyDnepr, gk: jerseyDneprGk },
  // Русские названия команд (все варианты с бэкенда)
  "Динамо-Минск": { regular: jerseyDinamoMinsk, gk: jerseyDinamoMinskGk },
  "Динамо Минск": { regular: jerseyDinamoMinsk, gk: jerseyDinamoMinskGk },
  "БАТЭ": { regular: jerseyBate, gk: jerseyBateGk },
  "БАТЭ Борисов": { regular: jerseyBate, gk: jerseyBateGk },
  "Динамо-Брест": { regular: jerseyDinamoBrest, gk: jerseyDinamoBrestGk },
  "Динамо Брест": { regular: jerseyDinamoBrest, gk: jerseyDinamoBrestGk },
  "МЛ Витебск": { regular: jerseyMlVitebsk, gk: jerseyMlVitebskGk },
  "Славия-Мозырь": { regular: jerseySlavia, gk: jerseySlaviaGk },
  "Славия Мозырь": { regular: jerseySlavia, gk: jerseySlaviaGk },
  "Славия": { regular: jerseySlavia, gk: jerseySlaviaGk },
  "Арсенал": { regular: jerseyArsenal, gk: jerseyArsenalGk },
  "Арсенал Дзержинск": { regular: jerseyArsenal, gk: jerseyArsenalGk },
  "Неман": { regular: jerseyNeman, gk: jerseyNemanGk },
  "Неман Гродно": { regular: jerseyNeman, gk: jerseyNemanGk },
  "Минск": { regular: jerseyMinsk, gk: jerseyMinskGk },
  "ФК Минск": { regular: jerseyMinsk, gk: jerseyMinskGk },
  "Торпедо-БелАЗ": { regular: jerseyTorpedo, gk: jerseyTorpedoGk },
  "Торпедо БелАЗ": { regular: jerseyTorpedo, gk: jerseyTorpedoGk },
  "Торпедо": { regular: jerseyTorpedo, gk: jerseyTorpedoGk },
  "Витебск": { regular: jerseyVitebsk, gk: jerseyVitebskGk },
  "ФК Витебск": { regular: jerseyVitebsk, gk: jerseyVitebskGk },
  "Днепр": { regular: jerseyDnepr, gk: jerseyDneprGk },
  "Днепр Могилев": { regular: jerseyDnepr, gk: jerseyDneprGk },
  "Днепр-Могилев": { regular: jerseyDnepr, gk: jerseyDneprGk },
  "Барановичи": { regular: jerseyBaranovichi, gk: jerseyBaranovichiGk },
  "ФК Барановичи": { regular: jerseyBaranovichi, gk: jerseyBaranovichiGk },
  "Белшина": { regular: jerseyBelshina, gk: jerseyBelshinaGk },
  "Белшина Бобруйск": { regular: jerseyBelshina, gk: jerseyBelshinaGk },
  "Гомель": { regular: jerseyGomel, gk: jerseyGomelGk },
  "ФК Гомель": { regular: jerseyGomel, gk: jerseyGomelGk },
  "Ислочь": { regular: jerseyIsloch, gk: jerseyIslochGk },
  "ФК Ислочь": { regular: jerseyIsloch, gk: jerseyIslochGk },
  "Нафтан": { regular: jerseyNaftan, gk: jerseyNaftanGk },
  "Нафтан Новополоцк": { regular: jerseyNaftan, gk: jerseyNaftanGk },
  "Нафтан-Новополоцк": { regular: jerseyNaftan, gk: jerseyNaftanGk },
};

// Helper function to get jersey based on team and position
export const getJerseyForTeam = (team: string, position?: string) => {
  const isGoalkeeper = position === "ВР" || position === "Goalkeeper";
  const jerseySet = TEAM_JERSEY_MAP[team];
  
  if (jerseySet) {
    return isGoalkeeper ? jerseySet.gk : jerseySet.regular;
  }
  
  // Fallback на стандартную футболку Славии
  return isGoalkeeper ? jerseySlaviaGk : jerseySlavia;
};
