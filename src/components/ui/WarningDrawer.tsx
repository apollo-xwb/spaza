"use client";

import type { DataSummaries, OptimizedRoute, Shop } from "@/types";

interface WarningDrawerProps {
  summaries: DataSummaries;
  route: OptimizedRoute | null;
  selectedShop: Shop | null;
  selectedCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export default function WarningDrawer({
  summaries,
  route,
  selectedShop,
  selectedCount,
  expanded,
  onToggle,
}: WarningDrawerProps) {
  const gaps = summaries.coverageGaps.slice(0, 5);
  const unverifiedPct = 100 - summaries.national.verifiedAddressPct;

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 glass-panel-strong border-t border-white/10 transition-all ${
        expanded ? "h-36" : "h-10"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-xs"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            !
          </span>
          <span className="font-medium text-white/90">
            Intelligence Alerts
          </span>
          <span className="text-white/40">
            Coverage gaps ({gaps.length}) · Unverified addresses ({unverifiedPct.toFixed(0)}%)
          </span>
        </div>
        <span className="text-white/40">{expanded ? "▼" : "▲"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-4 text-xs">
          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-red-400/80 mb-2">
              Coverage Gaps
            </h4>
            <ul className="space-y-1">
              {gaps.map((g) => (
                <li key={`${g.province}-${g.suburb}`} className="text-white/70">
                  {g.suburb}, {g.city} — {g.shopCount} shops, avg {g.avgActivations.toFixed(1)} act.
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-hud-amber/80 mb-2">
              Route Status
            </h4>
            {route ? (
              <div className="text-white/70 space-y-1">
                <p>Mode: {route.mode.replace("_", " ")}</p>
                <p>{route.stops.length} stops · {route.totalDistanceKm} km</p>
                <p>Yield: {route.activationYield?.toFixed(2)} act/km</p>
                <p className="text-white/40">Source: {route.source}</p>
              </div>
            ) : (
              <p className="text-white/40">No active route. Select shops or run optimizer.</p>
            )}
          </section>

          <section>
            <h4 className="text-[10px] uppercase tracking-widest text-hud-cyan/80 mb-2">
              Selection
            </h4>
            <div className="text-white/70 space-y-1">
              <p>{selectedCount} shops selected for routing</p>
              {selectedShop && (
                <p>
                  Focus: {selectedShop.shopName} ({selectedShop.activations} act.)
                </p>
              )}
              <p className="text-white/40">
                Shift+click shops to multi-select · Right-click in sidebar
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
