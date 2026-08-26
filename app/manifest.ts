import type { MetadataRoute } from "next";

/**
 * Web app manifest.
 *
 * `display: "browser"` rather than "standalone" — OWNA has no installed-app
 * experience to offer (no offline mode, no native-feeling chrome), so
 * promising one via the manifest would just be a broken "Install" prompt.
 * This exists for the metadata (name, theme color) browsers and share sheets
 * read from it regardless of installability.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OWNA",
    short_name: "OWNA",
    description: "Build a personal page that actually looks like you.",
    start_url: "/",
    display: "browser",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
