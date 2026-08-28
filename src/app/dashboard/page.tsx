import DashboardView from "@/components/dashboard/DashboardView";
import { loadAppData } from "@/lib/data-loader";

export default function DashboardPage() {
  const { shops, summaries, insights } = loadAppData();

  return <DashboardView shops={shops} summaries={summaries} insights={insights} />;
}
