import { NextResponse } from "next/server";

// Edge-compatible: signature check uses WebCrypto, no Stripe SDK.
export const runtime = "edge";

/**
 * Stripe webhook receiver. Verifies the signature against
 * STRIPE_WEBHOOK_SECRET and acknowledges the event.
 *
 * Current behavior: acknowledge only — Stripe's dashboard is the system of
 * record. TODO (next phase): on payment_intent.succeeded / invoice.paid,
 * record the gift in the Supabase gifts table (needs a service-role key;
 * the anon key is read-only by design).
 */
const TOLERANCE_SECONDS = 300;

async function verifySignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  const parts = new Map<string, string[]>();
  for (const kv of header.split(",")) {
    const [k, v] = kv.split("=", 2);
    if (!k || !v) continue;
    const list = parts.get(k.trim()) ?? [];
    list.push(v.trim());
    parts.set(k.trim(), list);
  }
  const timestamp = Number(parts.get("t")?.[0]);
  const signatures = parts.get("v1") ?? [];
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return signatures.some(
    (sig) =>
      sig.length === expected.length &&
      // constant-time-ish comparison
      sig.split("").reduce((acc, ch, i) => acc | (ch.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0,
  );
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!signature || !(await verifySignature(payload, signature, secret))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: { type?: string; id?: string };
  try {
    event = JSON.parse(payload) as { type?: string; id?: string };
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
    case "invoice.paid":
    case "payment_intent.payment_failed":
    case "invoice.payment_failed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "charge.refunded":
      // Acknowledged; dashboard is the record for now (see TODO above).
      break;
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
