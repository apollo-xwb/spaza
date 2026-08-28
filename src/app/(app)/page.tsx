import { Suspense } from "react";
import SuperAppShell from "@/components/shell/SuperAppShell";
import { loadAppData } from "@/lib/data-loader";

function MapPageContent() {
  const { shops, summaries, insights } = loadAppData();

  if (shops.length === 0) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-airly-mist text-ios-label">
        <div className="text-center px-6">
          <h1 className="text-xl font-semibold mb-2">No shop data found</h1>
          <p className="text-ios-secondary text-sm">Run npm run extract-data to load the dataset.</p>
        </div>
      </div>
    );
  }

  return <SuperAppShell shops={shops} summaries={summaries} insights={insights} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-airly-slate" />}>
      <MapPageContent />
    </Suspense>
  );
}
