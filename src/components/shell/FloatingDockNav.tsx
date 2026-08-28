"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppNav } from "@/contexts/AppNavContext";

const DOCK_ITEMS = [
  {
    id: "map",
    href: "/",
    label: "Map",
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z",
    action: null as "explore" | "routes" | null,
  },
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z",
    action: null,
  },
  {
    id: "explore",
    href: null,
    label: "Explore",
    icon: "M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z",
    action: "explore" as const,
  },
  {
    id: "routes",
    href: null,
    label: "Routes",
    icon: "M4 6h16M4 12h10M4 18h6",
    action: "routes" as const,
  },
];

export default function FloatingDockNav() {
  const pathname = usePathname();
  const { routeCount, openPanel, scrollToFilters } = useAppNav();
  const isMap = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

  const handleAction = (action: "explore" | "routes") => {
    if (isMap) {
      openPanel(action);
    } else if (action === "explore") {
      scrollToFilters();
    } else if (isDashboard) {
      window.location.href = "/?panel=routes";
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
      <div className="snap-dock pointer-events-auto flex items-center gap-1 px-2 py-2">
        {DOCK_ITEMS.map((item) => {
          const isActive =
            (item.id === "map" && isMap) ||
            (item.id === "dashboard" && isDashboard) ||
            false;

          const content = (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d={item.icon} />
              </svg>
              <span className="hidden sm:inline text-[11px] font-semibold">{item.label}</span>
              {item.id === "routes" && routeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ios-red px-1 text-[9px] font-bold text-white">
                  {routeCount}
                </span>
              )}
            </>
          );

          const className = `relative flex items-center gap-1.5 px-4 py-2.5 rounded-pill transition-all active:scale-95 ${
            isActive ? "bg-white/15 text-white" : "text-white/55 hover:text-white/80"
          }`;

          if (item.href) {
            return (
              <Link key={item.id} href={item.href} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.id} onClick={() => item.action && handleAction(item.action)} className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
