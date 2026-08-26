import { SocialIcon } from "@/components/icons/social-icons";
import { SOCIAL_META } from "@/lib/blocks/definitions";
import { resolveSocialHref } from "@/lib/blocks/social-links";
import type { BlockRendererProps } from "./types";

const ICON_SIZE = { sm: "1rem", md: "1.15rem", lg: "1.35rem" } as const;

export function SocialBlock({ props }: BlockRendererProps<"social">) {
  const links = props.links
    .map((link) => ({ ...link, href: resolveSocialHref(link.platform, link.url) }))
    .filter((link) => link.href);

  if (links.length === 0) return null;

  const isIconOnly = props.style === "icon";

  return (
    <div>
      {props.heading.trim() ? (
        <h2 className="profile-heading">{props.heading}</h2>
      ) : null}
      <ul
        className="profile-social"
        data-layout={props.layout}
        style={{
          justifyContent: props.layout === "row" ? "var(--p-justify)" : undefined,
        }}
      >
        {links.map((link) => {
          const meta = SOCIAL_META[link.platform];
          const label = link.label.trim() || meta.label;

          return (
            <li key={link.id || `${link.platform}-${link.url}`}>
              <a
                href={link.href}
                target="_blank"
                rel="me noopener noreferrer"
                className={
                  isIconOnly ? "profile-social-icon" : "profile-button"
                }
                data-shape={isIconOnly ? props.shape : undefined}
                data-size={props.size}
                data-variant={isIconOnly ? undefined : "outline"}
                // Icon-only links have no visible text, so the accessible name
                // has to come from somewhere. It is the platform, plus the
                // user's own label when they set one.
                aria-label={isIconOnly ? label : undefined}
              >
                <SocialIcon
                  platform={link.platform}
                  style={{ fontSize: ICON_SIZE[props.size] }}
                />
                {isIconOnly ? null : <span>{label}</span>}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
