import { ImageResponse } from "next/og";
import { snapshotSeo } from "@/lib/blocks/snapshot";
import { getPublishedProfile } from "@/lib/supabase/queries";

export const alt = "Profile preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The social preview card.
 *
 * Drawn from the profile's own theme, so a shared link looks like the page it
 * points at rather than like generic platform branding. A user who uploaded
 * their own preview image gets that instead — this only fills the gap.
 *
 * Only the palette and the text are used. Custom fonts would mean fetching and
 * embedding a font file per render, which is not worth the latency for an image
 * that is scraped once and then cached by the platform showing it.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const snapshot = await getPublishedProfile(username);

  if (!snapshot) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0b",
            color: "#fafafa",
            fontSize: 56,
          }}
        >
          OWNA
        </div>
      ),
      size,
    );
  }

  const { colors, background } = snapshot.theme;
  const { name, description } = snapshotSeo(snapshot);

  const canvas =
    background.kind === "gradient"
      ? `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`
      : colors.background;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background: canvas,
          color: colors.foreground,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 26,
              color: colors.muted,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: colors.accent,
              }}
            />
            @{snapshot.profile.username}
          </div>

          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>

          {description ? (
            <div
              style={{
                fontSize: 32,
                color: colors.muted,
                lineHeight: 1.35,
                // ImageResponse has no line clamp, so the text is trimmed here.
                maxWidth: 900,
              }}
            >
              {description.length > 140
                ? `${description.slice(0, 140).trimEnd()}…`
                : description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: colors.muted,
          }}
        >
          <span>owna.online/{snapshot.profile.username}</span>
          <span style={{ color: colors.accent, fontWeight: 600 }}>OWNA</span>
        </div>
      </div>
    ),
    size,
  );
}
