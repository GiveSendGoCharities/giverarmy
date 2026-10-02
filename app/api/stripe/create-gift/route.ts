import { NextResponse } from "next/server";

// Edge-compatible: calls Stripe's REST API directly with fetch (no SDK).
export const runtime = "edge";

/**
 * Creates the Stripe object behind an /enlist gift and returns its
 * PaymentIntent client secret for the Payment Element to confirm.
 *
 * - once:    one PaymentIntent for gift + support add-on.
 * - monthly: Customer + Subscription (default_incomplete) with an ad-hoc
 *            price for gift + support; the first invoice's PaymentIntent is
 *            confirmed client-side and the card is saved for renewals.
 *
 * ENTITY NOTE (counsel-reviewed copy lives in enlist.html): everything —
 * including the optional support add-on — is charged by and settles to
 * GiveSendGo Charities, Inc. Nothing here touches GiveSendGo.com LLC.
 *
 * API version is pinned so latest_invoice.payment_intent expansion keeps
 * working regardless of the account's default version.
 */
const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2024-06-20";
const PRODUCT_ID = "giver-army-monthly";

type GiftRequest = {
  frequency?: string;
  gift_cents?: number;
  tip_cents?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  optin?: boolean;
};

async function stripe(
  secretKey: string,
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_VERSION,
      ...(method === "POST"
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body:
      method === "POST" && params
        ? new URLSearchParams(params).toString()
        : undefined,
  });
  const data = (await res.json()) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return bad("Payments are not configured.", 503);

  let body: GiftRequest;
  try {
    body = (await request.json()) as GiftRequest;
  } catch {
    return bad("Invalid request.");
  }

  const frequency = body.frequency === "monthly" ? "monthly" : "once";
  const gift = Math.round(Number(body.gift_cents));
  const tip = Math.round(Number(body.tip_cents) || 0);
  const email = String(body.email ?? "").trim().slice(0, 254);
  const firstName = String(body.first_name ?? "").trim().slice(0, 100);
  const lastName = String(body.last_name ?? "").trim().slice(0, 100);

  if (!Number.isFinite(gift) || gift < 500 || gift > 1_000_000) {
    return bad("Gift must be between $5 and $10,000.");
  }
  if (!Number.isFinite(tip) || tip < 0 || tip > 200_000) {
    return bad("Invalid support amount.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return bad("Enter a valid email address.");
  }

  const total = gift + tip;
  const name = `${firstName} ${lastName}`.trim();
  const metadata: Record<string, string> = {
    "metadata[source]": "giver_army_enlist",
    "metadata[gift_cents]": String(gift),
    "metadata[support_cents]": String(tip),
    "metadata[frequency]": frequency,
    "metadata[donor_name]": name,
    "metadata[email_optin]": body.optin ? "yes" : "no",
  };

  try {
    if (frequency === "once") {
      const pi = await stripe(secretKey, "POST", "/payment_intents", {
        amount: String(total),
        currency: "usd",
        receipt_email: email,
        description: "Giver Army one-time gift",
        "automatic_payment_methods[enabled]": "true",
        statement_descriptor_suffix: "GIVER ARMY",
        ...metadata,
      });
      if (!pi.ok) return bad("Could not start your gift. Please try again.", 502);
      return NextResponse.json({
        clientSecret: pi.data.client_secret,
        mode: "once",
      });
    }

    // Monthly: customer → (ensure product) → subscription.
    const customer = await stripe(secretKey, "POST", "/customers", {
      email,
      ...(name ? { name } : {}),
      "metadata[source]": "giver_army_enlist",
    });
    if (!customer.ok) return bad("Could not start your membership.", 502);

    const product = await stripe(secretKey, "GET", `/products/${PRODUCT_ID}`);
    if (!product.ok) {
      const created = await stripe(secretKey, "POST", "/products", {
        id: PRODUCT_ID,
        name: "Giver Army monthly gift",
      });
      // A parallel request may have created it first; that error is fine.
      if (!created.ok && created.status !== 400) {
        return bad("Could not start your membership.", 502);
      }
    }

    const sub = await stripe(secretKey, "POST", "/subscriptions", {
      customer: String(customer.data.id),
      "items[0][price_data][currency]": "usd",
      "items[0][price_data][product]": PRODUCT_ID,
      "items[0][price_data][recurring][interval]": "month",
      "items[0][price_data][unit_amount]": String(total),
      payment_behavior: "default_incomplete",
      "payment_settings[save_default_payment_method]": "on_subscription",
      "expand[]": "latest_invoice.payment_intent",
      ...metadata,
    });
    if (!sub.ok) return bad("Could not start your membership.", 502);

    const invoice = sub.data.latest_invoice as
      | { payment_intent?: { client_secret?: string } }
      | undefined;
    const clientSecret = invoice?.payment_intent?.client_secret;
    if (!clientSecret) return bad("Could not start your membership.", 502);

    return NextResponse.json({ clientSecret, mode: "monthly" });
  } catch {
    return bad("Could not reach the payment provider. Please try again.", 502);
  }
}
