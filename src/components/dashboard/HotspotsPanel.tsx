"use client";

import type { Hotspot, DepotCandidate, CoverageGap } from "@/types";

interface HotspotsPanelProps {
  hotspots: Hotspot[];
  depots: DepotCandidate[];
  gaps: CoverageGap[];
}

export default function HotspotsPanel({ hotspots, depots, gaps }: HotspotsPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="ios-card overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <h3 className="ios-section-title">Activation Hotspots</h3>
        </div>
        {hotspots.slice(0, 6).map((h) => (
          <div key={h.label} className="ios-row">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{h.label}</div>
              <div className="text-[11px] text-ios-secondary">{h.count} shops</div>
            </div>
            <span className="text-sm font-bold text-ios-green tabular-nums">{h.totalActivations}</span>
          </div>
        ))}
      </div>

      <div className="ios-card overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <h3 className="ios-section-title">Distribution Hubs</h3>
        </div>
        {depots.slice(0, 6).map((d) => (
          <div key={d.id} className="ios-row">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{d.label}</div>
              <div className="text-[11px] text-ios-secondary">{d.city}, {d.province}</div>
            </div>
            <span className="text-sm font-semibold text-ios-blue tabular-nums">{d.shopCount}</span>
          </div>
        ))}
      </div>

      <div className="ios-card overflow-hidden">
        <div className="px-5 pt-5 pb-2">
          <h3 className="ios-section-title">Coverage Gaps</h3>
        </div>
        {gaps.slice(0, 6).map((g) => (
          <div key={`${g.suburb}-${g.city}`} className="ios-row">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{g.suburb}</div>
              <div className="text-[11px] text-ios-secondary">{g.city}, {g.province}</div>
            </div>
            <span className="text-sm font-semibold text-ios-red tabular-nums">{g.shopCount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
