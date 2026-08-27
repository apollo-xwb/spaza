"use client";

import type { RouteMode, OptimizedRoute, DataSummaries } from "@/types";
import {
  exportRouteCsv,
  exportRouteJson,
  optimizeRoute,
  selectHighValueShops,
} from "@/lib/route-optimizer";
import type { Shop } from "@/types";

interface RoutePanelProps {
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
  highValueCount: number;
  onHighValueCountChange: (n: number) => void;
  onDepotPreset: (depot: { lat: number; lng: number; label: string }) => void;
  collapsed: boolean;
}

export default function RoutePanel({
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
  highValueCount,
  onHighValueCountChange,
  onDepotPreset,
  collapsed,
}: RoutePanelProps) {
  if (collapsed) return null;

  const runOptimize = async () => {
    let shops: Shop[] = [];

    if (mode === "field_rep") {
      shops = selectedShops;
      if (shops.length < 2) {
        alert("Select at least 2 shops (Shift+click on map)");
        return;
      }
    } else if (mode === "high_value") {
      shops = selectHighValueShops(filteredShops, highValueCount);
    } else if (mode === "distribution") {
      if (!depot) {
        alert("Set a depot first (click map or choose preset)");
        return;
      }
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

  const downloadCsv = () => {
    if (!route) return;
    const blob = new Blob([exportRouteCsv(route)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-${mode}.csv`;
    a.click();
  };

  const downloadJson = () => {
    if (!route) return;
    const blob = new Blob([exportRouteJson(route)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-${mode}.json`;
    a.click();
  };

  return (
    <aside className="absolute right-0 top-14 bottom-36 z-20 w-72 glass-panel-strong border-l border-white/10 flex flex-col">
      <div className="p-3 border-b border-white/10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-hud-amber">
          Route Optimization
        </h2>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {(
            [
              ["field_rep", "Field Rep Visit"],
              ["high_value", "High-Value Route"],
              ["distribution", "Distribution / Depot"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-xs transition ${
                mode === id
                  ? "bg-hud-amber/20 border border-hud-amber/40 text-hud-amber"
                  : "bg-white/5 border border-transparent text-white/70 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "high_value" && (
          <div>
            <label className="text-[10px] uppercase text-white/40">Top shops</label>
            <input
              type="number"
              min={3}
              max={25}
              value={highValueCount}
              onChange={(e) => onHighValueCountChange(parseInt(e.target.value, 10) || 15)}
              className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
            />
          </div>
        )}

        {mode === "distribution" && (
          <div className="space-y-2">
            <button
              onClick={() => onDepotModeChange(!depotMode)}
              className={`w-full rounded-lg px-3 py-2 text-xs border ${
                depotMode
                  ? "border-hud-cyan bg-hud-cyan/20 text-hud-cyan"
                  : "border-white/10 bg-white/5 text-white/70"
              }`}
            >
              {depotMode ? "Click map to set depot..." : "Set depot on map"}
            </button>
            {depot && (
              <p className="text-[10px] text-white/50 font-mono">
                Depot: {depot.lat.toFixed(4)}, {depot.lng.toFixed(4)}
              </p>
            )}
            <div>
              <label className="text-[10px] uppercase text-white/40">Preset depots</label>
              <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                {summaries.depotCandidates.slice(0, 6).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onDepotPreset({ lat: d.lat, lng: d.lng, label: d.label })}
                    className="w-full text-left text-[10px] text-white/60 hover:text-hud-cyan py-0.5"
                  >
                    {d.label} ({d.shopCount} shops)
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white/5 p-2 text-[10px] text-white/50">
          {mode === "field_rep" && `${selectedShops.length} shops selected`}
          {mode === "high_value" && `Auto-pick top ${highValueCount} in filter`}
          {mode === "distribution" && `${selectedShops.length || "auto"} delivery stops`}
        </div>

        <button
          onClick={runOptimize}
          className="w-full rounded-lg bg-hud-amber/90 py-2.5 text-xs font-semibold text-black hover:bg-hud-amber transition hud-glow-amber"
        >
          Optimize Route
        </button>

        {route && (
          <div className="space-y-2">
            <div className="rounded-lg border border-hud-amber/30 bg-hud-amber/10 p-2 text-xs">
              <div className="text-hud-amber font-medium">{route.stops.length} stops</div>
              <div className="text-white/70">{route.totalDistanceKm} km · {route.totalDurationMin} min</div>
              {route.activationYield !== undefined && (
                <div className="text-white/50">{route.activationYield} activations/km</div>
              )}
            </div>
            <ol className="max-h-32 overflow-y-auto text-[10px] text-white/60 space-y-0.5">
              {route.stops.map((s) => (
                <li key={s.shop.id}>
                  {s.order}. {s.shop.shopName} ({s.shop.activations})
                </li>
              ))}
            </ol>
            <div className="flex gap-2">
              <button
                onClick={downloadCsv}
                className="flex-1 rounded border border-white/10 py-1.5 text-[10px] text-white/70 hover:bg-white/5"
              >
                Export CSV
              </button>
              <button
                onClick={downloadJson}
                className="flex-1 rounded border border-white/10 py-1.5 text-[10px] text-white/70 hover:bg-white/5"
              >
                Export JSON
              </button>
            </div>
            <button
              onClick={() => onRouteChange(null)}
              className="w-full text-[10px] text-white/40 hover:text-white"
            >
              Clear route
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
