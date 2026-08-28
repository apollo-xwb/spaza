"use client";

import type { RouteMode, OptimizedRoute, DataSummaries } from "@/types";
import type { Shop } from "@/types";
import {
  exportRouteCsv,
  optimizeRoute,
  selectHighValueShops,
} from "@/lib/route-optimizer";
import { formatZar } from "@/lib/insights-engine";

interface RouteBuilderProps {
  mode: RouteMode;
  onModeChange: (mode: RouteMode) => void;
  selectedShops: Shop[];
  filteredShops: Shop[];
  summaries: DataSummaries;
  route: OptimizedRoute | null;
  onRouteChange: (route: OptimizedRoute | null) => void;
  depot: { lat: number; lng: number; label?: string } | null;
  onDepotModeChange: (active: boolean) => void;
  depotMode: boolean;
  onDepotPreset: (depot: { lat: number; lng: number; label: string }) => void;
  highValueCount: number;
  onHighValueCountChange: (n: number) => void;
  onRemoveShop: (id: string) => void;
}

export default function RouteBuilder({
  mode,
  onModeChange,
  selectedShops,
  filteredShops,
  summaries,
  route,
  onRouteChange,
  depot,
  onDepotModeChange,
  depotMode,
  onDepotPreset,
  highValueCount,
  onHighValueCountChange,
  onRemoveShop,
}: RouteBuilderProps) {
  const runOptimize = async () => {
    let shops: Shop[] = [];
    if (mode === "field_rep") {
      shops = selectedShops;
      if (shops.length < 2) return;
    } else if (mode === "high_value") {
      shops = selectHighValueShops(filteredShops, highValueCount);
    } else {
      if (!depot) return;
      shops = selectedShops.length ? selectedShops : filteredShops.slice(0, 20);
    }
    const result = await optimizeRoute({
      mode,
      shops,
      depot: mode === "distribution" ? depot ?? undefined : undefined,
      roundtrip: mode === "distribution",
    });
    onRouteChange(result);
  };

  const modes: [RouteMode, string][] = [
    ["field_rep", "Field Rep"],
    ["high_value", "High-Value"],
    ["distribution", "Distribution"],
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {modes.map(([id, label]) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={`rounded-xl px-2 py-2.5 text-[11px] font-medium transition ${
              mode === id
                ? "bg-accent/15 border border-accent/50 text-accent"
                : "bg-white/50 border border-border text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "high_value" && (
        <div>
          <label className="text-[10px] uppercase text-muted">Top shops to visit</label>
          <input
            type="range" min={5} max={25} value={highValueCount}
            onChange={(e) => onHighValueCountChange(parseInt(e.target.value, 10))}
            className="w-full mt-1 accent-accent"
          />
          <div className="text-xs text-muted text-center">{highValueCount} shops</div>
        </div>
      )}

      {mode === "distribution" && (
        <div className="space-y-2">
          <button
            onClick={() => onDepotModeChange(!depotMode)}
            className={`w-full rounded-xl py-2.5 text-xs border ${
              depotMode ? "border-accent-teal bg-accent-teal/15 text-accent-teal" : "border-border text-primary/70"
            }`}
          >
            {depotMode ? "Tap map to set depot..." : "Set depot on map"}
          </button>
          <div className="flex flex-wrap gap-1">
            {summaries.depotCandidates.slice(0, 4).map((d) => (
              <button
                key={d.id}
                onClick={() => onDepotPreset({ lat: d.lat, lng: d.lng, label: d.label })}
                className="rounded-lg bg-white/60 border border-border px-2 py-1 text-[10px] text-muted hover:text-accent-teal"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedShops.length > 0 && (
        <div>
          <div className="text-[10px] uppercase text-muted mb-2">Selected ({selectedShops.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedShops.map((s) => (
              <button
                key={s.id}
                onClick={() => onRemoveShop(s.id)}
                className="flex items-center gap-1 rounded-full bg-accent-teal/10 border border-accent-teal/30 px-2.5 py-1 text-[10px] text-accent-teal"
              >
                {s.shopName.slice(0, 12)} ×
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={runOptimize}
        className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-black hover:bg-accent/90 transition glow-accent"
      >
        Optimize Route
      </button>

      {route && route.stops.length > 0 && (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-accent font-bold text-lg">{route.stops.length} stops</div>
              <div className="text-xs text-primary/70">{route.totalDistanceKm} km · {route.totalDurationMin} min</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">Est. Value</div>
              <div className="text-sm font-bold text-accent">{formatZar(route.estimatedValueZar ?? 0, true)}</div>
            </div>
          </div>
          {route.activationYield !== undefined && (
            <div className="text-[10px] text-muted">{route.activationYield} activations/km · via {route.source}</div>
          )}
          <ol className="max-h-32 overflow-y-auto text-[10px] text-muted space-y-0.5 scrollbar-thin">
            {route.stops.map((s) => (
              <li key={s.shop.id}>{s.order}. {s.shop.shopName} ({s.shop.activations})</li>
            ))}
          </ol>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const blob = new Blob([exportRouteCsv(route)], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "route.csv";
                a.click();
              }}
              className="flex-1 rounded-lg border border-border py-2 text-[10px] text-primary/70"
            >
              Export CSV
            </button>
            <button
              onClick={() => onRouteChange(null)}
              className="flex-1 rounded-lg border border-border py-2 text-[10px] text-muted"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {mode === "field_rep" && selectedShops.length < 2 && (
        <p className="text-[10px] text-muted text-center">
          Long-press blips on the map to add shops to your route
        </p>
      )}
    </div>
  );
}
