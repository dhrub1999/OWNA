import {
  Bricolage_Grotesque,
  DM_Sans,
  Geist,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Outfit,
  Playfair_Display,
  Sora,
  Space_Grotesk,
} from "next/font/google";
import type { FontKey } from "./schema";

/**
 * The curated font set.
 *
 * `next/font/google` self-hosts each face at build time, so a published profile
 * makes no request to Google and cannot shift layout while a font loads.
 *
 * Every font here declares `preload: false`. All ten variable class names are
 * attached to the profile root so that any theme can be applied without a
 * re-render, but preloading ten families on every page view would be absurd —
 * with preload off the browser fetches only the two faces the theme actually
 * references.
 *
 * The trade-off is that the set is fixed: `next/font/google` requires literal,
 * build-time calls, so a user cannot bring their own font. Custom fonts are a
 * post-MVP feature that will need a different loading path.
 */
/*
 * next/font loaders only accept a literal object argument — no spreads, no
 * shared constants — because the options are read at build time by the
 * compiler rather than at runtime. Hence the repetition below.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-geist",
});
const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-sora",
});
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-outfit",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-space-grotesk",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-dm-sans",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-bricolage",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
});
// Instrument Serif ships a single weight, so it must be requested explicitly.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  variable: "--font-instrument-serif",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
});

type FontEntry = {
  key: FontKey;
  /** Shown in the font picker. */
  label: string;
  /** The CSS custom property the loader defines. */
  cssVar: string;
  /** Fallback stack, used until the face loads and if it fails. */
  fallback: string;
  className: string;
  /** Grouping for the picker, so serifs are not mixed in with the sans list. */
  category: "sans" | "serif" | "display" | "mono";
};

export const FONTS: Record<FontKey, FontEntry> = {
  inter: {
    key: "inter",
    label: "Inter",
    cssVar: "--font-inter",
    fallback: "system-ui, sans-serif",
    className: inter.variable,
    category: "sans",
  },
  geist: {
    key: "geist",
    label: "Geist",
    cssVar: "--font-geist",
    fallback: "system-ui, sans-serif",
    className: geist.variable,
    category: "sans",
  },
  sora: {
    key: "sora",
    label: "Sora",
    cssVar: "--font-sora",
    fallback: "system-ui, sans-serif",
    className: sora.variable,
    category: "sans",
  },
  outfit: {
    key: "outfit",
    label: "Outfit",
    cssVar: "--font-outfit",
    fallback: "system-ui, sans-serif",
    className: outfit.variable,
    category: "sans",
  },
  "space-grotesk": {
    key: "space-grotesk",
    label: "Space Grotesk",
    cssVar: "--font-space-grotesk",
    fallback: "system-ui, sans-serif",
    className: spaceGrotesk.variable,
    category: "display",
  },
  "dm-sans": {
    key: "dm-sans",
    label: "DM Sans",
    cssVar: "--font-dm-sans",
    fallback: "system-ui, sans-serif",
    className: dmSans.variable,
    category: "sans",
  },
  bricolage: {
    key: "bricolage",
    label: "Bricolage",
    cssVar: "--font-bricolage",
    fallback: "system-ui, sans-serif",
    className: bricolage.variable,
    category: "display",
  },
  playfair: {
    key: "playfair",
    label: "Playfair Display",
    cssVar: "--font-playfair",
    fallback: "Georgia, serif",
    className: playfair.variable,
    category: "serif",
  },
  "instrument-serif": {
    key: "instrument-serif",
    label: "Instrument Serif",
    cssVar: "--font-instrument-serif",
    fallback: "Georgia, serif",
    className: instrumentSerif.variable,
    category: "serif",
  },
  "jetbrains-mono": {
    key: "jetbrains-mono",
    label: "JetBrains Mono",
    cssVar: "--font-jetbrains-mono",
    fallback: "ui-monospace, monospace",
    className: jetbrainsMono.variable,
    category: "mono",
  },
};

export const FONT_LIST = Object.values(FONTS);

/** Every font's variable class, for the profile root element. */
export const allFontClassNames = FONT_LIST.map((font) => font.className).join(" ");

/** A complete `font-family` value for one key. */
export function fontFamily(key: FontKey): string {
  const font = FONTS[key] ?? FONTS.inter;
  return `var(${font.cssVar}), ${font.fallback}`;
}
