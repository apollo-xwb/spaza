import type { ActivationTier } from "@/types";

const TYPE_MAP: Record<string, string> = {
  tuckshop: "Tuckshop",
  spaza: "Spaza",
  supermarket: "Supermarket",
  "fruit and vegetable": "Fresh Produce",
  "fruit and vegetable shops": "Fresh Produce",
  "hair salon": "Hair & Beauty",
  "tavern / bar": "Tavern & Bar",
  tavern: "Tavern & Bar",
  "internet cafe": "Internet Cafe",
  cellphone: "Cellphone",
  kota: "Fast Food",
  takeaway: "Fast Food",
  "bottle store": "Bottle Store",
  "driving school": "Services",
  "welding, steel, construction": "Construction",
  "shesa nyama": "Fast Food",
  "cellphone shop": "Cellphone",
};

export function normalizeShopType(raw: string): string {
  const key = raw.toLowerCase().trim();
  for (const [pattern, category] of Object.entries(TYPE_MAP)) {
    if (key.includes(pattern)) return category;
  }
  return raw.trim() || "Other";
}

export function getActivationTier(
  activations: number,
  quartiles: { q1: number; q2: number; q3: number }
): ActivationTier {
  if (activations >= quartiles.q3) return "elite";
  if (activations >= quartiles.q2) return "high";
  if (activations >= quartiles.q1) return "medium";
  return "low";
}

export const TIER_COLORS: Record<ActivationTier, string> = {
  low: "#64748b",
  medium: "#38bdf8",
  high: "#00E5FF",
  elite: "#E8B84A",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Tuckshop: "#00E5FF",
  Spaza: "#22d3ee",
  Supermarket: "#E8B84A",
  "Fresh Produce": "#4ade80",
  "Hair & Beauty": "#f472b6",
  "Tavern & Bar": "#fb923c",
  "Internet Cafe": "#a78bfa",
  Cellphone: "#60a5fa",
  "Fast Food": "#fbbf24",
  "Bottle Store": "#f87171",
  Services: "#94a3b8",
  Construction: "#78716c",
  Other: "#cbd5e1",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("en-ZA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCoord(lat: number, lng: number): string {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
}
