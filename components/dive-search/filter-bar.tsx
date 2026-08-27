"use client";

import type { DiveStyle, Region } from "@/lib/destinations";

const MONTH_NAMES = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const DAY_OPTIONS = [3, 4, 5, 6, 7, 9, 11];

const ALL_STYLES: DiveStyle[] = ["초급자", "조류", "드리프트", "대물", "매크로"];

const REGIONS: Region[] = ["필리핀", "베트남", "태국", "말레이시아", "미얀마", "인도네시아"];

interface FilterBarProps {
  month: number;
  onMonthChange: (month: number) => void;
  days: number;
  onDaysChange: (days: number) => void;
  dives: number;
  diveManuallySet: boolean;
  onDivesChange: (dives: number) => void;
  region: Region | "all";
  onRegionChange: (region: Region | "all") => void;
  styles: DiveStyle[];
  onStylesChange: (styles: DiveStyle[]) => void;
}

export function FilterBar({
  month,
  onMonthChange,
  days,
  onDaysChange,
  dives,
  diveManuallySet,
  onDivesChange,
  region,
  onRegionChange,
  styles,
  onStylesChange,
}: FilterBarProps) {
  function toggleStyle(style: DiveStyle) {
    if (styles.includes(style)) {
      onStylesChange(styles.filter((s) => s !== style));
    } else {
      onStylesChange([...styles, style]);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-lg border bg-card p-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">여행 월</span>
        <select
          value={month}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="h-9 min-w-24 rounded-md border bg-background px-2 text-sm"
        >
          {MONTH_NAMES.map((label, i) => (
            <option key={label} value={i + 1}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">여행 기간</span>
        <select
          value={days}
          onChange={(e) => onDaysChange(Number(e.target.value))}
          className="h-9 min-w-24 rounded-md border bg-background px-2 text-sm"
        >
          {DAY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}일
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">다이빙 횟수</span>
        <div className="flex items-center gap-2">
          <span className="flex h-9 items-center rounded-md border">
            <button
              type="button"
              aria-label="다이빙 횟수 줄이기"
              onClick={() => onDivesChange(Math.max(0, dives - 1))}
              className="flex h-full w-7 items-center justify-center text-sm"
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
              className="h-full w-10 border-x text-center text-sm"
            />
            <button
              type="button"
              aria-label="다이빙 횟수 늘리기"
              onClick={() => onDivesChange(dives + 1)}
              className="flex h-full w-7 items-center justify-center text-sm"
            >
              +
            </button>
          </span>
          <span className="text-xs text-muted-foreground">
            {diveManuallySet ? "직접 조정함" : "기간 기준 자동 추정"}
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">지역</span>
        <select
          value={region}
          onChange={(e) => onRegionChange(e.target.value as Region | "all")}
          className="h-9 min-w-24 rounded-md border bg-background px-2 text-sm"
        >
          <option value="all">전체</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">다이빙 스타일</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="다이빙 스타일 필터">
          {ALL_STYLES.map((style) => {
            const pressed = styles.includes(style);
            return (
              <button
                key={style}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggleStyle(style)}
                className={
                  "h-8 rounded-full border px-3 text-xs font-medium " +
                  (pressed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground")
                }
              >
                {style === "초급자" ? "초급자 추천" : style}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
