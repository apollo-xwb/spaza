"use client";

import type { TierDistribution } from "@/types";

interface TierDonutProps {
  tiers: TierDistribution;
}

const TIER_META = [
  { key: "elite" as const, label: "Elite", color: "#FFFC00" },
  { key: "high" as const, label: "High", color: "#007AFF" },
  { key: "medium" as const, label: "Medium", color: "#C8F135" },
  { key: "low" as const, label: "Low", color: "#8E8E93" },
];

export default function TierDonut({ tiers }: TierDonutProps) {
  const total = tiers.low + tiers.medium + tiers.high + tiers.elite;
  let cumulative = 0;
  const segments = TIER_META.map((t) => {
    const pct = (tiers[t.key] / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return `${t.color} ${start}% ${cumulative}%`;
  }).join(", ");

  return (
    <div className="ios-card texture-grain relative p-5 overflow-hidden">
      <h3 className="ios-section-title mb-4">Activation Tiers</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="donut-chart w-36 h-36 shrink-0" style={{ background: `conic-gradient(${segments})` }}>
          <div className="donut-hole">
            <span className="text-2xl font-extrabold tabular-nums">{total.toLocaleString()}</span>
            <span className="text-[10px] text-ios-secondary">shops</span>
          </div>
        </div>
        <div className="flex-1 w-full space-y-2">
          {TIER_META.map((t) => {
            const count = tiers[t.key];
            const pct = Math.round((count / total) * 100);
            return (
              <div key={t.key} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-sm flex-1 font-medium">{t.label}</span>
                <span className="text-sm font-bold tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
