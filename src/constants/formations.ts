export interface FormationShape {
  DEF: number;
  MID: number;
  FWD: number;
  name: string;
}

export const VALID_FORMATIONS: FormationShape[] = [
  { DEF: 4, MID: 3, FWD: 3, name: "4-3-3" },
  { DEF: 4, MID: 4, FWD: 2, name: "4-4-2" },
  { DEF: 3, MID: 5, FWD: 2, name: "3-5-2" },
  { DEF: 5, MID: 4, FWD: 1, name: "5-4-1" },
  { DEF: 3, MID: 4, FWD: 3, name: "3-4-3" },
  { DEF: 4, MID: 5, FWD: 1, name: "4-5-1" },
  { DEF: 5, MID: 2, FWD: 3, name: "5-2-3" },
  { DEF: 5, MID: 3, FWD: 2, name: "5-3-2" },
];

export function isValidFormation(defenders: number, midfielders: number, forwards: number): boolean {
  return VALID_FORMATIONS.some(
    (f) => f.DEF === defenders && f.MID === midfielders && f.FWD === forwards,
  );
}
