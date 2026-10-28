import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container, CTA, Eyebrow } from "@/components/ui";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { StoryCard } from "@/components/StoryCard";
import {
  getStory,
  internalStories,
  relatedStories,
  youTubeId,
} from "@/lib/stories";
import { links, PRICE_LABEL } from "@/lib/links";

type Params = { params: { slug: string } };

export const dynamic = "force-static";

export function generateStaticParams() {
  return internalStories.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const story = getStory(params.slug);
  if (!story?.page) return { title: "Story not found" };
  return {
    title: story.page.title.replace(/\.$/, ""),
    description: story.teaser,
    openGraph: {
      title: story.page.title.replace(/\.$/, ""),
      description: story.teaser,
      images: [{ url: story.image }],
    },
  };
}

export default function StoryPage({ params }: Params) {
  const story = getStory(params.slug);
  if (!story?.page) notFound();
  const page = story.page;
  const ytId = youTubeId(story.videoUrl);
  const related = relatedStories(story.slug, 2);

  return (
    <article>
      {/* Impact-report hero */}
      <section className="relative overflow-hidden bg-slate-ink">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" aria-hidden />
        <Container className="relative">
          <div className="max-w-3xl py-14 sm:py-20">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-bright"
            >
              <ArrowLeft size={16} aria-hidden />
              All stories
            </Link>
            <Eyebrow tone="light" className="mt-6">
              {page.kicker}
            </Eyebrow>
            <h1 className="display mt-4 text-5xl text-white sm:text-6xl lg:text-7xl">
              {page.title}
            </h1>
            {page.recipientLine ? (
              <p className="mt-5 text-lg text-cool-100">{page.recipientLine}</p>
            ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-cream-warm py-14 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            {/* Video */}
            {ytId ? (
              <YouTubeEmbed id={ytId} title={story.title} className="shadow-lift" />
            ) : null}

            {/* Pull quote */}
            <figure className="mt-12 border-l-4 border-gold-base pl-5 sm:pl-6">
              <blockquote className="display text-2xl text-slate-ink sm:text-3xl">
                “{page.pullQuote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold uppercase tracking-eyebrow text-gold-deep">
                {page.pullQuoteAttribution}
              </figcaption>
            </figure>

            {/* The story */}
            <div className="mt-12">
              <p className="text-xs font-bold uppercase tracking-eyebrow text-gold-deep">
                The story
              </p>
              <h2 className="heading mt-3 text-2xl text-slate-ink sm:text-3xl">
                {page.bodyHeading}
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-body text-slate-base">
                {page.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* The arc — stat row */}
          {page.arc && page.arc.length > 0 ? (
            <div className="mx-auto mt-16 max-w-5xl">
              <p className="text-xs font-bold uppercase tracking-eyebrow text-gold-deep">
                The arc
              </p>
              <h2 className="heading mt-3 text-2xl text-slate-ink sm:text-3xl">
                From one bite to one crowd.
              </h2>
              <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {page.arc.map((stat) => (
                  <div key={stat.label} className="surface-card p-6">
                    <dt className="display text-3xl text-slate-ink">
                      {stat.value}
                    </dt>
                    <dd className="mt-2">
                      <span className="block text-sm font-bold text-slate-base">
                        {stat.label}
                      </span>
                      <span className="mt-1 block text-sm leading-body text-slate-400">
                        {stat.detail}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {/* Give CTA */}
          <div className="mx-auto mt-16 max-w-3xl rounded-card bg-slate-ink p-8 text-center sm:p-10">
            <h2 className="heading text-2xl text-white sm:text-3xl">
              Be the crowd for the next story.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-body text-cool-100">
              From as little as $5 a month, you fund people facing their hardest
              moment with no one behind them.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CTA href={links.join} variant="gold">
                Join the Army — {PRICE_LABEL}
              </CTA>
              <CTA href={links.give} external variant="ghost-dark">
                Give once
              </CTA>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 ? (
            <div className="mx-auto mt-16 max-w-5xl">
              <h2 className="heading text-2xl text-slate-ink">More stories</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {related.map((s) => (
                  <StoryCard key={s.slug} story={s} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>
    </article>
  );
}
