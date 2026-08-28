"use client";

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Shop, OptimizedRoute } from "@/types";
import { getCategoryColor, TIER_COLORS } from "@/lib/utils";
import { shopsToGeoJSON } from "@/lib/shop-data";
import { createBlipElement } from "@/components/map/BlipMarker";

import { getMapStyle, type MapStyleMode } from "@/lib/map-style";
const BLIP_ZOOM_DESKTOP = 11;
const BLIP_ZOOM_MOBILE = 9;
const BLIP_LIMIT_DESKTOP = 200;
const BLIP_LIMIT_MOBILE = 300;

export interface MapCanvasHandle {
  resize: () => void;
  flyToShop: (shop: Shop) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  locate: () => void;
}

interface MapCanvasProps {
  shops: Shop[];
  selectedShop: Shop | null;
  selectedShopIds: Set<string>;
  route: OptimizedRoute | null;
  showHeatmap: boolean;
  showOpportunity: boolean;
  opportunityZones?: { lat: number; lng: number; opportunityScore: number }[];
  onShopSelect: (shop: Shop | null) => void;
  onShopToggle: (shop: Shop) => void;
  onDepotPick: (coords: { lat: number; lng: number }) => void;
  onViewportChange?: (bounds: maplibregl.LngLatBounds, center: { lat: number; lng: number }) => void;
  depotMode: boolean;
  depot: { lat: number; lng: number } | null;
  isMobile?: boolean;
  mapStyleMode?: MapStyleMode;
}

