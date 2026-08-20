import NextImage from "next/image";
import { safeImageSrc } from "@/lib/validations/url";

/**
 * An image on a public profile.
 *
 * Users upload to Supabase Storage, but they can also paste a URL from
 * anywhere. `next/image` refuses any host not listed in next.config.ts, so this
 * routes optimizable hosts through it and everything else through a plain <img>
 * with lazy loading — rather than crashing the page on an unexpected domain.
 *
 * The src is re-validated here even though it was validated on write: rows
 * written by an earlier schema outlive that check.
 */
const OPTIMIZABLE_HOSTS = [
  /(^|\.)supabase\.co$/i,
  /^lh3\.googleusercontent\.com$/i,
];

function isOptimizable(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return OPTIMIZABLE_HOSTS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

type Props = {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Passed through to the element's style, e.g. object-fit overrides. */
  style?: React.CSSProperties;
  /** data-* hooks, used by the CSS to size avatars and gallery tiles. */
  [key: `data-${string}`]: string | undefined;
};

export function ProfileImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
  style,
  ...rest
}: Props) {
  const safe = safeImageSrc(src);
  if (!safe) return null;

  if (isOptimizable(safe)) {
    return (
      <NextImage
        src={safe}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        style={style}
        {...rest}
      />
    );
  }

  // An arbitrary host: next/image would throw rather than render it, so this
  // path falls back to a plain lazy <img>.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safe}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={style}
      {...rest}
    />
  );
}
