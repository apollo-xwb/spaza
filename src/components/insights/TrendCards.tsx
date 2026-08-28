"use client";

import { formatZar } from "@/lib/insights-engine";
import type { DataInsights } from "@/types";

interface TrendCardsProps {
  insights: DataInsights;
}

export default function TrendCards({ insights }: TrendCardsProps) {
  const tiers = insights.tierDistribution;
  const total = tiers.low + tiers.medium + tiers.high + tiers.elite;

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest text-muted">Market Signals</h3>

      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Elite Tier", value: tiers.elite, pct: Math.round((tiers.elite / total) * 100), color: "#E78A3E" },
          { label: "High Tier", value: tiers.high, pct: Math.round((tiers.high / total) * 100), color: "#0D9488" },
          { label: "Medium", value: tiers.medium, pct: Math.round((tiers.medium / total) * 100), color: "#38bdf8" },
          { label: "Low", value: tiers.low, pct: Math.round((tiers.low / total) * 100), color: "#94a3b8" },
        ].map((t) => (
          <div key={t.label} className="rounded-xl bg-white/50 border border-border p-3">
            <div className="text-[9px] text-muted uppercase">{t.label}</div>
            <div className="text-lg font-bold tabular-nums" style={{ color: t.color }}>{t.pct}%</div>
            <div className="text-[9px] text-muted">{t.value.toLocaleString()} shops</div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-[9px] uppercase text-muted mb-2">Category Intelligence</h4>
        {insights.categoryLeaders.slice(0, 5).map((c) => (
          <div key={c.category} className="flex justify-between items-center py-1.5 border-b border-border text-xs">
            <span className="text-primary/80">{c.category}</span>
            <span className={`tabular-nums font-medium ${c.indexScore > 100 ? "text-accent-teal" : "text-muted"}`}>
              {c.indexScore} index · {c.count}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-[9px] uppercase text-muted mb-2">Opportunity Zones</h4>
        {insights.opportunityZones.slice(0, 4).map((z) => (
          <div key={`${z.province}-${z.suburb}`} className="flex justify-between py-1 text-xs text-muted">
            <span className="truncate pr-2">{z.suburb}, {z.city}</span>
            <span className="text-accent shrink-0">Score {z.opportunityScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
