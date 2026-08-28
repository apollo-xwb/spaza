"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type {
  Shop,
  DataSummaries,
  DataInsights,
  MapFilters,
  OptimizedRoute,
  RouteMode,
  AppTab,
} from "@/types";
import type { MapStyleMode } from "@/lib/map-style";
import { filterShops, computeVisibleStats } from "@/lib/shop-data";
import { computeLiveInsights } from "@/lib/insights-engine";
import type { MapCanvasHandle } from "@/components/map/MapCanvas";
import { useAppNav } from "@/contexts/AppNavContext";
import SnapMapHeader from "@/components/shell/SnapMapHeader";
import MapFloatingControls from "@/components/shell/MapFloatingControls";
import InsightPillStrip from "@/components/shell/InsightPillStrip";
import ShopSheet from "@/components/shell/ShopSheet";
import PanelSheet from "@/components/shell/PanelSheet";
import InsightsRail from "@/components/shell/InsightsRail";
import InsightHero from "@/components/insights/InsightHero";
import ProvinceLeaderboard from "@/components/insights/ProvinceLeaderboard";
import TrendCards from "@/components/insights/TrendCards";
import RouteBuilder from "@/components/routes/RouteBuilder";
import ExplorePanel from "@/components/explore/ExplorePanel";

const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), { ssr: false });

interface Props {
  shops: Shop[];
  summaries: DataSummaries;
  insights: DataInsights;
}

