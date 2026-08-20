/**
 * WCAG 2.1 contrast maths.
 *
 * Used to warn — never to override. The product promise is that customization
 * is not constrained, so the editor flags an unreadable pair and offers a fix
 * rather than refusing the colour.
 */

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;

type Rgb = { r: number; g: number; b: number };

/** Parse #rgb, #rrggbb or #rrggbbaa. Returns null for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  const value = hex.trim().replace(/^#/, "");

  // Length alone is not enough: "nonsense" is eight characters and would parse
  // to NaN channels, which then silently poison every ratio computed from it.
  if (!/^[0-9a-fA-F]+$/.test(value)) return null;

  if (value.length === 3) {
    const [r, g, b] = value.split("");
    return {
      r: parseInt(`${r}${r}`, 16),
      g: parseInt(`${g}${g}`, 16),
      b: parseInt(`${b}${b}`, 16),
    };
  }

  if (value.length === 6 || value.length === 8) {
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  return null;
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

/** Contrast ratio between two colours, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsAA(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= WCAG_AA_NORMAL;
}

/** Black or white, whichever is more readable on the given background. */
export function readableOn(background: string): string {
  return contrastRatio("#ffffff", background) >=
    contrastRatio("#000000", background)
    ? "#ffffff"
    : "#000000";
}

/**
 * Nudge `foreground` towards or away from `background` until it clears AA,
 * keeping its hue. Returns the original colour if the two are so close that no
 * amount of lightening helps — the caller shows the warning either way.
 */
export function fixContrast(
  foreground: string,
  background: string,
  target = WCAG_AA_NORMAL,
): string {
  const fg = hexToRgb(foreground);
  if (!fg) return readableOn(background);
  if (contrastRatio(foreground, background) >= target) return foreground;

  // Move away from the background: darken on light backgrounds, lighten on dark.
  const towardsWhite = luminance(background) < 0.5;

  let best = foreground;
  for (let step = 1; step <= 20; step += 1) {
    const amount = step / 20;
    const blended: Rgb = towardsWhite
      ? {
          r: fg.r + (255 - fg.r) * amount,
          g: fg.g + (255 - fg.g) * amount,
          b: fg.b + (255 - fg.b) * amount,
        }
      : { r: fg.r * (1 - amount), g: fg.g * (1 - amount), b: fg.b * (1 - amount) };

    best = rgbToHex(blended);
    if (contrastRatio(best, background) >= target) return best;
  }

  return readableOn(background);
}

export type ContrastCheck = {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
};

/** Round a ratio the way the editor displays it: "4.7:1". */
export function formatRatio(ratio: number): string {
  return `${Math.round(ratio * 10) / 10}:1`;
}
