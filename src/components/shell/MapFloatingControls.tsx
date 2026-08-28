"use client";

interface MapFloatingControlsProps {
  onLocate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleLayers: () => void;
  layersActive: boolean;
}

export default function MapFloatingControls({
  onLocate,
  onZoomIn,
  onZoomOut,
  onToggleLayers,
  layersActive,
}: MapFloatingControlsProps) {
  const btnClass = "snap-fab flex h-11 w-11 items-center justify-center active:scale-95 transition";

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 pb-dock md:pb-0">
      <button onClick={onToggleLayers} className={`${btnClass} ${layersActive ? "ring-2 ring-snap-lime" : ""}`} aria-label="Layers">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </button>
      <button onClick={onLocate} className={btnClass} aria-label="Locate me">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
          <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
      <div className="snap-glass rounded-2xl overflow-hidden flex flex-col">
        <button onClick={onZoomIn} className="flex h-10 w-11 items-center justify-center border-b border-white/30 active:bg-white/30" aria-label="Zoom in">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
        </button>
        <button onClick={onZoomOut} className="flex h-10 w-11 items-center justify-center active:bg-white/30" aria-label="Zoom out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5"><path d="M5 12h14" /></svg>
        </button>
      </div>
    </div>
  );
}
