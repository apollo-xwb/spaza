"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  MENU,
  MenuCategory,
  formatKES,
  getMenuItem,
} from "@/lib/menu";

const LOGO_URL = "https://www.rocomamas.co.ke/images//logo-combined.png";

type Cart = Record<string, number>;

interface OrderLine {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface OrderConfirmation {
  orderNumber: string;
  customerName: string;
  lines: OrderLine[];
  subtotal: number;
  vat: number;
  total: number;
  currency: string;
  placedAt: string;
}

export default function Storefront() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "All">(
    "All",
  );
  const [cart, setCart] = useState<Cart>({});
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(
    null,
  );

  const visibleMenu = useMemo(
    () =>
      activeCategory === "All"
        ? MENU
        : MENU.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const item = getMenuItem(id);
          if (!item) return null;
          return { item, quantity, lineTotal: item.price * quantity };
        })
        .filter((line): line is NonNullable<typeof line> => line !== null),
    [cart],
  );

  const itemCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function decrement(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] ?? 0;
      if (current <= 1) {
        delete next[id];
      } else {
        next[id] = current - 1;
      }
      return next;
    });
  }

  async function placeOrder() {
    setError(null);
    if (!customerName.trim()) {
      setError("Please enter a name for the order.");
      return;
    }
    if (cartLines.length === 0) {
      setError("Add at least one item before checking out.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          items: cartLines.map((line) => ({
            id: line.item.id,
            quantity: line.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong placing your order.");
        return;
      }
      setConfirmation(data as OrderConfirmation);
      setCart({});
      setCustomerName("");
    } catch {
      setError("Could not reach the ordering service. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header — solid black with orange borders */}
      <header className="sticky top-0 z-20 border-b-4 border-[#E78A3E] bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src={LOGO_URL}
              alt="ROCO combined logo"
              width={132}
              height={44}
              className="h-10 w-auto"
              priority
              unoptimized
            />
            <span className="hidden text-sm font-semibold uppercase tracking-widest text-[#E78A3E] sm:inline">
              SPAZA · ROCO OS
            </span>
          </div>
          <div
            className="flex items-center gap-2 rounded-full border border-[#E78A3E] px-4 py-1.5 text-sm font-bold text-white"
            data-testid="cart-badge"
          >
            <span aria-hidden>🛒</span>
            <span>{itemCount}</span>
            <span className="text-[#E78A3E]">·</span>
            <span className="text-[#E78A3E]">{formatKES(subtotal)}</span>
          </div>
        </div>
      </header>

      {/* Main canvas — white with grunge texture */}
      <main className="grunge-pattern flex-1">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
          <section>
            <h1 className="text-3xl font-black tracking-tight text-black">
              Order the good stuff
            </h1>
            <p className="mt-1 text-zinc-700">
              High-octane burgers, wings and sides — straight off the ROCO grill.
            </p>

            {/* Category pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {(["All", ...CATEGORIES] as const).map((cat) => {
                const selected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={
                      "rounded-full px-4 py-1.5 text-sm font-bold transition-colors " +
                      (selected
                        ? "bg-[#E78A3E] text-black"
                        : "bg-[#F4F4F5] text-zinc-800 hover:bg-zinc-200")
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Menu grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleMenu.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:border-[#E78A3E] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-black">
                        <span className="mr-2" aria-hidden>
                          {item.emoji}
                        </span>
                        {item.name}
                      </h2>
                      <span className="whitespace-nowrap font-mono text-sm font-bold text-[#C9722C]">
                        {formatKES(item.price)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {item.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(item.id)}
                    data-testid={`add-${item.id}`}
                    className="mt-4 rounded-lg bg-[#E78A3E] px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-[#C9722C]"
                  >
                    Add to order
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Cart panel */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border-2 border-black bg-white shadow-2xl">
              <div className="rounded-t-lg border-b-2 border-[#E78A3E] bg-black px-4 py-3">
                <h2 className="text-lg font-black uppercase tracking-wide text-white">
                  Your Order
                </h2>
              </div>
              <div className="p-4">
                {cartLines.length === 0 ? (
                  <p className="py-6 text-center text-sm text-zinc-500">
                    Your cart is empty. Add something tasty.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {cartLines.map((line) => (
                      <li
                        key={line.item.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-black">
                            {line.item.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatKES(line.item.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decrement(line.item.id)}
                            aria-label={`Remove one ${line.item.name}`}
                            className="h-7 w-7 rounded-full border border-zinc-300 text-black hover:border-[#E78A3E] hover:bg-[#F4F4F5]"
                          >
                            −
                          </button>
                          <span
                            className="w-6 text-center text-sm font-bold"
                            data-testid={`qty-${line.item.id}`}
                          >
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => addToCart(line.item.id)}
                            aria-label={`Add one ${line.item.name}`}
                            className="h-7 w-7 rounded-full bg-[#E78A3E] font-bold text-black hover:bg-[#C9722C]"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
                  <span className="text-sm font-semibold text-zinc-700">
                    Subtotal
                  </span>
                  <span
                    className="font-mono text-lg font-black text-black"
                    data-testid="subtotal"
                  >
                    {formatKES(subtotal)}
                  </span>
                </div>

                <label className="mt-4 block text-sm font-semibold text-zinc-700">
                  Name for order
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Amara"
                    data-testid="customer-name"
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-black outline-none transition-colors focus:border-[#E78A3E] focus:ring-2 focus:ring-[#E78A3E]"
                  />
                </label>

                {error && (
                  <p
                    className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={submitting}
                  data-testid="checkout"
                  className="mt-4 w-full rounded-lg bg-[#E78A3E] px-4 py-3 text-base font-black uppercase tracking-wide text-black transition-colors hover:bg-[#C9722C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Placing order…" : "Place order"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer — solid black with orange border */}
      <footer className="border-t-4 border-[#E78A3E] bg-black">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-white sm:px-6">
          <p className="font-semibold">
            <span className="text-[#E78A3E]">SPAZA</span> — powered by ROCO OS
          </p>
          <p className="mt-1 text-zinc-400">
            Prices in KES · VAT added at checkout.
          </p>
        </div>
      </footer>

      {/* Confirmation modal */}
      {confirmation && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
          <div
            className="w-full max-w-md rounded-2xl border-2 border-[#E78A3E] bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            data-testid="confirmation"
          >
            <div className="rounded-t-2xl border-b-2 border-[#E78A3E] bg-black px-5 py-4">
              <h2 className="text-xl font-black uppercase tracking-wide text-white">
                Order confirmed 🔥
              </h2>
            </div>
            <div className="p-5">
              <p className="text-zinc-700">
                Thanks{" "}
                <span className="font-bold text-black">
                  {confirmation.customerName}
                </span>
                ! Your order is in the queue.
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Order number:{" "}
                <span
                  className="font-mono font-bold text-[#C9722C]"
                  data-testid="order-number"
                >
                  {confirmation.orderNumber}
                </span>
              </p>

              <ul className="mt-4 space-y-1 text-sm">
                {confirmation.lines.map((line) => (
                  <li key={line.id} className="flex justify-between">
                    <span className="text-zinc-700">
                      {line.quantity} × {line.name}
                    </span>
                    <span className="font-mono text-black">
                      {formatKES(line.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1 border-t border-zinc-200 pt-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    {formatKES(confirmation.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>VAT (16%)</span>
                  <span className="font-mono">
                    {formatKES(confirmation.vat)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-black">
                  <span>Total</span>
                  <span className="font-mono" data-testid="order-total">
                    {formatKES(confirmation.total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="mt-5 w-full rounded-lg bg-[#E78A3E] px-4 py-3 font-black uppercase tracking-wide text-black transition-colors hover:bg-[#C9722C]"
              >
                Start a new order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
