// Club logos mapping
import arsenalLogo from "@/assets/clubs/arsenalLogo.png";
import baranovichiLogo from "@/assets/clubs/baranovichiLogo.png";
import bateLogo from "@/assets/clubs/bateLogo.png";
import belshinaLogo from "@/assets/clubs/belshinaLogo.png";
import vitebskLogo from "@/assets/clubs/vitebskLogo.png";
import gomelLogo from "@/assets/clubs/gomelLogo.png";
import brestLogo from "@/assets/clubs/brestLogo.png";
import dinamoLogo from "@/assets/clubs/dinamoLogo.png";
import dneprLogo from "@/assets/clubs/dneprLogo.png";
import islochLogo from "@/assets/clubs/islochLogo.png";
import minskLogo from "@/assets/clubs/minskLogo.png";
import mlLogo from "@/assets/clubs/mlLogo.png";
import naftanLogo from "@/assets/clubs/naftanLogo.png";
import nemanLogo from "@/assets/clubs/nemanLogo.png";
import slaviaLogo from "@/assets/clubs/slaviaLogo.png";
import torpedoLogo from "@/assets/clubs/torpedoLogo.png";

export const clubLogos: Record<string, string> = {
  // Russian names
  "Арсенал": arsenalLogo,
  "Барановичи": baranovichiLogo,
  "БАТЭ": bateLogo,
  "Белшина": belshinaLogo,
  "Витебск": vitebskLogo,
  "Гомель": gomelLogo,
  "Динамо-Брест": brestLogo,
  "Динамо Брест": brestLogo,
  "Динамо-Минск": dinamoLogo,
  "Динамо Минск": dinamoLogo,
  "Днепр-Могилев": dneprLogo,
  "Днепр": dneprLogo,
  "Ислочь": islochLogo,
  "Минск": minskLogo,
  "МЛ Витебск": mlLogo,
  "Нафтан-Новополоцк": naftanLogo,
  "Нафтан": naftanLogo,
  "Неман": nemanLogo,
  "Славия-Мозырь": slaviaLogo,
  "Славия": slaviaLogo,
  "Торпедо-БелАЗ": torpedoLogo,
  "Торпедо": torpedoLogo,
  // English names (from backend)
  "Arsenal": arsenalLogo,
  "Baranovichi": baranovichiLogo,
  "BATE": bateLogo,
  "Bate Borisov": bateLogo,
  "Belshina": belshinaLogo,
  "Vitebsk": vitebskLogo,
  "FC Vitebsk": vitebskLogo,
  "Gomel": gomelLogo,
  "FC Gomel": gomelLogo,
  "Dinamo Brest": brestLogo,
  "Dinamo-Brest": brestLogo,
  "Dinamo Minsk": dinamoLogo,
  "Dinamo-Minsk": dinamoLogo,
  "Dnepr Mogilev": dneprLogo,
  "FC Dnepr Mogilev": dneprLogo,
  "Isloch": islochLogo,
  "FC Isloch Minsk R.": islochLogo,
  "FC Minsk": minskLogo,
  "ML Vitebsk": mlLogo,
  "Naftan": naftanLogo,
  "Neman": nemanLogo,
  "Slavia Mozyr": slaviaLogo,
  "Slavia-Mozyr": slaviaLogo,
  "Torpedo Zhodino": torpedoLogo,
  "Torpedo-Zhodino": torpedoLogo,
};

export const getClubLogo = (teamName: string): string | undefined => {
  return clubLogos[teamName];
};
