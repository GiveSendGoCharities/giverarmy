import type { Metadata } from "next";
import { HandHeart, Megaphone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Container, CTA, SectionHeading } from "@/components/ui";
import { links, PRICE_LABEL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Enlist your crowd",
  description:
    "Have a crowd? Become a Giver Army champion: join as a giver, then rally your people to the crowdless.",
};

/**
 * Champions are fellow givers who rally their crowd — guides, never the hero,
 * never paid endorsers. Keep this page an ask, not an offer: join + rally.
 * No compensation language anywhere.
 */
const steps = [
  {
    title: "Join first",
    body: "Champions give before they ask. Enlist like every other giver — that's what makes your invitation honest.",
    Icon: HandHeart,
  },
  {
    title: "Rally your crowd",
    body: "Tell your people about the crowdless. Share a story, point them to the Army, and let the lives changed do the talking.",
    Icon: Megaphone,
  },
];

export default function EnlistYourCrowdPage() {
  return (
    <>
      <PageHero
        eyebrow="Champions"
        title="Have a crowd? Bring them."
        intro="Some givers come with a following — artists, athletes, everyday voices. Champions aren't the story. They point their crowd at the people who have none."
      />

      <section className="bg-cream-warm py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Two steps"
            title="Join. Then rally."
          />
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {steps.map((step, i) => (
              <div key={step.title} className="surface-card flex flex-col p-7">
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-tint3 text-gold-deep"
                    aria-hidden
                  >
                    <step.Icon size={20} />
                  </span>
                  <span className="display text-2xl text-cool-200">
                    0{i + 1}
                  </span>
                </div>
                <h2 className="heading mt-5 text-xl text-slate-ink">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm leading-body text-slate-400">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <CTA href={links.join} variant="gold">
              Join the Army — {PRICE_LABEL}
            </CTA>
            <CTA href={links.contact} external variant="ghost">
              Talk to the team
            </CTA>
          </div>
          <p className="mx-auto mt-6 max-w-md text-center text-xs leading-body text-slate-400">
            Champions are volunteers and fellow givers. The story is always the
            lives changed — never the platform of the person telling it.
          </p>
        </Container>
      </section>
    </>
  );
}
