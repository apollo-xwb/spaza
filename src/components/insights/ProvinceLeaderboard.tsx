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
      <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Province Rankings</h3>
      <div className="space-y-2">
        {provinces.map((p, i) => (
          <div key={p.province} className="rounded-xl bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/80">
                <span className="text-hud-cyan mr-1.5">#{i + 1}</span>
                {p.province}
              </span>
              <span className="text-xs font-semibold text-hud-amber tabular-nums">
                {formatZar(p.tamZar, true)}
              </span>
            </div>
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-hud-cyan to-hud-amber"
                style={{ width: `${(p.tamZar / maxTam) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-white/40">
              <span>{p.shopCount} shops</span>
              <span>{p.growthPotential}% growth potential</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
