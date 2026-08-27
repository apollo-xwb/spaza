# SPAZA

**SPAZA** is the [ROCO OS](https://www.rocomamas.co.ke/) point-of-sale storefront —
a fast, high-octane ordering interface for burgers, wings, sides and drinks.

Built with **Next.js 16** (App Router), **React 19**, **TypeScript** and **Tailwind CSS 4**,
and styled to the ROCO OS brand guide (Primary Orange `#E78A3E`, Primary Black `#000000`,
Primary White `#FFFFFF`).

## Features

- Browse the menu by category (Burgers · Wings · Sides · Drinks).
- Add items to a live cart with running subtotal.
- Checkout through a server-side order API (`POST /api/orders`) that validates the
  cart, recomputes pricing, applies 16% VAT and issues an order number.
- Order confirmation with an itemized receipt.

## Getting started

Requirements: **Node.js 22+** and **pnpm 10** (pinned via `packageManager`).

```bash
pnpm install        # install dependencies
pnpm dev            # start the dev server on http://localhost:3000
```

## Common commands

| Command          | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Run the development server (port 3000).  |
| `pnpm build`     | Production build.                        |
| `pnpm start`     | Serve the production build.              |
| `pnpm lint`      | Run ESLint.                             |
| `pnpm typecheck` | Type-check with `tsc --noEmit`.          |

## Order API

`POST /api/orders`

```json
{
  "customerName": "Amara",
  "items": [{ "id": "smash-classic", "quantity": 2 }]
}
```

Returns `201` with an itemized order, subtotal, VAT and total. `GET /api/orders`
returns a health payload.

## Project structure

```
src/
  app/
    api/orders/route.ts   # order placement + health endpoint
    layout.tsx            # root layout + brand metadata
    page.tsx              # renders the storefront
    globals.css           # Tailwind + ROCO OS tokens & grunge pattern
  components/
    Storefront.tsx        # interactive menu, cart and checkout
  lib/
    menu.ts               # menu data, types and helpers
```
