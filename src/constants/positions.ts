export enum PositionCode {
  GK = "ВР",
  DEF = "ЗЩ",
  MID = "ПЗ",
  FWD = "НП",
}

export const POSITION_LABELS_SINGULAR: Record<PositionCode, string> = {
  [PositionCode.GK]: "Вратарь",
  [PositionCode.DEF]: "Защитник",
  [PositionCode.MID]: "Полузащитник",
  [PositionCode.FWD]: "Нападающий",
};

export const POSITION_LABELS_PLURAL: Record<PositionCode, string> = {
  [PositionCode.GK]: "Вратари",
  [PositionCode.DEF]: "Защита",
  [PositionCode.MID]: "Полузащита",
  [PositionCode.FWD]: "Нападение",
};

export function getPositionLabel(pos: PositionCode, count: number): string {
  if (pos === PositionCode.GK) {
    return count === 1 ? POSITION_LABELS_SINGULAR[pos] : POSITION_LABELS_PLURAL[pos];
  }
  return POSITION_LABELS_PLURAL[pos];
}
