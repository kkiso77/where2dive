"use client";

import type { Destination } from "@/lib/destinations";

interface CompareTrayProps {
  destinations: Destination[];
  onRemove: (id: string) => void;
  onOpen: () => void;
}

export function CompareTray({ destinations, onRemove, onOpen }: CompareTrayProps) {
  if (destinations.length === 0) return null;

  return (
    <div className="sticky bottom-3 z-30 flex items-center gap-2.5 rounded-full border bg-popover px-3.5 py-2 shadow-lg">
      <span className="whitespace-nowrap text-xs text-muted-foreground">비교함</span>
      <div className="flex flex-1 flex-wrap gap-1.5">
        {destinations.map((destination) => (
          <span
            key={destination.id}
            className="flex items-center gap-1 rounded-full bg-secondary py-1 pl-2.5 pr-1 text-xs"
          >
            {destination.name}
            <button
              type="button"
              aria-label={`${destination.name} 비교함에서 빼기`}
              onClick={() => onRemove(destination.id)}
              className="flex h-4 w-4 items-center justify-center text-muted-foreground"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={destinations.length < 2}
        className="h-9 shrink-0 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground disabled:opacity-45"
      >
        나란히 비교
      </button>
    </div>
  );
}
