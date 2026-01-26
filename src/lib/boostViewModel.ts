import type { BoostChip, BoostStatus } from "@/components/BoostDrawer";
import type { BoostType } from "@/lib/api";
import { BOOST_TYPE_TO_ID, BoostId, BoostSection, TEAM_MANAGEMENT_BOOSTS, TRANSFER_BOOSTS } from "@/constants/boosts";

export interface BackendBoostInfo {
  type: BoostType;
  available: boolean;
  used_in_tour_number: number | null;
}

export type BoostAvailabilityMap = Record<BoostId, { available: boolean; usedInTourNumber?: number | null }>;

export function mapAvailableBoostsToView(backendBoosts: BackendBoostInfo[] | undefined | null): BoostAvailabilityMap {
  const map: Partial<BoostAvailabilityMap> = {};

  if (backendBoosts) {
    backendBoosts.forEach((boost) => {
      const id = BOOST_TYPE_TO_ID[boost.type];
      if (!id) return;
      map[id] = {
        available: boost.available,
        usedInTourNumber: boost.used_in_tour_number,
      };
    });
  }

  return map as BoostAvailabilityMap;
}

export function getActiveNextTourBoostId(
  availabilityMap: BoostAvailabilityMap,
  usedForNextTour: boolean,
  nextTourNumber: number | null,
): BoostId | null {
  if (!usedForNextTour) return null;

  const entries = Object.entries(availabilityMap) as [BoostId, { available: boolean; usedInTourNumber?: number | null }][];
  const unavailable = entries.filter(([, data]) => data.available === false);

  if (unavailable.length === 1) {
    return unavailable[0][0];
  }

  if (nextTourNumber != null) {
    const byNextTour = unavailable.find(([, data]) => data.usedInTourNumber === nextTourNumber);
    if (byNextTour) return byNextTour[0];
  }

  return null;
}

interface BuildBoostChipParams {
  section: BoostSection;
  baseChips: BoostChip[];
  availabilityMap: BoostAvailabilityMap;
  usedForNextTour: boolean;
  activeNextTourBoostId: BoostId | null;
  nextTourNumber: number | null;
  pendingBoostId: BoostId | null;
}

export function buildBoostChipStateForPage(params: BuildBoostChipParams): BoostChip[] {
  const {
    section,
    baseChips,
    availabilityMap,
    usedForNextTour,
    activeNextTourBoostId,
    nextTourNumber,
    pendingBoostId,
  } = params;

  const sectionBoostIds = section === BoostSection.TEAM_MANAGEMENT ? TEAM_MANAGEMENT_BOOSTS : TRANSFER_BOOSTS;

  return baseChips.map((chip) => {
    const id = chip.id as BoostId;
    const boostData = availabilityMap[id];
    const isSectionBoost = sectionBoostIds.includes(id);

    // 1) Локальный pending для текущего раздела
    if (pendingBoostId && pendingBoostId === id && isSectionBoost) {
      return { ...chip, status: "pending" as BoostStatus, sublabel: "Используется" };
    }

    // 2) Если бэкенд говорит, что буст уже использован
    if (boostData && boostData.available === false) {
      // 2.1 Выбран на следующий тур
      if (nextTourNumber && boostData.usedInTourNumber === nextTourNumber) {
        return {
          ...chip,
          status: "pending" as BoostStatus,
          sublabel: "Используется",
          usedInTour: boostData.usedInTourNumber || undefined,
        };
      }

      // 2.2 Использован в прошлом туре
      return {
        ...chip,
        status: "used" as BoostStatus,
        sublabel: boostData.usedInTourNumber
          ? `Использован во ${boostData.usedInTourNumber} туре`
          : "Использован",
        usedInTour: boostData.usedInTourNumber || undefined,
      };
    }

    // 3) На следующий тур уже выбран другой буст — этот блокируем
    if (usedForNextTour && activeNextTourBoostId && id !== activeNextTourBoostId) {
      return {
        ...chip,
        status: "used" as BoostStatus,
        sublabel:
          section === BoostSection.TRANSFERS
            ? "Недоступен (буст уже выбран на следующий тур)"
            : "Заблокирован",
      };
    }

    // 4) По умолчанию буст доступен
    return { ...chip, status: "available" as BoostStatus, sublabel: "Подробнее", usedInTour: undefined };
  });
}

export function hasBoostActiveInOtherSection(section: BoostSection, activeBoostId: BoostId | null): boolean {
  if (!activeBoostId) return false;
  if (section === BoostSection.TEAM_MANAGEMENT) {
    return TRANSFER_BOOSTS.includes(activeBoostId);
  }
  return TEAM_MANAGEMENT_BOOSTS.includes(activeBoostId);
}
