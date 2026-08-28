"use client";

import type { Shop } from "@/types";
import { formatCoord, TIER_COLORS } from "@/lib/utils";
import { formatZar, shopTamContribution } from "@/lib/insights-engine";

interface ShopSheetProps {
  shop: Shop | null;
  onClose: () => void;
  onAddToRoute: (shop: Shop) => void;
  inRoute: boolean;
  isDesktop?: boolean;
}

export default function ShopSheet({ shop, onClose, onAddToRoute, inRoute, isDesktop }: ShopSheetProps) {
  if (!shop) return null;

  const content = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1 pr-4">
          <div className="text-[10px] uppercase tracking-widest text-accent-teal mb-1">Selected Location</div>
          <h2 className="text-lg font-bold text-primary leading-tight">{shop.shopName}</h2>
          <p className="text-xs text-muted mt-0.5">{shop.shopTypeCategory} · {shop.city}</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-primary text-2xl leading-none shrink-0">×</button>
      </div>

      <div className="flex items-end gap-4 mb-5">
        <div>
          <div className="text-[10px] uppercase text-muted">Activations</div>
          <div className="text-4xl font-bold tabular-nums" style={{ color: TIER_COLORS[shop.activationTier] }}>
            {shop.activations}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] uppercase text-muted">Market Value</div>
          <div className="text-xl font-semibold text-accent tabular-nums">
            {formatZar(shopTamContribution(shop), true)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-muted">Tier</div>
          <div className="text-sm font-bold uppercase" style={{ color: TIER_COLORS[shop.activationTier] }}>
            {shop.activationTier}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          ["Province Rank", `#${shop.provinceRank}`],
          ["Coverage", shop.coverageScore.toFixed(1)],
          ["Address", shop.hasVerifiedAddress ? "Verified" : "Pending"],
          ["Coords", formatCoord(shop.lat, shop.lng).split(",")[0]],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/60 border border-border px-3 py-2">
            <div className="text-[9px] text-muted uppercase">{label}</div>
            <div className="text-xs font-medium text-primary truncate">{value}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mb-4 line-clamp-2">{shop.address}</p>

      <button
        onClick={() => onAddToRoute(shop)}
        className={`w-full rounded-xl py-3 text-sm font-semibold transition ${
          inRoute
            ? "bg-accent-teal/15 border border-accent-teal text-accent-teal"
            : "bg-accent text-black hover:bg-accent/90 glow-accent"
        }`}
      >
        {inRoute ? "✓ Added to Route" : "+ Add to Route"}
      </button>
    </>
  );

  if (isDesktop) {
    return (
      <div className="absolute top-20 right-4 z-30 w-80 glass-panel-strong rounded-2xl border border-accent-teal/20 p-4 glow-teal animate-slide-in-right grunge-pattern">
        {content}
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel-strong rounded-t-3xl border-t border-accent-teal/20 p-5 pb-safe-bottom max-h-[70vh] overflow-y-auto scrollbar-thin animate-slide-up md:hidden">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {content}
      </div>
    </>
  );
}
