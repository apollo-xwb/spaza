import type { Shop, MapFilters, VisibleStats } from "@/types";

export function filterShops(shops: Shop[], filters: MapFilters): Shop[] {
  const search = filters.search.toLowerCase().trim();

  return shops.filter((shop) => {
    if (filters.province && shop.province !== filters.province) return false;
    if (filters.city && shop.city !== filters.city) return false;
    if (filters.shopTypeCategory && shop.shopTypeCategory !== filters.shopTypeCategory) return false;
    if (filters.activationTier && shop.activationTier !== filters.activationTier) return false;

    if (search) {
      const haystack = [
        shop.shopName,
        shop.city,
        shop.suburb,
        shop.province,
        shop.shopTypeCategory,
        shop.address,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function computeVisibleStats(shops: Shop[], totalCount: number): VisibleStats {
  const totalActivations = shops.reduce((sum, s) => sum + s.activations, 0);
  const verified = shops.filter((s) => s.hasVerifiedAddress).length;

  return {
    visibleCount: shops.length,
    totalCount,
    totalActivations,
    avgActivations: shops.length ? totalActivations / shops.length : 0,
    verifiedPct: shops.length ? (verified / shops.length) * 100 : 0,
  };
}

export function shopsToGeoJSON(shops: Shop[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: shops.map((shop) => ({
      type: "Feature",
      id: shop.id,
      geometry: {
        type: "Point",
        coordinates: [shop.lng, shop.lat],
      },
      properties: {
        ...shop,
      },
    })),
  };
}

export function getUniqueValues(shops: Shop[]) {
  return {
    provinces: [...new Set(shops.map((s) => s.province))].sort(),
    cities: [...new Set(shops.map((s) => s.city))].sort(),
    categories: [...new Set(shops.map((s) => s.shopTypeCategory))].sort(),
    tiers: ["low", "medium", "high", "elite"] as const,
  };
}

export function getCitiesForProvince(shops: Shop[], province: string): string[] {
  return [
    ...new Set(
      shops.filter((s) => !province || s.province === province).map((s) => s.city)
    ),
  ].sort();
}
