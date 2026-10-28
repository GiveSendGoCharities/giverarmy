import { links } from "@/lib/links";

/**
 * Site-wide config: nav, entity statement, metadata defaults.
 */

/**
 * Canonical base URL — drives metadataBase, OpenGraph, canonical tags,
 * sitemap, and robots.
 *
 * Launch plan: giver.army serves as the main site first (canonical), then later
 * 301-redirects to giverarmy.com. When that flip happens, set
 * NEXT_PUBLIC_SITE_URL=https://giverarmy.com (and turn on the domain redirect in
 * Vercel) — no code change needed.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://giver.army";

export const site = {
  name: "Giver Army",
  /** The hostname of the canonical URL above (no scheme). */
  domain: SITE_URL.replace(/^https?:\/\//, ""),
  url: SITE_URL,
  tagline: "A Crowd for the Crowdless",
  description:
    "Some people in need have no crowd. Giver Army is a movement of everyday givers who fund them, follow their stories, and share the hope of Jesus through generosity — so no one faces their hardest moment alone.",

  // Entity separation — exact language, do not alter (see brief §2).
  entity: {
    statement:
      "Giver Army is a movement of GiveSendGo Charities, Inc., a 501(c)(3) public charity. All gifts are made to and stewarded by GiveSendGo Charities.",
    ein: "88-3776392",
    charityName: "GiveSendGo Charities, Inc.",
  },
} as const;

export const primaryNav = [
  { label: "The Movement", href: "/movement" },
  { label: "Stories", href: "/stories" },
  { label: "Impact", href: "/impact" },
  { label: "Multiply", href: "/multiply" },
] as const;

export const footerNav = {
  movement: [
    { label: "The Movement", href: "/movement" },
    { label: "Stories", href: "/stories" },
    { label: "Impact", href: "/impact" },
    { label: "Multiply", href: "/multiply" },
  ],
  give: [
    // Routes to the giving widget — never to /multiply.
    { label: "Join the Army", href: links.join },
    { label: "Give once", href: links.give, external: true },
    { label: "The 12 Causes", href: "/impact#causes" },
    { label: "Where your gift goes", href: "/impact#transparency" },
  ],
  trust: [
    { label: "About & Trust", href: "/about" },
    { label: "FAQ", href: "/about#faq" },
    { label: "Complex & offline giving", href: "/about#offline" },
  ],
} as const;
