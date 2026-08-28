"use client";

import { formatZar } from "@/lib/insights-engine";
import type { DataInsights, LiveInsights } from "@/types";

interface InsightHeroProps {
  insights: DataInsights;
  live: LiveInsights;
  compact?: boolean;
}

export default function InsightHero({ insights, live, compact }: InsightHeroProps) {
  return (
    <div className={`rounded-2xl border border-accent-teal/25 bg-gradient-to-br from-accent-teal/10 to-white/40 p-4 ${compact ? "" : "glow-teal"}`}>
      <div className="text-[10px] uppercase tracking-widest text-accent-teal mb-1">
        Total Addressable Market
      </div>
      <div className={`font-bold text-primary tabular-nums ${compact ? "text-2xl" : "text-4xl"}`}>
        {formatZar(insights.nationalTamZar, true)}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge label="Confidence" value={`${insights.dataConfidence}%`} />
        <Badge label="White-Space" value={`${live.whiteSpacePct}%`} />
        <Badge label="Concentration" value={`${live.concentrationIndex}%`} accent />
      </div>
      <p className="mt-2 text-[10px] text-muted">
        Based on {insights.valuePerActivation.toLocaleString()} ZAR/activation across verified retail network
      </p>
    </div>
  );
}

function Badge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className={`rounded-lg px-2 py-1 text-[10px] ${accent ? "bg-accent/15 text-accent" : "bg-white/60 text-muted border border-border"}`}>
      {label}: <strong className="text-primary">{value}</strong>
    </span>
  );
}
