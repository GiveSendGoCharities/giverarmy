import type { Metadata } from "next";
import { ShieldCheck, Compass, Flag } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Container, CTA, Eyebrow, SectionHeading } from "@/components/ui";
import { HowItWorks } from "@/components/HowItWorks";
import { links } from "@/lib/links";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Movement",
  description:
    "Who we are: a movement of everyday givers being a crowd for the crowdless. Mission, vision, values, and how it works — backed by GiveSendGo Charities.",
};

const pillars = [
  { title: "Faith First", body: "Everything begins with the hope of Jesus." },
  { title: "Generosity", body: "A generous life, lived openly and often." },
  { title: "Hope", body: "We carry hope to the moments that feel hopeless." },
  { title: "Community", body: "A crowd, not a transaction. We stay." },
  { title: "Integrity", body: "Transparent with every gift, every time." },
];

const values = [
  {
    title: "Vision",
    body: "To be the most trusted charity mobilizing resources for need.",
    Icon: Compass,
  },
  {
    title: "Mission",
    body: "Share the hope of Jesus through generosity.",
    Icon: Flag,
  },
  {
    title: "Purpose",
    body: "Build a generosity movement where every gift creates a ripple effect for Kingdom impact — especially for the crowdless.",
    Icon: ShieldCheck,
  },
];

export default function MovementPage() {
  return (
    <>
      <PageHero
        eyebrow="The movement"
        title="A crowd for the crowdless."
        intro="Giver Army is a movement of everyday givers who believe their generosity should count — and that no one should face their hardest moment alone."
      />

      {/* Who we are */}
      <section className="bg-cream-warm py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionHeading
              eyebrow="Who we are"
              title="The giver is the hero. We're the guide."
              intro="You're the one who shows up. Giver Army simply points the way, carries the receipts, and makes sure your generosity reaches the people with no crowd of their own."
            />
            <div className="space-y-4 text-lg leading-body text-slate-400">
              <p>
                Some people in need have no crowd. No network to rally, no
                followers to fund a way through. We call this the crowdless
                condition — and it&apos;s the villain we exist to defeat.
              </p>
              <p>
                We fund the crowdless, follow their stories, and share the hope
                of Jesus through generosity — so that a one-time donation
                becomes a life of belonging to something bigger.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission / Vision / Purpose */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="What drives us"
            title="Mission, vision, and purpose."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="surface-card flex flex-col p-7">
                <span
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-tint3 text-gold-deep"
                  aria-hidden
                >
                  <v.Icon size={20} />
                </span>
                <h3 className="heading mt-5 text-xl text-slate-ink">
                  {v.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-body text-slate-400">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Core pillars */}
      <section className="bg-cream-warm py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Core pillars"
            title="What we stand on."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((p) => (
              <li key={p.title} className="surface-card p-6">
                <h3 className="heading text-lg text-slate-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-body text-slate-400">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-cream py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Join the Army. See the impact. Multiply it."
          />
          <div className="mt-10">
            <HowItWorks />
          </div>
        </Container>
      </section>

      {/* Entity bridge — Backed by GiveSendGo Charities */}
      <section className="bg-slate-base py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <Eyebrow tone="light" className="mb-4">
                Backed by
              </Eyebrow>
              <h2 className="heading text-3xl text-white sm:text-4xl">
                Backed by GiveSendGo Charities.
              </h2>
              <p className="mt-5 text-lg leading-body text-cool-100">
                {site.entity.statement}
              </p>
              <p className="mt-4 text-sm leading-body text-cool-400">
                EIN {site.entity.ein}. GiveSendGo.com LLC, the crowdfunding
                platform, is a separate company and is not the recipient of
                gifts.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <CTA href={links.join} variant="gold">
                Join the Army — from $5/mo
              </CTA>
              <CTA href={links.charity} external variant="ghost-dark">
                Learn about GiveSendGo Charities
              </CTA>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
