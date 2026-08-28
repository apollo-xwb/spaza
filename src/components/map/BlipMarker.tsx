"use client";

import { getCategoryColor, TIER_COLORS } from "@/lib/utils";
import type { Shop } from "@/types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
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
  const size = shop.activationTier === "elite" ? 48 : shop.activationTier === "high" ? 42 : 36;
  const initials = getInitials(shop.shopName);
  const statusDot = shop.hasVerifiedAddress
    ? '<div class="blip-status"></div>'
    : "";

  return `
    <div class="blip-inner ${selected ? "blip-selected" : ""} ${inRoute ? "blip-route" : ""}" style="width:${size}px;height:${size}px">
      <div class="blip-pulse" style="border-color:${selected ? "#FFFC00" : tierColor}"></div>
      ${selected ? '<div class="blip-pulse blip-pulse-delay" style="border-color:#C8F135"></div>' : ""}
      <div class="blip-avatar" style="background:linear-gradient(135deg,${color},${color}cc)">
        <span>${initials}</span>
        ${statusDot}
      </div>
    </div>
  `;
}

export default function BlipMarker() {
  return null;
}