function propsToShop(props: Record<string, unknown>): Shop {
  return props as unknown as Shop;
}

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  {
    shops,
    selectedShop,
    selectedShopIds,
    route,
    showHeatmap,
    showOpportunity,
    opportunityZones = [],
    onShopSelect,
    onShopToggle,
    onDepotPick,
    onViewportChange,
    depotMode,
    depot,
    isMobile = false,
    mapStyleMode = "satellite",
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const shopsRef = useRef(shops);
  shopsRef.current = shops;

  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  const callbacksRef = useRef({ onShopSelect, onShopToggle, onDepotPick, depotMode });
  callbacksRef.current = { onShopSelect, onShopToggle, onDepotPick, depotMode };

  const getBlipZoom = () => (isMobileRef.current ? BLIP_ZOOM_MOBILE : BLIP_ZOOM_DESKTOP);
  const getBlipLimit = () => (isMobileRef.current ? BLIP_LIMIT_MOBILE : BLIP_LIMIT_DESKTOP);

  const updateBlips = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const threshold = getBlipZoom();
    if (map.getZoom() < threshold) return;

    const bounds = map.getBounds();
    const visible = shopsRef.current.filter(
      (s) =>
        s.lng >= bounds.getWest() &&
        s.lng <= bounds.getEast() &&
        s.lat >= bounds.getSouth() &&
        s.lat <= bounds.getNorth()
    );

    const limit = Math.min(visible.length, getBlipLimit());
    for (let i = 0; i < limit; i++) {
      const shop = visible[i];
      const selected = selectedShopIds.has(shop.id) || selectedShop?.id === shop.id;
      const inRoute = selectedShopIds.has(shop.id);

      const el = createBlipElement(
        shop,
        selected,
        inRoute,
        () => callbacksRef.current.onShopSelect(shop),
        () => callbacksRef.current.onShopToggle(shop)
      );

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([shop.lng, shop.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [selectedShop, selectedShopIds]);

  useImperativeHandle(ref, () => ({
    resize: () => mapRef.current?.resize(),
    flyToShop: (shop: Shop) => {
      mapRef.current?.easeTo({
        center: [shop.lng, shop.lat],
        zoom: Math.max(mapRef.current.getZoom(), 13),
        duration: 800,
      });
    },
    zoomIn: () => mapRef.current?.zoomIn({ duration: 300 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 300 }),
    locate: () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        mapRef.current?.easeTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 12,
          duration: 800,
        });
      });
    },
  }));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const blipZoom = getBlipZoom();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getMapStyle(mapStyleMode),
      center: [25.5, -29.5],
      zoom: 5,
      maxZoom: 18,
    });

    map.on("error", (e) => {
      console.error("Map error:", e.error?.message ?? e);
      setMapError("Map tiles failed to load. Retrying...");
    });

    map.on("data", (e) => {
      if (e.dataType === "source" && e.isSourceLoaded) {
        setMapError(null);
      }
    });

    if (!isMobileRef.current) {
      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    }

    map.on("load", () => {
      map.addSource("shops", {
        type: "geojson",
        data: shopsToGeoJSON(shopsRef.current),
        cluster: true,
        clusterMaxZoom: blipZoom - 1,
        clusterRadius: 50,
      });

      map.addSource("heatmap", { type: "geojson", data: shopsToGeoJSON(shopsRef.current) });

      map.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap",
        maxzoom: 14,
        layout: { visibility: showHeatmap ? "visible" : "none" },
        paint: {
          "heatmap-weight": ["get", "activations"],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 12, 2],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,122,255,0)",
            0.3, "rgba(0,122,255,0.35)",
            0.6, "rgba(255,149,0,0.55)",
            1, "rgba(255,149,0,0.85)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 5, 15, 12, 30],
          "heatmap-opacity": 0.65,
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "shops",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "rgba(200,241,53,0.6)", 50, "rgba(200,241,53,0.75)", 200, "rgba(255,252,0,0.85)"],
          "circle-radius": ["step", ["get", "point_count"], 20, 50, 28, 200, 36],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#C8F135",
          "circle-blur": 0.1,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "shops",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 13,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "shops",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["interpolate", ["linear"], ["get", "activations"], 1, 5, 10, 8, 20, 11],
          "circle-stroke-width": ["case", ["==", ["get", "selected"], true], 3, 1.5],
          "circle-stroke-color": ["case", ["==", ["get", "selected"], true], "#007AFF", "rgba(255,255,255,0.9)"],
          "circle-opacity": 0.92,
        },
      });

      map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "route-glow", type: "line", source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#FF9500", "line-width": 8, "line-blur": 4, "line-opacity": 0.35 },
      });
      map.addLayer({
        id: "route-line", type: "line", source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#FF9500", "line-width": 3, "line-dasharray": [2, 1] },
      });

      map.addSource("selection-radar", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "selection-radar-ring", type: "circle", source: "selection-radar",
        paint: {
          "circle-radius": 45,
          "circle-color": "rgba(0,122,255,0.1)",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#007AFF",
          "circle-opacity": 0.75,
        },
      });

      map.addSource("opportunity", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "opportunity-circles", type: "circle", source: "opportunity",
        layout: { visibility: showOpportunity ? "visible" : "none" },
        paint: {
          "circle-color": "rgba(255,149,0,0.2)",
          "circle-radius": 30,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,149,0,0.55)",
        },
      });

      map.addSource("depot", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "depot-marker", type: "circle", source: "depot",
        paint: {
          "circle-color": "#FF9500",
          "circle-radius": 12,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      updateBlips();
      setMapLoaded(true);
    });

    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource("shops") as maplibregl.GeoJSONSource;
      if (clusterId === undefined) return;
      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        map.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
        });
      });
    });

    map.on("click", "unclustered-point", (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      if (!props) return;
      const shop = propsToShop(props);
      if (callbacksRef.current.depotMode) {
        callbacksRef.current.onDepotPick({ lat: shop.lat, lng: shop.lng });
      } else if (e.originalEvent.shiftKey) {
        callbacksRef.current.onShopToggle(shop);
      } else {
        callbacksRef.current.onShopSelect(shop);
      }
    });

    map.on("click", (e) => {
      if (callbacksRef.current.depotMode) {
        callbacksRef.current.onDepotPick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        return;
      }
      const features = map.queryRenderedFeatures(e.point, { layers: ["unclustered-point", "clusters"] });
      if (!features.length) callbacksRef.current.onShopSelect(null);
    });

    map.on("moveend", () => {
      updateBlips();
      if (onViewportChange) {
        const bounds = map.getBounds();
        onViewportChange(bounds, { lat: map.getCenter().lat, lng: map.getCenter().lng });
      }
    });

    map.on("zoomend", updateBlips);

    mapRef.current = map;

    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [onViewportChange, showHeatmap, showOpportunity, updateBlips]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (!map.getSource("shops")) return;

    const threshold = getBlipZoom();
    const geojson = shopsToGeoJSON(shops);
    geojson.features = geojson.features.map((f) => {
      const shop = f.properties as unknown as Shop;
      const selected = selectedShopIds.has(shop.id) || selectedShop?.id === shop.id;
      return {
        ...f,
        properties: {
          ...shop,
          color: getCategoryColor(shop.shopTypeCategory),
          glowColor: TIER_COLORS[shop.activationTier],
          selected,
        },
      };
    });

    (map.getSource("shops") as maplibregl.GeoJSONSource)?.setData(geojson);
    (map.getSource("heatmap") as maplibregl.GeoJSONSource)?.setData(geojson);

    if (map.getLayer("heatmap-layer")) {
      map.setLayoutProperty("heatmap-layer", "visibility", showHeatmap ? "visible" : "none");
    }
    if (map.getLayer("unclustered-point")) {
      map.setLayoutProperty("unclustered-point", "visibility", map.getZoom() >= threshold ? "none" : "visible");
    }

    updateBlips();
  }, [shops, selectedShop, selectedShopIds, showHeatmap, isMobile, mapLoaded, updateBlips]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const source = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
    if (!route || route.coordinates.length < 2) {
      source?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    source?.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: route.coordinates },
    });
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const source = map.getSource("selection-radar") as maplibregl.GeoJSONSource | undefined;
    if (!selectedShop) {
      source?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    source?.setData({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [selectedShop.lng, selectedShop.lat] },
      }],
    });
    map.easeTo({
      center: [selectedShop.lng, selectedShop.lat],
      zoom: Math.max(map.getZoom(), 13),
      duration: 800,
    });
  }, [selectedShop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const source = map.getSource("depot") as maplibregl.GeoJSONSource | undefined;
    if (!depot) {
      source?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    source?.setData({
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [depot.lng, depot.lat] } }],
    });
  }, [depot]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (!map.getSource("opportunity")) return;
    const features = opportunityZones.map((z) => ({
      type: "Feature" as const,
      properties: { score: z.opportunityScore },
      geometry: { type: "Point" as const, coordinates: [z.lng, z.lat] },
    }));
    (map.getSource("opportunity") as maplibregl.GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features,
    });
    if (map.getLayer("opportunity-circles")) {
      map.setLayoutProperty("opportunity-circles", "visibility", showOpportunity ? "visible" : "none");
    }
  }, [opportunityZones, showOpportunity]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
      {mapError && (
        <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ios-card px-4 py-3 text-sm text-muted">
          {mapError}
        </div>
      )}
    </div>
  );
});

export default MapCanvas;
