"use client";

import { formatZar } from "@/lib/insights-engine";
import type { ProvinceInsight } from "@/types";

interface ProvinceLeaderboardProps {
  provinces: ProvinceInsight[];
}

export default function ProvinceLeaderboard({ provinces }: ProvinceLeaderboardProps) {
  const maxTam = provinces[0]?.tamZar ?? 1;

  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-widest text-muted mb-2">Province Rankings</h3>
      <div className="space-y-2">
        {provinces.map((p, i) => (
          <div key={p.province} className="rounded-xl bg-white/50 border border-border px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-primary">
                <span className="text-accent-teal mr-1.5">#{i + 1}</span>
                {p.province}
              </span>
              <span className="text-xs font-semibold text-accent tabular-nums">
                {formatZar(p.tamZar, true)}
              </span>
            </div>
            <div className="h-1 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-teal to-accent"
                style={{ width: `${(p.tamZar / maxTam) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-muted">
              <span>{p.shopCount} shops</span>
              <span>{p.growthPotential}% growth potential</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
