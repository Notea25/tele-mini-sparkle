import type { BoostType } from "@/lib/api";

export enum BoostId {
  BENCH = "bench",
  CAPTAIN3X = "captain3x",
  DOUBLE = "double",
  TRANSFERS = "transfers",
  GOLDEN = "golden",
}

export enum BoostSection {
  TEAM_MANAGEMENT = "team-management",
  TRANSFERS = "transfers",
}

export const TEAM_MANAGEMENT_BOOSTS: BoostId[] = [
  BoostId.BENCH,
  BoostId.CAPTAIN3X,
  BoostId.DOUBLE,
];

export const TRANSFER_BOOSTS: BoostId[] = [
  BoostId.TRANSFERS,
  BoostId.GOLDEN,
];

export const BOOST_TYPE_TO_ID: Record<BoostType, BoostId> = {
  bench_boost: BoostId.BENCH,
  triple_captain: BoostId.CAPTAIN3X,
  double_bet: BoostId.DOUBLE,
  transfers_plus: BoostId.TRANSFERS,
  gold_tour: BoostId.GOLDEN,
};

export const BOOST_ID_TO_TYPE: Record<BoostId, BoostType> = {
  [BoostId.BENCH]: "bench_boost",
  [BoostId.CAPTAIN3X]: "triple_captain",
  [BoostId.DOUBLE]: "double_bet",
  [BoostId.TRANSFERS]: "transfers_plus",
  [BoostId.GOLDEN]: "gold_tour",
};
