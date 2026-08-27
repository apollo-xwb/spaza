"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type {
  Shop,
  DataSummaries,
  MapFilters,
  OptimizedRoute,
  RouteMode,
} from "@/types";
import { filterShops, computeVisibleStats } from "@/lib/shop-data";
import KpiStrip from "@/components/ui/KpiStrip";
import MapSidebar from "@/components/ui/MapSidebar";
import ShopDetailCard from "@/components/ui/ShopDetailCard";
import WarningDrawer from "@/components/ui/WarningDrawer";
import RoutePanel from "@/components/ui/RoutePanel";

const ShopsMap = dynamic(() => import("@/components/map/ShopsMap"), { ssr: false });

interface Props {
  shops: Shop[];
  summaries: DataSummaries;
}

export default function IntelligenceDashboard({ shops, summaries }: Props) {
  const [filters, setFilters] = useState<MapFilters>({
    search: "",
    province: "",
    city: "",
    shopTypeCategory: "",
    activationTier: "",
    showHeatmap: false,
  });

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedShopIds, setSelectedShopIds] = useState<Set<string>>(new Set());
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>("field_rep");
  const [depot, setDepot] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [depotMode, setDepotMode] = useState(false);
  const [highValueCount, setHighValueCount] = useState(15);
  const [presentationMode, setPresentationMode] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);

  const visibleShops = useMemo(
    () => filterShops(shops, filters),
    [shops, filters]
  );

  const selectedShops = useMemo(
    () => shops.filter((s) => selectedShopIds.has(s.id)),
    [shops, selectedShopIds]
  );

  const stats = useMemo(
    () => computeVisibleStats(visibleShops, shops.length),
    [visibleShops, shops.length]
  );

  const handleShopToggle = useCallback((shop: Shop) => {
    setSelectedShopIds((prev) => {
      const next = new Set(prev);
      if (next.has(shop.id)) next.delete(shop.id);
      else next.add(shop.id);
      return next;
    });
  }, []);

  const handleDepotPick = useCallback((coords: { lat: number; lng: number }) => {
    setDepot({ ...coords, label: "Custom Depot" });
    setDepotMode(false);
  }, []);

  const handleDepotPreset = useCallback(
    (d: { lat: number; lng: number; label: string }) => {
      setDepot(d);
      setDepotMode(false);
    },
    []
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-hud-bg">
      <ShopsMap
        shops={visibleShops}
        selectedShop={selectedShop}
        selectedShopIds={selectedShopIds}
        route={route}
        showHeatmap={filters.showHeatmap}
        onShopSelect={setSelectedShop}
        onShopToggle={handleShopToggle}
        onDepotPick={handleDepotPick}
        depotMode={depotMode}
        depot={depot}
        presentationMode={presentationMode}
      />

      <KpiStrip
        stats={stats}
        route={route}
        presentationMode={presentationMode}
        onTogglePresentation={() => setPresentationMode((p) => !p)}
      />

      <MapSidebar
        filters={filters}
        onFiltersChange={setFilters}
        summaries={summaries}
        allShops={shops}
        visibleShops={visibleShops}
        selectedShopIds={selectedShopIds}
        onShopSelect={setSelectedShop}
        onShopToggle={handleShopToggle}
        collapsed={presentationMode}
      />

      <RoutePanel
        mode={routeMode}
        onModeChange={setRouteMode}
        selectedShops={selectedShops}
        filteredShops={visibleShops}
        summaries={summaries}
        route={route}
        onRouteChange={setRoute}
        depot={depot}
        onDepotModeChange={setDepotMode}
        depotMode={depotMode}
        highValueCount={highValueCount}
        onHighValueCountChange={setHighValueCount}
        onDepotPreset={handleDepotPreset}
        collapsed={presentationMode}
      />

      <ShopDetailCard shop={selectedShop} onClose={() => setSelectedShop(null)} />

      <WarningDrawer
        summaries={summaries}
        route={route}
        selectedShop={selectedShop}
        selectedCount={selectedShopIds.size}
        expanded={drawerExpanded}
        onToggle={() => setDrawerExpanded((e) => !e)}
      />

      {!presentationMode && (
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-10 glass-panel rounded-full px-4 py-1.5 text-[10px] text-white/50">
          Showing {stats.visibleCount.toLocaleString()} of {stats.totalCount.toLocaleString()} shops ·{" "}
          {stats.totalActivations.toLocaleString()} activations in view
        </div>
      )}
    </div>
  );
}