export default function SuperAppShell({ shops, summaries, insights }: Props) {
  const mapRef = useRef<MapCanvasHandle>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setRouteCount, registerPanelHandler } = useAppNav();

  const [activeTab, setActiveTab] = useState<AppTab>("map");
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapStyleMode, setMapStyleMode] = useState<MapStyleMode>("satellite");

  const [filters, setFilters] = useState<MapFilters>({
    search: "",
    province: "",
    city: "",
    shopTypeCategory: "",
    activationTier: "",
    showHeatmap: false,
    showOpportunity: false,
  });

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedShopIds, setSelectedShopIds] = useState<Set<string>>(new Set());
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>("field_rep");
  const [depot, setDepot] = useState<{ lat: number; lng: number; label?: string } | null>(null);
  const [depotMode, setDepotMode] = useState(false);
  const [highValueCount, setHighValueCount] = useState(15);
  const [mapCenter, setMapCenter] = useState({ lat: -29.5, lng: 25.5 });

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setRouteCount(selectedShopIds.size);
  }, [selectedShopIds, setRouteCount]);

  useEffect(() => {
    registerPanelHandler((tab: AppTab) => {
      if (tab === "map") {
        setPanelOpen(false);
        setActiveTab("map");
      } else {
        setActiveTab(tab);
        setPanelOpen(true);
      }
    });
    return () => registerPanelHandler(null);
  }, [registerPanelHandler]);

  useEffect(() => {
    const panel = searchParams.get("panel");
    if (panel === "routes" || panel === "explore" || panel === "insights") {
      setActiveTab(panel as AppTab);
      setPanelOpen(true);
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const visibleShops = useMemo(() => filterShops(shops, filters), [shops, filters]);
  const selectedShops = useMemo(() => shops.filter((s) => selectedShopIds.has(s.id)), [shops, selectedShopIds]);
  const stats = useMemo(() => computeVisibleStats(visibleShops, shops.length), [visibleShops, shops.length]);
  const live = useMemo(() => computeLiveInsights(visibleShops, stats), [visibleShops, stats]);

  const handleShopToggle = useCallback((shop: Shop) => {
    setSelectedShopIds((prev) => {
      const next = new Set(prev);
      if (next.has(shop.id)) next.delete(shop.id);
      else next.add(shop.id);
      return next;
    });
  }, []);

  const handleShopSelect = useCallback((shop: Shop | null) => {
    setSelectedShop(shop);
    if (shop) mapRef.current?.flyToShop(shop);
  }, []);

  const handleDepotPick = useCallback((coords: { lat: number; lng: number }) => {
    setDepot({ ...coords, label: "Custom Depot" });
    setDepotMode(false);
  }, []);

  const handleRemoveShop = useCallback((id: string) => {
    setSelectedShopIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleToggleLayers = useCallback(() => {
    setFilters((f) => ({
      ...f,
      showHeatmap: !f.showHeatmap,
      showOpportunity: !f.showOpportunity,
    }));
  }, []);

  const handleToggleMapStyle = useCallback(() => {
    setMapStyleMode((m) => (m === "satellite" ? "streets" : "satellite"));
  }, []);

  useEffect(() => {
    mapRef.current?.resize();
  }, [panelOpen, selectedShop, railCollapsed]);

  const layersActive = filters.showHeatmap || filters.showOpportunity;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <MapCanvas
        key={mapStyleMode}
        ref={mapRef}
        shops={visibleShops}
        selectedShop={selectedShop}
        selectedShopIds={selectedShopIds}
        route={route}
        showHeatmap={filters.showHeatmap}
        showOpportunity={filters.showOpportunity}
        opportunityZones={insights.opportunityZones}
        onShopSelect={handleShopSelect}
        onShopToggle={handleShopToggle}
        onDepotPick={handleDepotPick}
        onViewportChange={(_, center) => setMapCenter(center)}
        depotMode={depotMode}
        depot={depot}
        isMobile={!isDesktop}
        mapStyleMode={mapStyleMode}
      />

      <SnapMapHeader
        shopCount={shops.length}
        onMenuClick={() => { setPanelOpen(true); setActiveTab("explore"); }}
        onSearchClick={() => {
          setSearchOpen((o) => !o);
          if (!searchOpen) { setPanelOpen(true); setActiveTab("explore"); }
        }}
        searchOpen={searchOpen}
      />

      {searchOpen && (
        <div className="absolute top-[4.5rem] left-4 right-4 z-30 md:left-auto md:right-4 md:w-80">
          <input
            autoFocus
            type="search"
            placeholder="Search locations..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full snap-glass-strong rounded-ios-lg px-4 py-3 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-snap-lime/50"
          />
        </div>
      )}

      <MapFloatingControls
        onLocate={() => mapRef.current?.locate()}
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onToggleLayers={() => { handleToggleLayers(); handleToggleMapStyle(); }}
        layersActive={layersActive || mapStyleMode === "streets"}
      />

      {isDesktop && activeTab === "map" && !panelOpen && (
        <InsightPillStrip stats={stats} live={live} />
      )}

      <InsightsRail
        insights={insights}
        live={live}
        collapsed={railCollapsed}
        onToggle={() => setRailCollapsed((c) => !c)}
      />

      {isDesktop && activeTab === "routes" && (
        <aside className="absolute right-3 top-24 bottom-24 z-30 w-80 snap-glass-strong rounded-ios-lg overflow-y-auto scrollbar-thin p-4 hidden md:block texture-grain relative">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Route Optimizer</h2>
          <RouteBuilder
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
            onDepotPreset={(d) => { setDepot(d); setDepotMode(false); }}
            highValueCount={highValueCount}
            onHighValueCountChange={setHighValueCount}
            onRemoveShop={handleRemoveShop}
          />
        </aside>
      )}

      <ShopSheet
        shop={selectedShop}
        onClose={() => setSelectedShop(null)}
        onAddToRoute={handleShopToggle}
        inRoute={selectedShop ? selectedShopIds.has(selectedShop.id) : false}
        isDesktop={isDesktop}
      />

      <PanelSheet open={panelOpen} tab={activeTab} onClose={() => { setPanelOpen(false); setActiveTab("map"); }}>
        {activeTab === "insights" && (
          <div className="space-y-4 pb-8">
            <InsightHero insights={insights} live={live} />
            <ProvinceLeaderboard provinces={insights.byProvince} />
            <TrendCards insights={insights} />
          </div>
        )}
        {activeTab === "routes" && (
          <RouteBuilder
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
            onDepotPreset={(d) => { setDepot(d); setDepotMode(false); }}
            highValueCount={highValueCount}
            onHighValueCountChange={setHighValueCount}
            onRemoveShop={handleRemoveShop}
          />
        )}
        {activeTab === "explore" && (
          <ExplorePanel
            filters={filters}
            onFiltersChange={setFilters}
            summaries={summaries}
            allShops={shops}
            visibleShops={visibleShops}
            mapCenter={mapCenter}
            onShopSelect={(s) => { handleShopSelect(s); setPanelOpen(false); setActiveTab("map"); }}
          />
        )}
      </PanelSheet>
    </div>
  );
}
