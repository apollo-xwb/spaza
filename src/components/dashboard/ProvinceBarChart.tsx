"use client";

import { formatZar } from "@/lib/insights-engine";
import type { ProvinceInsight } from "@/types";

interface ProvinceBarChartProps {
  provinces: ProvinceInsight[];
}

export default function ProvinceBarChart({ provinces }: ProvinceBarChartProps) {
  const maxTam = provinces[0]?.tamZar ?? 1;
  const colors = ["#007AFF", "#34C759", "#FF9500", "#AF52DE", "#5AC8FA", "#FF3B30", "#5856D6", "#FF2D55", "#00C7BE"];

  return (
    <div className="ios-card p-5">
      <h3 className="ios-section-title mb-4">Province TAM Breakdown</h3>
      <div className="space-y-3">
        {provinces.map((p, i) => (
          <div key={p.province}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-ios-label">{p.province}</span>
              <div className="text-right">
                <span className="text-sm font-semibold tabular-nums text-ios-label">{formatZar(p.tamZar, true)}</span>
                <span className="text-[10px] text-ios-secondary ml-2">{p.shopCount} shops</span>
              </div>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(p.tamZar / maxTam) * 100}%`, backgroundColor: colors[i % colors.length] }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-ios-tertiary">
              <span>{p.avgActivations.toFixed(1)} avg activations</span>
              <span>{p.growthPotential}% growth potential</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
