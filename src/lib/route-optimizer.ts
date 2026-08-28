import type { OptimizedRoute, RouteMode, Shop } from "@/types";
import { VALUE_PER_ACTIVATION } from "@/lib/insights-engine";
import * as turf from "@turf/turf";

const OSRM_URL = process.env.NEXT_PUBLIC_OSRM_URL ?? "https://router.project-osrm.org";

interface OptimizeInput {
  mode: RouteMode;
  shops: Shop[];
  depot?: { lat: number; lng: number; label?: string };
  roundtrip?: boolean;
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
  for (const shop of orderedShops) coordinates.push([shop.lng, shop.lat]);

  let totalDistanceKm = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistanceKm += turf.distance(turf.point(coordinates[i]), turf.point(coordinates[i + 1]), {
      units: "kilometers",
    });
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
    estimatedValueZar: totalActivations * VALUE_PER_ACTIVATION,
    source: "fallback",
  };
}

async function fetchOsrmTrip(
  coordinates: [number, number][],
  roundtrip: boolean
): Promise<{ coordinates: [number, number][]; distance: number; duration: number; order: number[] } | null> {
  if (coordinates.length < 2 || coordinates.length > 50) return null;

  const coordStr = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `${OSRM_URL}/trip/v1/driving/${coordStr}?roundtrip=${roundtrip}&source=first&destination=last&geometries=geojson&overview=full`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.trips?.[0]) return null;

    const trip = data.trips[0];
    const order: number[] = (data.waypoints as { waypoint_index: number }[])
      .map((w, i) => ({ i, idx: w.waypoint_index }))
      .sort((a, b) => a.idx - b.idx)
      .map((w) => w.i);

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

  const osrmResult = await fetchOsrmTrip(waypoints, roundtrip);

  if (osrmResult) {
    const shopStartIdx = depot ? 1 : 0;
    const reorderedShops = osrmResult.order
      .filter((i) => i >= shopStartIdx)
      .map((i, idx) => ({ shop: ordered[i - shopStartIdx] ?? ordered[idx], order: idx + 1 }));

    const totalActivations = reorderedShops.reduce((s, x) => s + x.shop.activations, 0);

    return {
      mode,
      stops: reorderedShops,
      coordinates: osrmResult.coordinates,
      totalDistanceKm: Math.round(osrmResult.distance * 100) / 100,
      totalDurationMin: Math.round(osrmResult.duration),
      activationYield:
        osrmResult.distance > 0
          ? Math.round((totalActivations / osrmResult.distance) * 100) / 100
          : totalActivations,
      estimatedValueZar: totalActivations * VALUE_PER_ACTIVATION,
      source: "osrm",
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
