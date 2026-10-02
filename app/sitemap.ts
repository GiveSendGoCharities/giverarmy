import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Individual stories link out to givesendgo.org, so only our own pages here.
  const routes = [
    "",
    "/movement",
    "/stories",
    "/impact",
    "/multiply",
    "/enlist-your-crowd",
    "/about",
    "/privacy",
    "/terms",
    "/enlist",
  ];
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
