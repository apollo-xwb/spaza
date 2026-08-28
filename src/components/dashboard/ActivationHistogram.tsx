"use client";

import type { Shop } from "@/types";

interface ActivationHistogramProps {
  shops: Shop[];
}

export default function ActivationHistogram({ shops }: ActivationHistogramProps) {
  const buckets = [
    { label: "1-3", min: 1, max: 3, count: 0 },
    { label: "4-6", min: 4, max: 6, count: 0 },
    { label: "7-10", min: 7, max: 10, count: 0 },
    { label: "11-15", min: 11, max: 15, count: 0 },
    { label: "16-20", min: 16, max: 20, count: 0 },
    { label: "21+", min: 21, max: Infinity, count: 0 },
  ];

  for (const shop of shops) {
    const bucket = buckets.find((b) => shop.activations >= b.min && shop.activations <= b.max);
    if (bucket) bucket.count++;
  }

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="ios-card p-5">
      <h3 className="ios-section-title mb-1">Activation Distribution</h3>
      <p className="text-[11px] text-ios-secondary mb-4">How activations spread across the network</p>
      <div className="flex items-end gap-2 h-40">
        {buckets.map((b) => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-ios-secondary tabular-nums">{b.count}</span>
            <div
              className="w-full rounded-t-lg bg-ios-blue transition-all duration-700"
              style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count > 0 ? 4 : 0, opacity: 0.7 + (b.count / max) * 0.3 }}
            />
            <span className="text-[10px] text-ios-tertiary">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
