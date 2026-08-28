import type { StyleSpecification } from "maplibre-gl";

const ESRI_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics';

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

/** Esri World Imagery — satellite, free, Snap Map feel */
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: ESRI_ATTRIBUTION,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "satellite",
      type: "raster",
      source: "satellite",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

/** CARTO Voyager — streets overlay */
export const STREETS_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    streets: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: CARTO_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: "streets",
      type: "raster",
      source: "streets",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export type MapStyleMode = "satellite" | "streets";

export function getMapStyle(mode: MapStyleMode): StyleSpecification {
  return mode === "satellite" ? SATELLITE_STYLE : STREETS_STYLE;
}

/** Default export for backward compat */
export const MAP_STYLE = SATELLITE_STYLE;
