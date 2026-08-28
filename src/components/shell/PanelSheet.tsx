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
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col glass-panel-strong rounded-t-3xl border-t border-white/10 md:hidden"
        style={{ height: "calc(85vh - env(safe-area-inset-bottom))" }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <h2 className="text-base font-bold text-white">{titles[tab]}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-safe-bottom">
          {children}
        </div>
      </div>
    </>
  );
}
