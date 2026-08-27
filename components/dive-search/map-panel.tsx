"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";

import { getCondition, type Destination } from "@/lib/destinations";

const CONDITION_COLOR: Record<string, string> = {
  optimal: "#10b981",
  good: "#f59e0b",
  poor: "#9ca3af",
};

function markerIcon(color: string, selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.35);
      ${selected ? "outline:3px solid #6366f1;outline-offset:1px;" : ""}
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
  });
}

// 부모 그리드가 상세 패널 유무에 따라 열 수를 바꾸면 지도 컨테이너의 실제 크기도 바뀐다.
// Leaflet은 컨테이너 크기 변화를 스스로 감지하지 못하므로 ResizeObserver로 감지해 다시 계산시킨다.
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

interface MapPanelProps {
  destinations: Destination[];
  month: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapPanel({ destinations, month, selectedId, onSelect }: MapPanelProps) {
  return (
    <div
      className="h-[280px] overflow-hidden rounded-lg border lg:h-[calc(100vh-var(--sticky-top)-1rem)]"
      data-testid="map-panel"
    >
      <MapContainer
        center={[3, 115]}
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeHandler />
        {destinations.map((destination) => {
          const condition = getCondition(destination, month);
          return (
            <Marker
              key={destination.id}
              position={destination.coordinates}
              icon={markerIcon(CONDITION_COLOR[condition], selectedId === destination.id)}
              eventHandlers={{ click: () => onSelect(destination.id) }}
            >
              <Tooltip>{destination.name}</Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
