import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { ProfileImage } from "@/components/public/profile-image";
import type { BlockRendererProps } from "./types";

export function GalleryBlock({ props }: BlockRendererProps<"gallery">) {
  const images = props.images.filter((image) => image.url.trim());
  if (images.length === 0) return null;

  const grid = (
    <ul
      className="profile-gallery"
      data-layout={props.layout}
      data-columns={String(props.columns)}
      style={
        {
          gap: `${props.gap}px`,
          "--gallery-gap": `${props.gap}px`,
        } as React.CSSProperties
      }
    >
      {images.map((image, index) => (
        <li key={image.id || image.url} className="profile-gallery-item">
          {props.lightbox ? (
            <button
              type="button"
              data-gallery-index={index}
              className="block w-full cursor-zoom-in"
              aria-label={
                image.alt.trim()
                  ? `Enlarge: ${image.alt}`
                  : `Enlarge image ${index + 1} of ${images.length}`
              }
            >
              <ProfileImage
                src={image.url}
                alt={image.alt}
                width={900}
                height={900}
                sizes="(max-width: 640px) 45vw, 260px"
              />
            </button>
          ) : (
            <ProfileImage
              src={image.url}
              alt={image.alt}
              width={900}
              height={900}
              sizes="(max-width: 640px) 45vw, 260px"
            />
          )}
          {props.showCaptions && image.caption.trim() ? (
            <p className="profile-caption">{image.caption}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {props.heading.trim() ? (
        <h2 className="profile-heading">{props.heading}</h2>
      ) : null}
      {props.lightbox ? (
        <GalleryLightbox
          images={images.map((image) => ({
            url: image.url,
            alt: image.alt,
            caption: image.caption,
          }))}
        >
          {grid}
        </GalleryLightbox>
      ) : (
        grid
      )}
    </div>
  );
}
