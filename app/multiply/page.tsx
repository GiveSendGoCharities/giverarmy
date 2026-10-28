import type { Metadata } from "next";
import { Church, Share2, Users, HandHeart } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Container, CTA, SectionHeading } from "@/components/ui";
import { NewsletterForm } from "@/components/NewsletterForm";
import { ChampionsBand } from "@/components/ChampionsBand";
import { links, PRICE_LABEL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Multiply",
  description:
    "Give leads — then you multiply. Pray, share, and recruit to grow the crowd around the crowdless, and join the Giver Army Dispatch.",
};

const ways = [
  {
    title: "Pray",
    body: "Lift up the people behind the stories by name. Generosity starts on your knees before it shows up in a bank account. Make the crowdless part of your daily prayers.",
    Icon: Church,
  },
  {
    title: "Share",
    body: "Pass a story along to your people. Every share pulls another person into the crowd around someone who had none — and shapes a culture of generosity.",
    Icon: Share2,
  },
  {
    title: "Recruit",
    body: "Invite a friend to enlist for as little as $5 a month. Two givers become four; four become a movement. Recruiting is how the crowd outgrows the need.",
    Icon: Users,
  },
];

export default function MultiplyPage() {
  return (
    <>
      <PageHero
        eyebrow="Multiply"
        title="Give leads. Then you multiply."
        intro="Giving is the direct way in. Prayer, sharing, and recruiting multiply what your gift begins — until the crowd outgrows the need."
      >
        <CTA href={links.give} external variant="gold">
          Give now
        </CTA>
      </PageHero>

      {/* The three transitional CTAs */}
      <section className="bg-cream-warm py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Three ways to multiply"
            title="Pray. Share. Recruit."
            intro="The transitional steps that turn a single gift into a movement."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {ways.map((w) => (
              <div key={w.title} className="surface-card flex flex-col p-7">
                <span
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-tint3 text-gold-deep"
                  aria-hidden
                >
                  <w.Icon size={22} />
                </span>
                <h3 className="heading mt-5 text-xl text-slate-ink">
                  {w.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-body text-slate-400">
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Give — the direct CTA reminder */}
      <section className="bg-cream py-16 sm:py-20">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-card bg-gold-base p-8 text-slate-ink shadow-gold sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex items-start gap-4">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-ink/10"
                aria-hidden
              >
                <HandHeart size={24} />
              </span>
              <div>
                <h2 className="heading text-2xl">Give is where it starts.</h2>
                <p className="mt-1 max-w-md text-[0.95rem] leading-body text-slate-ink/80">
                  Multiplying matters most when it&apos;s built on giving. Fund
                  the crowdless first.
                </p>
              </div>
            </div>
            <CTA
              href={links.join}
              variant="ghost"
              className="!border-slate-ink/30 !bg-slate-ink !text-white hover:!border-slate-ink hover:!text-gold-bright"
            >
              Join the Army — {PRICE_LABEL}
            </CTA>
          </div>
        </Container>
      </section>

      {/* Rally your crowd — champions */}
      <ChampionsBand />

      {/* Dispatch newsletter signup */}
      <section className="bg-slate-ink py-20 sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading
              eyebrow="The Dispatch"
              title="Join the Giver Army Dispatch."
              intro="Stories, impact updates, and the people your generosity reached — straight to your inbox. No noise. Just the receipts."
              tone="light"
              align="center"
            />
            <div className="mx-auto mt-8 max-w-lg text-left">
              <NewsletterForm tone="dark" />
              <p className="mt-3 text-center text-xs text-cool-400">
                We&apos;ll never sell your email. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
