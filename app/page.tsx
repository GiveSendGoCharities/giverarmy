import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Container, CTA, Eyebrow, SectionHeading } from "@/components/ui";
import { StatsStrip } from "@/components/StatsStrip";
import { StoryCard } from "@/components/StoryCard";
import { AnchorStory } from "@/components/AnchorStory";
import { VisionVideo } from "@/components/VisionVideo";
import { HowItWorks } from "@/components/HowItWorks";
import { WaysToBelong } from "@/components/WaysToBelong";
import { CausesSection } from "@/components/CausesSection";
import { ValuePills } from "@/components/ValuePills";
import { NewsletterForm } from "@/components/NewsletterForm";
import { CandidBadge } from "@/components/CandidBadge";
import { GiftInMotion } from "@/components/GiftInMotion";
import { getMovementStats } from "@/lib/stats";
import { getStoryLineup } from "@/lib/liveStories";
import { links } from "@/lib/links";

export const revalidate = 1800; // ISR — refresh live stats every 30 min

export default async function HomePage() {
  const movementStats = await getMovementStats();
  const stories = await getStoryLineup();
  const anchor = stories[0];
  const rest = stories.slice(1);
  return (
    <>
      {/* 1 — Hero */}
      <Hero />

      {/* 1b — Vision film, just below the fold */}
      <VisionVideo />

      {/* 2 — The Movement */}
      <section className="bg-slate-base py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="The movement"
            title="Join a global generosity movement."
            intro="Thousands of everyday givers, one growing crowd. Here's where the movement stands today."
            tone="light"
          />
          <div className="mt-10">
            <StatsStrip stats={movementStats} tone="light" columns={4} />
            {movementStats.some((s) => s.placeholder) ? (
              <p className="mt-4 text-xs text-cool-400">
                Figures marked — are pending verified reporting.
              </p>
            ) : null}
          </div>
        </Container>
      </section>

      {/* 2b — Your gift, in motion (live line) */}
      <GiftInMotion />

      {/* 3 — Stories */}
      <section className="bg-cream-warm py-20 sm:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Stories"
              title="Real receipts. Real lives. Real hope."
              intro="Generosity you can see. Every story is a life changed by a crowd that showed up."
            />
            <Link
              href="/stories"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gold-deep"
            >
              Read more stories
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
          {anchor ? (
            <div className="mt-10">
              <AnchorStory story={anchor} />
            </div>
          ) : null}
          {rest.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.slice(0, 6).map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      {/* 4 — The Crowdless */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow className="mb-4">The crowdless</Eyebrow>
              <h2 className="heading text-3xl text-slate-ink sm:text-4xl">
                Some people face their hardest moment with no one behind them.
              </h2>
              <p className="mt-5 text-lg leading-body text-slate-400">
                No network to rally. No crowd to fund a way through. The
                crowdless condition leaves real people invisible at the exact
                moment they need to be seen. That&apos;s the villain we exist to
                defeat.
              </p>
            </div>
            <figure className="rounded-card border-l-4 border-gold-base bg-white p-8 shadow-card sm:p-10">
              <blockquote className="display text-2xl text-slate-ink sm:text-3xl">
                “We are a crowd for the crowdless — so no one faces their hardest
                moment alone.”
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold uppercase tracking-eyebrow text-gold-deep">
                The Giver Army promise
              </figcaption>
            </figure>
          </div>
        </Container>
      </section>

      {/* 5 — How it works */}
      <section className="bg-cream-warm py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to a generous life."
            intro="Join the Army. See the impact. Multiply it."
          />
          <div className="mt-10">
            <HowItWorks />
          </div>
        </Container>
      </section>

      {/* 6 — Ways to Belong */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Ways to belong"
            title="Give leads. Then you multiply."
            intro="Giving is the direct way in. Prayer, sharing, and recruiting multiply what your gift begins."
          />
          <div className="mt-10">
            <WaysToBelong />
          </div>
        </Container>
      </section>

      {/* 7 — The 12 Causes carousel */}
      <CausesSection />

      {/* 8 — Transparency */}
      <section
        id="transparency"
        className="bg-cream-warm py-20 sm:py-24"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Transparency"
                title="You should never wonder where your gift went."
                intro="Giver Army is backed by GiveSendGo Charities, a 501(c)(3) public charity with transparent grant tracking — so your generosity is something you can follow, not just hope about."
              />
              <div className="mt-8">
                <ValuePills />
              </div>
            </div>

            {/* Candid Platinum + Dispatch signup */}
            <div className="surface-card flex flex-col p-8 sm:p-10">
              <CandidBadge />
              <h3 className="heading mt-5 text-2xl text-slate-ink">
                Get the Giver Army Dispatch.
              </h3>
              <p className="mt-3 text-[0.95rem] leading-body text-slate-400">
                Stories, impact updates, and the people your generosity reached
                — straight to your inbox. No noise. Just the receipts.
              </p>
              <div className="mt-6">
                <NewsletterForm tone="light" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 9 — Final CTA */}
      <section className="relative overflow-hidden bg-slate-ink py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-hero-glow opacity-80"
          aria-hidden
        />
        <Container className="relative text-center">
          <h2 className="display mx-auto max-w-3xl text-4xl text-white sm:text-5xl">
            Find your crowd. Fund the crowdless.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-body text-cool-100">
            You were made to be a giver. Step into a movement that turns
            generosity into changed lives.
          </p>
          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <CTA href={links.join} variant="gold">
              Join the Army — from $5/mo
            </CTA>
            <CTA href={links.give} external variant="ghost-dark">
              Give once
            </CTA>
          </div>
        </Container>
      </section>
    </>
  );
}
