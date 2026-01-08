// Tour data utilities for fantasy league
// 30 tours in Belarus Higher League season

import boostBench from "@/assets/boost-bench.png";
import boostCaptain3x from "@/assets/boost-captain3x.png";
import boostTransfers from "@/assets/boost-transfers.png";
import boostGolden from "@/assets/boost-golden.png";
import boostDouble from "@/assets/boost-double.png";

export type BoostType = "bench" | "captain3x" | "transfers" | "golden" | "double";

export interface BoostInfo {
  id: BoostType;
  icon: string;
  label: string;
}

export const BOOST_CONFIG: Record<BoostType, BoostInfo> = {
  bench: { id: "bench", icon: boostBench, label: "Скамейка +" },
  captain3x: { id: "captain3x", icon: boostCaptain3x, label: "3x Капитан" },
  transfers: { id: "transfers", icon: boostTransfers, label: "Трансферы +" },
  golden: { id: "golden", icon: boostGolden, label: "Золотой тур" },
  double: { id: "double", icon: boostDouble, label: "Двойная сила" },
};

export const MAX_TOURS = 30;

// Generate deterministic tour data based on team ID seed
export function generateTourData(teamSeed: number) {
  const tourPoints: number[] = [];
  const tourBoosts: (BoostType | null)[] = [];
  
  // Generate points for each tour (30 tours)
  for (let tour = 1; tour <= MAX_TOURS; tour++) {
    // Deterministic random based on team seed and tour
    const seed = teamSeed * 1000 + tour;
    const pseudoRandom = Math.sin(seed) * 10000;
    const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
    
    // Points between 30 and 120
    const points = Math.floor(randomFactor * 90) + 30;
    tourPoints.push(points);
    tourBoosts.push(null);
  }
  
  // Assign boosts to random tours (each boost used once per season)
  const boostTypes: BoostType[] = ["bench", "captain3x", "transfers", "golden", "double"];
  const usedTours = new Set<number>();
  
  boostTypes.forEach((boostType, index) => {
    // Deterministic tour assignment based on team seed
    const seed = teamSeed * 100 + index;
    const pseudoRandom = Math.sin(seed) * 10000;
    const randomFactor = pseudoRandom - Math.floor(pseudoRandom);
    
    let tourIndex = Math.floor(randomFactor * MAX_TOURS);
    
    // Find next available tour if already used
    while (usedTours.has(tourIndex)) {
      tourIndex = (tourIndex + 1) % MAX_TOURS;
    }
    
    usedTours.add(tourIndex);
    tourBoosts[tourIndex] = boostType;
  });
  
  return { tourPoints, tourBoosts };
}

export function getTourBoostInfo(boostType: BoostType | null): BoostInfo | null {
  if (!boostType) return null;
  return BOOST_CONFIG[boostType];
}
