export type ConditionLevel = "optimal" | "good" | "poor";

export type DiveStyle = "초급자" | "조류" | "드리프트" | "대물" | "매크로";

export type Region = "필리핀" | "태국" | "말레이시아" | "인도네시아" | "베트남" | "미얀마";

export interface DiveBand {
  label: string;
  min: number;
  max: number;
}

export interface FlightInfo {
  transfer: "직항" | "경유";
  priceMin: number;
  priceMax: number;
  transferAirport?: string;
  destinationAirport: string;
}

export interface LiveaboardInfo {
  months: number[];
  priceMin: number;
  priceMax: number;
}

export interface LodgingInfo {
  shop: [number, number];
  separate: [number, number];
}

export interface Destination {
  id: string;
  name: string;
  country: Region;
  region: Region;
  distanceKm: number;
  coordinates: [number, number];
  flight: FlightInfo;
  localTransfer: string;
  localTransferShort: string;
  styles: DiveStyle[];
  condition: {
    optimal: number[];
    good: number[];
    poor: number[];
  };
  reason: Partial<Record<ConditionLevel, string>>;
  divePrices: [number, number, number, number];
  gear: number;
  liveaboard: LiveaboardInfo | null;
  lodging: LodgingInfo;
  maps: string;
}
