import { describe, expect, it } from "vitest";

import { groupByCountry, matchesFilters, sortByDistance, splitByCondition } from "./filters";
import type { Destination } from "./types";

function makeDestination(overrides: Partial<Destination>): Destination {
  return {
    id: "test",
    name: "테스트 목적지",
    country: "필리핀",
    region: "필리핀",
    distanceKm: 1000,
    coordinates: [0, 0],
    flight: { transfer: "직항", priceMin: 10, priceMax: 20, destinationAirport: "테스트" },
    localTransfer: "테스트 이동",
    localTransferShort: "테스트",
    styles: ["초급자"],
    condition: { optimal: [1], good: [2], poor: [3] },
    reason: { optimal: "최적 이유", good: "양호 이유", poor: "비추천 이유" },
    divePrices: [4, 3.5, 3.3, 3.0],
    gear: 1.5,
    liveaboard: null,
    lodging: { shop: [3, 4], separate: [3, 7] },
    maps: "https://example.com",
    ...overrides,
  };
}

describe("sortByDistance", () => {
  it("인천 기준 거리가 가까운 순으로 정렬한다", () => {
    const far = makeDestination({ id: "far", distanceKm: 6000 });
    const near = makeDestination({ id: "near", distanceKm: 2000 });
    const mid = makeDestination({ id: "mid", distanceKm: 4000 });

    const sorted = sortByDistance([far, near, mid]);

    expect(sorted.map((d) => d.id)).toEqual(["near", "mid", "far"]);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const list = [makeDestination({ id: "a", distanceKm: 2000 }), makeDestination({ id: "b", distanceKm: 1000 })];
    const original = [...list];

    sortByDistance(list);

    expect(list).toEqual(original);
  });
});

describe("matchesFilters", () => {
  it("지역이 all이면 모든 목적지를 통과시킨다", () => {
    const destination = makeDestination({ region: "태국" });
    expect(matchesFilters(destination, { region: "all", styles: [] })).toBe(true);
  });

  it("지역이 다르면 걸러낸다", () => {
    const destination = makeDestination({ region: "태국" });
    expect(matchesFilters(destination, { region: "필리핀", styles: [] })).toBe(false);
  });

  it("선택한 스타일을 모두 가진 목적지만 통과시킨다", () => {
    const destination = makeDestination({ styles: ["대물", "드리프트"] });
    expect(matchesFilters(destination, { region: "all", styles: ["대물"] })).toBe(true);
    expect(matchesFilters(destination, { region: "all", styles: ["대물", "매크로"] })).toBe(false);
  });
});

describe("splitByCondition", () => {
  it("그 달에 비추천인 목적지만 notRecommended로 분리한다", () => {
    const optimalInJan = makeDestination({
      id: "optimal-jan",
      distanceKm: 1000,
      condition: { optimal: [1], good: [2], poor: [3] },
    });
    const poorInJan = makeDestination({
      id: "poor-jan",
      distanceKm: 2000,
      condition: { optimal: [7], good: [8], poor: [1] },
    });

    const result = splitByCondition([optimalInJan, poorInJan], 1);

    expect(result.recommended.map((d) => d.id)).toEqual(["optimal-jan"]);
    expect(result.notRecommended.map((d) => d.id)).toEqual(["poor-jan"]);
  });

  it("각 그룹 내부는 거리순으로 정렬된다", () => {
    const far = makeDestination({ id: "far", distanceKm: 6000 });
    const near = makeDestination({ id: "near", distanceKm: 2000 });

    const result = splitByCondition([far, near], 1);

    expect(result.recommended.map((d) => d.id)).toEqual(["near", "far"]);
  });
});

describe("groupByCountry", () => {
  it("국가별로 목적지를 묶는다", () => {
    const list = [
      makeDestination({ id: "a", country: "필리핀" }),
      makeDestination({ id: "b", country: "태국" }),
      makeDestination({ id: "c", country: "필리핀" }),
    ];

    const groups = groupByCountry(list);

    expect(groups.get("필리핀")?.map((d) => d.id)).toEqual(["a", "c"]);
    expect(groups.get("태국")?.map((d) => d.id)).toEqual(["b"]);
  });
});
