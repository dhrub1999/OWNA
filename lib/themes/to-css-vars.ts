import type { CSSProperties } from "react";
import { safeImageSrc } from "@/lib/validations/url";
import { fontFamily } from "./fonts";
import type { Layout, Theme } from "./schema";

/**
 * Turns a validated theme into CSS custom properties.
 *
 * The result is applied as an inline `style` object on the profile root — not
 * as an injected <style> tag and not as a generated stylesheet. That matters
 * for three reasons:
 *
 *   * there is no string interpolation into a CSS parser, so a theme cannot
 *     carry an injection even if a value somehow slipped past Zod;
 *   * it works under a CSP without needing a nonce, which in turn is what lets
 *     a public profile stay in the static shell;
 *   * the editor's live preview updates by handing React a new object, with no
 *     stylesheet churn and no flash.
 */
export type CSSVars = CSSProperties & Record<`--${string}`, string>;

/** Type ramp, in rem, before the user's scale multiplier is applied. */
const TYPE_RAMP = {
  xs: 0.75,
  sm: 0.875,
  base: 1,
  lg: 1.125,
  xl: 1.375,
  "2xl": 1.75,
  "3xl": 2.25,
  "4xl": 3,
} as const;

const SHADOWS = {
  none: "none",
  soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)",
  medium: "0 2px 4px rgb(0 0 0 / 0.06), 0 16px 40px -16px rgb(0 0 0 / 0.20)",
  hard: "0 4px 0 0 currentColor",
} as const;

export const LAYOUT_WIDTHS = {
  narrow: "34rem",
  default: "42rem",
  wide: "56rem",
  full: "100%",
} as const;

/** Percentage (0–100) to a two-digit hex alpha suffix. */
function alphaHex(percent: number): string {
  const clamped = Math.min(100, Math.max(0, percent));
  return Math.round((clamped / 100) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** A hex colour with an alpha channel applied, e.g. #2563eb + 40% -> #2563eb66. */
function withAlpha(hex: string, percent: number): string {
  const base = hex.length === 9 ? hex.slice(0, 7) : hex;
  return `${base}${alphaHex(percent)}`;
}

/**
 * Wrap a user-supplied image URL in a `url()`.
 *
 * safeImageSrc already restricts the protocol and round-trips through the URL
 * parser, which percent-encodes quotes. The extra character check below is
 * belt-and-braces: a URL that still contains anything able to terminate a
 * CSS token is dropped rather than escaped, because there is no legitimate
 * image URL that needs those characters.
 */
function cssUrl(input: string | null | undefined): string | null {
  const src = safeImageSrc(input);
  if (!src) return null;
  if (/["'()\;\s]/.test(src)) return null;
  return `url("${src}")`;
}

/** Background patterns are generated here, from the theme's own colours. */
function patternImage(
  pattern: "dots" | "grid" | "diagonal" | "noise",
  color: string,
): string {
  switch (pattern) {
    case "dots":
      return `radial-gradient(${color} 1px, transparent 1px)`;
    case "grid":
      return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
    case "diagonal":
      return `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px 10px)`;
    case "noise":
      return `radial-gradient(${color} 0.5px, transparent 0.5px), radial-gradient(${color} 0.5px, transparent 0.5px)`;
  }
}

const PATTERN_SIZES = {
  dots: "16px 16px",
  grid: "24px 24px",
  diagonal: "14px 14px",
  noise: "7px 7px, 13px 13px",
} as const;

export function themeToCssVars(theme: Theme, layout: Layout): CSSVars {
  const { colors, typography, radius, spacing, background, effects } = theme;

  const vars: Record<string, string> = {
    "--p-bg": colors.background,
    "--p-fg": colors.foreground,
    "--p-muted": colors.muted,
    "--p-accent": colors.accent,
    "--p-accent-fg": colors.accentForeground,
    "--p-card": colors.card,
    "--p-card-fg": colors.cardForeground,
    "--p-border": colors.border,
    "--p-btn": colors.button,
    "--p-btn-fg": colors.buttonForeground,

    "--p-font-heading": fontFamily(typography.headingFont),
    "--p-font-body": fontFamily(typography.bodyFont),
    "--p-weight-heading": typography.headingWeight,
    "--p-weight-body": typography.bodyWeight,
    "--p-tracking-heading": `${typography.letterSpacing}em`,

    "--p-radius": `${radius.base}px`,
    "--p-radius-btn": `${radius.button}px`,
    "--p-radius-img": `${radius.image}px`,
    "--p-radius-card": `${radius.card}px`,
    "--p-radius-avatar":
      radius.avatar === "circle"
        ? "9999px"
        : radius.avatar === "rounded"
          ? `${radius.image}px`
          : "0px",

    "--p-pad": `${spacing.padding}px`,
    "--p-gap": `${spacing.block}px`,
    "--p-section": `${spacing.section}px`,

    "--p-shadow": SHADOWS[effects.shadow],
    "--p-card-border": effects.cardBorder ? "1px" : "0px",
    "--p-card-blur": effects.glass ? "12px" : "0px",
    "--p-card-bg": effects.glass ? withAlpha(colors.card, 55) : colors.card,

    "--p-width": LAYOUT_WIDTHS[layout.width],
    "--p-align": layout.align === "center" ? "center" : "left",
    "--p-items": layout.align === "center" ? "center" : "flex-start",
  };

  for (const [name, rem] of Object.entries(TYPE_RAMP)) {
    // Body copy stays close to its base size while headings take the full
    // multiplier, so turning the scale up enlarges the page without making
    // paragraphs unreadable.
    const weighted = name === "xs" || name === "sm" || name === "base"
      ? 1 + (typography.scale - 1) * 0.4
      : typography.scale;
    vars[`--p-text-${name}`] = `${(rem * weighted).toFixed(4)}rem`;
  }

  switch (background.kind) {
    case "solid": {
      vars["--p-page-bg"] = colors.background;
      vars["--p-page-image"] = "none";
      vars["--p-page-size"] = "auto";
      break;
    }
    case "gradient": {
      vars["--p-page-bg"] = background.from;
      vars["--p-page-image"] =
        `linear-gradient(${background.angle}deg, ${background.from}, ${background.to})`;
      vars["--p-page-size"] = "cover";
      break;
    }
    case "image": {
      const url = cssUrl(background.url);
      vars["--p-page-bg"] = colors.background;
      // The overlay is a gradient of the background colour laid over the photo,
      // which is what keeps text readable on top of an arbitrary image.
      vars["--p-page-image"] = url
        ? `linear-gradient(${withAlpha(colors.background, background.overlay)}, ${withAlpha(colors.background, background.overlay)}), ${url}`
        : "none";
      vars["--p-page-size"] = "cover";
      vars["--p-page-blur"] = `${background.blur}px`;
      break;
    }
    case "pattern": {
      vars["--p-page-bg"] = colors.background;
      vars["--p-page-image"] = patternImage(
        background.pattern,
        withAlpha(colors.foreground, background.opacity),
      );
      vars["--p-page-size"] = PATTERN_SIZES[background.pattern];
      break;
    }
  }

  return vars as CSSVars;
}
