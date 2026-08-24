import type { NextConfig } from "next";

/**
 * Hosts we allow to be embedded in an <iframe> by the Embed block.
 * Keep this in sync with the provider registry in lib/blocks/embeds/providers.ts —
 * a provider that is not listed here will be blocked by the CSP at runtime.
 */
const EMBED_FRAME_SRC = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://open.spotify.com",
].join(" ");

/**
 * Security headers applied to every route.
 *
 * Note: `script-src` is deliberately omitted. Locking it down properly requires
 * per-request nonces, which forces every page to be dynamic and defeats the
 * static shell that public profiles depend on. The directives below close the
 * injection vectors that actually apply to us: we never render user HTML, and
 * user-supplied values only ever reach the DOM as text or as validated inline
 * style custom properties.
 */

const mediaSrc =
  process.env.NODE_ENV === "development"
    ? "media-src 'self' http: https:"
    : "media-src 'self' https:";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      `frame-src 'self' ${EMBED_FRAME_SRC}`,
      "img-src 'self' data: blob: https:",
      // "media-src 'self' https:",
      mediaSrc,
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Opt in to the Next.js 16 Cache Components model. Public profile reads are
  // wrapped in `use cache` + cacheTag and invalidated on publish, so a profile
  // page is served from the static shell until its owner republishes.
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Google account avatars, used when a user signs in with Google.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
