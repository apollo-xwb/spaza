"use client";

import { createContext, useContext, useCallback, useState, useMemo, type ReactNode } from "react";
import type { AppTab } from "@/types";

interface AppNavContextValue {
  routeCount: number;
  setRouteCount: (n: number) => void;
  openPanel: (tab: AppTab) => void;
  registerPanelHandler: (handler: ((tab: AppTab) => void) | null) => void;
  scrollToFilters: () => void;
  registerScrollToFilters: (handler: (() => void) | null) => void;
}

const AppNavContext = createContext<AppNavContextValue | null>(null);

export function AppNavProvider({ children }: { children: ReactNode }) {
  const [routeCount, setRouteCount] = useState(0);
  const [panelHandler, setPanelHandler] = useState<((tab: AppTab) => void) | null>(null);
  const [scrollHandler, setScrollHandler] = useState<(() => void) | null>(null);

  const openPanel = useCallback(
    (tab: AppTab) => {
      panelHandler?.(tab);
    },
    [panelHandler]
  );

  const registerPanelHandler = useCallback((handler: ((tab: AppTab) => void) | null) => {
    setPanelHandler(() => handler);
  }, []);

  const scrollToFilters = useCallback(() => {
    scrollHandler?.();
  }, [scrollHandler]);

  const registerScrollToFilters = useCallback((handler: (() => void) | null) => {
    setScrollHandler(() => handler);
  }, []);

  const value = useMemo(
    () => ({
      routeCount,
      setRouteCount,
      openPanel,
      registerPanelHandler,
      scrollToFilters,
      registerScrollToFilters,
    }),
    [routeCount, openPanel, registerPanelHandler, scrollToFilters, registerScrollToFilters]
  );

  return <AppNavContext.Provider value={value}>{children}</AppNavContext.Provider>;
}

export function useAppNav() {
  const ctx = useContext(AppNavContext);
  if (!ctx) throw new Error("useAppNav must be used within AppNavProvider");
  return ctx;
}
