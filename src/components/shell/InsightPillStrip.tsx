"use client";

import { formatZar } from "@/lib/insights-engine";
import type { LiveInsights, VisibleStats } from "@/types";

interface InsightPillStripProps {
  stats: VisibleStats;
  live: LiveInsights;
}

export default function InsightPillStrip({ stats, live }: InsightPillStripProps) {
  const pills = [
    { label: "TAM", value: formatZar(live.tamZar, true), accent: true },
    { label: "In View", value: stats.visibleCount.toLocaleString(), accent: false },
    { label: "Activations", value: stats.totalActivations.toLocaleString(), accent: false },
    { label: "White-Space", value: `${live.whiteSpacePct}%`, accent: false },
    { label: "Growth", value: `${live.growthPotential}%`, accent: false },
    { label: "Concentration", value: `${live.concentrationIndex}%`, accent: false },
  ];

  return (
    <div className="absolute bottom-6 left-0 right-0 z-20 px-4 hidden md:block md:left-auto md:right-4 md:max-w-md">
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
        {pills.map((p) => (
          <div
            key={p.label}
            className={`ios-card shrink-0 rounded-ios px-3 py-2 ${p.accent ? "ring-1 ring-ios-blue/20" : ""}`}
          >
            <div className="text-[9px] font-semibold uppercase tracking-wider text-ios-secondary">{p.label}</div>
            <div className={`text-sm font-semibold tabular-nums ${p.accent ? "text-ios-blue" : "text-ios-label"}`}>
              {p.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
