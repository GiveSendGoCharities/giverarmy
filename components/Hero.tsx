import { Container, CTA, Eyebrow } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { links, PRICE_LABEL } from "@/lib/links";

/**
 * Signature hero — winged emblem against a slate surface with a soft radial
 * Antique-Gold glow. This is the page's memorable moment; boldness is
 * concentrated here.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-ink">
      {/* Radial gold glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-hero-glow"
        aria-hidden
      />
      <Container className="relative">
        <div className="flex flex-col items-center py-20 text-center sm:py-28">
          {/* Winged emblem mark */}
          <div className="animate-fade-up">
            <Logo
              variant="light"
              className="mx-auto h-12 w-auto sm:h-14"
            />
          </div>

          <Eyebrow tone="light" className="mt-8">
            A movement of GiveSendGo Charities
          </Eyebrow>

          <h1 className="display mt-6 max-w-4xl text-4xl text-white sm:text-6xl lg:text-7xl">
            You were made to be a{" "}
            <span className="text-gold-base">giver</span>.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-body text-cool-100 sm:text-xl">
            Some people face their hardest moment with no crowd behind them.
            Giver Army is a movement of everyday givers who fund them, follow
            their stories, and share the hope of Jesus through generosity.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <CTA href={links.join} variant="gold">
              Join the Army — {PRICE_LABEL}
            </CTA>
            <CTA href={links.give} external variant="ghost-dark">
              Give once
            </CTA>
          </div>

          <p className="mt-8 text-base font-semibold text-gold-bright">
            Find your crowd. Fund the crowdless.
          </p>
        </div>
      </Container>
    </section>
  );
}
