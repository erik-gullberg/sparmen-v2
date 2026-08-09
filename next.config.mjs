import nextBundleAnalyzer from "@next/bundle-analyzer";
import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serwist/bundle-analyzer inject a `webpack` config. Next 16 dev defaults to
  // Turbopack; declaring an (empty) turbopack config acknowledges that and
  // silences the "webpack config with no turbopack config" error. Production
  // builds still run under webpack (see the `--webpack` build script) so the
  // service worker is compiled by Serwist.
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Enable experimental features for better performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ["lucide-react"],
  },
  // Optimize production builds
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  // Optimize for static generation
  reactProductionProfiling: false,
  // Better cache headers
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/song/:id*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/spex/:id*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/top-songs",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Serwist compiles src/sw.js separately from Next's bundler, so it works under
// both Turbopack and webpack. Caching rules + offline fallback live in src/sw.js.
const withSerwist = withSerwistInit({
  swSrc: "src/sw.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

// @next/bundle-analyzer always injects a `webpack` config, which makes Next 16's
// default Turbopack dev server error out. Only wrap with it when actually
// analyzing (that script runs with --webpack), so `next dev` stays on Turbopack.
const config =
  process.env.ANALYZE === "true"
    ? withSerwist(withBundleAnalyzer(nextConfig))
    : withSerwist(nextConfig);

export default config;
