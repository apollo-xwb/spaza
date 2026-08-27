import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import type { DataSummaries, Shop } from "../src/types";
import { getActivationTier, normalizeShopType } from "../src/lib/utils";

const PDF_PATH = path.join(process.cwd(), "uploads/Top_1000_Shops_By_Province_72de.pdf");
const OUT_DIR = path.join(process.cwd(), "public/data");

const PROVINCES = [
  "Northern Cape",
  "Western Cape",
  "Mpumalanga",
  "Limpopo",
  "Free State",
  "North West",
  "Gauteng",
  "KwaZulu-Natal",
  "Eastern Cape",
];

const SHOP_TYPES = [
  "Fruit and vegetable shops",
  "Welding, steel, construction",
  "Driving School",
  "Internet cafe",
  "Hair salon",
  "Bottle store",
  "Supermarket",
  "Takeaway",
  "TuckShop",
  "Tuckshop",
  "Spaza",
  "Tavern / bar",
  "Cellphone",
  "Kota",
  "Shesa nyama",
  "Tavern",
].sort((a, b) => b.length - a.length);

interface RawRow {
  orderNo: number;
  shopName: string;
  shopType: string;
  city: string;
  suburb: string;
  province: string;
  address: string;
  lat: number;
  lng: number;
  activations: number;
  distance: number;
  distanceKm: number;
}

const COORD_TAIL =
  /(-\d+\.\d+)(\d+\.\d+)(\d+)(\d+)(?:\.(\d+)|(\.\d+))?\s*$/;

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function quartiles(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    const pos = (sorted.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  };
  return { q1: q(0.25), q2: q(0.5), q3: q(0.75) };
}

function isHeaderOrMeta(line: string): boolean {
  const l = line.trim();
  if (!l) return true;
  if (l.startsWith("Top 1000")) return true;
  if (l.startsWith("Full data export")) return true;
  if (l.startsWith("Total records")) return true;
  if (l.includes("records — columns")) return true;
  if (l === "Order" || l === "No") return true;
  if (l.startsWith("Shop NameShop Type")) return true;
  if (PROVINCES.some((p) => l === `${p} —` || /^\d+ shops$/.test(l))) return false;
  if (PROVINCES.some((p) => l.startsWith(`${p} —`))) return true;
  return false;
}

function isRecordStart(line: string): boolean {
  return /^\d+[a-zA-Z0-9]/.test(line.trim());
}

function joinLines(lines: string[]): string[] {
  const records: string[] = [];
  let buffer = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || isHeaderOrMeta(trimmed)) continue;

    if (isRecordStart(trimmed)) {
      if (buffer) records.push(buffer);
      buffer = trimmed;
    } else if (buffer) {
      buffer += " " + trimmed;
    }
  }
  if (buffer) records.push(buffer);
  return records;
}

function parseCoordTail(raw: string): {
  lat: number;
  lng: number;
  activations: number;
  distance: number;
  distanceKm: number;
  before: string;
} | null {
  const match = raw.match(
    /(-\d+\.\d+)(\d+\.\d+)(\d+)(\d+)((?:\.\d+)?)\s*$/
  );
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  const activations = parseInt(match[3], 10);
  const distance = parseInt(match[4], 10);
  const distanceKm = match[5] ? parseFloat(match[5]) : 0;

  return {
    lat,
    lng,
    activations,
    distance,
    distanceKm,
    before: raw.slice(0, match.index).trim(),
  };
}

