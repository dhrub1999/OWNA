import { describe, expect, it } from "vitest";
import { resolveEmbed } from "@/lib/blocks/embeds/providers";

/**
 * The property under test is not "does it parse YouTube links" — it is that an
 * iframe src is only ever built by us, from an id matching a strict pattern.
 * Everything unrecognised must return null so the block falls back to a link.
 */
describe("embed resolution", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "youtube.com/watch?v=dQw4w9WgXcQ",
  ])("resolves %s to a nocookie embed", (url) => {
    const embed = resolveEmbed(url);
    expect(embed?.provider).toBe("youtube");
    expect(embed?.src).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0",
    );
  });

  it("resolves Spotify links and picks the height that player needs", () => {
    const track = resolveEmbed("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(track?.src).toBe("https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT");
    expect(track?.height).toBe(152);

    const playlist = resolveEmbed(
      "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
    );
    expect(playlist?.height).toBe(352);
  });

  it("handles Spotify's locale-prefixed URLs", () => {
    const embed = resolveEmbed(
      "https://open.spotify.com/intl-de/album/4cOdK2wGLETKBW3PvgPWqT",
    );
    expect(embed?.src).toBe("https://open.spotify.com/embed/album/4cOdK2wGLETKBW3PvgPWqT");
  });

  it("drops query parameters the user's link happened to carry", () => {
    const embed = resolveEmbed(
      "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123&utm_source=x",
    );
    expect(embed?.src).not.toContain("si=");
    expect(embed?.src).not.toContain("utm_source");
  });

  it.each([
    ["javascript:alert(1)", "not even a URL we would fetch"],
    ["https://evil.example.com/embed/x", "unknown host"],
    ["https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ", "lookalike host"],
    ["https://www.youtube.com/watch?v=../../etc", "id fails the pattern"],
    ["https://www.youtube.com/watch?v=short", "id is the wrong length"],
    ["https://open.spotify.com/track/tooshort", "id is the wrong length"],
    ["https://open.spotify.com/notakind/4cOdK2wGLETKBW3PvgPWqT", "unknown kind"],
    ["", "empty"],
  ])("refuses to frame %s (%s)", (url) => {
    expect(resolveEmbed(url)).toBeNull();
  });

  it("only ever produces hosts that the CSP frame-src allows", () => {
    const hosts = [
      resolveEmbed("https://youtu.be/dQw4w9WgXcQ")?.src,
      resolveEmbed("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")?.src,
    ].map((src) => new URL(src!).origin);

    expect(hosts).toEqual([
      "https://www.youtube-nocookie.com",
      "https://open.spotify.com",
    ]);
  });
});
