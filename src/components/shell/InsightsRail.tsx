"use client";

import { formatZar } from "@/lib/insights-engine";
import type { DataInsights, LiveInsights } from "@/types";
import InsightHero from "@/components/insights/InsightHero";
import ProvinceLeaderboard from "@/components/insights/ProvinceLeaderboard";
import TrendCards from "@/components/insights/TrendCards";

interface InsightsRailProps {
  insights: DataInsights;
  live: LiveInsights;
  collapsed: boolean;
  onToggle: () => void;
}

export default function InsightsRail({ insights, live, collapsed, onToggle }: InsightsRailProps) {
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="absolute left-3 top-20 z-30 glass-panel rounded-xl px-3 py-2 text-xs text-accent-teal hidden md:block"
      >
        → Insights
      </button>
    );
  }

  return (
    <aside className="absolute left-3 top-20 bottom-6 z-30 w-72 glass-panel-strong rounded-2xl border border-border overflow-hidden hidden md:flex md:flex-col grunge-pattern">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent-teal">Intelligence</h2>
          <p className="text-[10px] text-muted">{formatZar(live.tamZar, true)} live TAM</p>
        </div>
        <button onClick={onToggle} className="text-muted hover:text-primary text-lg">‹</button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        <InsightHero insights={insights} live={live} compact />
        <ProvinceLeaderboard provinces={insights.byProvince.slice(0, 6)} />
        <TrendCards insights={insights} />
      </div>
    </aside>
  );
}
