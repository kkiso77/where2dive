"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  estimateDives,
  getDestinations,
  matchesFilters,
  splitByCondition,
  type Destination,
  type DiveStyle,
  type Region,
} from "@/lib/destinations";
import { CompareOverlay } from "./compare-overlay";
import { CompareTray } from "./compare-tray";
import { DetailPanel } from "./detail-panel";
import { DetailPlaceholder } from "./detail-placeholder";
import { EmptyState } from "./empty-state";
import { FilterBar } from "./filter-bar";
import { DestinationList } from "./destination-list";

const MapPanel = dynamic(() => import("./map-panel").then((m) => m.MapPanel), {
  ssr: false,
  loading: () => (
    <div
      className="h-[280px] animate-pulse rounded-lg border bg-muted lg:h-[calc(100vh-var(--sticky-top,7.5rem)-1rem)]"
      data-testid="map-panel"
    />
  ),
});

const CURRENT_MONTH = new Date().getMonth() + 1;

export function SearchScreen() {
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [days, setDays] = useState(5);
  const [dives, setDives] = useState(() => estimateDives(5));
  const [diveManuallySet, setDiveManuallySet] = useState(false);
  const [region, setRegion] = useState<Region | "all">("all");
  const [styles, setStyles] = useState<DiveStyle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const listColumnRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // 상세 견적 칸이 목록만큼 늘어나야 sticky가 목록 끝까지 유지된다.
  // 그리드 자식 내부에 sticky 요소가 있으면 브라우저가 자동 늘어남(align-items:stretch)을
  // 제대로 계산하지 못하므로, 목록 실제 높이를 측정해 옆 칸의 최소 높이로 직접 지정한다.
  useEffect(() => {
    const el = listColumnRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setListHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 헤더·필터바를 화면 위에 고정하는 만큼, 지도·상세 칸의 sticky 위치도 그 높이만큼 밀어야
  // 서로 겹치지 않는다. 필터바가 좁은 화면에서 줄바꿈되면 높이가 달라지므로 실측한다.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeaderHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const allDestinations = useMemo(() => getDestinations(), []);

  const matched = useMemo(
    () => allDestinations.filter((d) => matchesFilters(d, { region, styles })),
    [allDestinations, region, styles]
  );

  const { recommended, notRecommended } = useMemo(
    () => splitByCondition(matched, month),
    [matched, month]
  );

  const mapTargets = useMemo(() => [...recommended, ...notRecommended], [recommended, notRecommended]);

  const selectedDestination: Destination | undefined = useMemo(
    () => allDestinations.find((d) => d.id === selectedId),
    [allDestinations, selectedId]
  );

  const compareDestinations = useMemo(
    () => allDestinations.filter((d) => compareIds.has(d.id)),
    [allDestinations, compareIds]
  );

  function resetFilters() {
    setRegion("all");
    setStyles([]);
  }

  function handleDaysChange(nextDays: number) {
    setDays(nextDays);
    if (!diveManuallySet) setDives(estimateDives(nextDays));
  }

  function handleDivesChange(nextDives: number) {
    setDives(Math.max(0, nextDives));
    setDiveManuallySet(true);
  }

  function selectDestination(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  function closeDetail() {
    setSelectedId(null);
  }

  function toggleCompare(id: string, checked: boolean) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      if (next.size < 2) setCompareOpen(false);
      return next;
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-4 py-3">
      {/* 헤더·필터바는 화면 위에 고정되어, 목록을 아무리 스크롤해도 조건을 계속 바꿀 수 있다. */}
      <div ref={headerRef} className="sticky top-0 z-20 flex flex-col gap-3 bg-background pb-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Where2Dive</h1>
          <p className="text-sm text-muted-foreground">
            월과 기간을 넣으면 그 시기에 다이빙하기 좋은 동남아 목적지와 예상 견적을 비교합니다.
          </p>
        </div>

        <FilterBar
          month={month}
          onMonthChange={setMonth}
          days={days}
          onDaysChange={handleDaysChange}
          dives={dives}
          diveManuallySet={diveManuallySet}
          onDivesChange={handleDivesChange}
          region={region}
          onRegionChange={setRegion}
          styles={styles}
          onStylesChange={setStyles}
        />
      </div>

      {matched.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div
          className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-3"
          style={
            {
              "--list-height": `${listHeight}px`,
              "--sticky-top": `${headerHeight + 12}px`,
            } as CSSProperties
          }
        >
          {/* 지도는 화면을 스크롤해도 왼쪽 칸에 계속 붙어 있는다. */}
          <div className="lg:sticky lg:top-[var(--sticky-top)]">
            <MapPanel
              destinations={mapTargets}
              month={month}
              selectedId={selectedId}
              onSelect={selectDestination}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">동남아 다이빙 목적지 지도</p>
          </div>

          <div ref={listColumnRef} className="flex flex-col gap-3">
            <p className="ml-0.5 text-xs text-muted-foreground">
              {month}월 기준 추천 {recommended.length}곳 · 비추천 {notRecommended.length}곳 ·
              인천에서 가까운 순
            </p>
            <DestinationList
              title="추천 목적지"
              destinations={recommended}
              month={month}
              dives={dives}
              days={days}
              selectedId={selectedId}
              onSelect={selectDestination}
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
            />
            <DestinationList
              title="이번 달 비추천 목적지"
              destinations={notRecommended}
              month={month}
              dives={dives}
              days={days}
              selectedId={selectedId}
              onSelect={selectDestination}
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
            />
          </div>

          {/* 상세 견적은 오른쪽 칸에 계속 자리하고, 값만 선택에 따라 바뀐다. */}
          <div className="lg:min-h-[var(--list-height)]">
            <div className="lg:sticky lg:top-[var(--sticky-top)]">
              {selectedDestination ? (
                <DetailPanel
                  destination={selectedDestination}
                  month={month}
                  dives={dives}
                  days={days}
                  diveManuallySet={diveManuallySet}
                  onDivesChange={handleDivesChange}
                  onClose={closeDetail}
                />
              ) : (
                <DetailPlaceholder />
              )}
            </div>
          </div>
        </div>
      )}

      <CompareTray
        destinations={compareDestinations}
        onRemove={(id) => toggleCompare(id, false)}
        onOpen={() => setCompareOpen(true)}
      />

      {compareOpen && compareDestinations.length >= 2 && (
        <CompareOverlay
          destinations={compareDestinations}
          month={month}
          dives={dives}
          days={days}
          region={region}
          styles={styles}
          onRemove={(id) => toggleCompare(id, false)}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
