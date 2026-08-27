"use client";

import type { Shop, MapFilters, DataSummaries } from "@/types";
import { formatCoord, TIER_COLORS } from "@/lib/utils";
import { getCitiesForProvince } from "@/lib/shop-data";

interface MapSidebarProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  summaries: DataSummaries;
  allShops: Shop[];
  visibleShops: Shop[];
  selectedShopIds: Set<string>;
  onShopSelect: (shop: Shop) => void;
  onShopToggle: (shop: Shop) => void;
  collapsed: boolean;
}

export default function MapSidebar({
  filters,
  onFiltersChange,
  summaries,
  allShops,
  visibleShops,
  selectedShopIds,
  onShopSelect,
  onShopToggle,
  collapsed,
}: MapSidebarProps) {
  if (collapsed) return null;

  const cities = getCitiesForProvince(allShops, filters.province);
  const nearby = [...visibleShops]
    .sort((a, b) => b.activations - a.activations)
    .slice(0, 8);

  const update = (patch: Partial<MapFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <aside className="absolute left-0 top-14 bottom-36 z-20 w-72 glass-panel-strong border-r border-white/10 flex flex-col">
      <div className="p-3 border-b border-white/10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search location..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 pl-8 text-xs text-white placeholder:text-white/30 focus:border-hud-cyan focus:outline-none focus:ring-1 focus:ring-hud-cyan"
          />
          <svg
            className="absolute left-2.5 top-2.5 text-white/40"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <nav className="px-3 py-2 border-b border-white/10">
        {["Map", "Analytics", "Routes"].map((tab, i) => (
          <button
            key={tab}
            className={`mr-4 text-xs uppercase tracking-wider ${
              i === 0 ? "text-hud-cyan border-l-2 border-hud-cyan pl-2" : "text-white/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
        <FilterSelect
          label="Province"
          value={filters.province}
          onChange={(v) => update({ province: v, city: "" })}
          options={["", ...summaries.byProvince.map((p) => p.province)]}
        />
        <FilterSelect
          label="City"
          value={filters.city}
          onChange={(v) => update({ city: v })}
          options={["", ...cities]}
        />
        <FilterSelect
          label="Shop Type"
          value={filters.shopTypeCategory}
          onChange={(v) => update({ shopTypeCategory: v })}
          options={["", ...summaries.byShopType.map((t) => t.category)]}
        />
        <FilterSelect
          label="Activation Tier"
          value={filters.activationTier}
          onChange={(v) => update({ activationTier: v })}
          options={["", "low", "medium", "high", "elite"]}
        />

        <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showHeatmap}
            onChange={(e) => update({ showHeatmap: e.target.checked })}
            className="rounded border-white/20 bg-black/40 text-hud-cyan focus:ring-hud-cyan"
          />
          Activation heatmap
        </label>

        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Province Intelligence
          </h3>
          <div className="space-y-1">
            {summaries.byProvince.slice(0, 5).map((p) => (
              <button
                key={p.province}
                onClick={() => update({ province: p.province, city: "" })}
                className="w-full flex justify-between items-center rounded px-2 py-1.5 text-xs hover:bg-white/5 transition"
              >
                <span className="text-white/80">{p.province}</span>
                <span className="text-hud-cyan tabular-nums">{p.count}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Top Activations Nearby
          </h3>
          <div className="space-y-1">
            {nearby.map((shop) => (
              <button
                key={shop.id}
                onClick={() => onShopSelect(shop)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onShopToggle(shop);
                }}
                className={`w-full text-left rounded px-2 py-1.5 text-xs hover:bg-white/5 transition border ${
                  selectedShopIds.has(shop.id)
                    ? "border-hud-cyan/50 bg-hud-cyan/10"
                    : "border-transparent"
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-white/90 truncate pr-2">{shop.shopName}</span>
                  <span
                    className="tabular-nums shrink-0"
                    style={{ color: TIER_COLORS[shop.activationTier] }}
                  >
                    {shop.activations}
                  </span>
                </div>
                <div className="text-[10px] text-white/40 truncate">
                  {shop.shopTypeCategory} · {shop.city}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
            Type Intelligence
          </h3>
          {summaries.byShopType.slice(0, 6).map((t) => (
            <div key={t.category} className="flex justify-between text-xs py-1">
              <span className="text-white/60">{t.category}</span>
              <span className="text-white/40 tabular-nums">
                {t.count} · avg {t.avgActivations.toFixed(1)}
              </span>
            </div>
          ))}
        </section>
      </div>

      <div className="p-3 border-t border-white/10 text-[10px] text-white/40">
        <div className="flex items-center gap-2">
          <span className="text-hud-cyan">●</span>
          {summaries.national.totalShops.toLocaleString()} enriched locations ·{" "}
          {summaries.national.provinces} provinces
        </div>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/40">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white focus:border-hud-cyan focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt || "all"} value={opt}>
            {opt || `All ${label}s`}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SidebarLocationReadout({ shop }: { shop: Shop | null }) {
  if (!shop) return null;
  return (
    <div className="font-mono text-[10px] text-white/50">
      {formatCoord(shop.lat, shop.lng)}
    </div>
  );
}
