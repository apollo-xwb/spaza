import { NextResponse } from "next/server";
import { getMenuItem } from "@/lib/menu";

const VAT_RATE = 0.16;

interface IncomingLine {
  id?: unknown;
  quantity?: unknown;
}

interface OrderPayload {
  customerName?: unknown;
  items?: unknown;
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "spaza-orders" });
}

export async function POST(request: Request) {
  let body: OrderPayload;
  try {
    body = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  if (!customerName) {
    return NextResponse.json(
      { error: "A customer name is required." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: "Your order must contain at least one item." },
      { status: 400 },
    );
  }

  const lines = [];
  for (const raw of body.items as IncomingLine[]) {
    const id = typeof raw?.id === "string" ? raw.id : "";
    const quantity =
      typeof raw?.quantity === "number" && Number.isInteger(raw.quantity)
        ? raw.quantity
        : 0;

    if (!id || quantity <= 0) {
      return NextResponse.json(
        { error: "Each line item needs a valid id and quantity." },
        { status: 400 },
      );
    }

    const item = getMenuItem(id);
    if (!item) {
      return NextResponse.json(
        { error: `Unknown menu item: ${id}` },
        { status: 400 },
      );
    }

    lines.push({
      id: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      lineTotal: item.price * quantity,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  const orderNumber = `SPZ-${Date.now().toString(36).toUpperCase()}`;

  return NextResponse.json(
    {
      orderNumber,
      customerName,
      lines,
      subtotal,
      vat,
      total,
      currency: "KES",
      placedAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
