"use client";

import { getCategoryColor, TIER_COLORS } from "@/lib/utils";
import type { Shop } from "@/types";

interface BlipMarkerProps {
  shop: Shop;
  selected: boolean;
  inRoute: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

export function createBlipElement(
  shop: Shop,
  selected: boolean,
  inRoute: boolean,
  onTap: () => void,
  onLongPress: () => void
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "blip-marker";
  el.innerHTML = renderBlipHtml(shop, selected, inRoute);

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let longPressed = false;

  const clearTimer = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  el.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    longPressed = false;
    pressTimer = setTimeout(() => {
      longPressed = true;
      onLongPress();
    }, 500);
  });

  el.addEventListener("mouseup", (e) => {
    e.stopPropagation();
    clearTimer();
    if (!longPressed) onTap();
  });

  el.addEventListener("mouseleave", clearTimer);

  el.addEventListener("touchstart", (e) => {
    e.stopPropagation();
    longPressed = false;
    pressTimer = setTimeout(() => {
      longPressed = true;
      onLongPress();
    }, 500);
  }, { passive: true });

  el.addEventListener("touchend", (e) => {
    e.stopPropagation();
    clearTimer();
    if (!longPressed) onTap();
  });

  return el;
}

function renderBlipHtml(shop: Shop, selected: boolean, inRoute: boolean): string {
  const color = getCategoryColor(shop.shopTypeCategory);
  const tierColor = TIER_COLORS[shop.activationTier];
  const size = shop.activationTier === "elite" ? 44 : shop.activationTier === "high" ? 38 : 32;

  return `
    <div class="blip-inner ${selected ? "blip-selected" : ""} ${inRoute ? "blip-route" : ""}" style="width:${size}px;height:${size}px">
      <div class="blip-pulse" style="border-color:${tierColor}"></div>
      <div class="blip-pulse blip-pulse-delay" style="border-color:${tierColor}"></div>
      <div class="blip-core" style="background:${color};box-shadow:0 0 12px ${tierColor}80">
        <span class="blip-count">${shop.activations}</span>
      </div>
    </div>
  `;
}

export default function BlipMarker({ shop, selected, inRoute, onTap, onLongPress }: BlipMarkerProps) {
  return (
    <div
      className={`blip-inner ${selected ? "blip-selected" : ""} ${inRoute ? "blip-route" : ""}`}
      onClick={(e) => { e.stopPropagation(); onTap(); }}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(); }}
    >
      <div className="blip-pulse" style={{ borderColor: TIER_COLORS[shop.activationTier] }} />
      <div
        className="blip-core"
        style={{
          background: getCategoryColor(shop.shopTypeCategory),
          boxShadow: `0 0 12px ${TIER_COLORS[shop.activationTier]}80`,
        }}
      >
        <span className="blip-count">{shop.activations}</span>
      </div>
    </div>
  );
}
