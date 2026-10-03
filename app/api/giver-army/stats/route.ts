import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Edge-compatible: no Node-only APIs.
export const runtime = "edge";

/**
 * Live gift counter for the /enlist page (and the GiveSendGo.com pop-up).
 *
 * Contract (per the v7.3 design's LIVE spec): { gift_count, updated_at }.
 * The client hides the count entirely when the payload is missing, invalid,
 * or stale — so on any failure we return 503 and the page degrades to its
 * "You're enlisted." copy instead of showing a wrong number.
 *
 * gift_count = scraped GiverArmyFund campaign counter (stats_latest view,
 * refreshed ~30 min) + direct /enlist Stripe gifts, which the campaign
 * counter never sees:
 *   - one-time gifts: PaymentIntents searched by our metadata
 *   - monthly gifts (first charge + every renewal): paid invoices whose
 *     subscription metadata is ours
 * Stripe counting is best-effort — any failure falls back to the scraped
 * count alone rather than erroring the whole response.
 */
const STRIPE_API = "https://api.stripe.com/v1";
const STRIPE_VERSION = "2024-06-20";
const MAX_PAGES = 10;

async function stripeGet(
  secretKey: string,
  path: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": STRIPE_VERSION,
    },
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

async function countDirectStripeGifts(): Promise<number> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return 0;
  let count = 0;

  // One-time gifts: metadata lives on the PaymentIntent itself.
  try {
    const query = encodeURIComponent(
      "metadata['source']:'giver_army_enlist' AND status:'succeeded'",
    );
    let page: string | null = null;
    for (let i = 0; i < MAX_PAGES; i++) {
      const data = await stripeGet(
        secretKey,
        `/payment_intents/search?query=${query}&limit=100${page ? `&page=${page}` : ""}`,
      );
      if (!data) break;
      const rows = (data.data ?? []) as unknown[];
      count += rows.length;
      if (!data.has_more || !data.next_page) break;
      page = String(data.next_page);
    }
  } catch {
    /* best-effort */
  }

  // Monthly gifts: each paid invoice (first charge and renewals) whose
  // subscription metadata is ours counts as one gift.
  try {
    let after: string | null = null;
    for (let i = 0; i < MAX_PAGES; i++) {
      const data = await stripeGet(
        secretKey,
        `/invoices?status=paid&limit=100${after ? `&starting_after=${after}` : ""}`,
      );
      if (!data) break;
      const rows = (data.data ?? []) as {
        id?: string;
        amount_paid?: number;
        subscription_details?: { metadata?: Record<string, string> };
      }[];
      for (const inv of rows) {
        if (
          (inv.amount_paid ?? 0) > 0 &&
          inv.subscription_details?.metadata?.source === "giver_army_enlist"
        ) {
          count += 1;
        }
      }
      if (!data.has_more || rows.length === 0) break;
      after = String(rows[rows.length - 1].id);
    }
  } catch {
    /* best-effort */
  }

  return count;
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "stats unavailable" }, { status: 503 });
  }
  try {
    const { data, error } = await supabase
      .from("stats_latest")
      .select("gift_count, scraped_at")
      .limit(1)
      .maybeSingle();
    const giftCount = typeof data?.gift_count === "number" ? data.gift_count : null;
    const scrapedAt = typeof data?.scraped_at === "string" ? data.scraped_at : null;
    if (error || giftCount == null || giftCount <= 0 || !scrapedAt) {
      return NextResponse.json({ error: "stats unavailable" }, { status: 503 });
    }
    const direct = await countDirectStripeGifts();
    return NextResponse.json(
      { gift_count: giftCount + direct, updated_at: scrapedAt },
      {
        headers: {
          // Short shared cache so 25s client polling doesn't hammer
          // Supabase or Stripe.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "stats unavailable" }, { status: 503 });
  }
}
