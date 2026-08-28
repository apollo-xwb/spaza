"use client";

import { formatZar } from "@/lib/insights-engine";
import type { LiveInsights, VisibleStats } from "@/types";

interface StatsFabProps {
  stats: VisibleStats;
  live: LiveInsights;
}

export default function StatsFab({ stats, live }: StatsFabProps) {
  const pills = [
    { label: "TAM", value: formatZar(live.tamZar, true), accent: true },
    { label: "In View", value: stats.visibleCount.toLocaleString(), accent: false },
    { label: "Activations", value: stats.totalActivations.toLocaleString(), accent: false },
    { label: "White-Space", value: `${live.whiteSpacePct}%`, accent: false },
    { label: "Growth", value: `${live.growthPotential}%`, accent: false },
  ];

  return (
    <details className="group absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] left-4 z-20 md:hidden">
      <summary className="glass-fab flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full active:scale-95 transition">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5">
          <path d="M3 3v18h18M7 16l4-8 4 5 4-9" />
        </svg>
      </summary>
      <div className="absolute bottom-14 left-0 w-52 ios-card p-3 space-y-2.5">
        {pills.map((p) => (
          <div key={p.label} className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-ios-secondary">{p.label}</span>
            <span className={`text-sm font-semibold tabular-nums ${p.accent ? "text-ios-blue" : "text-ios-label"}`}>
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}
