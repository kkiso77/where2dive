"use client";

import { cn } from "@/lib/utils";
import {
  CONDITION_LABEL,
  estimateTotalAverage,
  getCondition,
  getConditionReason,
  type Destination,
} from "@/lib/destinations";

function formatMan(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}만원`;
}

interface DestinationCardProps {
  destination: Destination;
  month: number;
  dives: number;
  days: number;
  selected: boolean;
  onSelect: (id: string) => void;
  inCompare: boolean;
  onToggleCompare: (id: string, checked: boolean) => void;
}

const CONDITION_BADGE_CLASS: Record<string, string> = {
  optimal: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  good: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  poor: "bg-muted text-muted-foreground",
};

export function DestinationCard({
  destination,
  month,
  dives,
  days,
  selected,
  onSelect,
  inCompare,
  onToggleCompare,
}: DestinationCardProps) {
  const condition = getCondition(destination, month);
  const reason = getConditionReason(destination, month);
  const total = estimateTotalAverage(destination, dives, days);
  const flightRoute =
    destination.flight.transfer === "직항"
      ? `인천 → ${destination.flight.destinationAirport} 직항`
      : `인천 → ${destination.flight.transferAirport} 경유 → ${destination.flight.destinationAirport}`;

  return (
    <div
      role="button"
      tabIndex={0}
      data-destination-id={destination.id}
      onClick={() => onSelect(destination.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(destination.id);
      }}
      className={cn(
        "cursor-pointer rounded-lg border bg-card p-3 transition-colors",
        selected ? "border-foreground ring-1 ring-foreground" : "hover:border-ring"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold">{destination.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {destination.country} · {flightRoute}
          </p>
          <p className="text-xs text-muted-foreground">
            공항 도착 후 {destination.localTransferShort}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-semibold",
            CONDITION_BADGE_CLASS[condition]
          )}
        >
          {CONDITION_LABEL[condition]}
        </span>
      </div>

      <div className="my-2 flex flex-wrap gap-1">
        {destination.styles.map((style) => (
          <span key={style} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {style}
          </span>
        ))}
      </div>

      <p className={cn("text-xs leading-relaxed", condition === "poor" && "text-destructive/80")}>
        {reason}
      </p>

      <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2">
        <p className="text-sm font-bold">
          <span className="mr-1 text-[10px] font-medium text-muted-foreground">예상 총액</span>
          약 {formatMan(total)}
        </p>
        <div className="flex items-center gap-3">
          <label
            className="flex items-center gap-1 text-xs text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={inCompare}
              onChange={(e) => onToggleCompare(destination.id, e.target.checked)}
            />
            비교
          </label>
          <a
            href={destination.maps}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            지도에서 다이빙샵 보기 ↗
          </a>
        </div>
      </div>
    </div>
  );
}
