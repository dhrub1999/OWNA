import { ProfileImage } from "@/components/public/profile-image";
import { safeHref } from "@/lib/validations/url";
import type { BlockRendererProps } from "./types";

const RATIO = {
  auto: undefined,
  "16:9": "16 / 9",
  "4:3": "4 / 3",
  "1:1": "1 / 1",
  "3:4": "3 / 4",
} as const;

const WIDTH = { full: "100%", inset: "80%", half: "50%" } as const;

export function ImageBlock({ props }: BlockRendererProps<"image">) {
  if (!props.url.trim()) return null;

  const aspectRatio = RATIO[props.ratio];
  const href = safeHref(props.href);

  const image = (
    <ProfileImage
      src={props.url}
      // An empty alt is correct for a decorative image: a screen reader skips
      // it rather than announcing a filename. The editor nudges for real alt
      // text, but never invents it.
      alt={props.alt}
      width={1600}
      height={1200}
      sizes="(max-width: 640px) 92vw, 640px"
      className="profile-image"
      style={
        aspectRatio ? { aspectRatio, objectFit: props.fit } : { objectFit: props.fit }
      }
    />
  );

  return (
    <figure style={{ width: WIDTH[props.width], margin: "0 auto" }}>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
      {props.caption.trim() ? (
        <figcaption className="profile-caption">{props.caption}</figcaption>
      ) : null}
    </figure>
  );
}
