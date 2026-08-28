"use client";

import type { Shop, DataSummaries, DataInsights } from "@/types";
import IosSegmentedNav from "@/components/shell/IosSegmentedNav";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ProvinceBarChart from "@/components/dashboard/ProvinceBarChart";
import TierDonut from "@/components/dashboard/TierDonut";
import ShopTypeGrid from "@/components/dashboard/ShopTypeGrid";
import TopCitiesList from "@/components/dashboard/TopCitiesList";
import OpportunityList from "@/components/dashboard/OpportunityList";
import HotspotsPanel from "@/components/dashboard/HotspotsPanel";
import MarketSignals from "@/components/dashboard/MarketSignals";
import ActivationHistogram from "@/components/dashboard/ActivationHistogram";

interface Props {
  shops: Shop[];
  summaries: DataSummaries;
  insights: DataInsights;
}

export default function DashboardView({ shops, summaries, insights }: Props) {
  return (
    <div className="h-[100dvh] overflow-y-auto bg-ios-bg">
      <header className="ios-blur-strong sticky top-0 z-30 border-b border-ios-separator pt-safe-top">
        <div className="px-5 pt-4 pb-3">
          <div className="flex justify-center mb-4">
            <IosSegmentedNav />
          </div>
          <h1 className="ios-large-title text-ios-label">Dashboard</h1>
          <p className="text-[15px] text-ios-secondary mt-1">
            South Africa retail intelligence · {summaries.national.totalShops.toLocaleString()} locations
          </p>
        </div>
      </header>

      <main className="px-4 md:px-6 py-5 pb-safe-bottom space-y-5 max-w-7xl mx-auto">
        <KpiGrid summaries={summaries} insights={insights} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ProvinceBarChart provinces={insights.byProvince} />
          <TierDonut tiers={insights.tierDistribution} />
        </div>

        <MarketSignals insights={insights} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ActivationHistogram shops={shops} />
          <ShopTypeGrid types={summaries.byShopType} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TopCitiesList cities={summaries.byCity} />
          <OpportunityList zones={insights.opportunityZones} />
        </div>

        <HotspotsPanel
          hotspots={summaries.hotspots}
          depots={summaries.depotCandidates}
          gaps={summaries.coverageGaps}
        />
      </main>
    </div>
  );
}
