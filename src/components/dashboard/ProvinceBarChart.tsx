"use client";

import { formatZar } from "@/lib/insights-engine";
import type { ProvinceInsight } from "@/types";

interface ProvinceBarChartProps {
  provinces: ProvinceInsight[];
}

export default function ProvinceBarChart({ provinces }: ProvinceBarChartProps) {
  const maxTam = provinces[0]?.tamZar ?? 1;
  const colors = ["#007AFF", "#C8F135", "#FFFC00", "#AF52DE", "#5AC8FA", "#FF9500", "#34C759", "#FF3B30", "#5856D6"];

  return (
    <div className="ios-card texture-grain relative p-5 overflow-hidden">
      <h3 className="ios-section-title mb-4">Province TAM</h3>
      <div className="space-y-3">
        {provinces.map((p, i) => (
          <div key={p.province}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold">{p.province}</span>
              <span className="text-sm font-bold tabular-nums">{formatZar(p.tamZar, true)}</span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(p.tamZar / maxTam) * 100}%`, backgroundColor: colors[i % colors.length] }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-ios-secondary">
              <span>{p.shopCount} shops</span>
              <span>{p.growthPotential}% growth</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
