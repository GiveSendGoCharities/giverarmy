/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Pages does not run the default Next.js image optimizer.
    // Keeping images unoptimized keeps <Image> working at the edge; swap to a
    // Cloudflare image loader later if/when real raster art is added.
    unoptimized: true,
  },
  async rewrites() {
    return [
      // v7.3 story-led landing page (self-contained HTML in public/).
      // Candidate to replace the homepage; promote by adding
      // { source: "/", destination: "/join.html" } here.
      { source: "/join", destination: "/join.html" },
    ];
  },
};

export default nextConfig;
