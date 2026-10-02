import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Edge-compatible: no Node-only APIs. Runs on Cloudflare Pages.
export const runtime = "edge";

/**
 * Live gift counter for the /join page (and the GiveSendGo.com pop-up).
 *
 * Contract (per the v7.3 design's LIVE spec): { gift_count, updated_at }.
 * The client hides the count entirely when the payload is missing, invalid,
 * or stale — so on any failure we return 503 and the page degrades to its
 * "You're enlisted." copy instead of showing a wrong number.
 *
 * Source: stats_latest view (scraped from the GiverArmyFund campaign page
 * every ~30 min by the refresh_giverarmy_stats cron).
 */
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
    return NextResponse.json(
      { gift_count: giftCount, updated_at: scrapedAt },
      {
        headers: {
          // Short shared cache so 25s client polling doesn't hammer Supabase.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "stats unavailable" }, { status: 503 });
  }
}
