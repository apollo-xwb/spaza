"use client";

import type { AppTab } from "@/types";

interface PanelSheetProps {
  open: boolean;
  tab: AppTab;
  onClose: () => void;
  children: React.ReactNode;
}

export default function PanelSheet({ open, tab, onClose, children }: PanelSheetProps) {
  if (!open || tab === "map") return null;

  const titles: Record<AppTab, string> = {
    map: "Map",
    insights: "Market Intelligence",
    routes: "Route Optimizer",
    explore: "Explore & Filter",
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col snap-glass-strong rounded-t-[28px] border-t border-white/40 texture-topo"
        style={{ height: "calc(82vh - env(safe-area-inset-bottom))", marginBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="w-full">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
            <h2 className="text-base font-bold text-gray-900">{titles[tab]}</h2>
          </div>
          <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-4">
          {children}
        </div>
      </div>
    </>
  );
}
