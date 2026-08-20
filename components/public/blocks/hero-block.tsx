import { MapPin } from "lucide-react";
import { ProfileImage } from "@/components/public/profile-image";
import type { BlockRendererProps } from "./types";

/**
 * The hero.
 *
 * Every text field falls back to the profile's own value when left blank, so
 * renaming yourself in settings updates the page unless you deliberately typed
 * something different here.
 */
export function HeroBlock({ props, context }: BlockRendererProps<"hero">) {
  const { profile } = context;

  const name = props.headline.trim() || profile.displayName.trim() || profile.username;
  const tagline = props.tagline.trim() || profile.status.trim();
  const bio = props.bio.trim() || profile.bio.trim();
  const avatar = props.avatarUrl.trim() || profile.avatarUrl.trim();
  const location = props.location.trim() || profile.location.trim();
  const status = props.status.trim();

  return (
    <div className="profile-hero" data-align={props.align}>
      {props.showAvatar && avatar ? (
        <ProfileImage
          src={avatar}
          alt=""
          width={264}
          height={264}
          sizes="(max-width: 640px) 40vw, 160px"
          priority
          className="profile-avatar"
          // The rendered size is fixed by CSS; the intrinsic size above only
          // drives the srcset, and 2x of the largest avatar is 264px.
          style={undefined}
          {...{ "data-size": props.avatarSize }}
        />
      ) : null}

      <div className="flex flex-col gap-1.5">
        <h1 className="profile-hero-name">{name}</h1>
        {props.showUsername ? (
          <p className="profile-muted" style={{ fontSize: "var(--p-text-sm)" }}>
            @{profile.username}
          </p>
        ) : null}
      </div>

      {tagline ? <p className="profile-hero-tagline">{tagline}</p> : null}
      {bio ? <p className="profile-hero-bio">{bio}</p> : null}

      {status || location ? (
        <div className="profile-hero-meta">
          {status ? (
            <span className="profile-chip">
              <span
                aria-hidden="true"
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: "var(--p-accent)" }}
              />
              {status}
            </span>
          ) : null}
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" />
              {location}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