function parseRecord(raw: string, defaultProvince: string): RawRow | null {
  const orderMatch = raw.match(/^(\d+)/);
  if (!orderMatch) return null;
  const orderNo = parseInt(orderMatch[1], 10);
  let body = raw.slice(orderMatch[0].length);

  const coords = parseCoordTail(body);
  if (!coords) return null;
  body = coords.before;

  let province = defaultProvince;
  let provinceIdx = -1;
  for (const p of PROVINCES) {
    const idx = body.lastIndexOf(p);
    if (idx !== -1 && idx > provinceIdx) {
      provinceIdx = idx;
      province = p;
    }
  }
  if (provinceIdx === -1) return null;

  const address = body.slice(provinceIdx + province.length).trim();
  const beforeProvince = body.slice(0, provinceIdx);

  let shopType = "Other";
  let shopName = beforeProvince;
  let city = "";
  let suburb = "";

  for (const type of SHOP_TYPES) {
    const idx = beforeProvince.toLowerCase().lastIndexOf(type.toLowerCase());
    if (idx !== -1) {
      shopType = type;
      shopName = beforeProvince.slice(0, idx).trim();
      const locationPart = beforeProvince.slice(idx + type.length).trim();
      const locMatch = locationPart.match(/^(.+?)(?:\s+(Ward \d+|Paballelo|.*))?$/);
      if (locationPart) {
        const words = locationPart.split(/\s{2,}|(?=[A-Z][a-z]+(?: Ward| Metropolitan))/);
        const loc = locationPart;
        const wardMatch = loc.match(/^(.+?)(Ward \d+.*|Paballelo|.*Ward.*)$/);
        if (wardMatch) {
          city = wardMatch[1].replace(/\s+$/, "") || loc.split(/(?=nKhara|ÇnKhara|Sol Plaatje|eThekwini)/)[0]?.trim() || "";
          suburb = wardMatch[2]?.trim() || "";
        } else {
          const splitIdx = loc.search(/(?:Ward \d+|Local Municipality|Metropolitan Municipality)/);
          if (splitIdx > 0) {
            city = loc.slice(0, splitIdx).trim();
            suburb = loc.slice(splitIdx).trim();
          } else if (loc.length > 20) {
            city = loc.slice(0, Math.min(15, loc.length)).trim();
            suburb = loc.slice(Math.min(15, loc.length)).trim();
          } else {
            city = loc;
            suburb = loc;
          }
        }
      }
      break;
    }
  }

  if (shopType === "Other") {
    const parts = beforeProvince.split(/(?=[A-Z][a-z]{3,})/);
    shopName = parts[0] ?? beforeProvince;
    city = parts[1] ?? "";
    suburb = parts.slice(2).join(" ") || city;
  }

  if (!city) {
    const locGuess = beforeProvince.slice(shopName.length + shopType.length).trim();
    city = locGuess.split(/(?=nKhara|ÇnKhara|Sol Plaatje|eThekwini|Polokwane|Kimberley|Durban|Johannesburg)/)[0]?.trim() || "Unknown";
    suburb = locGuess.slice(city.length).trim() || city;
  }

  return {
    orderNo,
    shopName: shopName || `Shop ${orderNo}`,
    shopType,
    city: city || "Unknown",
    suburb: suburb || city || "Unknown",
    province,
    address: address || "waiting for location..",
    lat: coords.lat,
    lng: coords.lng,
    activations: coords.activations,
    distance: coords.distance,
    distanceKm: coords.distanceKm,
  };
}

function parseRecords(text: string): RawRow[] {
  const lines = text.split("\n");
  const records: RawRow[] = [];
  let currentProvince = PROVINCES[0];

  for (const line of lines) {
    const trimmed = line.trim();
    if (PROVINCES.includes(trimmed)) {
      currentProvince = trimmed;
    }
  }

  const joined = joinLines(lines);
  for (const raw of joined) {
    for (const p of PROVINCES) {
      if (raw.includes(p)) {
        currentProvince = p;
        break;
      }
    }
    const row = parseRecord(raw, currentProvince);
    if (row) records.push(row);
  }

  return records;
}

function enrichShops(raw: RawRow[]): Shop[] {
  const activationValues = raw.map((r) => r.activations);
  const qs = quartiles(activationValues);

  const suburbCounts = new Map<string, { count: number; activations: number }>();
  for (const r of raw) {
    const key = `${r.province}|${r.suburb}`;
    const entry = suburbCounts.get(key) ?? { count: 0, activations: 0 };
    entry.count += 1;
    entry.activations += r.activations;
    suburbCounts.set(key, entry);
  }

  const byProvince = new Map<string, RawRow[]>();
  for (const r of raw) {
    const list = byProvince.get(r.province) ?? [];
    list.push(r);
    byProvince.set(r.province, list);
  }

  const provinceRanks = new Map<string, Map<number, number>>();
  for (const [province, rows] of byProvince) {
    const sorted = [...rows].sort((a, b) => b.activations - a.activations);
    const rankMap = new Map<number, number>();
    sorted.forEach((r, i) => rankMap.set(r.orderNo, i + 1));
    provinceRanks.set(province, rankMap);
  }

  const sortedByDistance = [...raw].sort((a, b) => a.distance - b.distance);
  const routeSeq = new Map<number, number>();
  sortedByDistance.forEach((r, i) => routeSeq.set(r.orderNo, i + 1));

  return raw.map((r) => {
    const suburbKey = `${r.province}|${r.suburb}`;
    const suburbData = suburbCounts.get(suburbKey)!;
    const density = suburbData.activations / suburbData.count;
    const coverageScore = Math.round((density * Math.log10(suburbData.count + 1)) * 10) / 10;

    return {
      id: `${r.province.replace(/\s+/g, "").slice(0, 2).toUpperCase()}-${r.orderNo}-${Math.round(r.lat * 1000)}`,
      orderNo: r.orderNo,
      shopName: r.shopName,
      shopType: r.shopType,
      shopTypeCategory: normalizeShopType(r.shopType),
      city: r.city,
      suburb: r.suburb,
      province: r.province,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      activations: r.activations,
      distance: r.distance,
      distanceKm: r.distanceKm,
      activationTier: getActivationTier(r.activations, qs),
      coverageScore,
      provinceRank: provinceRanks.get(r.province)?.get(r.orderNo) ?? 0,
      routeSequence: routeSeq.get(r.orderNo) ?? 0,
      hasVerifiedAddress: !r.address.toLowerCase().includes("waiting for location"),
    };
  });
}

