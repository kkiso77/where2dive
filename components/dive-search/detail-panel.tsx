"use client";

import { cn } from "@/lib/utils";
import {
  CONDITION_LABEL,
  DIVE_BANDS,
  REFERENCE_DATE,
  estimateCost,
  getCondition,
  getConditionReason,
  getDiveUnitPrice,
  isLiveaboardAvailable,
  type Destination,
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

interface DetailPanelProps {
  destination: Destination;
  month: number;
  dives: number;
  days: number;
  diveManuallySet: boolean;
  onDivesChange: (dives: number) => void;
  onClose: () => void;
}

export function DetailPanel({
  destination,
  month,
  dives,
  days,
  diveManuallySet,
  onDivesChange,
  onClose,
}: DetailPanelProps) {
  const condition = getCondition(destination, month);
  const reason = getConditionReason(destination, month);
  const { bandIndex, perDive } = getDiveUnitPrice(destination, dives);
  const estimate = estimateCost(destination, dives, days);
  const liveaboard = isLiveaboardAvailable(destination, month);

  return (
    <div
      data-testid="detail-panel"
      className="flex flex-col overflow-y-auto rounded-lg border bg-popover p-4 lg:max-h-[calc(100vh-var(--sticky-top)-0.75rem)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{destination.name}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {destination.country} · {CONDITION_LABEL[condition]} · {month}월 기준
          </p>
        </div>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-sm"
        >
          ✕
        </button>
      </div>

      <p className={cn("mb-3 mt-2 text-xs leading-relaxed", condition === "poor" && "text-destructive/80")}>
        {reason}
      </p>

      <div className="mb-3 flex items-center justify-between rounded-md bg-muted px-3 py-2.5">
        <div>
          <p className="text-xs">다이빙 횟수</p>
          <p className="text-[11px] text-muted-foreground">
            {diveManuallySet ? "직접 조정함" : `${days}일 여행 기준 추정`}
          </p>
        </div>
        <span className="flex h-8 items-center rounded-md border">
          <button
            type="button"
            aria-label="다이빙 횟수 줄이기"
            onClick={() => onDivesChange(Math.max(0, dives - 1))}
            className="flex h-full w-6 items-center justify-center text-sm"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="다이빙 횟수"
            value={dives}
            onChange={(e) => {
              const value = Number(e.target.value.replace(/[^0-9]/g, ""));
              onDivesChange(Number.isNaN(value) ? 0 : value);
            }}
            className="h-full w-9 border-x text-center text-sm"
          />
          <button
            type="button"
            aria-label="다이빙 횟수 늘리기"
            onClick={() => onDivesChange(dives + 1)}
            className="flex h-full w-6 items-center justify-center text-sm"
          >
            +
          </button>
        </span>
      </div>

      <section className="mb-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          다이빙 비용 · 멀티다이브 할인
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="pb-1.5 text-left font-medium">구간</th>
              <th className="pb-1.5 text-left font-medium">1다이브 단가</th>
              <th className="pb-1.5" />
            </tr>
          </thead>
          <tbody>
            {DIVE_BANDS.map((band, i) => (
              <tr key={band.label} className={cn("border-t", i === bandIndex && "bg-emerald-50 dark:bg-emerald-950")}>
                <td className={cn("py-1.5", i === bandIndex && "font-bold")}>{band.label}</td>
                <td className="py-1.5">{destination.divePrices[i]}만원</td>
                <td className="py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  {i === bandIndex ? "현재 적용" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 flex items-baseline justify-between border-t pt-1.5 text-sm">
          <div>
            펀다이빙 {dives}회
            <div className="text-[11px] text-muted-foreground">
              {bandIndex >= 0 ? `${DIVE_BANDS[bandIndex].label} 구간 · ${perDive}만원/다이브` : "다이빙 횟수 0회"}
            </div>
          </div>
          <span className="font-semibold">{formatMan(estimate.diveCost)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t pt-1.5 text-sm">
          <div>
            장비 풀세트 대여
            <div className="text-[11px] text-muted-foreground">1일 {destination.gear}만원 기준</div>
          </div>
          <span className="font-semibold">{formatMan(estimate.gearCost)}</span>
        </div>
      </section>

      {destination.liveaboard && (
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">리브어보드</h3>
          {liveaboard ? (
            <>
              <div className="flex items-baseline justify-between text-sm">
                <div>
                  선상 숙박 다이빙 패키지 ({estimate.nights}박)
                  <div className="text-[11px] text-muted-foreground">
                    1박 {formatRange(destination.liveaboard.priceMin, destination.liveaboard.priceMax)}, {month}월
                    운항
                  </div>
                </div>
                <span className="font-semibold">
                  {formatRange(estimate.liveaboardPackageMin ?? 0, estimate.liveaboardPackageMax ?? 0)}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t pt-1.5 text-sm">
                <div>
                  리브어보드 이용 시 예상 총액
                  <div className="text-[11px] text-muted-foreground">항공 + 리브어보드 패키지, 육상 다이빙과는 별도 여행</div>
                </div>
                <span className="font-bold">
                  {formatRange(estimate.liveaboardTotalMin ?? 0, estimate.liveaboardTotalMax ?? 0)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{month}월은 이 지역 리브어보드 운항 시즌이 아닙니다.</p>
          )}
        </section>
      )}

      <section className="mb-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">항공</h3>
        <div className="flex items-baseline justify-between text-sm">
          <div>
            {flightRouteLabel(destination)}
            <div className="text-[11px] text-muted-foreground">왕복 기준</div>
          </div>
          <span className="font-semibold">{formatRange(estimate.flightMin, estimate.flightMax)}</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          공항 → 다이빙 지역: {destination.localTransfer}
        </p>
      </section>

      <section className="mb-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          숙소 ({estimate.nights}박)
        </h3>
        <div className="flex justify-between py-1 text-xs">
          <span className="text-muted-foreground">다이빙샵 패키지 포함형</span>
          <span className="font-semibold">{formatRange(estimate.lodgingShopMin, estimate.lodgingShopMax)}</span>
        </div>
        <div className="flex justify-between py-1 text-xs">
          <span className="text-muted-foreground">별도 숙박</span>
          <span className="font-semibold">
            {formatRange(estimate.lodgingSeparateMin, estimate.lodgingSeparateMax)}
          </span>
        </div>
      </section>

      <div className="mt-1 flex items-baseline justify-between border-t-2 border-foreground pt-2.5">
        <span className="text-sm font-semibold">예상 총액 (숙소 패키지 기준)</span>
        <span className="text-lg font-extrabold">{formatRange(estimate.totalMin, estimate.totalMax)}</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {REFERENCE_DATE} 조사 기준 참고가입니다. 실제 예약 시 금액은 다를 수 있습니다. 예약은 각
        다이빙샵·항공사·리브어보드 운영사에서 직접 진행해 주세요.
      </p>
    </div>
  );
}
