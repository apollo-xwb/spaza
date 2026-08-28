"use client";

import type { Shop, MapFilters, DataSummaries } from "@/types";
import { TIER_COLORS } from "@/lib/utils";
import { getCitiesForProvince } from "@/lib/shop-data";

interface ExplorePanelProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  summaries: DataSummaries;
  allShops: Shop[];
  visibleShops: Shop[];
  mapCenter: { lat: number; lng: number };
  onShopSelect: (shop: Shop) => void;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
        active
          ? "bg-accent-teal/15 border border-accent-teal/50 text-accent-teal"
          : "bg-white/60 border border-border text-muted"
      }`}
    >
      {label}
    </button>
  );
}

export default function ExplorePanel({
  filters,
  onFiltersChange,
  summaries,
  allShops,
  visibleShops,
  mapCenter,
  onShopSelect,
}: ExplorePanelProps) {
  const update = (patch: Partial<MapFilters>) => onFiltersChange({ ...filters, ...patch });
  const cities = getCitiesForProvince(allShops, filters.province);

  const nearby = [...visibleShops]
    .map((s) => ({
      shop: s,
      dist: Math.sqrt((s.lat - mapCenter.lat) ** 2 + (s.lng - mapCenter.lng) ** 2),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 10);

  const topActivations = [...visibleShops].sort((a, b) => b.activations - a.activations).slice(0, 8);

  return (
    <div className="space-y-5">
      <div>
        <input
          type="search"
          placeholder="Search shops, suburbs, cities..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm text-primary placeholder:text-muted focus:border-accent-teal focus:outline-none"
        />
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Province</div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <Chip label="All" active={!filters.province} onClick={() => update({ province: "", city: "" })} />
          {summaries.byProvince.map((p) => (
            <Chip
              key={p.province}
              label={p.province}
              active={filters.province === p.province}
              onClick={() => update({ province: p.province, city: "" })}
            />
          ))}
        </div>
      </div>

      {filters.province && cities.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted mb-2">City</div>
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
            <Chip label="All" active={!filters.city} onClick={() => update({ city: "" })} />
            {cities.slice(0, 15).map((c) => (
              <Chip key={c} label={c} active={filters.city === c} onClick={() => update({ city: c })} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Shop Type</div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <Chip label="All" active={!filters.shopTypeCategory} onClick={() => update({ shopTypeCategory: "" })} />
          {summaries.byShopType.map((t) => (
            <Chip
              key={t.category}
              label={t.category}
              active={filters.shopTypeCategory === t.category}
              onClick={() => update({ shopTypeCategory: t.category })}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <label className="flex items-center gap-2 text-xs text-primary/70 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showHeatmap}
            onChange={(e) => update({ showHeatmap: e.target.checked })}
            className="accent-accent-teal"
          />
          Heatmap
        </label>
        <label className="flex items-center gap-2 text-xs text-primary/70 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showOpportunity}
            onChange={(e) => update({ showOpportunity: e.target.checked })}
            className="accent-accent"
          />
          Opportunity zones
        </label>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Top Activations</div>
        <div className="space-y-1">
          {topActivations.map((s) => (
            <button
              key={s.id}
              onClick={() => onShopSelect(s)}
              className="w-full flex justify-between items-center rounded-xl bg-white/50 border border-border px-3 py-2.5 text-left hover:bg-white/80 transition"
            >
              <div className="min-w-0">
                <div className="text-xs text-primary truncate">{s.shopName}</div>
                <div className="text-[10px] text-muted">{s.city} · {s.shopTypeCategory}</div>
              </div>
              <span className="text-sm font-bold tabular-nums ml-2" style={{ color: TIER_COLORS[s.activationTier] }}>
                {s.activations}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Nearby</div>
        <div className="space-y-1">
          {nearby.map(({ shop }) => (
            <button
              key={shop.id}
              onClick={() => onShopSelect(shop)}
              className="w-full flex justify-between rounded-xl px-3 py-2 text-left hover:bg-white/50 text-xs text-primary/70"
            >
              <span className="truncate">{shop.shopName}</span>
              <span className="text-accent-teal ml-2 shrink-0">{shop.activations}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
