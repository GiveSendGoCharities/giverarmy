import { NextResponse } from "next/server";

// Edge-compatible: no Node-only APIs.
export const runtime = "edge";

/**
 * Publishable-key handoff for the static /enlist page. The publishable key is
 * public by design; without it the widget stays in demo mode.
 */
export async function GET() {
  return NextResponse.json(
    { publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null },
    { headers: { "Cache-Control": "public, s-maxage=300" } },
  );
}
