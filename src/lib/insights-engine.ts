import type { Shop, DataInsights, LiveInsights, VisibleStats } from "@/types";

export const VALUE_PER_ACTIVATION = 350;

export function formatZar(n: number, compact = false): string {
  if (compact) {
    if (n >= 1_000_000_000) return `R${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}K`;
  }
  return `R${Math.round(n).toLocaleString("en-ZA")}`;
}

export function computeTam(activations: number, valuePerActivation = VALUE_PER_ACTIVATION): number {
  return activations * valuePerActivation;
}

export function computeConcentrationIndex(shops: Shop[]): number {
  if (!shops.length) return 0;
  const sorted = [...shops].sort((a, b) => b.activations - a.activations);
  const topCount = Math.max(1, Math.ceil(shops.length * 0.1));
  const topActivations = sorted.slice(0, topCount).reduce((s, x) => s + x.activations, 0);
  const total = shops.reduce((s, x) => s + x.activations, 0);
  return total > 0 ? Math.round((topActivations / total) * 100) : 0;
}

export function computeGrowthPotential(shops: Shop[]): number {
  if (!shops.length) return 0;
  const highValue = shops.filter((s) => s.activationTier === "elite" || s.activationTier === "high").length;
  return Math.round((highValue / shops.length) * 100);
}

export function computeWhiteSpacePct(shops: Shop[]): number {
  if (!shops.length) return 0;
  const suburbMap = new Map<string, { count: number; activations: number }>();
  for (const s of shops) {
    const key = `${s.province}|${s.suburb}`;
    const e = suburbMap.get(key) ?? { count: 0, activations: 0 };
    e.count++;
    e.activations += s.activations;
    suburbMap.set(key, e);
  }
  const suburbs = [...suburbMap.values()].filter((s) => s.count >= 3);
  if (!suburbs.length) return 0;
  const lowPerforming = suburbs.filter((s) => s.activations / s.count < 4).length;
  return Math.round((lowPerforming / suburbs.length) * 100);
}

export function computeLiveInsights(shops: Shop[], stats: VisibleStats): LiveInsights {
  return {
    tamZar: computeTam(stats.totalActivations),
    densityScore: shops.length ? Math.round((stats.totalActivations / shops.length) * 10) / 10 : 0,
    whiteSpacePct: computeWhiteSpacePct(shops),
    concentrationIndex: computeConcentrationIndex(shops),
    growthPotential: computeGrowthPotential(shops),
  };
}

export function shopTamContribution(shop: Shop): number {
  return computeTam(shop.activations);
}

export function buildInsightsFromShops(shops: Shop[]): DataInsights {
  const totalActivations = shops.reduce((s, x) => s + x.activations, 0);
  const verified = shops.filter((s) => s.hasVerifiedAddress).length;

  const tierDistribution = { low: 0, medium: 0, high: 0, elite: 0 };
  for (const s of shops) tierDistribution[s.activationTier]++;

  const provinceMap = new Map<string, Shop[]>();
  for (const s of shops) {
    const list = provinceMap.get(s.province) ?? [];
    list.push(s);
    provinceMap.set(s.province, list);
  }

  const byProvince = [...provinceMap.entries()].map(([province, list]) => {
    const activations = list.reduce((s, x) => s + x.activations, 0);
    const verifiedPct = (list.filter((x) => x.hasVerifiedAddress).length / list.length) * 100;
    return {
      province,
      tamZar: computeTam(activations),
      shopCount: list.length,
      avgActivations: activations / list.length,
      growthPotential: computeGrowthPotential(list),
      dataConfidence: Math.round(verifiedPct),
    };
  }).sort((a, b) => b.tamZar - a.tamZar);

  const suburbMap = new Map<string, { suburb: string; city: string; province: string; shops: Shop[] }>();
  for (const s of shops) {
    const key = `${s.province}|${s.city}|${s.suburb}`;
    const e = suburbMap.get(key) ?? { suburb: s.suburb, city: s.city, province: s.province, shops: [] };
    e.shops.push(s);
    suburbMap.set(key, e);
  }

  const opportunityZones = [...suburbMap.values()]
    .filter((s) => s.shops.length >= 3)
    .map((s) => {
      const avg = s.shops.reduce((sum, x) => sum + x.activations, 0) / s.shops.length;
      const lat = s.shops.reduce((sum, x) => sum + x.lat, 0) / s.shops.length;
      const lng = s.shops.reduce((sum, x) => sum + x.lng, 0) / s.shops.length;
      return {
        suburb: s.suburb,
        city: s.city,
        province: s.province,
        shopCount: s.shops.length,
        avgActivations: avg,
        opportunityScore: Math.round((s.shops.length * (5 - avg)) * 10) / 10,
        lat,
        lng,
      };
    })
    .filter((s) => s.avgActivations < 4)
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 20);

  const typeMap = new Map<string, Shop[]>();
  for (const s of shops) {
    const list = typeMap.get(s.shopTypeCategory) ?? [];
    list.push(s);
    typeMap.set(s.shopTypeCategory, list);
  }

  const nationalAvg = totalActivations / shops.length;
  const categoryLeaders = [...typeMap.entries()]
    .map(([category, list]) => {
      const avg = list.reduce((s, x) => s + x.activations, 0) / list.length;
      return {
        category,
        count: list.length,
        avgActivations: avg,
        indexScore: Math.round((avg / nationalAvg) * 100),
      };
    })
    .sort((a, b) => b.indexScore - a.indexScore);

  return {
    nationalTamZar: computeTam(totalActivations),
    valuePerActivation: VALUE_PER_ACTIVATION,
    concentrationIndex: computeConcentrationIndex(shops),
    dataConfidence: Math.round((verified / shops.length) * 100),
    whiteSpacePct: computeWhiteSpacePct(shops),
    tierDistribution,
    byProvince,
    opportunityZones,
    categoryLeaders,
  };
}
