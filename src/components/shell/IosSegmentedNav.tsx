"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function IosSegmentedNav() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div className="ios-segmented mx-auto w-full max-w-xs">
      <Link
        href="/"
        className={`ios-segment ${!isDashboard ? "ios-segment-active" : ""}`}
      >
        Map
      </Link>
      <Link
        href="/dashboard"
        className={`ios-segment ${isDashboard ? "ios-segment-active" : ""}`}
      >
        Dashboard
      </Link>
    </div>
  );
}
