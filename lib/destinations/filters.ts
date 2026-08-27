import { getCondition } from "./conditions";
import type { Destination, DiveStyle, Region } from "./types";

export interface SearchFilters {
  region: Region | "all";
  styles: DiveStyle[];
}

export function matchesFilters(destination: Destination, filters: SearchFilters): boolean {
  if (filters.region !== "all" && destination.region !== filters.region) return false;
  if (filters.styles.length > 0) {
    return filters.styles.every((style) => destination.styles.includes(style));
  }
  return true;
}

export function sortByDistance(destinations: Destination[]): Destination[] {
  return [...destinations].sort((a, b) => a.distanceKm - b.distanceKm);
}

export interface SplitByConditionResult {
  recommended: Destination[];
  notRecommended: Destination[];
}

// 조건에 맞는 목적지를 그 달의 컨디션 기준으로 추천/비추천 두 그룹으로 나눈다.
// 필터를 통과하지 못해 아예 후보가 아닌 목적지는 애초에 이 함수에 넘기지 않는다.
export function splitByCondition(destinations: Destination[], month: number): SplitByConditionResult {
  const recommended: Destination[] = [];
  const notRecommended: Destination[] = [];
  for (const destination of sortByDistance(destinations)) {
    if (getCondition(destination, month) === "poor") notRecommended.push(destination);
    else recommended.push(destination);
  }
  return { recommended, notRecommended };
}

export function groupByCountry(destinations: Destination[]): Map<string, Destination[]> {
  const groups = new Map<string, Destination[]>();
  for (const destination of destinations) {
    const list = groups.get(destination.country);
    if (list) list.push(destination);
    else groups.set(destination.country, [destination]);
  }
  return groups;
}
