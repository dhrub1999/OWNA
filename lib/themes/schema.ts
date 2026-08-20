import { z } from "zod";

/**
 * The theme is the product. Everything a user can change about how their page
 * looks is described by this schema, and nothing reaches CSS without passing
 * through it first.
 *
 * Two rules shape the design:
 *
 *  1. No free-form CSS. Every value is an enum, a clamped number, or a hex
 *     colour. A theme therefore cannot express a style that breaks the page,
 *     and — more importantly — cannot express a CSS injection.
 *  2. Every field has a default, so `{}` parses to a complete theme. That is
 *     why profiles.theme starts as '{}' in the database: defaults live here,
 *     in one place, rather than being duplicated into a migration.
 */

/** Curated font set. Adding one means adding a loader in ./fonts.ts too. */
export const FONT_KEYS = [
  "inter",
  "geist",
  "sora",
  "outfit",
  "space-grotesk",
  "dm-sans",
  "bricolage",
  "playfair",
  "instrument-serif",
  "jetbrains-mono",
] as const;

export type FontKey = (typeof FONT_KEYS)[number];

/**
 * Colours are hex, and only hex.
 *
 * Restricting the format keeps the contrast maths in ./contrast.ts exact, and
 * means a colour can never carry a payload — `red; background: url(...)` does
 * not match.
 */
const hexColor = z
  .string()
  .trim()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Use a hex colour")
  .transform((value) => value.toLowerCase());

const color = (fallback: string) => hexColor.catch(fallback).default(fallback);

/** A number that silently clamps instead of failing, so a bad row still renders. */
const clamped = (min: number, max: number, fallback: number) =>
  z
    .number()
    .catch(fallback)
    .default(fallback)
    .transform((value) => Math.min(max, Math.max(min, value)));

/**
 * `.prefault({})` rather than `.default({})`: prefault supplies the value on the
 * *input* side, so an absent object is parsed as `{}` and every field falls
 * through to its own default. `.default()` would require the caller to hand
 * over a complete, already-parsed object.
 */
export const colorsSchema = z
  .object({
    background: color("#ffffff"),
    foreground: color("#0f0f10"),
    muted: color("#6b7280"),
    accent: color("#2563eb"),
    accentForeground: color("#ffffff"),
    card: color("#f6f6f7"),
    cardForeground: color("#0f0f10"),
    border: color("#e5e7eb"),
    button: color("#0f0f10"),
    buttonForeground: color("#ffffff"),
  })
  .prefault({});

export const typographySchema = z
  .object({
    headingFont: z.enum(FONT_KEYS).catch("inter").default("inter"),
    bodyFont: z.enum(FONT_KEYS).catch("inter").default("inter"),
    /** Multiplier applied to the whole type ramp. */
    scale: clamped(0.8, 1.6, 1),
    headingWeight: z
      .enum(["400", "500", "600", "700", "800", "900"])
      .catch("700")
      .default("700"),
    bodyWeight: z.enum(["300", "400", "500", "600"]).catch("400").default("400"),
    /** em, applied to headings only. */
    letterSpacing: clamped(-0.06, 0.2, -0.02),
  })
  .prefault({});

export const radiusSchema = z
  .object({
    base: clamped(0, 48, 12),
    button: clamped(0, 48, 10),
    image: clamped(0, 48, 12),
    card: clamped(0, 48, 16),
    /** Hero avatar: a shape, not a radius, because "circle" must survive a radius change. */
    avatar: z.enum(["circle", "rounded", "square"]).catch("circle").default("circle"),
  })
  .prefault({});

export const spacingSchema = z
  .object({
    /** px between the page edge and content. */
    padding: clamped(0, 80, 24),
    /** px between blocks. */
    block: clamped(0, 120, 28),
    /** px above and below the whole page. */
    section: clamped(0, 200, 56),
  })
  .prefault({});

/**
 * Backgrounds.
 *
 * A discriminated union rather than a CSS string, so the renderer builds the
 * declaration itself. `image` is the only variant carrying user input, and its
 * URL is re-validated at render time before it ever reaches a url().
 */
export const backgroundSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("solid") }),
    z.object({
      kind: z.literal("gradient"),
      from: color("#2563eb"),
      to: color("#7c3aed"),
      angle: clamped(0, 360, 160),
    }),
    z.object({
      kind: z.literal("image"),
      url: z.string().trim().max(2048).default(""),
      /** 0–100; how much the background colour is laid over the image. */
      overlay: clamped(0, 100, 40),
      blur: clamped(0, 24, 0),
    }),
    z.object({
      kind: z.literal("pattern"),
      /** Fixed set, generated from our own CSS — never user input. */
      pattern: z
        .enum(["dots", "grid", "diagonal", "noise"])
        .catch("dots")
        .default("dots"),
      opacity: clamped(0, 100, 12),
    }),
  ])
  .catch({ kind: "solid" as const })
  .prefault({ kind: "solid" as const });

export const effectsSchema = z
  .object({
    shadow: z.enum(["none", "soft", "medium", "hard"]).catch("soft").default("soft"),
    cardBorder: z.boolean().catch(true).default(true),
    /** Frosted-glass cards. Costs a backdrop-filter, so it is opt-in. */
    glass: z.boolean().catch(false).default(false),
  })
  .prefault({});

export const themeSchema = z
  .object({
    colors: colorsSchema,
    typography: typographySchema,
    radius: radiusSchema,
    spacing: spacingSchema,
    background: backgroundSchema,
    effects: effectsSchema,
  })
  .prefault({});

export type Theme = z.infer<typeof themeSchema>;
export type ThemeColors = Theme["colors"];
export type ThemeBackground = Theme["background"];

/**
 * Page-level structure. Kept out of the theme, and in its own column, because
 * swapping a colour palette should not silently rearrange the page.
 */
export const layoutSchema = z
  .object({
    width: z.enum(["narrow", "default", "wide", "full"]).catch("default").default("default"),
    align: z.enum(["left", "center"]).catch("center").default("center"),
    style: z.enum(["stack", "card", "grid"]).catch("stack").default("stack"),
  })
  .prefault({});

export type Layout = z.infer<typeof layoutSchema>;

/** Parse an untrusted value from the database into a complete theme. */
export function parseTheme(value: unknown): Theme {
  return themeSchema.parse(value ?? {});
}

/** Parse an untrusted value from the database into a complete layout. */
export function parseLayout(value: unknown): Layout {
  return layoutSchema.parse(value ?? {});
}

export const defaultTheme = (): Theme => themeSchema.parse({});
export const defaultLayout = (): Layout => layoutSchema.parse({});
