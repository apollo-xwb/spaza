"use client";

import { formatNumber } from "@/lib/utils";
import { formatZar } from "@/lib/insights-engine";
import type { LiveInsights, VisibleStats } from "@/types";
import IosSegmentedNav from "@/components/shell/IosSegmentedNav";

interface FloatingHeaderProps {
  stats: VisibleStats;
  live: LiveInsights;
  onSearchToggle: () => void;
  searchOpen: boolean;
  isDesktop?: boolean;
}

export default function FloatingHeader({ stats, live, onSearchToggle, searchOpen, isDesktop }: FloatingHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-safe-top">
      <div className="ios-blur-strong mt-2 rounded-ios-lg border border-ios-separator shadow-sm">
        <div className="flex justify-center px-3 pt-2.5 pb-2">
          <IosSegmentedNav />
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-ios bg-ios-blue/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2">
                <circle cx="12" cy="10" r="3" />
                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] font-semibold text-ios-label truncate">Spaza Map</h1>
              {isDesktop && (
                <p className="text-[12px] text-ios-secondary tabular-nums">
                  {formatNumber(stats.visibleCount)} locations · {formatZar(live.tamZar, true)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onSearchToggle}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95 ${
              searchOpen ? "bg-ios-blue text-white" : "bg-ios-fill text-ios-secondary"
            }`}
            aria-label="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
