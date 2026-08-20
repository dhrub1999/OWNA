import { ExternalLink } from "lucide-react";
import { EmbedFrame } from "@/components/public/embed-frame";
import { resolveEmbed } from "@/lib/blocks/embeds/providers";
import { safeHref } from "@/lib/validations/url";
import type { BlockRendererProps } from "./types";

export function EmbedBlock({ props }: BlockRendererProps<"embed">) {
  const embed = resolveEmbed(props.url);

  // A URL we do not have a provider for is never framed. It degrades to a plain
  // link, which is the only safe thing to do with an arbitrary host.
  if (!embed) {
    const href = safeHref(props.url);
    if (!href) return null;

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="profile-button"
        data-variant="outline"
        data-size="md"
      >
        <span>{props.title.trim() || "Open link"}</span>
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
    );
  }

  const title = props.title.trim() || embed.defaultTitle;

  return (
    <div>
      {props.heading.trim() ? (
        <h2 className="profile-heading">{props.heading}</h2>
      ) : null}
      <EmbedFrame embed={embed} title={title} />
    </div>
  );
}
