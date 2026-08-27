import { describe, expect, it } from "vitest";

import { estimateCost, estimateDives, getDiveUnitPrice, isLiveaboardAvailable } from "./pricing";
import type { Destination } from "./types";

const destination: Destination = {
  id: "test",
  name: "테스트 목적지",
  country: "필리핀",
  region: "필리핀",
  distanceKm: 1000,
  coordinates: [0, 0],
  flight: { transfer: "직항", priceMin: 50, priceMax: 70, destinationAirport: "테스트" },
  localTransfer: "테스트 이동",
  localTransferShort: "테스트",
  styles: ["초급자"],
  condition: { optimal: [1], good: [2], poor: [3] },
  reason: { optimal: "최적 이유" },
  divePrices: [4.0, 3.5, 3.3, 3.0],
  gear: 1.5,
  liveaboard: { months: [4, 5, 6], priceMin: 20, priceMax: 30 },
  lodging: { shop: [3.0, 4.0], separate: [3.5, 6.0] },
  maps: "https://example.com",
};

describe("estimateDives", () => {
  it("이동에 앞뒤 하루씩 쓰고 남은 날에 하루 3다이브를 적용한다", () => {
    expect(estimateDives(5)).toBe(9);
    expect(estimateDives(7)).toBe(15);
  });

  it("이동일보다 짧은 기간에서도 음수가 나오지 않는다", () => {
    expect(estimateDives(1)).toBe(0);
    expect(estimateDives(0)).toBe(0);
  });
});

describe("getDiveUnitPrice", () => {
  it("다이빙 횟수가 각 구간 경계에 들어가면 해당 구간 단가를 적용한다", () => {
    expect(getDiveUnitPrice(destination, 1).perDive).toBe(4.0);
    expect(getDiveUnitPrice(destination, 2).perDive).toBe(4.0);
    expect(getDiveUnitPrice(destination, 3).perDive).toBe(3.5);
    expect(getDiveUnitPrice(destination, 4).perDive).toBe(3.5);
    expect(getDiveUnitPrice(destination, 5).perDive).toBe(3.3);
    expect(getDiveUnitPrice(destination, 9).perDive).toBe(3.3);
    expect(getDiveUnitPrice(destination, 10).perDive).toBe(3.0);
    expect(getDiveUnitPrice(destination, 20).perDive).toBe(3.0);
  });

  it("경계를 넘어서면 bandIndex도 함께 올라간다", () => {
    expect(getDiveUnitPrice(destination, 2).bandIndex).toBe(0);
    expect(getDiveUnitPrice(destination, 5).bandIndex).toBe(2);
    expect(getDiveUnitPrice(destination, 10).bandIndex).toBe(3);
  });

  it("다이빙 횟수가 0이면 적용 구간이 없다", () => {
    expect(getDiveUnitPrice(destination, 0).bandIndex).toBe(-1);
  });
});

describe("isLiveaboardAvailable", () => {
  it("리브어보드 운항 시즌에 여행 월이 포함되면 true를 반환한다", () => {
    expect(isLiveaboardAvailable(destination, 5)).toBe(true);
    expect(isLiveaboardAvailable(destination, 1)).toBe(false);
  });

  it("리브어보드가 없는 목적지는 항상 false를 반환한다", () => {
    expect(isLiveaboardAvailable({ ...destination, liveaboard: null }, 5)).toBe(false);
  });
});

describe("estimateCost", () => {
  it("알려진 요금표와 다이빙 횟수 조합에 대해 견적 총액이 기대값과 일치한다", () => {
    // 9회 다이빙(5～9회 구간, 3.3만원) + 장비(3일치, ceil(9/3)=3 * 1.5) + 항공(50~70) + 숙소(4박, 3.0~4.0 * 4)
    const estimate = estimateCost(destination, 9, 5);

    expect(estimate.diveCost).toBeCloseTo(9 * 3.3);
    expect(estimate.gearCost).toBeCloseTo(3 * 1.5);
    expect(estimate.nights).toBe(4);
    expect(estimate.lodgingShopMin).toBeCloseTo(3.0 * 4);
    expect(estimate.lodgingShopMax).toBeCloseTo(4.0 * 4);
    expect(estimate.totalMin).toBeCloseTo(9 * 3.3 + 3 * 1.5 + 50 + 3.0 * 4);
    expect(estimate.totalMax).toBeCloseTo(9 * 3.3 + 3 * 1.5 + 70 + 4.0 * 4);
  });

  it("여행 기간이 1일이어도 최소 1박으로 계산한다", () => {
    const estimate = estimateCost(destination, 0, 1);
    expect(estimate.nights).toBe(1);
  });

  it("리브어보드가 있는 목적지는 항공 + 리브어보드 패키지(박수 곱)로 별도 총액을 낸다", () => {
    const estimate = estimateCost(destination, 9, 5);

    // nights=4, liveaboard 20~30(1박) * 4
    expect(estimate.liveaboardPackageMin).toBeCloseTo(20 * 4);
    expect(estimate.liveaboardPackageMax).toBeCloseTo(30 * 4);
    expect(estimate.liveaboardTotalMin).toBeCloseTo(50 + 20 * 4);
    expect(estimate.liveaboardTotalMax).toBeCloseTo(70 + 30 * 4);
    // 육상 기준 총액에는 리브어보드 비용이 섞이지 않는다.
    expect(estimate.totalMin).toBeCloseTo(9 * 3.3 + 3 * 1.5 + 50 + 3.0 * 4);
  });

  it("리브어보드가 없는 목적지는 리브어보드 관련 필드가 없다", () => {
    const estimate = estimateCost({ ...destination, liveaboard: null }, 9, 5);

    expect(estimate.liveaboardTotalMin).toBeUndefined();
    expect(estimate.liveaboardTotalMax).toBeUndefined();
  });
});
