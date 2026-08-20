"use client";

import { CheckCircle2 } from "lucide-react";
import { SUPPORTED_EMBEDS, resolveEmbed } from "@/lib/blocks/embeds/providers";
import { PanelSection, TextField } from "../controls";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function EmbedInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"embed">(block);
  const resolved = resolveEmbed(props.url);

  return (
    <PanelSection title="Embed">
      <TextField
        label="Heading"
        value={props.heading}
        onChange={(value) => set("heading", value)}
        placeholder="Optional"
        maxLength={120}
      />
      <TextField
        label="Link"
        value={props.url}
        onChange={(value) => set("url", value)}
        placeholder="open.spotify.com/track/…"
        // Anything we cannot match becomes a plain link rather than an iframe,
        // so this is information, not an error.
        warning={
          props.url.trim() && !resolved
            ? "Not a supported player — this will show as a link instead."
            : null
        }
      />

      {resolved ? (
        <p className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-500">
          <CheckCircle2 className="size-3" aria-hidden="true" />
          {resolved.providerLabel} player
        </p>
      ) : (
        <p className="text-muted-foreground text-[11px]">
          Works with {SUPPORTED_EMBEDS.map((embed) => embed.label).join(" and ")}.
        </p>
      )}

      <TextField
        label="Title"
        value={props.title}
        onChange={(value) => set("title", value)}
        placeholder={resolved?.defaultTitle ?? "Describe the embed"}
        hint="Read by screen readers"
        maxLength={120}
      />
    </PanelSection>
  );
}
