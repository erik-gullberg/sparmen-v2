import { defaultCache } from "@serwist/next/worker";
import {
  Serwist,
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from "serwist";

// Custom rules are matched before defaultCache (first match wins).
const runtimeCaching = [
  {
    // Song/spex pages are static — serve instantly from cache and refresh in
    // the background so a dead basement connection never blocks a page.
    matcher: /\/(song|spex)\/\d+/i,
    handler: new StaleWhileRevalidate({
      cacheName: "song-spex-pages",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 1000,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  {
    matcher: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
    handler: new NetworkFirst({
      cacheName: "supabase-api",
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 }),
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  },
  {
    matcher: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
    handler: new NetworkFirst({
      cacheName: "supabase-auth",
      networkTimeoutSeconds: 3,
    }),
  },
  {
    matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: new CacheFirst({
      cacheName: "images",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  // /offline is added explicitly so the document fallback below is precached.
  precacheEntries: [...self.__SW_MANIFEST, { url: "/offline", revision: null }],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
