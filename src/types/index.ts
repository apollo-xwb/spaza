export type ActivationTier = "low" | "medium" | "high" | "elite";

export interface Shop {
  id: string;
  orderNo: number;
  shopName: string;
  shopType: string;
  shopTypeCategory: string;
  city: string;
  suburb: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  activations: number;
  distance: number;
  distanceKm: number;
  activationTier: ActivationTier;
  coverageScore: number;
  provinceRank: number;
  routeSequence: number;
  hasVerifiedAddress: boolean;
}

export interface ProvinceSummary {
  province: string;
  count: number;
  totalActivations: number;
  avgActivations: number;
  verifiedAddressPct: number;
}

export interface CitySummary {
  city: string;
  province: string;
  count: number;
  avgActivations: number;
  lat: number;
  lng: number;
}

export interface ShopTypeSummary {
  category: string;
  count: number;
  avgActivations: number;
}

export interface Hotspot {
  lat: number;
  lng: number;
  count: number;
  totalActivations: number;
  label: string;
}

export interface DepotCandidate {
  id: string;
  label: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  shopCount: number;
}

export interface CoverageGap {
  suburb: string;
  city: string;
  province: string;
  shopCount: number;
  avgActivations: number;
}

export interface DataSummaries {
  national: {
    totalShops: number;
    totalActivations: number;
    avgActivations: number;
    medianActivations: number;
    verifiedAddressPct: number;
    provinces: number;
    cities: number;
    shopTypeCategories: number;
  };
  byProvince: ProvinceSummary[];
  byCity: CitySummary[];
  byShopType: ShopTypeSummary[];
  hotspots: Hotspot[];
  depotCandidates: DepotCandidate[];
  coverageGaps: CoverageGap[];
}

export type RouteMode = "field_rep" | "high_value" | "distribution";

export interface RouteStop {
  shop: Shop;
  order: number;
}

export interface OptimizedRoute {
  mode: RouteMode;
  stops: RouteStop[];
  coordinates: [number, number][];
  totalDistanceKm: number;
  totalDurationMin: number;
  activationYield?: number;
  source: "mapbox" | "fallback";
}

export interface MapFilters {
  search: string;
  province: string;
  city: string;
  shopTypeCategory: string;
  activationTier: string;
  showHeatmap: boolean;
}

export interface VisibleStats {
  visibleCount: number;
  totalCount: number;
  totalActivations: number;
  avgActivations: number;
  verifiedPct: number;
}
