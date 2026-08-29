import {
  type BlockType,
  parseBlockProps,
  parseBlockStyle,
} from "@/lib/blocks/definitions";
import type { ProfileSnapshot, SnapshotBlock } from "@/lib/blocks/snapshot";
import { FONTS } from "@/lib/themes/fonts";
import {
  PRESETS_BY_ID,
  PRESET_SWATCHES,
  THEME_PRESETS,
  type ThemePresetId,
  resolvePreset,
} from "@/lib/themes/presets";
import type { Layout, Theme } from "@/lib/themes/schema";

/**
 * The three presets the landing page's Customize step offers, and the demo
 * profile it re-themes.
 *
 * Everything here is *derived* from lib/themes/presets.ts and lib/themes/fonts.ts
 * rather than retyped. A preset's colours, fonts, radii and layout can change in
 * one place and the marketing page follows, which is the whole reason this file
 * exists instead of a literal in the component.
 */

/** Which three of the ten. Portfolio first, because the flow opens on it. */
export const BUILD_FLOW_PRESET_IDS = [
  "portfolio",
  "editorial",
  "cyber",
] as const satisfies readonly ThemePresetId[];

/** Drives the panel's "3 of 10" caption, so adding a preset updates the copy. */
export const TOTAL_PRESET_COUNT = THEME_PRESETS.length;

/** The layout picker's own wording, mirrored for the panel's LAYOUT fact. */
const LAYOUT_LABELS: Record<Layout["style"], string> = {
  stack: "Stack",
  card: "Card",
  grid: "Grid",
};

export type BuildFlowPreset = {
  id: ThemePresetId;
  name: string;
  description: string;
  /** Accent and background dots on the preset card. */
  accent: string;
  background: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  cardRadius: string;
  layoutLabel: string;
  theme: Theme;
  layout: Layout;
};

export const BUILD_FLOW_PRESETS: BuildFlowPreset[] = BUILD_FLOW_PRESET_IDS.map(
  (id) => {
    const preset = PRESETS_BY_ID[id];
    const swatch = PRESET_SWATCHES[id];
    const { theme, layout } = resolvePreset(id);

    return {
      id,
      name: preset.name,
      description: preset.description,
      accent: swatch.accent,
      background: swatch.background,
      border: swatch.border,
      headingFont: FONTS[theme.typography.headingFont].label,
      bodyFont: FONTS[theme.typography.bodyFont].label,
      cardRadius: `${theme.radius.card}px`,
      layoutLabel: LAYOUT_LABELS[layout.style],
      theme,
      layout,
    };
  },
);

// ---------------------------------------------------------------------------
// The profile the preview renders
// ---------------------------------------------------------------------------

function block(id: string, type: BlockType, props: unknown): SnapshotBlock {
  return {
    id,
    type,
    props: parseBlockProps(type, props),
    style: parseBlockStyle({}),
  };
}

/**
 * Imagery is deliberately greyscale.
 *
 * The same four blocks are shown under Portfolio's charcoal-and-lime, Editorial's
 * warm cream and Cyber's near-black-and-cyan. A colour photograph reads as a
 * clash under at least one of the three; a greyscale one sits under all of them.
 *
 * These are remote URLs rather than files in /public because the renderer's
 * `safeImageSrc` guard requires an absolute http(s) src — the same reason
 * lib/demo-profiles.ts uses them for the profiles in sections 4 and 6.
 */
const shot = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}?grayscale`;

/**
 * Blocks in reveal order, parsed once at module load.
 *
 * `buildFlowSnapshot` slices this array, so the preview gains a block rather
 * than un-hiding one — which is what lets the CSS mount animation in
 * globals.css fire for the new block only, and never re-run for the ones
 * already on screen.
 */
const BUILD_FLOW_BLOCKS: SnapshotBlock[] = [
  block("bf-hero", "hero", {
    headline: "Priya Raghavan",
    tagline: "Brand designer + art direction",
    bio: "Ten years of identity work for small studios. Currently taking two projects a quarter.",
    avatarUrl: "https://i.pravatar.cc/480?img=32",
    showAvatar: true,
    showUsername: false,
    avatarSize: "md",
    status: "Open to projects",
    location: "Bengaluru",
  }),
  block("bf-social", "social", {
    links: [
      { id: "bf-s1", platform: "instagram", url: "instagram.com", label: "" },
      { id: "bf-s2", platform: "dribbble", url: "dribbble.com", label: "" },
      { id: "bf-s3", platform: "linkedin", url: "linkedin.com", label: "" },
      { id: "bf-s4", platform: "email", url: "hello@example.com", label: "" },
    ],
    style: "icon",
    layout: "row",
    shape: "circle",
    size: "md",
  }),
  block("bf-projects", "projects", {
    heading: "Projects",
    items: [
      {
        id: "bf-p1",
        name: "Kettle & Co",
        description: "Identity for a neighbourhood roastery.",
        imageUrl: shot("owna-project-roastery", 800, 600),
        url: "",
        tags: [],
      },
      {
        id: "bf-p2",
        name: "Northbound",
        description: "Wayfinding for a coworking floor.",
        imageUrl: shot("owna-project-wayfinding", 800, 600),
        url: "",
        tags: [],
      },
    ],
    layout: "grid",
    columns: 2,
    imageRatio: "4:3",
    showTags: false,
    showDescription: true,
  }),
  block("bf-gallery", "gallery", {
    heading: "Gallery",
    images: [
      {
        id: "bf-g1",
        url: shot("owna-gallery-press", 700, 700),
        alt: "",
        caption: "",
        shape: "square",
        position: "center",
      },
      {
        id: "bf-g2",
        url: shot("owna-gallery-swatches", 700, 700),
        alt: "",
        caption: "",
        shape: "square",
        position: "center",
      },
      {
        id: "bf-g3",
        url: shot("owna-gallery-signage", 700, 700),
        alt: "",
        caption: "",
        shape: "square",
        position: "center",
      },
    ],
    layout: "grid",
    columns: 3,
    gap: 8,
    showCaptions: false,
    lightbox: false,
  }),
];

/** How many blocks the reveal ends on. */
export const BUILD_FLOW_BLOCK_COUNT = BUILD_FLOW_BLOCKS.length;

/** The username the publish panel claims and the preview's caption prints. */
export const BUILD_FLOW_USERNAME = "priya";

/**
 * The snapshot for one frame of the flow: a preset, and how many blocks have
 * been revealed so far.
 */
export function buildFlowSnapshot(
  preset: BuildFlowPreset,
  revealed: number,
): ProfileSnapshot {
  return {
    version: 1,
    profile: {
      username: BUILD_FLOW_USERNAME,
      displayName: "Priya Raghavan",
      bio: "",
      avatarUrl: "",
      status: "Open to projects",
      location: "Bengaluru",
    },
    seo: { title: "", description: "", ogImageUrl: "" },
    theme: preset.theme,
    layout: preset.layout,
    blocks: BUILD_FLOW_BLOCKS.slice(0, Math.max(1, revealed)),
    publishedAt: null,
  };
}
