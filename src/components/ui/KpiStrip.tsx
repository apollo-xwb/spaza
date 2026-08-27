"use client";

import { formatNumber } from "@/lib/utils";
import type { VisibleStats, OptimizedRoute } from "@/types";

interface KpiStripProps {
  stats: VisibleStats;
  route: OptimizedRoute | null;
  presentationMode: boolean;
  onTogglePresentation: () => void;
}

export default function KpiStrip({
  stats,
  route,
  presentationMode,
  onTogglePresentation,
}: KpiStripProps) {
  return (
    <header
      className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 glass-panel-strong border-b border-white/10 ${
        presentationMode ? "py-4" : "py-2"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-hud-cyan/40 bg-hud-cyan/10 hud-glow-cyan">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 className={`font-semibold tracking-wide text-white ${presentationMode ? "text-xl" : "text-sm"}`}>
            SHOPS INTELLIGENCE
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-white/50">
            South Africa · Enriched Retail Network
          </p>
        </div>
      </div>

      <div className={`flex items-center gap-6 ${presentationMode ? "text-base" : "text-xs"}`}>
        <Kpi label="Locations" value={formatNumber(stats.visibleCount)} sub={`of ${formatNumber(stats.totalCount)}`} highlight />
        <Kpi label="Activations" value={formatNumber(stats.totalActivations)} sub={`avg ${stats.avgActivations.toFixed(1)}`} />
        <Kpi label="Verified" value={`${stats.verifiedPct.toFixed(0)}%`} sub="addresses" />
        {route && (
          <Kpi
            label="Route"
            value={`${route.totalDistanceKm} km`}
            sub={`${route.totalDurationMin} min · ${route.source}`}
            accent="amber"
          />
        )}
      </div>

      <button
        onClick={onTogglePresentation}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
          presentationMode
            ? "border-hud-cyan bg-hud-cyan/20 text-hud-cyan"
            : "border-white/20 bg-white/5 text-white/80 hover:border-hud-cyan/50"
        }`}
      >
        {presentationMode ? "Exit Present" : "Present ▶"}
      </button>
    </header>
  );
}

function Kpi({
  label,
  value,
  sub,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
  accent?: "amber";
}) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div
        className={`font-semibold tabular-nums ${
          accent === "amber"
            ? "text-hud-amber"
            : highlight
              ? "text-hud-cyan"
              : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-white/40">{sub}</div>
    </div>
  );
}
