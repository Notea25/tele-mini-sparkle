// ВРЕМЕННО: заглушки для отображения соперника.
// Реальные данные о следующем сопернике приходят из backend (PlayerFullInfo.next_3_tours)
// и используются в карточке игрока (календарь). Для плиток состава мы больше
// не генерируем фейковый календарь на фронтенде.

export function normalizeTeamName(teamName: string): string {
  return teamName;
}

export interface PlayerWithOpponent {
  nextOpponent: string;
  nextOpponentHome: boolean;
}

export function getNextOpponentData(teamName: string): PlayerWithOpponent {
  return {
    nextOpponent: "",
    nextOpponentHome: false,
  };
}
