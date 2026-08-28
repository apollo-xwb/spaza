"use client";

import type { AppTab } from "@/types";

const TABS: { id: AppTab; label: string; icon: string }[] = [
  { id: "map", label: "Map", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" },
  { id: "insights", label: "Insights", icon: "M3 3v18h18M7 16l4-8 4 5 4-9" },
  { id: "routes", label: "Routes", icon: "M4 6h16M4 12h10M4 18h6" },
  { id: "explore", label: "Explore", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
];

interface BottomNavProps {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  routeCount?: number;
}

export default function BottomNav({ active, onChange, routeCount = 0 }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 ios-blur-strong border-t border-ios-separator pb-safe-bottom md:hidden">
      <div className="flex items-stretch justify-around px-2 pt-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 transition active:scale-95 ${
                isActive ? "text-ios-blue" : "text-ios-secondary"
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d={tab.icon} />
              </svg>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {tab.id === "routes" && routeCount > 0 && (
                <span className="absolute right-1/4 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ios-red px-1 text-[10px] font-bold text-white">
                  {routeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
