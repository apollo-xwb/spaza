"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { Shop, OptimizedRoute } from "@/types";
import { getCategoryColor, TIER_COLORS } from "@/lib/utils";
import { shopsToGeoJSON } from "@/lib/shop-data";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface ShopsMapProps {
  shops: Shop[];
  selectedShop: Shop | null;
  selectedShopIds: Set<string>;
  route: OptimizedRoute | null;
  showHeatmap: boolean;
  onShopSelect: (shop: Shop | null) => void;
  onShopToggle: (shop: Shop) => void;
  onDepotPick: (coords: { lat: number; lng: number }) => void;
  depotMode: boolean;
  depot: { lat: number; lng: number } | null;
  presentationMode: boolean;
}

export default function ShopsMap({
  shops,
  selectedShop,
  selectedShopIds,
  route,
  showHeatmap,
  onShopSelect,
  onShopToggle,
  onDepotPick,
  depotMode,
  depot,
  presentationMode,
}: ShopsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const shopsRef = useRef(shops);
  shopsRef.current = shops;

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN || "pk.placeholder";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_TOKEN && !MAPBOX_TOKEN.includes("your_mapbox")
        ? "mapbox://styles/mapbox/dark-v11"
        : undefined,
      ...(MAPBOX_TOKEN && !MAPBOX_TOKEN.includes("your_mapbox")
        ? {}
        : {
            style: {
              version: 8,
              sources: {
                osm: {
                  type: "raster",
                  tiles: [
                    "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
                  ],
                  tileSize: 256,
                  attribution: "© OpenStreetMap © CARTO",
                },
              },
              layers: [
                {
                  id: "osm",
                  type: "raster",
                  source: "osm",
                },
              ],
            },
          }),
      center: [25.5, -29.5],
      zoom: 5,
      pitch: presentationMode ? 45 : 0,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("shops", {
        type: "geojson",
        data: shopsToGeoJSON(shopsRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      map.addSource("heatmap", {
        type: "geojson",
        data: shopsToGeoJSON(shopsRef.current),
      });

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
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,229,255,0)",
            0.3,
            "rgba(0,229,255,0.3)",
            0.6,
            "rgba(232,184,74,0.6)",
            1,
            "rgba(232,184,74,0.9)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 5, 15, 12, 30],
          "heatmap-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "shops",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "rgba(0,229,255,0.6)",
            50,
            "rgba(0,229,255,0.75)",
            200,
            "rgba(232,184,74,0.85)",
          ],
          "circle-radius": ["step", ["get", "point_count"], 18, 50, 24, 200, 32],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#00E5FF",
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
          "text-size": 12,
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point-glow",
        type: "circle",
        source: "shops",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "glowColor"],
          "circle-radius": 12,
          "circle-blur": 0.6,
          "circle-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "shops",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "activations"],
            1,
            4,
            10,
            7,
            20,
            10,
          ],
          "circle-stroke-width": [
            "case",
            ["==", ["get", "selected"], true],
            3,
            1,
          ],
          "circle-stroke-color": [
            "case",
            ["==", ["get", "selected"], true],
            "#00E5FF",
            "rgba(255,255,255,0.5)",
          ],
        },
      });

      map.addSource("route", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#E8B84A",
          "line-width": 8,
          "line-blur": 4,
          "line-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#E8B84A",
          "line-width": 3,
          "line-dasharray": [2, 1],
        },
      });

      map.addSource("selection-radar", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "selection-radar-ring",
        type: "circle",
        source: "selection-radar",
        paint: {
          "circle-radius": 40,
          "circle-color": "rgba(0,229,255,0.15)",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#00E5FF",
          "circle-opacity": 0.6,
        },
      });

      map.addSource("depot", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "depot-marker",
        type: "circle",
        source: "depot",
        paint: {
          "circle-color": "#E8B84A",
          "circle-radius": 10,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });
    });

    map.on("click", "clusters", (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      if (!features.length) return;
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource("shops") as mapboxgl.GeoJSONSource;
      if (clusterId === undefined) return;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom === null || zoom === undefined) return;
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

      const shop: Shop = {
        id: props.id,
        orderNo: props.orderNo,
        shopName: props.shopName,
        shopType: props.shopType,
        shopTypeCategory: props.shopTypeCategory,
        city: props.city,
        suburb: props.suburb,
        province: props.province,
        address: props.address,
        lat: props.lat,
        lng: props.lng,
        activations: props.activations,
        distance: props.distance,
        distanceKm: props.distanceKm,
        activationTier: props.activationTier,
        coverageScore: props.coverageScore,
        provinceRank: props.provinceRank,
        routeSequence: props.routeSequence,
        hasVerifiedAddress: props.hasVerifiedAddress,
      };

      if (depotMode) {
        onDepotPick({ lat: shop.lat, lng: shop.lng });
      } else if (e.originalEvent.shiftKey) {
        onShopToggle(shop);
      } else {
        onShopSelect(shop);
      }
    });

    map.on("mouseenter", "unclustered-point", (e) => {
      map.getCanvas().style.cursor = "pointer";
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      if (!props) return;

      popupRef.current?.remove();
      popupRef.current = new mapboxgl.Popup({ closeButton: false, offset: 12 })
        .setLngLat((e.features[0].geometry as GeoJSON.Point).coordinates as [number, number])
        .setHTML(
          `<strong>${props.shopName}</strong><br/>${props.shopTypeCategory} · ${props.activations} activations<br/><span style="opacity:0.7">${props.city}, ${props.province}</span>`
        )
        .addTo(map);
    });

    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
      popupRef.current?.remove();
    });

    map.on("click", (e) => {
      if (depotMode) {
        onDepotPick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        return;
      }
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point", "clusters"],
      });
      if (!features.length) onShopSelect(null);
    });

    mapRef.current = map;
  }, [depotMode, onDepotPick, onShopSelect, onShopToggle, showHeatmap, presentationMode]);

  useEffect(() => {
    initMap();
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [initMap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

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

    const shopSource = map.getSource("shops") as mapboxgl.GeoJSONSource | undefined;
    shopSource?.setData(geojson);

    const heatSource = map.getSource("heatmap") as mapboxgl.GeoJSONSource | undefined;
    heatSource?.setData(geojson);

    if (map.getLayer("heatmap-layer")) {
      map.setLayoutProperty(
        "heatmap-layer",
        "visibility",
        showHeatmap ? "visible" : "none"
      );
    }
  }, [shops, selectedShop, selectedShopIds, showHeatmap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const routeSource = map.getSource("route") as mapboxgl.GeoJSONSource | undefined;
    if (!route || route.coordinates.length < 2) {
      routeSource?.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    routeSource?.setData({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route.coordinates,
      },
    });
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const radarSource = map.getSource("selection-radar") as mapboxgl.GeoJSONSource | undefined;
    if (!selectedShop) {
      radarSource?.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    radarSource?.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [selectedShop.lng, selectedShop.lat],
          },
        },
      ],
    });

    map.easeTo({
      center: [selectedShop.lng, selectedShop.lat],
      zoom: Math.max(map.getZoom(), 13),
      duration: 800,
    });
  }, [selectedShop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource("depot") as mapboxgl.GeoJSONSource | undefined;
    if (!depot) {
      source?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    source?.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: [depot.lng, depot.lat] },
        },
      ],
    });
  }, [depot]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full" />
  );
}

export function flyToProvince(
  map: mapboxgl.Map | null,
  bounds: [[number, number], [number, number]]
) {
  map?.fitBounds(bounds, { padding: 80, duration: 1200 });
}

export function setDepotMarker(
  map: mapboxgl.Map | null,
  depot: { lat: number; lng: number } | null
) {
  if (!map || !map.isStyleLoaded()) return;
  const source = map.getSource("depot") as mapboxgl.GeoJSONSource | undefined;
  if (!depot) {
    source?.setData({ type: "FeatureCollection", features: [] });
    return;
  }
  source?.setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Point", coordinates: [depot.lng, depot.lat] },
      },
    ],
  });
}
