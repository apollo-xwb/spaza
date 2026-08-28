import type { Shop, DataSummaries, DataInsights } from "@/types";
import { buildInsightsFromShops } from "@/lib/insights-engine";
import fs from "fs";
import path from "path";

const emptySummaries: DataSummaries = {
  national: {
    totalShops: 0,
    totalActivations: 0,
    avgActivations: 0,
    medianActivations: 0,
    verifiedAddressPct: 0,
    provinces: 0,
    cities: 0,
    shopTypeCategories: 0,
  },
  byProvince: [],
  byCity: [],
  byShopType: [],
  hotspots: [],
  depotCandidates: [],
  coverageGaps: [],
};

export function loadAppData(): {
  shops: Shop[];
  summaries: DataSummaries;
  insights: DataInsights;
} {
  const shopsPath = path.join(process.cwd(), "public/data/shops.json");
  const summariesPath = path.join(process.cwd(), "public/data/summaries.json");
  const insightsPath = path.join(process.cwd(), "public/data/insights.json");

  if (!fs.existsSync(shopsPath)) {
    return { shops: [], summaries: emptySummaries, insights: buildInsightsFromShops([]) };
  }

  const shops = JSON.parse(fs.readFileSync(shopsPath, "utf-8")) as Shop[];
  const summaries = fs.existsSync(summariesPath)
    ? (JSON.parse(fs.readFileSync(summariesPath, "utf-8")) as DataSummaries)
    : emptySummaries;

  const insights = fs.existsSync(insightsPath)
    ? (JSON.parse(fs.readFileSync(insightsPath, "utf-8")) as DataInsights)
    : buildInsightsFromShops(shops);

  return { shops, summaries, insights };
}