function buildSummaries(shops: Shop[]): DataSummaries {
  const activations = shops.map((s) => s.activations);
  const verified = shops.filter((s) => s.hasVerifiedAddress).length;

  const provinceMap = new Map<string, Shop[]>();
  const cityMap = new Map<string, Shop[]>();
  const typeMap = new Map<string, Shop[]>();

  for (const shop of shops) {
    const pList = provinceMap.get(shop.province) ?? [];
    pList.push(shop);
    provinceMap.set(shop.province, pList);

    const cityKey = `${shop.province}|${shop.city}`;
    const cList = cityMap.get(cityKey) ?? [];
    cList.push(shop);
    cityMap.set(cityKey, cList);

    const tList = typeMap.get(shop.shopTypeCategory) ?? [];
    tList.push(shop);
    typeMap.set(shop.shopTypeCategory, tList);
  }

  const byProvince = [...provinceMap.entries()]
    .map(([province, list]) => ({
      province,
      count: list.length,
      totalActivations: list.reduce((s, x) => s + x.activations, 0),
      avgActivations: list.reduce((s, x) => s + x.activations, 0) / list.length,
      verifiedAddressPct: (list.filter((x) => x.hasVerifiedAddress).length / list.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  const byCity = [...cityMap.entries()]
    .map(([, list]) => {
      const lat = list.reduce((s, x) => s + x.lat, 0) / list.length;
      const lng = list.reduce((s, x) => s + x.lng, 0) / list.length;
      return {
        city: list[0].city,
        province: list[0].province,
        count: list.length,
        avgActivations: list.reduce((s, x) => s + x.activations, 0) / list.length,
        lat,
        lng,
      };
    })
    .sort((a, b) => b.count - a.count);

  const byShopType = [...typeMap.entries()]
    .map(([category, list]) => ({
      category,
      count: list.length,
      avgActivations: list.reduce((s, x) => s + x.activations, 0) / list.length,
    }))
    .sort((a, b) => b.count - a.count);

  const topShops = [...shops].sort((a, b) => b.activations - a.activations).slice(0, 50);
  const hotspots = topShops.map((s) => ({
    lat: s.lat,
    lng: s.lng,
    count: 1,
    totalActivations: s.activations,
    label: `${s.shopName} (${s.city})`,
  }));

  const depotCandidates = byCity.slice(0, 20).map((c, i) => ({
    id: `depot-${i}`,
    label: `${c.city} Hub`,
    city: c.city,
    province: c.province,
    lat: c.lat,
    lng: c.lng,
    shopCount: c.count,
  }));

  const suburbStats = new Map<string, { suburb: string; city: string; province: string; shops: Shop[] }>();
  for (const shop of shops) {
    const key = `${shop.province}|${shop.city}|${shop.suburb}`;
    const entry = suburbStats.get(key) ?? {
      suburb: shop.suburb,
      city: shop.city,
      province: shop.province,
      shops: [],
    };
    entry.shops.push(shop);
    suburbStats.set(key, entry);
  }

  const coverageGaps = [...suburbStats.values()]
    .filter((s) => s.shops.length >= 3)
    .map((s) => ({
      suburb: s.suburb,
      city: s.city,
      province: s.province,
      shopCount: s.shops.length,
      avgActivations: s.shops.reduce((sum, x) => sum + x.activations, 0) / s.shops.length,
    }))
    .filter((s) => s.avgActivations < 4)
    .sort((a, b) => a.avgActivations - b.avgActivations)
    .slice(0, 30);

  return {
    national: {
      totalShops: shops.length,
      totalActivations: activations.reduce((a, b) => a + b, 0),
      avgActivations: activations.reduce((a, b) => a + b, 0) / activations.length,
      medianActivations: median(activations),
      verifiedAddressPct: (verified / shops.length) * 100,
      provinces: provinceMap.size,
      cities: cityMap.size,
      shopTypeCategories: typeMap.size,
    },
    byProvince,
    byCity,
    byShopType,
    hotspots,
    depotCandidates,
    coverageGaps,
  };
}

async function main() {
  console.log("Reading PDF:", PDF_PATH);
  const buffer = fs.readFileSync(PDF_PATH);
  const parsed = await pdf(buffer);
  const raw = parseRecords(parsed.text);
  console.log(`Parsed ${raw.length} raw records`);

  if (raw.length === 0) {
    console.error("No records parsed — check PDF format");
    process.exit(1);
  }

  const shops = enrichShops(raw);
  console.log(`Enriched ${shops.length} shops`);
  console.log(`Sample: ${shops[0].shopName} | ${shops[0].province} | ${shops[0].activations} activations`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "shops.json"), JSON.stringify(shops));
  fs.writeFileSync(
    path.join(OUT_DIR, "summaries.json"),
    JSON.stringify(buildSummaries(shops), null, 2)
  );

  console.log("Wrote public/data/shops.json and summaries.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
