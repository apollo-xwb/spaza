"use client";

import type { DataInsights } from "@/types";

interface MarketSignalsProps {
  insights: DataInsights;
}

export default function MarketSignals({ insights }: MarketSignalsProps) {
  const signals = [
    { label: "Data Confidence", value: `${insights.dataConfidence}%`, color: "bg-ios-green/15 text-ios-green" },
    { label: "White-Space", value: `${insights.whiteSpacePct}%`, color: "bg-ios-orange/15 text-ios-orange" },
    { label: "Concentration", value: `${insights.concentrationIndex}%`, color: "bg-ios-purple/15 text-ios-purple" },
    { label: "Value / Activation", value: `R${insights.valuePerActivation}`, color: "bg-ios-blue/15 text-ios-blue" },
  ];

  return (
    <div className="ios-card p-5">
      <h3 className="ios-section-title mb-4">Market Signals</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {signals.map((s) => (
          <div key={s.label} className={`rounded-ios p-4 ${s.color}`}>
            <div className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</div>
            <div className="text-[11px] font-medium opacity-80 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-ios-separator">
        <h4 className="text-xs font-semibold text-ios-secondary mb-3">Category Index Leaders</h4>
        <div className="space-y-2">
          {insights.categoryLeaders.slice(0, 6).map((c) => (
            <div key={c.category} className="flex items-center justify-between">
              <span className="text-sm text-ios-label">{c.category}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-ios-secondary">{c.count} shops</span>
                <span className={`text-sm font-bold tabular-nums ${c.indexScore > 100 ? "text-ios-blue" : "text-ios-secondary"}`}>
                  {c.indexScore}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
