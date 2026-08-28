"use client";

import { formatNumber } from "@/lib/utils";

interface SnapMapHeaderProps {
  shopCount: number;
  onMenuClick: () => void;
  onSearchClick: () => void;
  searchOpen: boolean;
}

export default function SnapMapHeader({ shopCount, onMenuClick, onSearchClick, searchOpen }: SnapMapHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-safe-top">
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={onMenuClick}
          className="snap-fab flex h-11 w-11 items-center justify-center active:scale-95 transition"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="snap-glass flex-1 max-w-[220px] rounded-pill px-4 py-2.5 text-center">
          <div className="text-[13px] font-semibold text-gray-900 truncate">South Africa</div>
          <div className="text-[11px] text-gray-500 tabular-nums">{formatNumber(shopCount)} shops</div>
        </div>

        <button
          onClick={onSearchClick}
          className={`snap-fab flex h-11 w-11 items-center justify-center active:scale-95 transition ${
            searchOpen ? "ring-2 ring-snap-yellow" : ""
          }`}
          aria-label="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </header>
  );
}
