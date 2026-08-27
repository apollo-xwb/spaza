import IntelligenceDashboard from "@/components/IntelligenceDashboard";
import type { Shop, DataSummaries } from "@/types";
import fs from "fs";
import path from "path";

function loadData(): { shops: Shop[]; summaries: DataSummaries } {
  const shopsPath = path.join(process.cwd(), "public/data/shops.json");
  const summariesPath = path.join(process.cwd(), "public/data/summaries.json");

  if (!fs.existsSync(shopsPath)) {
    return {
      shops: [],
      summaries: {
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
      },
    };
  }

  const shops = JSON.parse(fs.readFileSync(shopsPath, "utf-8")) as Shop[];
  const summaries = JSON.parse(fs.readFileSync(summariesPath, "utf-8")) as DataSummaries;
  return { shops, summaries };
}

export default function HomePage() {
  const { shops, summaries } = loadData();

  if (shops.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-hud-bg text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">No shop data found</h1>
          <p className="text-white/50 text-sm">Run npm run extract-data to load the PDF dataset.</p>
        </div>
      </div>
    );
  }

  return <IntelligenceDashboard shops={shops} summaries={summaries} />;
}
