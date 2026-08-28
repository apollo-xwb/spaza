# Spaza Intelligence — Super Map

Map-first, fully responsive retail intelligence super-app for South Africa. Free maps, interactive blips, synthesized market insights, and route optimization — built from 6,900+ enriched shop locations.

## Features

- **Full-screen MapLibre map** with CARTO dark tiles (no API key required)
- **Interactive blips** — pulsing markers, tap to inspect, long-press to add to routes
- **Market intelligence** — TAM estimates, province rankings, opportunity zones, tier analysis
- **Route optimization** — field rep, high-value, and distribution modes via OSRM
- **Fully responsive** — mobile bottom sheets + desktop collapsible rails

## Quick start

```bash
npm install
npm run extract-data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data pipeline

```bash
npm run extract-data
```

Outputs:
- `public/data/shops.json` — enriched shop records
- `public/data/summaries.json` — province/city/type aggregates
- `public/data/insights.json` — TAM, opportunity zones, category intelligence

## Environment (optional)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_OSRM_URL` | OSRM routing server (default: public OSRM) |

## Stack

Next.js 15 · TypeScript · Tailwind CSS · MapLibre GL JS · OSRM · Turf.js
