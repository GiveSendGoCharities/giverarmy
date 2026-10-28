import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { StoriesBrowser } from "@/components/StoriesBrowser";
import { getStoryLineup } from "@/lib/liveStories";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Real receipts. Real lives. Real hope. Video testimonies of the crowdless finding a crowd, filterable by cause.",
};

export const revalidate = 1800; // ISR — pick up newly published stories

export default async function StoriesPage() {
  const stories = await getStoryLineup();
  return (
    <>
      <PageHero
        eyebrow="Stories"
        title="Real receipts. Real lives. Real hope."
        intro="Every story here is a life changed by a crowd that showed up. Filter by cause to see where generosity is reaching."
      />
      <section className="bg-cream-warm py-16 sm:py-20">
        <Container>
          <StoriesBrowser stories={stories} />
        </Container>
      </section>
    </>
  );
}
