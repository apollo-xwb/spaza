"use client";

import { AppNavProvider } from "@/contexts/AppNavContext";
import FloatingDockNav from "@/components/shell/FloatingDockNav";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <AppNavProvider>
      <div className="relative min-h-[100dvh]">
        {children}
        <FloatingDockNav />
      </div>
    </AppNavProvider>
  );
}
