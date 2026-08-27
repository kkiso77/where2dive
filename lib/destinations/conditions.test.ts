import { describe, expect, it } from "vitest";

import { getCondition, getConditionReason } from "./conditions";
import type { Destination } from "./types";

const destination: Destination = {
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
  condition: { optimal: [1, 2], good: [3, 4], poor: [5, 6] },
  reason: { optimal: "최적 이유", good: "양호 이유", poor: "비추천 이유" },
  divePrices: [4, 3.5, 3.3, 3.0],
  gear: 1.5,
  liveaboard: null,
  lodging: { shop: [3, 4], separate: [3, 7] },
  maps: "https://example.com",
};

describe("getCondition", () => {
  it("optimal 월이면 최적을 반환한다", () => {
    expect(getCondition(destination, 1)).toBe("optimal");
  });

  it("good 월이면 양호를 반환한다", () => {
    expect(getCondition(destination, 3)).toBe("good");
  });

  it("어디에도 없는 월이면 비추천으로 취급한다", () => {
    expect(getCondition(destination, 5)).toBe("poor");
    expect(getCondition(destination, 12)).toBe("poor");
  });
});

describe("getConditionReason", () => {
  it("현재 컨디션 등급에 맞는 이유를 반환한다", () => {
    expect(getConditionReason(destination, 1)).toBe("최적 이유");
    expect(getConditionReason(destination, 3)).toBe("양호 이유");
    expect(getConditionReason(destination, 12)).toBe("비추천 이유");
  });

  it("해당 등급의 이유가 없으면 good, optimal 순으로 대신 쓴다", () => {
    const withoutPoorReason: Destination = {
      ...destination,
      reason: { optimal: "최적 이유", good: "양호 이유" },
    };
    expect(getConditionReason(withoutPoorReason, 12)).toBe("양호 이유");
  });
});
