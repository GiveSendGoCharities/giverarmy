/**
 * Centralized outbound links.
 *
 * This marketing site does NOT process payments. Every giving / donation action
 * is an outbound link to the GiveSendGo Charities donor site (givesendgo.org).
 * Cause campaigns live on the crowdfunding platform (givesendgo.com).
 *
 * COMPLIANCE NOTE: givesendgo.org (GiveSendGo Charities, Inc., the 501(c)(3)) and
 * givesendgo.com (GiveSendGo.com LLC, the crowdfunding platform) are SEPARATE
 * entities. Do not conflate them. Gifts are made to and stewarded by the charity.
 *
 * Swap these placeholder hrefs for production URLs in one place.
 */
export const links = {
  // Donor / checkout actions. All "Join" CTAs must route here (never to
  // /multiply). With JavaScript, <JoinWidget> intercepts clicks on this href
  // and pops up the GiverArmyFund donate widget in a modal; without it the
  // link falls through to /join, which serves the same widget full-page.
  // Widget presets are $25 / $50 / $125 plus a custom field with a $5.00
  // minimum — $5/mo is the floor, not a preset or default.
  join: "/join",
  give: "https://www.givesendgo.org/give", // one-time gift (placeholder URL)

  // The charity / donor site
  charity: "https://www.givesendgo.org",

  // The crowdfunding platform (SEPARATE company — not the giving entity)
  platform: "https://www.givesendgo.com",

  // Policies / legal — Privacy & Terms are published on this site; contact
  // stays on the .org donor site
  privacy: "/privacy",
  terms: "/terms",
  contact: "https://www.givesendgo.org/contact",

  // Transparency
  candid: "https://www.candid.org",

  // Social (placeholders — swap for real handles)
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    x: "https://x.com",
  },
} as const;

/**
 * Gift-amount messaging: $5/mo is the MINIMUM (custom-field floor), not the
 * default. Widget presets are $25 / $50 / $125. Copy must anchor on the low
 * barrier ("from $5/mo", "as little as $5 a month") and never imply $5 is the
 * default gift.
 */
export const PRICE_LABEL = "from $5/mo";
export const MIN_GIFT_PHRASE = "as little as $5 a month";
export const GIFT_TIERS = [25, 50, 125] as const; // widget presets; custom min $5

/**
 * Canonical story page on the GiveSendGo Charities site (.org). Story slugs map
 * directly to /impact/<slug> there (e.g. operation-shelter, steve-and-dawn).
 * Story cards link out to these pages.
 */
export const orgStoryUrl = (slug: string) =>
  `${links.charity}/impact/${slug}`;

/** The .org impact index (story library on givesendgo.org). */
export const orgImpactIndex = `${links.charity}/impact`;
