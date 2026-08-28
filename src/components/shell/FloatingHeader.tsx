"use client";

import { formatNumber } from "@/lib/utils";
import { formatZar } from "@/lib/insights-engine";
import type { LiveInsights, VisibleStats } from "@/types";

interface FloatingHeaderProps {
  stats: VisibleStats;
  live: LiveInsights;
  onSearchToggle: () => void;
  searchOpen: boolean;
  isDesktop?: boolean;
}

export default function FloatingHeader({ stats, live, onSearchToggle, searchOpen, isDesktop }: FloatingHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-3 pt-safe-top">
      <div className="glass-panel-strong mt-2 flex items-center justify-between rounded-2xl px-3 py-2.5 md:px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-teal/40 bg-accent-teal/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-wide text-primary truncate">SPAZA SUPER MAP</h1>
            {isDesktop && (
              <p className="text-[10px] text-accent-teal tabular-nums">
                {formatNumber(stats.visibleCount)} locations · {formatZar(live.tamZar, true)} TAM
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onSearchToggle}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
            searchOpen ? "border-accent-teal bg-accent-teal/15 text-accent-teal" : "border-border bg-white/50 text-muted"
          }`}
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </header>
  );
}
