import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { ProfileImage } from "@/components/public/profile-image";
import { BENTO_INTRINSIC_SIZE, objectPositionFor } from "@/lib/blocks/gallery";
import type { BlockRendererProps } from "./types";

export function GalleryBlock({ props }: BlockRendererProps<"gallery">) {
  const allImages = props.images.filter((image) => image.url.trim());
  const isBento = props.layout === "bento";
  // Bento only ever displays the first 6 — the rest stay stored/editable and
  // reappear the moment the layout switches back to grid/masonry.
  const images = isBento ? allImages.slice(0, 6) : allImages;
  if (images.length === 0) return null;

  const grid = (
    <ul
      className="profile-gallery"
      data-layout={props.layout}
      data-columns={isBento ? undefined : String(props.columns)}
      data-count={isBento ? String(images.length) : undefined}
      style={
        {
          gap: `${props.gap}px`,
          "--gallery-gap": `${props.gap}px`,
        } as React.CSSProperties
      }
    >
      {images.map((image, index) => {
        const size = isBento ? BENTO_INTRINSIC_SIZE[image.shape] : { width: 900, height: 900 };
        const style = isBento
          ? ({ objectPosition: objectPositionFor(image.position) } as React.CSSProperties)
          : undefined;

        return (
          <li
            key={image.id || image.url}
            className="profile-gallery-item"
            data-shape={isBento ? image.shape : undefined}
          >
            {props.lightbox ? (
              <button
                type="button"
                data-gallery-index={index}
                className="profile-gallery-trigger cursor-zoom-in"
                aria-label={
                  image.alt.trim()
                    ? `Enlarge: ${image.alt}`
                    : `Enlarge image ${index + 1} of ${images.length}`
                }
              >
                <ProfileImage
                  src={image.url}
                  alt={image.alt}
                  width={size.width}
                  height={size.height}
                  style={style}
                  sizes="(max-width: 640px) 45vw, 260px"
                />
              </button>
            ) : (
              <ProfileImage
                src={image.url}
                alt={image.alt}
                width={size.width}
                height={size.height}
                style={style}
                sizes="(max-width: 640px) 45vw, 260px"
              />
            )}
            {props.showCaptions && image.caption.trim() ? (
              <p className="profile-caption">{image.caption}</p>
            ) : null}
          </li>
        );
      })}
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
