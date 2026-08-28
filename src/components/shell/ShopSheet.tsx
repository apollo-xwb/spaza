"use client";

import type { Shop } from "@/types";
import { TIER_COLORS } from "@/lib/utils";
import { formatZar, shopTamContribution } from "@/lib/insights-engine";

interface ShopSheetProps {
  shop: Shop | null;
  onClose: () => void;
  onAddToRoute: (shop: Shop) => void;
  inRoute: boolean;
  isDesktop?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ShopSheet({ shop, onClose, onAddToRoute, inRoute, isDesktop }: ShopSheetProps) {
  if (!shop) return null;

  const initials = getInitials(shop.shopName);
  const tierColor = TIER_COLORS[shop.activationTier];

  const card = (
    <div className="snap-glass-strong rounded-ios-lg p-4 texture-grain relative animate-slide-up">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white border-[3px] border-white shadow-md"
          style={{ background: tierColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">{shop.shopName}</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">{shop.shopTypeCategory} · {shop.city}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0">×</button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-bold tabular-nums" style={{ color: tierColor }}>{shop.activations}</span>
            <span className="text-[11px] text-gray-400">activations</span>
            <span className="text-[12px] font-semibold text-gray-700 tabular-nums ml-auto">
              {formatZar(shopTamContribution(shop), true)}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onAddToRoute(shop)}
        className={`w-full mt-4 rounded-pill py-2.5 text-sm font-bold transition active:scale-[0.98] ${
          inRoute
            ? "bg-snap-lime/30 text-gray-800 border border-snap-lime"
            : "bg-gray-900 text-white"
        }`}
      >
        {inRoute ? "Added to Route" : "Add to Route"}
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="absolute top-24 right-4 z-30 w-80">
        {card}
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 md:hidden">
        {card}
      </div>
    </>
  );
}
