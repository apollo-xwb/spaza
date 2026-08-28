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
    <div className={`rounded-2xl border border-hud-cyan/30 bg-gradient-to-br from-hud-cyan/10 to-transparent p-4 ${compact ? "" : "hud-glow-cyan"}`}>
      <div className="text-[10px] uppercase tracking-widest text-hud-cyan/80 mb-1">
        Total Addressable Market
      </div>
      <div className={`font-bold text-white tabular-nums ${compact ? "text-2xl" : "text-4xl"}`}>
        {formatZar(insights.nationalTamZar, true)}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge label="Confidence" value={`${insights.dataConfidence}%`} />
        <Badge label="White-Space" value={`${live.whiteSpacePct}%`} />
        <Badge label="Concentration" value={`${live.concentrationIndex}%`} accent />
      </div>
      <p className="mt-2 text-[10px] text-white/40">
        Based on {insights.valuePerActivation.toLocaleString()} ZAR/activation across verified retail network
      </p>
    </div>
  );
}

function Badge({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <span className={`rounded-lg px-2 py-1 text-[10px] ${accent ? "bg-hud-amber/20 text-hud-amber" : "bg-white/5 text-white/60"}`}>
      {label}: <strong>{value}</strong>
    </span>
  );
}
