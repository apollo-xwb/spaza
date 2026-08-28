"use client";

import type { OpportunityZone } from "@/types";

interface OpportunityListProps {
  zones: OpportunityZone[];
}

export default function OpportunityList({ zones }: OpportunityListProps) {
  return (
    <div className="ios-card overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="ios-section-title">Opportunity Zones</h3>
        <p className="text-[11px] text-ios-secondary mt-1">High-growth white-space markets</p>
      </div>
      {zones.slice(0, 10).map((z) => (
        <div key={`${z.suburb}-${z.city}`} className="ios-row">
          <div className="min-w-0">
            <div className="text-sm font-medium text-ios-label truncate">{z.suburb}</div>
            <div className="text-[11px] text-ios-secondary">{z.city}, {z.province}</div>
          </div>
          <div className="text-right shrink-0 ml-3">
            <div className="text-sm font-bold text-ios-orange tabular-nums">{z.opportunityScore}</div>
            <div className="text-[10px] text-ios-tertiary">{z.shopCount} shops</div>
          </div>
        </div>
      ))}
    </div>
  );
}
