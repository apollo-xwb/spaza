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
    { label: "Total Shops", value: n.totalShops.toLocaleString(), color: "text-ios-blue" },
    { label: "Verified", value: `${n.verifiedAddressPct.toFixed(0)}%`, color: "text-ios-green" },
    { label: "Provinces", value: String(n.provinces), color: "text-ios-orange" },
    { label: "Cities", value: String(n.cities), color: "text-ios-purple" },
    { label: "Categories", value: String(n.shopTypeCategories), color: "text-airly-slate" },
    { label: "White-Space", value: `${insights.whiteSpacePct}%`, color: "text-ios-teal" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="ios-card texture-dots p-4 relative overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ios-secondary mb-1">{k.label}</div>
          <div className={`text-xl font-extrabold tabular-nums tracking-tight ${k.color}`}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}
