import type { ConditionLevel, Destination } from "./types";

export const CONDITION_LABEL: Record<ConditionLevel, string> = {
  optimal: "최적",
  good: "양호",
  poor: "비추천",
};

export function getCondition(destination: Destination, month: number): ConditionLevel {
  if (destination.condition.optimal.includes(month)) return "optimal";
  if (destination.condition.good.includes(month)) return "good";
  return "poor";
}

export function getConditionReason(destination: Destination, month: number): string {
  const level = getCondition(destination, month);
  return (
    destination.reason[level] ?? destination.reason.good ?? destination.reason.optimal ?? ""
  );
}
