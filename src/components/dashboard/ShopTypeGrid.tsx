"use client";

import type { ShopTypeSummary } from "@/types";

interface ShopTypeGridProps {
  types: ShopTypeSummary[];
}

const COLORS = ["#007AFF", "#34C759", "#FF9500", "#AF52DE", "#5AC8FA", "#FF3B30", "#5856D6", "#00C7BE", "#FF2D55", "#8E8E93", "#30B0C7", "#AC8E68", "#64D2FF"];

export default function ShopTypeGrid({ types }: ShopTypeGridProps) {
  const max = types[0]?.count ?? 1;

  return (
    <div className="ios-card p-5">
      <h3 className="ios-section-title mb-4">Shop Categories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {types.map((t, i) => (
          <div key={t.category} className="ios-card-inset p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ios-label truncate pr-2">{t.category}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: COLORS[i % COLORS.length] }}>
                {t.count.toLocaleString()}
              </span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(t.count / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
              />
            </div>
            <div className="text-[10px] text-ios-tertiary mt-1">{t.avgActivations.toFixed(1)} avg activations</div>
          </div>
        ))}
      </div>
    </div>
  );
}
