import type { OptimizedRoute, RouteMode, Shop } from "@/types";
import * as turf from "@turf/turf";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

interface OptimizeInput {
  mode: RouteMode;
  shops: Shop[];
  depot?: { lat: number; lng: number; label?: string };
  roundtrip?: boolean;
}

function haversineKm(a: Shop, b: Shop): number {
  return turf.distance([a.lng, a.lat], [b.lng, b.lat], { units: "kilometers" });
}

function nearestNeighborRoute(shops: Shop[], depot?: { lat: number; lng: number }): Shop[] {
  if (shops.length <= 1) return shops;

  const remaining = [...shops];
  const ordered: Shop[] = [];
  let current: { lat: number; lng: number } = depot ?? remaining[0];

  if (depot) {
    remaining.sort(
      (a, b) =>
        turf.distance([current.lng, current.lat], [a.lng, a.lat]) -
        turf.distance([current.lng, current.lat], [b.lng, b.lat])
    );
  } else {
    ordered.push(remaining.shift()!);
    current = ordered[0];
  }

  while (remaining.length) {
    remaining.sort(
      (a, b) =>
        turf.distance([current.lng, current.lat], [a.lng, a.lat]) -
        turf.distance([current.lng, current.lat], [b.lng, b.lat])
    );
    const next = remaining.shift()!;
    ordered.push(next);
    current = next;
  }

  return ordered;
}

function buildFallbackRoute(
  mode: RouteMode,
  orderedShops: Shop[],
  depot?: { lat: number; lng: number }
): OptimizedRoute {
  const coordinates: [number, number][] = [];

  if (depot) coordinates.push([depot.lng, depot.lat]);
  for (const shop of orderedShops) {
    coordinates.push([shop.lng, shop.lat]);
  }

  let totalDistanceKm = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistanceKm += turf.distance(
      turf.point(coordinates[i]),
      turf.point(coordinates[i + 1]),
      { units: "kilometers" }
    );
  }

  const totalActivations = orderedShops.reduce((s, x) => s + x.activations, 0);

  return {
    mode,
    stops: orderedShops.map((shop, i) => ({ shop, order: i + 1 })),
    coordinates,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalDurationMin: Math.round(totalDistanceKm * 2.5),
    activationYield:
      totalDistanceKm > 0
        ? Math.round((totalActivations / totalDistanceKm) * 100) / 100
        : totalActivations,
    source: "fallback",
  };
}

async function fetchMapboxOptimization(
  coordinates: [number, number][],
  roundtrip: boolean
): Promise<{ coordinates: [number, number][]; distance: number; duration: number; order: number[] } | null> {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes("your_mapbox")) return null;
  if (coordinates.length < 2) return null;

  const coordStr = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordStr}?roundtrip=${roundtrip}&source=first&destination=last&geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const trip = data.trips?.[0];
    if (!trip) return null;

    const order: number[] = data.waypoints
      .map((w: { waypoint_index: number }, i: number) => ({ i, idx: w.waypoint_index }))
      .sort((a: { idx: number }, b: { idx: number }) => a.idx - b.idx)
      .map((w: { i: number }) => w.i);

    return {
      coordinates: trip.geometry.coordinates as [number, number][],
      distance: trip.distance / 1000,
      duration: trip.duration / 60,
      order,
    };
  } catch {
    return null;
  }
}

export async function optimizeRoute(input: OptimizeInput): Promise<OptimizedRoute> {
  const { mode, shops, depot, roundtrip = false } = input;
  if (!shops.length) {
    return {
      mode,
      stops: [],
      coordinates: [],
      totalDistanceKm: 0,
      totalDurationMin: 0,
      source: "fallback",
    };
  }

  let ordered = [...shops];
  if (mode === "high_value") {
    ordered.sort((a, b) => b.activations - a.activations);
  } else {
    ordered = nearestNeighborRoute(shops, depot);
  }

  const waypoints: [number, number][] = [];
  if (depot) waypoints.push([depot.lng, depot.lat]);
  for (const shop of ordered) waypoints.push([shop.lng, shop.lat]);

  const mapboxResult = await fetchMapboxOptimization(waypoints, roundtrip);

  if (mapboxResult) {
    const shopStartIdx = depot ? 1 : 0;
    const reorderedShops = mapboxResult.order
      .filter((i) => i >= shopStartIdx)
      .map((i, idx) => ({ shop: ordered[i - shopStartIdx] ?? ordered[idx], order: idx + 1 }));

    const totalActivations = reorderedShops.reduce((s, x) => s + x.shop.activations, 0);

    return {
      mode,
      stops: reorderedShops,
      coordinates: mapboxResult.coordinates,
      totalDistanceKm: Math.round(mapboxResult.distance * 100) / 100,
      totalDurationMin: Math.round(mapboxResult.duration),
      activationYield:
        mapboxResult.distance > 0
          ? Math.round((totalActivations / mapboxResult.distance) * 100) / 100
          : totalActivations,
      source: "mapbox",
    };
  }

  return buildFallbackRoute(mode, ordered, depot);
}

export function selectHighValueShops(shops: Shop[], count = 15): Shop[] {
  return [...shops].sort((a, b) => b.activations - a.activations).slice(0, count);
}

export function exportRouteCsv(route: OptimizedRoute): string {
  const header = "Stop,Shop Name,City,Province,Activations,Lat,Lng";
  const rows = route.stops.map(
    (s) =>
      `${s.order},"${s.shop.shopName.replace(/"/g, '""')}",${s.shop.city},${s.shop.province},${s.shop.activations},${s.shop.lat},${s.shop.lng}`
  );
  return [header, ...rows].join("\n");
}

export function exportRouteJson(route: OptimizedRoute): string {
  return JSON.stringify(route, null, 2);
}

export function estimateRouteDistance(shops: Shop[]): number {
  if (shops.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < shops.length - 1; i++) {
    total += haversineKm(shops[i], shops[i + 1]);
  }
  return Math.round(total * 100) / 100;
}
