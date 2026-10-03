/**
 * Branded transactional emails for the Giver Army (sent via Resend).
 * Edge-safe: plain template strings, no Node APIs.
 *
 * Entity/tax language (do not alter without counsel): Giver Army is a
 * movement of GiveSendGo Charities, Inc., a 501(c)(3) public charity,
 * EIN 88-3776392. Contributions are tax-deductible to the extent allowed
 * by law.
 */

const SITE = "https://giver.army";
const GOLD = "#B38E3D";
const SLATE = "#383F41";
const SLATE_DEEP = "#262A2B";
const CREAM = "#F9F7ED";
const MUTED = "#5F686B";

export const EMAIL_FROM = "Giver Army <hello@giver.army>";
export const EMAIL_REPLY_TO = "info@givesendgo.org";

const TAX_STATEMENT =
  "Giver Army is a movement of GiveSendGo Charities, Inc., a 501(c)(3) public charity (EIN 88-3776392). All gifts are made to and stewarded by GiveSendGo Charities. Your contribution is tax-deductible to the extent allowed by law. No goods or services were provided in exchange for your contribution unless stated in your receipt.";

function shell(bodyHtml: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Giver Army</title></head>
<body style="margin:0;padding:0;background:${CREAM};font-family:Inter,'Helvetica Neue',Arial,sans-serif;color:${SLATE};">
<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td align="center" style="padding:8px 0 20px;">
    <img src="${SITE}/brand/giver-army-logo.jpg" alt="Giver Army" width="180" style="display:block;width:180px;height:auto;">
  </td></tr>
  <tr><td style="background:#ffffff;border-radius:12px;padding:36px 32px;">
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:24px 16px 8px;">
    <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:${MUTED};">${TAX_STATEMENT}</p>
    <p style="margin:0 0 10px;font-size:12px;line-height:1.6;color:${MUTED};">GiveSendGo Charities, Inc. &middot; #1067, 167 South Broadway STE 5, Salem, NH 03079 &middot; <a href="mailto:${EMAIL_REPLY_TO}" style="color:${MUTED};">${EMAIL_REPLY_TO}</a></p>
    <p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:${MUTED};">You're receiving this because you joined the Giver Army at giver.army. To stop these updates, reply with &ldquo;unsubscribe&rdquo;.</p>
    <img src="${SITE}/brand/gsgc-charities-logo.png" alt="GiveSendGo Charities" width="150" style="display:block;width:150px;height:auto;opacity:.9;">
    <p style="margin:12px 0 0;font-size:12px;font-weight:600;color:${GOLD};">For the Crowdless.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:${GOLD};color:${SLATE_DEEP};font-weight:700;font-size:16px;text-decoration:none;padding:14px 28px;border-radius:6px;">${label}</a>`;

const h1 = (t: string) =>
  `<h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;letter-spacing:-.02em;color:${SLATE};">${t}</h1>`;
const p = (t: string) =>
  `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${SLATE};">${t}</p>`;
const small = (t: string) =>
  `<p style="margin:0 0 14px;font-size:13.5px;line-height:1.6;color:${MUTED};">${t}</p>`;

export type GiftInfo = {
  name: string; // first name or ""
  amountLabel: string; // e.g. "$22.00/month" or "$100.00"
  monthly: boolean;
};

/** 1 of 3 — immediately after the gift. Welcome + tax information. */
export function welcomeEmail(g: GiftInfo) {
  const hi = g.name ? `${g.name}, you` : "You";
  return {
    subject: g.monthly
      ? "Welcome to the Giver Army — you just became someone's crowd"
      : "Thank you — you just showed up for someone",
    html: shell(
      h1(`${hi} joined the crowd.`) +
        p(
          g.monthly
            ? `Your gift of <strong>${g.amountLabel}</strong> is now part of a growing crowd for people facing their hardest moment with no one behind them. Welcome to the Giver Army.`
            : `Your gift of <strong>${g.amountLabel}</strong> goes to people facing their hardest moment with no crowd behind them. Thank you for showing up.`,
        ) +
        p(
          `<strong>For your records:</strong> your gift was made to GiveSendGo Charities, Inc., a 501(c)(3) public charity (EIN 88-3776392), and is tax-deductible to the extent allowed by law. Keep your Stripe receipt &mdash; it's your acknowledgment${g.monthly ? ", and a year-end giving statement follows each January" : ""}.`,
        ) +
        p(
          `What happens next: our grant team sends pooled gifts to verified needs where no crowd has formed. ${g.monthly ? "Every quarter you'll hear who you showed up for, by name." : "You can follow who the Army shows up for anytime."}`,
        ) +
        `<p style="margin:8px 0 0;">${btn(`${SITE}/enlist#stories`, "Meet the people the crowd reached")}</p>`,
      "Your gift is in. Here's what it means and what happens next.",
    ),
  };
}

/** 2 of 3 — two days later. Where the money goes + transparency. */
export function whereItGoesEmail(g: GiftInfo) {
  return {
    subject: "Where your gift goes",
    html: shell(
      h1("Twelve kinds of need. One crowd.") +
        p(
          "Your gift flows through the Giver Army Fund to validated needs across twelve cause areas &mdash; crisis response, medical relief, essentials for life, faith-based work, and more. Gifts are unrestricted so the team can move the day a need is validated.",
        ) +
        p(
          "GiveSendGo Charities reviews every need before a grant is made and holds Candid's Platinum Seal of Transparency.",
        ) +
        small(
          "Tax note: because your gift is unrestricted charitable giving to a 501(c)(3), it qualifies as a deductible contribution in the year it was given, to the extent allowed by law. Talk to your tax advisor about your situation.",
        ) +
        `<p style="margin:8px 0 0;">${btn(`${SITE}/impact`, "See the impact")}</p>`,
      "How the Giver Army turns your gift into grants for the crowdless.",
    ),
  };
}

/** 3 of 3 — seven days later. Multiply. */
export function multiplyEmail(g: GiftInfo) {
  const share = encodeURIComponent(
    "I just joined the Giver Army — a crowd for people who don't have one. Join me from $5 a month: https://giver.army/enlist",
  );
  return {
    subject: "Enlist one friend who'd do this too",
    html: shell(
      h1("The crowd grows one invitation at a time.") +
        p(
          `${g.name ? g.name + ", every" : "Every"} member you bring is another crowd for someone who has none. If one friend comes to mind &mdash; the one who always shows up &mdash; send them this.`,
        ) +
        `<p style="margin:8px 0 20px;">${btn(`sms:?&body=${share}`, "Text a friend")}</p>` +
        p(
          `Or share the link directly: <a href="${SITE}/enlist" style="color:${GOLD};font-weight:600;">giver.army/enlist</a>`,
        ) +
        small(
          "And if you'd like someone to pray with you, just reply to this email — the Hope Team reads every message.",
        ),
      "One invitation doubles your impact.",
    ),
  };
}
