# Shops Intelligence Map

Full-screen quantifiable shop intelligence dashboard for South Africa — built from enriched retail location data with Mapbox visualization, KPI analytics, and route optimization.

## Features

- **6,900+ shop locations** across 9 provinces with activations, coverage scores, and tier rankings
- **Dark command-center UI** with glass panels, clustered map blips, heatmaps, and selection radar
- **Route optimization** — field rep visits, high-value activation routes, distribution/depot planning
- **Presentation mode** for boardroom demos

## Quick start

```bash
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
npm run extract-data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data

Shop records are extracted from the PDF export via:

```bash
npm run extract-data
```

Outputs:

- `public/data/shops.json` — enriched shop records
- `public/data/summaries.json` — province/city/type aggregates

## Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token (Directions + Optimization scopes) |

Without a Mapbox token, the app falls back to CARTO dark tiles and nearest-neighbor routing.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · Mapbox GL JS · Turf.js
