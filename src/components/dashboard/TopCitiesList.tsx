"use client";

import type { CitySummary } from "@/types";

interface TopCitiesListProps {
  cities: CitySummary[];
}

export default function TopCitiesList({ cities }: TopCitiesListProps) {
  const top = [...cities].sort((a, b) => b.count - a.count).slice(0, 12);

  return (
    <div className="ios-card overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="ios-section-title">Top Cities by Shop Count</h3>
      </div>
      {top.map((c, i) => (
        <div key={`${c.city}-${c.province}`} className="ios-row">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-6 h-6 rounded-full bg-ios-fill flex items-center justify-center text-[11px] font-bold text-ios-secondary shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-ios-label truncate">{c.city}</div>
              <div className="text-[11px] text-ios-secondary">{c.province}</div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-3">
            <div className="text-sm font-semibold tabular-nums">{c.count}</div>
            <div className="text-[10px] text-ios-tertiary">{c.avgActivations.toFixed(1)} avg</div>
          </div>
        </div>
      ))}
    </div>
  );
}
