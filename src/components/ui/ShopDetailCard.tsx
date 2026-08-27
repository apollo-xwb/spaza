"use client";

import type { Shop } from "@/types";
import { formatCoord, formatNumber, TIER_COLORS } from "@/lib/utils";

interface ShopDetailCardProps {
  shop: Shop | null;
  onClose: () => void;
}

export default function ShopDetailCard({ shop, onClose }: ShopDetailCardProps) {
  if (!shop) return null;

  return (
    <div className="absolute top-20 right-4 z-30 w-80 glass-panel-strong rounded-xl border border-hud-cyan/20 hud-glow-cyan overflow-hidden">
      <div className="flex items-start justify-between p-4 border-b border-white/10">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-hud-cyan">Selected Location</div>
          <h2 className="text-lg font-semibold text-white mt-1">{shop.shopName}</h2>
          <p className="text-xs text-white/50">{shop.shopTypeCategory}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">Activations</div>
            <div
              className="text-4xl font-bold tabular-nums"
              style={{ color: TIER_COLORS[shop.activationTier] }}
            >
              {shop.activations}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-white/40">Tier</div>
            <div
              className="text-sm font-medium uppercase"
              style={{ color: TIER_COLORS[shop.activationTier] }}
            >
              {shop.activationTier}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Metric label="Province Rank" value={`#${shop.provinceRank}`} />
          <Metric label="Coverage Score" value={shop.coverageScore.toFixed(1)} />
          <Metric label="Route Seq" value={`#${shop.routeSequence}`} />
          <Metric
            label="Address"
            value={shop.hasVerifiedAddress ? "Verified" : "Pending"}
            warn={!shop.hasVerifiedAddress}
          />
        </div>

        <div className="space-y-2 text-xs">
          <Row label="City" value={`${shop.city}, ${shop.suburb}`} />
          <Row label="Province" value={shop.province} />
          <Row label="Address" value={shop.address} />
          <Row label="Coordinates" value={formatCoord(shop.lat, shop.lng)} mono />
          <Row label="Distance Chain" value={`${formatNumber(shop.distance)} m · ${shop.distanceKm} km step`} />
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="radar-ring absolute h-16 w-16 rounded-full border border-hud-cyan/40" />
        <div className="radar-ring-delay absolute h-16 w-16 rounded-full border border-hud-cyan/20" />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2">
      <div className="text-[10px] text-white/40">{label}</div>
      <div className={`text-sm font-medium ${warn ? "text-orange-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <span className="text-white/40 shrink-0 w-20">{label}</span>
      <span className={`text-white/80 ${mono ? "font-mono text-[10px]" : ""}`}>{value}</span>
    </div>
  );
}
