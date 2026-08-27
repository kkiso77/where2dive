import { createSupabaseClient } from "@/lib/supabase/client";
import type { Destination, DiveStyle, LiveaboardInfo, LodgingInfo, Region } from "./types";

// 다이빙 요금 구간: 모든 목적지가 같은 4개 경계를 공유한다.
export const DIVE_BANDS = [
  { label: "1～2회", min: 1, max: 2 },
  { label: "3～4회", min: 3, max: 4 },
  { label: "5～9회", min: 5, max: 9 },
  { label: "10회 이상", min: 10, max: Infinity },
] as const;

export const REFERENCE_DATE = "2026년 7월";

// Supabase destinations 테이블의 행 형태. 2026년 7월 웹 조사 기준 큐레이션 데이터를 담고 있다.
// docs/decisions/travel-data-source.md 참고.
interface DestinationRow {
  id: string;
  name: string;
  country: string;
  region: string;
  distance_km: number;
  lat: number;
  lng: number;
  flight: Destination["flight"];
  local_transfer: string;
  local_transfer_short: string;
  styles: string[];
  condition: Destination["condition"];
  reason: Destination["reason"];
  dive_prices: number[];
  gear: number;
  liveaboard: LiveaboardInfo | null;
  lodging: LodgingInfo;
  maps: string;
}

function toDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    name: row.name,
    country: row.country as Region,
    region: row.region as Region,
    distanceKm: row.distance_km,
    coordinates: [row.lat, row.lng],
    flight: row.flight,
    localTransfer: row.local_transfer,
    localTransferShort: row.local_transfer_short,
    styles: row.styles as DiveStyle[],
    condition: row.condition,
    reason: row.reason,
    divePrices: row.dive_prices as [number, number, number, number],
    gear: row.gear,
    liveaboard: row.liveaboard,
    lodging: row.lodging,
    maps: row.maps,
  };
}

// 데이터 접근은 이 함수를 통해서만 이루어진다. Supabase의 destinations 테이블을 조회하며,
// 서버 컴포넌트에서만 호출한다. docs/decisions/travel-data-source.md 참고.
export async function getDestinations(): Promise<Destination[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("distance_km", { ascending: true });

  if (error) {
    throw new Error(`다이빙 목적지 데이터를 불러오지 못했습니다: ${error.message}`);
  }

  return (data as DestinationRow[]).map(toDestination);
}
