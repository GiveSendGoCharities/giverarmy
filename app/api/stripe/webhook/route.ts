import { NextResponse } from "next/server";
import {
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  welcomeEmail,
  whereItGoesEmail,
  multiplyEmail,
  type GiftInfo,
} from "@/lib/email";

// Edge-compatible: signature check uses WebCrypto, no Stripe SDK.
export const runtime = "edge";

/**
 * Stripe webhook receiver.
 *
 * POST — verifies the signature against STRIPE_WEBHOOK_SECRET, then on a
 * first successful gift from /enlist sends the 3-email welcome sequence via
 * Resend (welcome now; follow-ups scheduled +2d and +7d, follow-ups only
 * with email opt-in). Resend Idempotency-Keys are derived from the Stripe
 * event id so webhook retries never double-send.
 *
 * GET — configuration status (booleans + Resend domain state only, no
 * secrets). Used to verify wiring from outside.
 *
 * TODO (next phase): record gifts in the Supabase gifts table once
 * SUPABASE_SERVICE_ROLE_KEY is provisioned.
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
      sig
        .split("")
        .reduce(
          (acc, ch, i) => acc | (ch.charCodeAt(0) ^ expected.charCodeAt(i)),
          0,
        ) === 0,
  );
}

const money = (cents: number) =>
  "$" +
  (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

async function sendEmail(
  apiKey: string,
  to: string,
  email: { subject: string; html: string },
  idempotencyKey: string,
  scheduledAt?: string,
): Promise<void> {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        reply_to: EMAIL_REPLY_TO,
        subject: email.subject,
        html: email.html,
        ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
      }),
    });
  } catch {
    // Email failure must never fail the webhook ack; Stripe would retry
    // the whole event and the idempotency key covers the resend.
  }
}

async function sendSequence(
  eventId: string,
  to: string,
  gift: GiftInfo,
  optin: boolean,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;
  const day = 24 * 60 * 60 * 1000;
  await sendEmail(apiKey, to, welcomeEmail(gift), `welcome-${eventId}`);
  if (optin) {
    await sendEmail(
      apiKey,
      to,
      whereItGoesEmail(gift),
      `where-${eventId}`,
      new Date(Date.now() + 2 * day).toISOString(),
    );
    await sendEmail(
      apiKey,
      to,
      multiplyEmail(gift),
      `multiply-${eventId}`,
      new Date(Date.now() + 7 * day).toISOString(),
    );
  }
}

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
};

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "webhook not configured" },
      { status: 503 },
    );
  }
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!signature || !(await verifySignature(payload, signature, secret))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
  const obj = (event.data?.object ?? {}) as Record<string, unknown>;
  const eventId = String(event.id ?? "evt_unknown");

  if (event.type === "payment_intent.succeeded") {
    // One-time /enlist gifts carry our metadata directly on the intent.
    const md = (obj.metadata ?? {}) as Record<string, string>;
    if (md.source === "giver_army_enlist" && md.frequency === "once") {
      const to = String(obj.receipt_email ?? "");
      await sendSequence(
        eventId,
        to,
        {
          name: (md.donor_name ?? "").split(" ")[0] ?? "",
          amountLabel: money(Number(md.gift_cents) || Number(obj.amount) || 0),
          monthly: false,
        },
        md.email_optin === "yes",
      );
    }
  } else if (event.type === "invoice.paid") {
    // First monthly charge: metadata rides on subscription_details.
    const sd = (obj.subscription_details ?? {}) as {
      metadata?: Record<string, string>;
    };
    const md = sd.metadata ?? {};
    if (
      md.source === "giver_army_enlist" &&
      obj.billing_reason === "subscription_create"
    ) {
      const to = String(obj.customer_email ?? "");
      await sendSequence(
        eventId,
        to,
        {
          name: (md.donor_name ?? "").split(" ")[0] ?? "",
          amountLabel:
            money(Number(md.gift_cents) || Number(obj.amount_paid) || 0) +
            "/month",
          monthly: true,
        },
        md.email_optin === "yes",
      );
    }
  }

  return NextResponse.json({ received: true });
}

/** Configuration status — booleans and Resend domain state only. */
export async function GET() {
  const resendKey = process.env.RESEND_API_KEY;
  let resendDomains: { name: string; status: string }[] | null = null;
  if (resendKey) {
    try {
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      const d = (await r.json()) as {
        data?: { name?: string; status?: string }[];
      };
      resendDomains = (d.data ?? []).map((x) => ({
        name: String(x.name),
        status: String(x.status),
      }));
    } catch {
      resendDomains = null;
    }
  }
  return NextResponse.json({
    stripeSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stripePublishableKey: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    resendApiKey: Boolean(resendKey),
    resendDomains,
    supabaseRead: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
