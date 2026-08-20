"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { ResolvedEmbed } from "@/lib/blocks/embeds/providers";

/**
 * A click-to-load facade in front of a third-party iframe.
 *
 * Embedding a player eagerly costs several hundred kilobytes and a set of
 * third-party cookies before the visitor has asked for anything. The facade is
 * a button; the iframe only exists after someone decides they want it.
 *
 * The `src` is not user data — it is built from a fixed template by
 * lib/blocks/embeds/providers.ts — but the frame is still sandboxed to the
 * capabilities a player actually needs.
 */
export function EmbedFrame({
  embed,
  title,
}: {
  embed: ResolvedEmbed;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);

  const frameStyle = embed.aspectRatio
    ? { aspectRatio: embed.aspectRatio, width: "100%" }
    : { height: `${embed.height}px`, width: "100%" };

  if (!loaded) {
    return (
      <button
        type="button"
        className="profile-embed-facade"
        style={frameStyle}
        onClick={() => setLoaded(true)}
      >
        <Play aria-hidden="true" className="size-5" />
        <span>Play on {embed.providerLabel}</span>
      </button>
    );
  }

  return (
    <iframe
      src={embed.src}
      title={title}
      className="profile-embed"
      style={frameStyle}
      allow={embed.allow}
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
