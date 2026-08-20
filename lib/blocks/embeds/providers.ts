/**
 * Third-party embeds.
 *
 * The rule this module exists to enforce: an iframe `src` is never a value the
 * user supplied. The user supplies a page URL, we match it against a strict
 * per-provider pattern, pull out an id that can only contain [A-Za-z0-9_-], and
 * build the src ourselves from a fixed template.
 *
 * Anything that does not match a provider renders as a plain link instead of an
 * iframe, so a paste of `javascript:...` or an attacker-controlled host has no
 * path to becoming a frame.
 *
 * Hosts produced here must also appear in the `frame-src` allowlist in
 * next.config.ts, or the browser will block them.
 */

export type EmbedProviderId = "youtube" | "spotify";

export type ResolvedEmbed = {
  provider: EmbedProviderId;
  providerLabel: string;
  /** Built by us, from a fixed template. */
  src: string;
  /** The original page, used for the click-to-load facade and the fallback link. */
  href: string;
  /** CSS aspect-ratio value, or null when the embed has a fixed height. */
  aspectRatio: string | null;
  /** Fixed height in px, for players that do not scale. */
  height: number | null;
  /** Permissions granted to the frame. Deliberately minimal. */
  allow: string;
  defaultTitle: string;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_LIST_ID = /^[A-Za-z0-9_-]{12,42}$/;
const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const SPOTIFY_KINDS = ["track", "album", "playlist", "artist", "episode", "show"] as const;
type SpotifyKind = (typeof SPOTIFY_KINDS)[number];

/** Spotify's own recommended heights. A track player does not scale. */
const SPOTIFY_HEIGHTS: Record<SpotifyKind, number> = {
  track: 152,
  episode: 152,
  album: 352,
  playlist: 352,
  artist: 352,
  show: 352,
};

function parseUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function host(url: URL): string {
  return url.hostname.replace(/^www\./, "").toLowerCase();
}

function resolveYouTube(url: URL): ResolvedEmbed | null {
  const h = host(url);
  const segments = url.pathname.split("/").filter(Boolean);

  let videoId: string | null = null;
  let listId: string | null = null;

  if (h === "youtu.be") {
    videoId = segments[0] ?? null;
  } else if (h === "youtube.com" || h === "m.youtube.com" || h === "youtube-nocookie.com") {
    if (segments[0] === "watch") videoId = url.searchParams.get("v");
    else if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live")
      videoId = segments[1] ?? null;
    else if (segments[0] === "playlist") listId = url.searchParams.get("list");
  } else {
    return null;
  }

  if (!listId) listId = url.searchParams.get("list");

  if (videoId && YOUTUBE_ID.test(videoId)) {
    return {
      provider: "youtube",
      providerLabel: "YouTube",
      // youtube-nocookie.com does not set tracking cookies until playback.
      src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      href: `https://www.youtube.com/watch?v=${videoId}`,
      aspectRatio: "16 / 9",
      height: null,
      allow: "accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share",
      defaultTitle: "YouTube video",
    };
  }

  if (listId && YOUTUBE_LIST_ID.test(listId)) {
    return {
      provider: "youtube",
      providerLabel: "YouTube",
      src: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`,
      href: `https://www.youtube.com/playlist?list=${listId}`,
      aspectRatio: "16 / 9",
      height: null,
      allow: "accelerometer; clipboard-write; encrypted-media; picture-in-picture; web-share",
      defaultTitle: "YouTube playlist",
    };
  }

  return null;
}

function resolveSpotify(url: URL): ResolvedEmbed | null {
  if (host(url) !== "open.spotify.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  // Locale-prefixed URLs look like /intl-de/track/<id>.
  const offset = segments[0]?.startsWith("intl-") ? 1 : 0;
  const kind = segments[offset];
  const id = segments[offset + 1];

  if (!kind || !id) return null;
  if (!(SPOTIFY_KINDS as readonly string[]).includes(kind)) return null;
  if (!SPOTIFY_ID.test(id)) return null;

  const typed = kind as SpotifyKind;

  return {
    provider: "spotify",
    providerLabel: "Spotify",
    src: `https://open.spotify.com/embed/${typed}/${id}`,
    href: `https://open.spotify.com/${typed}/${id}`,
    aspectRatio: null,
    height: SPOTIFY_HEIGHTS[typed],
    allow: "clipboard-write; encrypted-media; fullscreen; picture-in-picture",
    defaultTitle: `Spotify ${typed}`,
  };
}

const RESOLVERS = [resolveYouTube, resolveSpotify];

/** Resolve a pasted URL to a safe embed, or null if we do not support it. */
export function resolveEmbed(raw: string | null | undefined): ResolvedEmbed | null {
  if (!raw) return null;
  const url = parseUrl(raw);
  if (!url) return null;

  for (const resolve of RESOLVERS) {
    const resolved = resolve(url);
    if (resolved) return resolved;
  }
  return null;
}

export const SUPPORTED_EMBEDS = [
  { id: "youtube" as const, label: "YouTube", example: "youtube.com/watch?v=…" },
  { id: "spotify" as const, label: "Spotify", example: "open.spotify.com/track/…" },
];
