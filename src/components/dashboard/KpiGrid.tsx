"use client";

import { formatZar } from "@/lib/insights-engine";
import type { DataSummaries, DataInsights } from "@/types";

interface KpiGridProps {
  summaries: DataSummaries;
  insights: DataInsights;
}

export default function KpiGrid({ summaries, insights }: KpiGridProps) {
  const n = summaries.national;
  const kpis = [
    { label: "Total Shops", value: n.totalShops.toLocaleString(), color: "text-ios-blue", sub: "Nationwide network" },
    { label: "Activations", value: n.totalActivations.toLocaleString(), color: "text-ios-green", sub: "Lifetime total" },
    { label: "TAM", value: formatZar(insights.nationalTamZar, true), color: "text-ios-purple", sub: "Addressable market" },
    { label: "Verified", value: `${n.verifiedAddressPct.toFixed(0)}%`, color: "text-ios-teal", sub: "Address quality" },
    { label: "Provinces", value: String(n.provinces), color: "text-ios-orange", sub: `${n.cities} cities` },
    { label: "Avg Activation", value: n.avgActivations.toFixed(1), color: "text-ios-label", sub: `Median ${n.medianActivations}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="ios-card p-4">
          <div className="text-[11px] font-medium text-ios-secondary mb-1">{k.label}</div>
          <div className={`text-2xl font-bold tabular-nums tracking-tight ${k.color}`}>{k.value}</div>
          <div className="text-[10px] text-ios-tertiary mt-1">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}
