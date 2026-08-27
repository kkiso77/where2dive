"use client";

import {
  CONDITION_LABEL,
  estimateTotalAverage,
  getCondition,
  getDiveUnitPrice,
  isLiveaboardAvailable,
  matchesFilters,
  type Destination,
  type DiveStyle,
  type Region,
} from "@/lib/destinations";

function formatMan(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}만원`;
}

function formatRange(min: number, max: number) {
  return `${Math.round(min).toLocaleString("ko-KR")}～${Math.round(max).toLocaleString("ko-KR")}만원`;
}

function flightRouteLabel(destination: Destination) {
  if (destination.flight.transfer === "직항") {
    return `인천 → ${destination.flight.destinationAirport} 직항`;
  }
  return `인천 → ${destination.flight.transferAirport} 경유 → ${destination.flight.destinationAirport}`;
}

interface CompareOverlayProps {
  destinations: Destination[];
  month: number;
  dives: number;
  days: number;
  region: Region | "all";
  styles: DiveStyle[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function CompareOverlay({
  destinations,
  month,
  dives,
  days,
  region,
  styles,
  onRemove,
  onClose,
}: CompareOverlayProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[88vh] w-full max-w-4xl overflow-auto rounded-lg bg-popover p-5 shadow-2xl">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-lg font-bold">후보지 비교</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            닫기
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th />
                {destinations.map((destination) => {
                  const passesFilter = matchesFilters(destination, { region, styles });
                  const isPoor = getCondition(destination, month) === "poor";
                  return (
                    <th key={destination.id} className="min-w-[170px] px-2.5 pb-3 text-left align-top">
                      <button
                        type="button"
                        aria-label={`${destination.name} 비교에서 빼기`}
                        onClick={() => onRemove(destination.id)}
                        className="float-right text-sm text-muted-foreground"
                      >
                        ×
                      </button>
                      <div className="text-sm font-bold">{destination.name}</div>
                      <div className="text-muted-foreground">{destination.country}</div>
                      {!passesFilter && (
                        <span className="mt-1 inline-block rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                          현재 조건에서 후보 아님
                        </span>
                      )}
                      {passesFilter && isPoor && (
                        <span className="mt-1 inline-block rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">
                          이번 달 비추천
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-muted-foreground">
                  컨디션
                </th>
                {destinations.map((destination) => (
                  <td key={destination.id} className="px-2.5 py-2 align-top">
                    {CONDITION_LABEL[getCondition(destination, month)]}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-muted-foreground">
                  스타일
                </th>
                {destinations.map((destination) => (
                  <td key={destination.id} className="px-2.5 py-2 align-top">
                    {destination.styles.join(" ")}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-muted-foreground">
                  다이빙 비용
                </th>
                {destinations.map((destination) => {
                  const { perDive } = getDiveUnitPrice(destination, dives);
                  return (
                    <td key={destination.id} className="px-2.5 py-2 align-top">
                      {formatMan(perDive * dives)} ({dives}회)
                    </td>
                  );
                })}
              </tr>
              <tr className="border-t">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-muted-foreground">
                  리브어보드
                </th>
                {destinations.map((destination) => (
                  <td key={destination.id} className="px-2.5 py-2 align-top">
                    {destination.liveaboard
                      ? isLiveaboardAvailable(destination, month)
                        ? formatRange(destination.liveaboard.priceMin, destination.liveaboard.priceMax)
                        : "이번 달 미운항"
                      : "해당 없음"}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-muted-foreground">
                  항공(왕복)
                </th>
                {destinations.map((destination) => (
                  <td key={destination.id} className="px-2.5 py-2 align-top">
                    {flightRouteLabel(destination)}
                    <div className="text-muted-foreground">
                      {formatRange(destination.flight.priceMin, destination.flight.priceMax)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-semibold text-muted-foreground">
                  숙소(패키지)
                </th>
                {destinations.map((destination) => {
                  const nights = Math.max(1, days - 1);
                  return (
                    <td key={destination.id} className="px-2.5 py-2 align-top">
                      {formatRange(destination.lodging.shop[0] * nights, destination.lodging.shop[1] * nights)}
                    </td>
                  );
                })}
              </tr>
              <tr className="border-t-2 border-foreground">
                <th scope="row" className="whitespace-nowrap py-2 pr-3 text-left font-bold">
                  예상 총액
                </th>
                {destinations.map((destination) => (
                  <td key={destination.id} className="px-2.5 py-2 align-top font-bold">
                    약 {formatMan(estimateTotalAverage(destination, dives, days))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
