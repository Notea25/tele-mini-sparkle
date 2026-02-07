// Team abbreviations mapping (Russian 3-letter codes)
// Used for displaying opponent names on player cards

export const TEAM_ABBREVIATIONS: Record<string, string> = {
  // Русские названия
  "Арсенал": "АРС",
  "Арсенал Дзержинск": "АРС",
  "БАТЭ": "БАТ",
  "БАТЭ Борисов": "БАТ",
  "Белшина": "БЕЛ",
  "Белшина Бобруйск": "БЕЛ",
  "Витебск": "ВИТ",
  "ФК Витебск": "ВИТ",
  "Гомель": "ГОМ",
  "ФК Гомель": "ГОМ",
  "Динамо-Минск": "ДМН",
  "Динамо Минск": "ДМН",
  "Динамо-Брест": "ДБР",
  "Динамо Брест": "ДБР",
  "Днепр": "ДНП",
  "Днепр Могилев": "ДНП",
  "Днепр-Могилев": "ДНП",
  "Ислочь": "ИСЛ",
  "ФК Ислочь": "ИСЛ",
  "МЛ Витебск": "МЛВ",
  "Минск": "МИН",
  "ФК Минск": "МИН",
  "Нафтан": "НАФ",
  "Нафтан Новополоцк": "НАФ",
  "Нафтан-Новополоцк": "НАФ",
  "Неман": "НЕМ",
  "Неман Гродно": "НЕМ",
  "Славия-Мозырь": "СЛА",
  "Славия Мозырь": "СЛА",
  "Славия": "СЛА",
  "Торпедо-БелАЗ": "ТОР",
  "Торпедо БелАЗ": "ТОР",
  "Торпедо": "ТОР",
  "Барановичи": "БАР",
  "ФК Барановичи": "БАР",
  
  // English names (from backend)
  "Arsenal": "АРС",
  "Bate Borisov": "БАТ",
  "BATE": "БАТ",
  "Belshina": "БЕЛ",
  "Vitebsk": "ВИТ",
  "FC Vitebsk": "ВИТ",
  "Gomel": "ГОМ",
  "FC Gomel": "ГОМ",
  "Dinamo Minsk": "ДМН",
  "Dinamo-Minsk": "ДМН",
  "Dinamo Brest": "ДБР",
  "Dinamo-Brest": "ДБР",
  "Dnepr Mogilev": "ДНП",
  "FC Dnepr Mogilev": "ДНП",
  "Isloch": "ИСЛ",
  "FC Isloch Minsk R.": "ИСЛ",
  "ML Vitebsk": "МЛВ",
  "Minsk": "МИН",
  "FC Minsk": "МИН",
  "Naftan": "НАФ",
  "Neman": "НЕМ",
  "Slavia Mozyr": "СЛА",
  "Slavia-Mozyr": "СЛА",
  "Torpedo Zhodino": "ТОР",
  "Torpedo-Zhodino": "ТОР",
  "Baranovichi": "БАР",
};

/**
 * Get 3-letter abbreviation for a team name
 * Returns the original name (truncated to 3 chars) if no mapping exists
 */
export const getTeamAbbreviation = (teamName: string): string => {
  if (!teamName) return "—";
  return TEAM_ABBREVIATIONS[teamName] || teamName.slice(0, 3).toUpperCase();
};
