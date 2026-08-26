import { ProfileImage } from "@/components/public/profile-image";
import { safeHref } from "@/lib/validations/url";
import type { BlockRendererProps } from "./types";

const RATIO = {
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
  none: undefined,
} as const;

export function ProjectsBlock({ props }: BlockRendererProps<"projects">) {
  const items = props.items.filter((item) => item.name.trim());
  if (items.length === 0) return null;

  const aspectRatio = RATIO[props.imageRatio];

  return (
    <div>
      {props.heading.trim() ? (
        <h2 className="profile-heading">{props.heading}</h2>
      ) : null}

      <div
        className="profile-projects"
        data-layout={props.layout}
        data-columns={String(props.columns)}
      >
        {items.map((item) => {
          const href = safeHref(item.url);
          // A card with a link is an anchor; one without is a plain div, rather
          // than an anchor with no href that a keyboard user can still reach.
          const Tag = href ? "a" : "div";

          return (
            <Tag
              key={item.id || item.name}
              className="profile-project"
              {...(href
                ? { href, target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {aspectRatio && item.imageUrl.trim() ? (
                <div className="profile-project-media" style={{ aspectRatio }}>
                  <ProfileImage
                    src={item.imageUrl}
                    alt={item.name}
                    width={720}
                    height={480}
                    sizes="(max-width: 640px) 90vw, 360px"
                  />
                </div>
              ) : null}

              <h3 className="profile-project-name">{item.name}</h3>

              {props.showDescription && item.description.trim() ? (
                <p className="profile-project-description">{item.description}</p>
              ) : null}

              {props.showTags && item.tags.length > 0 ? (
                <ul className="profile-tags">
                  {item.tags.map((tag) => (
                    <li key={tag} className="profile-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
