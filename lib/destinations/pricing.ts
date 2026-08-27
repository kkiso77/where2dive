import { DIVE_BANDS } from "./data";
import type { Destination } from "./types";

// 여행 기간(일수)에서 다이빙 횟수 기본값을 추정한다.
// 이동에 앞뒤 하루씩을 쓰고, 남은 날에 하루 3다이브를 적용한다.
export function estimateDives(days: number): number {
  return Math.max(0, days - 2) * 3;
}

export interface DiveUnitPrice {
  perDive: number;
  bandIndex: number; // 다이빙 횟수가 0이면 -1(적용 구간 없음)
}

export function getDiveUnitPrice(destination: Destination, dives: number): DiveUnitPrice {
  if (dives <= 0) return { perDive: destination.divePrices[0], bandIndex: -1 };
  let bandIndex = 0;
  DIVE_BANDS.forEach((band, i) => {
    if (dives >= band.min) bandIndex = i;
  });
  return { perDive: destination.divePrices[bandIndex], bandIndex };
}

export function isLiveaboardAvailable(destination: Destination, month: number): boolean {
  return destination.liveaboard != null && destination.liveaboard.months.includes(month);
}

export interface CostEstimate {
  diveCost: number;
  gearCost: number;
  flightMin: number;
  flightMax: number;
  lodgingShopMin: number;
  lodgingShopMax: number;
  lodgingSeparateMin: number;
  lodgingSeparateMax: number;
  totalMin: number;
  totalMax: number;
  nights: number;
  liveaboardPackageMin?: number;
  liveaboardPackageMax?: number;
  liveaboardTotalMin?: number;
  liveaboardTotalMax?: number;
}

// 여행 기간(days)과 다이빙 횟수(dives)를 기준으로 예상 견적 범위를 계산한다.
// 숙소는 다이빙샵 패키지 포함형 기준으로 총액 범위를 낸다.
// 리브어보드는 육상 다이빙과는 별도의 여행 형태라 육상 기준 총액에 합산하지 않고,
// 항공 + 리브어보드 패키지(박수 곱)만으로 별도의 총액을 낸다.
export function estimateCost(destination: Destination, dives: number, days: number): CostEstimate {
  const { perDive } = getDiveUnitPrice(destination, dives);
  const diveCost = perDive * dives;
  const gearCost = destination.gear * Math.ceil(dives / 3);
  const nights = Math.max(1, days - 1);
  const lodgingShopMin = destination.lodging.shop[0] * nights;
  const lodgingShopMax = destination.lodging.shop[1] * nights;
  const lodgingSeparateMin = destination.lodging.separate[0] * nights;
  const lodgingSeparateMax = destination.lodging.separate[1] * nights;

  const liveaboardPackageMin = destination.liveaboard ? destination.liveaboard.priceMin * nights : undefined;
  const liveaboardPackageMax = destination.liveaboard ? destination.liveaboard.priceMax * nights : undefined;

  return {
    diveCost,
    gearCost,
    flightMin: destination.flight.priceMin,
    flightMax: destination.flight.priceMax,
    lodgingShopMin,
    lodgingShopMax,
    lodgingSeparateMin,
    lodgingSeparateMax,
    nights,
    totalMin: diveCost + gearCost + destination.flight.priceMin + lodgingShopMin,
    totalMax: diveCost + gearCost + destination.flight.priceMax + lodgingShopMax,
    liveaboardPackageMin,
    liveaboardPackageMax,
    liveaboardTotalMin:
      liveaboardPackageMin != null ? destination.flight.priceMin + liveaboardPackageMin : undefined,
    liveaboardTotalMax:
      liveaboardPackageMax != null ? destination.flight.priceMax + liveaboardPackageMax : undefined,
  };
}

export function estimateTotalAverage(destination: Destination, dives: number, days: number): number {
  const { totalMin, totalMax } = estimateCost(destination, dives, days);
  return (totalMin + totalMax) / 2;
}
