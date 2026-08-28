"use client";

import { useEffect, useRef } from "react";
import type { Shop, DataSummaries, DataInsights } from "@/types";
import { formatZar } from "@/lib/insights-engine";
import { useAppNav } from "@/contexts/AppNavContext";
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
  const filtersRef = useRef<HTMLDivElement>(null);
  const { registerScrollToFilters } = useAppNav();

  useEffect(() => {
    registerScrollToFilters(() => {
      filtersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => registerScrollToFilters(null);
  }, [registerScrollToFilters]);

  const n = summaries.national;

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-airly-gradient texture-grain relative">
      <header className="px-5 pt-safe-top pb-4">
        <div className="pt-6">
          <h1 className="ios-large-title text-white">Dashboard</h1>
          <p className="text-[15px] text-white/70 mt-1">
            {n.totalShops.toLocaleString()} locations across South Africa
          </p>
        </div>
      </header>

      <main className="px-4 md:px-6 pb-dock space-y-5 max-w-7xl mx-auto">
        {/* Hero KPI row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-ios-lg p-5 texture-topo" style={{ background: "linear-gradient(135deg, #C8F135 0%, #9BC53D 100%)" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800/70">Total TAM</div>
            <div className="text-3xl font-extrabold text-gray-900 tabular-nums mt-1 tracking-tight">
              {formatZar(insights.nationalTamZar, true)}
            </div>
            <div className="text-[11px] text-gray-800/60 mt-1">{insights.dataConfidence}% confidence</div>
          </div>
          <div className="relative overflow-hidden rounded-ios-lg p-5 texture-topo" style={{ background: "linear-gradient(135deg, #FFFC00 0%, #FFD60A 100%)" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-800/70">Activations</div>
            <div className="text-3xl font-extrabold text-gray-900 tabular-nums mt-1 tracking-tight">
              {n.totalActivations.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-800/60 mt-1">{n.avgActivations.toFixed(1)} avg per shop</div>
          </div>
        </div>

        <div ref={filtersRef}>
          <KpiGrid summaries={summaries} insights={insights} />
        </div>

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
