"use client";

import { useState } from "react";

import { groupByCountry, type Destination } from "@/lib/destinations";
import { DestinationCard } from "./destination-card";

interface DestinationListProps {
  title: string;
  destinations: Destination[];
  month: number;
  dives: number;
  days: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  compareIds: Set<string>;
  onToggleCompare: (id: string, checked: boolean) => void;
}

export function DestinationList({
  title,
  destinations,
  month,
  dives,
  days,
  selectedId,
  onSelect,
  compareIds,
  onToggleCompare,
}: DestinationListProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (destinations.length === 0) return null;

  const groups = groupByCountry(destinations);

  return (
    <div>
      <p className="mb-2 ml-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {[...groups.entries()].map(([country, items]) => {
          const isCollapsed = collapsed.has(country);
          return (
            <div key={country} className="overflow-hidden rounded-lg border bg-card">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(country)) next.delete(country);
                    else next.add(country);
                    return next;
                  })
                }
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between gap-2 bg-secondary px-3 py-2.5 text-left"
              >
                <span>
                  <span className="text-sm font-bold">{country}</span>
                  <span className="ml-1.5 text-xs font-medium text-muted-foreground">
                    {items.length}곳
                  </span>
                </span>
                <span
                  className="text-xs text-muted-foreground transition-transform"
                  style={{ transform: isCollapsed ? "rotate(-90deg)" : undefined }}
                >
                  ▾
                </span>
              </button>
              {!isCollapsed && (
                <div className="flex flex-col gap-2 p-2">
                  {items.map((destination) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
                      month={month}
                      dives={dives}
                      days={days}
                      selected={selectedId === destination.id}
                      onSelect={onSelect}
                      inCompare={compareIds.has(destination.id)}
                      onToggleCompare={onToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
