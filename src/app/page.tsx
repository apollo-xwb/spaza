import SuperAppShell from "@/components/shell/SuperAppShell";
import type { Shop, DataSummaries, DataInsights } from "@/types";
import { buildInsightsFromShops } from "@/lib/insights-engine";
import fs from "fs";
import path from "path";

function loadData(): { shops: Shop[]; summaries: DataSummaries; insights: DataInsights } {
  const shopsPath = path.join(process.cwd(), "public/data/shops.json");
  const summariesPath = path.join(process.cwd(), "public/data/summaries.json");
  const insightsPath = path.join(process.cwd(), "public/data/insights.json");

  const emptySummaries: DataSummaries = {
    national: { totalShops: 0, totalActivations: 0, avgActivations: 0, medianActivations: 0, verifiedAddressPct: 0, provinces: 0, cities: 0, shopTypeCategories: 0 },
    byProvince: [], byCity: [], byShopType: [], hotspots: [], depotCandidates: [], coverageGaps: [],
  };

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

export default function HomePage() {
  const { shops, summaries, insights } = loadData();

  if (shops.length === 0) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-surface text-primary">
        <div className="text-center px-6">
          <h1 className="text-xl font-semibold mb-2">No shop data found</h1>
          <p className="text-muted text-sm">Run npm run extract-data to load the dataset.</p>
        </div>
      </div>
    );
  }

  return <SuperAppShell shops={shops} summaries={summaries} insights={insights} />;
}
