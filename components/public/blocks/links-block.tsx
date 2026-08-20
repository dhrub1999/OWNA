import { ArrowUpRight } from "lucide-react";
import { safeHref } from "@/lib/validations/url";
import type { BlockRendererProps } from "./types";

/** Custom link buttons — the link-in-bio staple. */
export function LinksBlock({ props }: BlockRendererProps<"links">) {
  const items = props.items
    .map((item) => ({ ...item, href: safeHref(item.url) }))
    .filter((item) => item.href && item.label.trim());

  if (items.length === 0) return null;

  return (
    <div>
      {props.heading.trim() ? (
        <h2 className="profile-heading">{props.heading}</h2>
      ) : null}
      <ul className="profile-links" data-layout={props.layout}>
        {items.map((item) => (
          <li key={item.id || item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-button profile-link"
              data-variant={props.style}
              data-size={props.size}
            >
              <span className="profile-link-text">
                <span className="truncate">{item.label}</span>
                {item.description.trim() ? (
                  <span className="profile-link-description truncate">
                    {item.description}
                  </span>
                ) : null}
              </span>
              {props.showArrow ? (
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 opacity-60" />
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
