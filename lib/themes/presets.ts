import type { z } from "zod";
import {
  type Layout,
  type Theme,
  layoutSchema,
  themeSchema,
} from "./schema";

/**
 * Starter themes.
 *
 * A preset is a starting point, never a mode: applying one writes a complete
 * theme object into the draft, and every field of it stays editable afterwards.
 * Nothing in the renderer knows which preset a profile came from.
 *
 * All ten clear WCAG AA for body text against their own background — the
 * contrast warning in the editor should never fire on an untouched preset.
 */
export type ThemePresetId =
  | "minimal"
  | "dark"
  | "glass"
  | "retro"
  | "cyber"
  | "editorial"
  | "soft"
  | "colorful"
  | "professional"
  | "portfolio";

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  description: string;
  theme: z.input<typeof themeSchema>;
  layout: z.input<typeof layoutSchema>;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "White space, quiet type, nothing shouting.",
    theme: {
      colors: {
        background: "#ffffff",
        foreground: "#18181b",
        muted: "#71717a",
        accent: "#2563eb",
        accentForeground: "#ffffff",
        card: "#fafafa",
        cardForeground: "#18181b",
        border: "#e4e4e7",
        button: "#18181b",
        buttonForeground: "#ffffff",
      },
      typography: { headingFont: "inter", bodyFont: "inter", scale: 1, headingWeight: "600" },
      radius: { base: 10, button: 10, image: 12, card: 14, avatar: "circle" },
      spacing: { padding: 24, block: 28, section: 64 },
      background: { kind: "solid" },
      effects: { shadow: "none", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "center", style: "stack" },
  },
  {
    id: "dark",
    name: "Dark",
    description: "Near-black canvas with a cool blue accent.",
    theme: {
      colors: {
        background: "#0a0a0b",
        foreground: "#fafafa",
        muted: "#a1a1aa",
        accent: "#60a5fa",
        accentForeground: "#0a0a0b",
        card: "#161618",
        cardForeground: "#fafafa",
        border: "#27272a",
        button: "#fafafa",
        buttonForeground: "#0a0a0b",
      },
      typography: { headingFont: "geist", bodyFont: "geist", scale: 1.05, headingWeight: "700" },
      radius: { base: 12, button: 12, image: 14, card: 18, avatar: "circle" },
      spacing: { padding: 24, block: 28, section: 64 },
      background: { kind: "solid" },
      effects: { shadow: "soft", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  {
    id: "glass",
    name: "Glass",
    description: "Frosted cards floating over a deep gradient.",
    theme: {
      colors: {
        background: "#2e1065",
        foreground: "#f5f3ff",
        muted: "#c4b5fd",
        accent: "#a78bfa",
        accentForeground: "#1e1b4b",
        card: "#4c1d95",
        cardForeground: "#f5f3ff",
        border: "#7c3aed",
        button: "#f5f3ff",
        buttonForeground: "#2e1065",
      },
      typography: { headingFont: "outfit", bodyFont: "outfit", scale: 1.05, headingWeight: "600" },
      radius: { base: 18, button: 999, image: 18, card: 24, avatar: "circle" },
      spacing: { padding: 24, block: 24, section: 72 },
      background: { kind: "gradient", from: "#4c1d95", to: "#1e1b4b", angle: 165 },
      effects: { shadow: "medium", cardBorder: true, glass: true },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  {
    id: "retro",
    name: "Retro",
    description: "Warm paper, heavy borders, offset shadows.",
    theme: {
      colors: {
        background: "#f5ecd7",
        foreground: "#3b2412",
        muted: "#8a6a4a",
        accent: "#c2410c",
        accentForeground: "#fff7ed",
        card: "#fffaf0",
        cardForeground: "#3b2412",
        border: "#3b2412",
        button: "#c2410c",
        buttonForeground: "#fff7ed",
      },
      typography: {
        headingFont: "space-grotesk",
        bodyFont: "dm-sans",
        scale: 1.05,
        headingWeight: "700",
        letterSpacing: -0.03,
      },
      radius: { base: 4, button: 4, image: 4, card: 6, avatar: "square" },
      spacing: { padding: 24, block: 26, section: 56 },
      background: { kind: "pattern", pattern: "diagonal", opacity: 8 },
      effects: { shadow: "hard", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "left", style: "card" },
  },
  {
    id: "cyber",
    name: "Cyber",
    description: "Terminal black with an electric cyan edge.",
    theme: {
      colors: {
        background: "#05060a",
        foreground: "#e2e8f0",
        muted: "#64748b",
        accent: "#22d3ee",
        accentForeground: "#05060a",
        card: "#0b0f18",
        cardForeground: "#e2e8f0",
        border: "#1e293b",
        button: "#22d3ee",
        buttonForeground: "#05060a",
      },
      typography: {
        headingFont: "jetbrains-mono",
        bodyFont: "jetbrains-mono",
        scale: 0.95,
        headingWeight: "700",
        letterSpacing: -0.01,
      },
      radius: { base: 2, button: 2, image: 2, card: 4, avatar: "square" },
      spacing: { padding: 20, block: 22, section: 48 },
      background: { kind: "pattern", pattern: "grid", opacity: 10 },
      effects: { shadow: "none", cardBorder: true, glass: false },
    },
    layout: { width: "default", align: "left", style: "stack" },
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Serif headlines, generous measure, magazine calm.",
    theme: {
      colors: {
        background: "#faf9f7",
        foreground: "#1c1917",
        muted: "#78716c",
        accent: "#7c2d12",
        accentForeground: "#fef3c7",
        card: "#f5f4f1",
        cardForeground: "#1c1917",
        border: "#e7e5e4",
        button: "#1c1917",
        buttonForeground: "#faf9f7",
      },
      typography: {
        headingFont: "playfair",
        bodyFont: "dm-sans",
        scale: 1.15,
        headingWeight: "700",
        letterSpacing: -0.02,
      },
      radius: { base: 2, button: 2, image: 2, card: 4, avatar: "rounded" },
      spacing: { padding: 28, block: 34, section: 80 },
      background: { kind: "solid" },
      effects: { shadow: "none", cardBorder: false, glass: false },
    },
    layout: { width: "wide", align: "left", style: "stack" },
  },
  {
    id: "soft",
    name: "Soft",
    description: "Pastel lilac, rounded everything, gentle depth.",
    theme: {
      colors: {
        background: "#f6f3ff",
        foreground: "#2e2a3d",
        muted: "#6d6885",
        accent: "#6151d8",
        accentForeground: "#ffffff",
        card: "#ffffff",
        cardForeground: "#2e2a3d",
        border: "#e6e1fb",
        button: "#6151d8",
        buttonForeground: "#ffffff",
      },
      typography: { headingFont: "dm-sans", bodyFont: "dm-sans", scale: 1, headingWeight: "700" },
      radius: { base: 20, button: 999, image: 22, card: 26, avatar: "circle" },
      spacing: { padding: 24, block: 24, section: 64 },
      background: { kind: "solid" },
      effects: { shadow: "soft", cardBorder: false, glass: false },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  {
    id: "colorful",
    name: "Colorful",
    description: "Cream and hot pink, loud on purpose.",
    theme: {
      colors: {
        background: "#fffbeb",
        foreground: "#18181b",
        muted: "#78716c",
        accent: "#db2777",
        accentForeground: "#ffffff",
        card: "#ffffff",
        cardForeground: "#18181b",
        border: "#fde68a",
        button: "#db2777",
        buttonForeground: "#ffffff",
      },
      typography: {
        headingFont: "bricolage",
        bodyFont: "outfit",
        scale: 1.15,
        headingWeight: "800",
        letterSpacing: -0.04,
      },
      radius: { base: 16, button: 999, image: 20, card: 24, avatar: "circle" },
      spacing: { padding: 24, block: 26, section: 64 },
      background: { kind: "pattern", pattern: "dots", opacity: 14 },
      effects: { shadow: "medium", cardBorder: false, glass: false },
    },
    layout: { width: "default", align: "center", style: "card" },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Navy on white. Reads well on a recruiter's laptop.",
    theme: {
      colors: {
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#64748b",
        accent: "#1e40af",
        accentForeground: "#ffffff",
        card: "#f8fafc",
        cardForeground: "#0f172a",
        border: "#e2e8f0",
        button: "#1e40af",
        buttonForeground: "#ffffff",
      },
      typography: { headingFont: "inter", bodyFont: "inter", scale: 0.98, headingWeight: "600" },
      radius: { base: 6, button: 6, image: 8, card: 10, avatar: "rounded" },
      spacing: { padding: 24, block: 24, section: 56 },
      background: { kind: "solid" },
      effects: { shadow: "none", cardBorder: true, glass: false },
    },
    layout: { width: "narrow", align: "left", style: "stack" },
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Charcoal grid built to put work first.",
    theme: {
      colors: {
        background: "#101014",
        foreground: "#f4f4f5",
        muted: "#8b8b93",
        accent: "#a3e635",
        accentForeground: "#101014",
        card: "#1a1a20",
        cardForeground: "#f4f4f5",
        border: "#2a2a32",
        button: "#a3e635",
        buttonForeground: "#101014",
      },
      typography: {
        headingFont: "sora",
        bodyFont: "inter",
        scale: 1.05,
        headingWeight: "700",
        letterSpacing: -0.03,
      },
      radius: { base: 10, button: 8, image: 10, card: 14, avatar: "rounded" },
      spacing: { padding: 28, block: 32, section: 72 },
      background: { kind: "solid" },
      effects: { shadow: "soft", cardBorder: true, glass: false },
    },
    layout: { width: "wide", align: "left", style: "grid" },
  },
];

export const PRESETS_BY_ID = Object.fromEntries(
  THEME_PRESETS.map((preset) => [preset.id, preset]),
) as Record<ThemePresetId, ThemePreset>;

/**
 * Swatch colours for the preset grid, resolved once at module load.
 *
 * The literals above are schema *input* — fields may be omitted — so reading
 * `preset.theme.colors.background` directly is not type-safe. Parsing once here
 * gives the picker a complete palette without re-parsing ten themes on every
 * render of the design panel.
 */
export const PRESET_SWATCHES: Record<
  ThemePresetId,
  { background: string; foreground: string; accent: string; border: string }
> = Object.fromEntries(
  THEME_PRESETS.map((preset) => {
    const { colors } = themeSchema.parse(preset.theme);
    return [
      preset.id,
      {
        background: colors.background,
        foreground: colors.foreground,
        accent: colors.accent,
        border: colors.border,
      },
    ];
  }),
) as Record<ThemePresetId, { background: string; foreground: string; accent: string; border: string }>;

/** A preset's full, parsed theme and layout, ready to write into a draft. */
export function resolvePreset(id: ThemePresetId): { theme: Theme; layout: Layout } {
  const preset = PRESETS_BY_ID[id] ?? PRESETS_BY_ID.minimal;
  return {
    theme: themeSchema.parse(preset.theme),
    layout: layoutSchema.parse(preset.layout),
  };
}
