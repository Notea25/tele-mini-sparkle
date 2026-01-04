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

// Helper function to get jersey based on team and position
export const getJerseyForTeam = (team: string, position?: string) => {
  switch (team) {
    case "Динамо-Минск":
      return position === "ВР" ? jerseyDinamoMinskGk : jerseyDinamoMinsk;
    case "БАТЭ":
      return position === "ВР" ? jerseyBateGk : jerseyBate;
    case "Динамо-Брест":
      return position === "ВР" ? jerseyDinamoBrestGk : jerseyDinamoBrest;
    case "МЛ Витебск":
      return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
    case "Славия-Мозырь":
      return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
    case "Арсенал":
      return position === "ВР" ? jerseyArsenalGk : jerseyArsenal;
    case "Неман":
      return position === "ВР" ? jerseyNemanGk : jerseyNeman;
    case "Минск":
      return position === "ВР" ? jerseyMinskGk : jerseyMinsk;
    case "Торпедо-БелАЗ":
      return position === "ВР" ? jerseyTorpedoGk : jerseyTorpedo;
    case "Витебск":
      return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
    case "Днепр":
      return position === "ВР" ? jerseyDneprGk : jerseyDnepr;
    case "Барановичи":
      return position === "ВР" ? jerseyBaranovichiGk : jerseyBaranovichi;
    case "Белшина":
      return position === "ВР" ? jerseyBelshinaGk : jerseyBelshina;
      case "Гомель":
      return position === "ВР" ? jerseyGomelGk : jerseyGomel;
      case "Ислочь":
      return position === "ВР" ? jerseyIslochGk : jerseyIsloch;
      case "Нафтан":
      return position === "ВР" ? jerseyNaftanGk : jerseyNaftan;
    default:
      return jerseySlavia;
  }
};
