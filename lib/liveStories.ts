import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { featuredStories, youTubeId, type Story } from "@/lib/stories";
import { orgStoryUrl } from "@/lib/links";

/**
 * Live story lineup — published rows from the shared `impact_stories` table
 * (the same source givesendgo.org renders), so the Story of the Month lands
 * here the moment the .org team publishes it. Ordering mirrors the .org:
 * featured first (newest featured_at), then newest published.
 *
 * Rules:
 *  - Only is_published rows are ever read (RLS also enforces this).
 *  - A row whose slug matches a curated entry in lib/stories.ts uses the
 *    curated card (it carries the on-site page, champion flag, etc.).
 *  - Other rows link out to the canonical story page on the .org.
 *  - Curated stories that aren't in the table (e.g. champion videos) are
 *    appended after the live ones.
 *  - Any failure falls back to the curated list — never an empty carousel.
 *
 * ACCESS: impact_stories has NO anon grant or RLS policy (verified against
 * role_table_grants / pg_policy — only service_role can read it, same as the
 * .org). So this reads with SUPABASE_SERVICE_ROLE_KEY, SERVER-ONLY: this
 * module must only ever be imported from server components / route handlers,
 * and only published rows are selected. Do not grant anon access to the
 * shared table just for this.
 */

function storiesClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabase; // anon client — works if a read policy is ever added
}

type ImpactStoryRow = {
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  recipient_name: string | null;
  location: string | null;
  fund: string | null;
  video_url: string | null;
  poster_url: string | null;
  pull_quote: string | null;
  body: string | null;
};

/** First sentence or two of the body, capped for card teasers. */
function bodyExcerpt(body: string | null): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= 180) return text;
  const cut = text.slice(0, 180);
  const sentence = cut.match(/^[\s\S]*?[.!?](?=\s)/);
  return sentence ? sentence[0] : `${cut.replace(/\s+\S*$/, "")}…`;
}

function rowToStory(row: ImpactStoryRow): Story {
  const slug = row.slug ?? "";
  const videoId = youTubeId(row.video_url);
  const image =
    row.poster_url ||
    (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "") ||
    "/brand/giver-army-logo.jpg";
  // "Story of the Month · <month>" subtitles are kickers, not teasers — use
  // the body opening instead so the card says something about the story.
  const subtitle = (row.subtitle ?? "").trim();
  const teaser =
    subtitle && !/^story of the month/i.test(subtitle)
      ? subtitle
      : bodyExcerpt(row.body) || subtitle;
  return {
    slug,
    title: row.title ?? "A Giver Army story",
    teaser,
    cause: row.fund ?? "",
    image,
    imageAlt: row.title ?? "A Giver Army story",
    videoUrl: row.video_url,
    recipientName: row.recipient_name,
    location: row.location,
    pullQuote: row.pull_quote,
    href: orgStoryUrl(slug),
    external: true,
  };
}

export async function getStoryLineup(): Promise<Story[]> {
  const client = storiesClient();
  if (!client) return featuredStories;
  try {
    const { data, error } = await client
      .from("impact_stories")
      .select(
        "slug, title, subtitle, recipient_name, location, fund, video_url, poster_url, pull_quote, body, is_featured, featured_at, published_at",
      )
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("featured_at", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false });
    if (error || !data || data.length === 0) return featuredStories;

    const rows = (data as ImpactStoryRow[]).filter((r) => r.slug && r.title);
    if (rows.length === 0) return featuredStories;

    const curatedBySlug = new Map(featuredStories.map((s) => [s.slug, s]));
    const live = rows.map((r) => curatedBySlug.get(r.slug!) ?? rowToStory(r));
    const liveSlugs = new Set(rows.map((r) => r.slug));
    const extras = featuredStories.filter((s) => !liveSlugs.has(s.slug));
    return [...live, ...extras];
  } catch {
    return featuredStories;
  }
}
