/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Pages does not run the default Next.js image optimizer.
    // Keeping images unoptimized keeps <Image> working at the edge; swap to a
    // Cloudflare image loader later if/when real raster art is added.
    unoptimized: true,
  },
  // Giver Army member dashboard lives on givesendgo.org (GiveSendGo
  // Charities). giver.army forwards members there; one sign-in, one domain.
  // Temporary (307) so the targets can change without browser caching.
  // /join itself stays the enlist page below; only /join/<code> forwards.
  async redirects() {
    const DASH = "https://givesendgo.org/giverarmy";
    const ORG = "https://givesendgo.org";
    return [
      { source: "/dashboard", destination: DASH, permanent: false },
      { source: "/dashboard/:path*", destination: `${DASH}/:path*`, permanent: false },
      { source: "/login", destination: `${DASH}/login`, permanent: false },
      { source: "/signin", destination: `${DASH}/login`, permanent: false },
      { source: "/members", destination: DASH, permanent: false },
      // Personal links: credited through the existing referral route.
      { source: "/join/:code", destination: `${ORG}/r/:code?to=/join`, permanent: false },
      { source: "/give/:code", destination: `${ORG}/r/:code?to=/give`, permanent: false },
      { source: "/r/:code", destination: `${ORG}/r/:code`, permanent: false },
    ];
  },
  async rewrites() {
    return [
      // v7.3 story-led landing page (self-contained HTML in public/).
      // /join is taken by a platform-level redirect to the payment flow, so
      // this lives at /enlist. Candidate to replace the homepage; promote by
      // adding { source: "/", destination: "/enlist.html" } here.
      { source: "/enlist", destination: "/enlist.html" },
      // A/B variant B: same page, pathname-detected — shows the GiverArmyFund
      // campaign's hosted donate widget instead of the Stripe widget.
      { source: "/join", destination: "/enlist.html" },
    ];
  },
};

export default nextConfig;
