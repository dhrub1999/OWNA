import { z } from "zod";
import { optionalUrlSchema, urlSchema } from "@/lib/validations/url";

/**
 * Block definitions: pure data, no React, no server imports.
 *
 * This module is the single source of truth for what a block is. It is imported
 * by the editor, by the public renderer, by the save action and by the tests,
 * which is exactly why it must stay free of components — pulling a React tree
 * in here would drag editor-only client code into the public page's bundle.
 *
 * The two component registries live elsewhere and key off these types:
 *   components/public/blocks   — presentational renderers
 *   components/editor/inspectors — client property panels
 *
 * Adding a block means adding an entry here plus one entry in each registry.
 * Nothing else in the codebase needs to change.
 */

export const BLOCK_TYPES = [
  "hero",
  "text",
  "social",
  "links",
  "projects",
  "image",
  "gallery",
  "embed",
  "divider",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

/** Stable ids for repeatable rows inside a block's props. */
export function newItemId(): string {
  return crypto.randomUUID();
}

const alignSchema = z.enum(["left", "center"]).catch("center").prefault("center");

// ---------------------------------------------------------------------------
// Per-block style overrides. Stored in blocks.style, applied by the renderer on
// top of the theme, so one block can break the page rhythm without a new theme.
// ---------------------------------------------------------------------------

export const blockStyleSchema = z
  .object({
    /** Surface the block sits on. `card` picks up the theme's card treatment. */
    surface: z.enum(["none", "card", "accent"]).catch("none").prefault("none"),
    /** Extra vertical space around this block, in px, on top of the theme gap. */
    spacing: z.number().catch(0).prefault(0).transform((n) => Math.min(96, Math.max(0, n))),
    /** Ignore the layout max-width and run edge to edge. */
    fullBleed: z.boolean().catch(false).prefault(false),
    /** Per-block alignment override; `inherit` follows the layout. */
    align: z.enum(["inherit", "left", "center"]).catch("inherit").prefault("inherit"),
  })
  .prefault({});

export type BlockStyle = z.infer<typeof blockStyleSchema>;

// ---------------------------------------------------------------------------
// hero
// ---------------------------------------------------------------------------

export const heroPropsSchema = z
  .object({
    /** All optional: an empty field falls back to the profile's own value, so
     *  changing your display name in settings updates the hero unless you have
     *  deliberately overridden it here. */
    headline: z.string().max(80).catch("").prefault(""),
    tagline: z.string().max(120).catch("").prefault(""),
    bio: z.string().max(500).catch("").prefault(""),
    avatarUrl: z.string().max(2048).catch("").prefault(""),
    status: z.string().max(60).catch("").prefault(""),
    location: z.string().max(60).catch("").prefault(""),
    showAvatar: z.boolean().catch(true).prefault(true),
    showUsername: z.boolean().catch(true).prefault(true),
    avatarSize: z.enum(["sm", "md", "lg"]).catch("md").prefault("md"),
    align: alignSchema,
  })
  .prefault({});

// ---------------------------------------------------------------------------
// text
// ---------------------------------------------------------------------------

export const textPropsSchema = z
  .object({
    heading: z.string().max(120).catch("").prefault(""),
    /** Plain text, rendered with `white-space: pre-wrap`. Never HTML, never
     *  markdown — there is no sanitizer in this codebase and no page that calls
     *  dangerouslySetInnerHTML. */
    body: z.string().max(4000).catch("").prefault(""),
    size: z.enum(["sm", "base", "lg"]).catch("base").prefault("base"),
    tone: z.enum(["default", "muted", "accent"]).catch("default").prefault("default"),
    align: z.enum(["left", "center", "inherit"]).catch("inherit").prefault("inherit"),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// social
// ---------------------------------------------------------------------------

export const SOCIAL_PLATFORMS = [
  "instagram",
  "x",
  "linkedin",
  "github",
  "youtube",
  "discord",
  "tiktok",
  "facebook",
  "twitch",
  "dribbble",
  "behance",
  "website",
  "email",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_META: Record<
  SocialPlatform,
  { label: string; placeholder: string }
> = {
  instagram: { label: "Instagram", placeholder: "instagram.com/you" },
  x: { label: "X", placeholder: "x.com/you" },
  linkedin: { label: "LinkedIn", placeholder: "linkedin.com/in/you" },
  github: { label: "GitHub", placeholder: "github.com/you" },
  youtube: { label: "YouTube", placeholder: "youtube.com/@you" },
  discord: { label: "Discord", placeholder: "discord.gg/invite" },
  tiktok: { label: "TikTok", placeholder: "tiktok.com/@you" },
  facebook: { label: "Facebook", placeholder: "facebook.com/you" },
  twitch: { label: "Twitch", placeholder: "twitch.tv/you" },
  dribbble: { label: "Dribbble", placeholder: "dribbble.com/you" },
  behance: { label: "Behance", placeholder: "behance.net/you" },
  website: { label: "Website", placeholder: "yoursite.com" },
  email: { label: "Email", placeholder: "you@example.com" },
};

const socialLinkSchema = z.object({
  id: z.string().catch(""),
  platform: z.enum(SOCIAL_PLATFORMS).catch("website"),
  url: z.string().max(2048).catch(""),
  label: z.string().max(40).catch("").prefault(""),
});

export const socialPropsSchema = z
  .object({
    heading: z.string().max(120).catch("").prefault(""),
    links: z.array(socialLinkSchema).max(20).catch([]).prefault([]),
    style: z.enum(["icon", "icon-label", "button"]).catch("icon").prefault("icon"),
    layout: z.enum(["row", "column", "grid"]).catch("row").prefault("row"),
    shape: z.enum(["circle", "rounded", "square"]).catch("circle").prefault("circle"),
    size: z.enum(["sm", "md", "lg"]).catch("md").prefault("md"),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// links
// ---------------------------------------------------------------------------

const linkItemSchema = z.object({
  id: z.string().catch(""),
  label: z.string().max(80).catch(""),
  url: z.string().max(2048).catch(""),
  description: z.string().max(140).catch("").prefault(""),
  /** Lucide icon name, restricted to a curated set in the inspector. */
  icon: z.string().max(40).catch("").prefault(""),
});

export const linksPropsSchema = z
  .object({
    heading: z.string().max(120).catch("").prefault(""),
    items: z.array(linkItemSchema).max(50).catch([]).prefault([]),
    style: z.enum(["solid", "outline", "ghost", "card"]).catch("solid").prefault("solid"),
    layout: z.enum(["stack", "grid"]).catch("stack").prefault("stack"),
    size: z.enum(["sm", "md", "lg"]).catch("md").prefault("md"),
    showArrow: z.boolean().catch(true).prefault(true),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// projects
// ---------------------------------------------------------------------------

const projectItemSchema = z.object({
  id: z.string().catch(""),
  name: z.string().max(80).catch(""),
  description: z.string().max(300).catch("").prefault(""),
  imageUrl: z.string().max(2048).catch("").prefault(""),
  url: z.string().max(2048).catch("").prefault(""),
  tags: z.array(z.string().max(24)).max(8).catch([]).prefault([]),
});

export const projectsPropsSchema = z
  .object({
    heading: z.string().max(120).catch("Projects").prefault("Projects"),
    items: z.array(projectItemSchema).max(40).catch([]).prefault([]),
    layout: z.enum(["grid", "list"]).catch("grid").prefault("grid"),
    columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).catch(2).prefault(2),
    imageRatio: z.enum(["16:9", "4:3", "1:1", "none"]).catch("16:9").prefault("16:9"),
    showTags: z.boolean().catch(true).prefault(true),
    showDescription: z.boolean().catch(true).prefault(true),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// image
// ---------------------------------------------------------------------------

export const imagePropsSchema = z
  .object({
    url: z.string().max(2048).catch("").prefault(""),
    /** Required for a11y. The inspector warns when it is empty; an image with
     *  no alt text is rendered with alt="" so a screen reader skips it rather
     *  than reading a filename. */
    alt: z.string().max(200).catch("").prefault(""),
    caption: z.string().max(200).catch("").prefault(""),
    href: z.string().max(2048).catch("").prefault(""),
    ratio: z.enum(["auto", "16:9", "4:3", "1:1", "3:4"]).catch("auto").prefault("auto"),
    fit: z.enum(["cover", "contain"]).catch("cover").prefault("cover"),
    width: z.enum(["full", "inset", "half"]).catch("full").prefault("full"),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// gallery
// ---------------------------------------------------------------------------

const galleryImageSchema = z.object({
  id: z.string().catch(""),
  url: z.string().max(2048).catch(""),
  alt: z.string().max(200).catch("").prefault(""),
  caption: z.string().max(200).catch("").prefault(""),
  // Bento-only; ignored by grid/masonry. Kept on every image regardless of
  // the block's current layout so switching layouts never loses a choice.
  shape: z.enum(["square", "landscape", "portrait"]).catch("square").prefault("square"),
  position: z
    .enum([
      "top-left",
      "top-center",
      "top-right",
      "center-left",
      "center",
      "center-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ])
    .catch("center")
    .prefault("center"),
});

export const galleryPropsSchema = z
  .object({
    heading: z.string().max(120).catch("").prefault(""),
    images: z.array(galleryImageSchema).max(60).catch([]).prefault([]),
    layout: z.enum(["grid", "masonry", "bento"]).catch("grid").prefault("grid"),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).catch(3).prefault(3),
    gap: z.number().catch(8).prefault(8).transform((n) => Math.min(32, Math.max(0, n))),
    showCaptions: z.boolean().catch(false).prefault(false),
    lightbox: z.boolean().catch(true).prefault(true),
  })
  .prefault({});

export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type GalleryImageShape = GalleryImage["shape"];
export type GalleryImagePosition = GalleryImage["position"];

// ---------------------------------------------------------------------------
// embed
// ---------------------------------------------------------------------------

export const embedPropsSchema = z
  .object({
    heading: z.string().max(120).catch("").prefault(""),
    /** The URL the user pasted. The provider and the iframe src are derived
     *  from it at render time by lib/blocks/embeds/providers.ts — the src is
     *  never stored, so a stored value can never become an iframe source. */
    url: z.string().max(2048).catch("").prefault(""),
    title: z.string().max(120).catch("").prefault(""),
    theme: z.enum(["auto", "dark", "light"]).catch("auto").prefault("auto"),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// divider
// ---------------------------------------------------------------------------

export const dividerPropsSchema = z
  .object({
    variant: z.enum(["line", "dashed", "dots", "space"]).catch("line").prefault("line"),
    thickness: z.number().catch(1).prefault(1).transform((n) => Math.min(8, Math.max(1, n))),
    height: z.number().catch(24).prefault(24).transform((n) => Math.min(200, Math.max(0, n))),
    width: z.enum(["full", "half", "short"]).catch("full").prefault("full"),
  })
  .prefault({});

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const BLOCK_PROP_SCHEMAS = {
  hero: heroPropsSchema,
  text: textPropsSchema,
  social: socialPropsSchema,
  links: linksPropsSchema,
  projects: projectsPropsSchema,
  image: imagePropsSchema,
  gallery: galleryPropsSchema,
  embed: embedPropsSchema,
  divider: dividerPropsSchema,
} as const;

export type BlockPropsMap = {
  [K in BlockType]: z.infer<(typeof BLOCK_PROP_SCHEMAS)[K]>;
};

export type BlockPropsFor<T extends BlockType> = BlockPropsMap[T];
export type AnyBlockProps = BlockPropsMap[BlockType];

type BlockMeta = {
  type: BlockType;
  label: string;
  description: string;
  /** Lucide icon name; resolved in components/icons. */
  icon: string;
  group: "identity" | "content" | "media" | "structure";
  /** Blocks a profile should only ever have one of. */
  singleton?: boolean;
};

export const BLOCK_META: Record<BlockType, BlockMeta> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Your photo, name and one line about you.",
    icon: "UserRound",
    group: "identity",
    singleton: true,
  },
  text: {
    type: "text",
    label: "Text",
    description: "A heading and a paragraph.",
    icon: "Type",
    group: "content",
  },
  social: {
    type: "social",
    label: "Social links",
    description: "Icons for the platforms you're on.",
    icon: "AtSign",
    group: "content",
  },
  links: {
    type: "links",
    label: "Links",
    description: "Buttons pointing anywhere you like.",
    icon: "Link2",
    group: "content",
  },
  projects: {
    type: "projects",
    label: "Projects",
    description: "Cards for the things you've made.",
    icon: "LayoutGrid",
    group: "content",
  },
  image: {
    type: "image",
    label: "Image",
    description: "A single picture, optionally linked.",
    icon: "Image",
    group: "media",
  },
  gallery: {
    type: "gallery",
    label: "Gallery",
    description: "A grid of images.",
    icon: "Images",
    group: "media",
  },
  embed: {
    type: "embed",
    label: "Embed",
    description: "A Spotify or YouTube player.",
    icon: "Play",
    group: "media",
  },
  divider: {
    type: "divider",
    label: "Divider",
    description: "A line or a gap.",
    icon: "Minus",
    group: "structure",
  },
};

export const BLOCK_LIST = BLOCK_TYPES.map((type) => BLOCK_META[type]);

export function isBlockType(value: unknown): value is BlockType {
  return typeof value === "string" && (BLOCK_TYPES as readonly string[]).includes(value);
}

/**
 * Parse untrusted props for a known block type, filling in every default.
 *
 * Never throws. Individual fields recover on their own through `.catch()`, but
 * a value that is not an object at all — a string, a number, a row written by
 * some future shape we cannot anticipate — has no field-level recovery, and one
 * unreadable block must not take down the page around it.
 */
export function parseBlockProps<T extends BlockType>(
  type: T,
  props: unknown,
): BlockPropsFor<T> {
  const schema = BLOCK_PROP_SCHEMAS[type];
  const result = schema.safeParse(props ?? {});
  return (result.success ? result.data : schema.parse({})) as BlockPropsFor<T>;
}

export function parseBlockStyle(style: unknown): BlockStyle {
  const result = blockStyleSchema.safeParse(style ?? {});
  return result.success ? result.data : blockStyleSchema.parse({});
}

/** Fresh props for a newly added block. */
export function defaultBlockProps<T extends BlockType>(type: T): BlockPropsFor<T> {
  return parseBlockProps(type, {});
}

/**
 * Seed content for a block the moment it is added, so the canvas never shows an
 * empty rectangle. Kept separate from the schema defaults: a *saved* empty block
 * should stay empty, only a *new* one gets placeholder copy.
 */
export function starterBlockProps<T extends BlockType>(type: T): BlockPropsFor<T> {
  const base = defaultBlockProps(type);

  switch (type) {
    case "text":
      return {
        ...base,
        heading: "About",
        body: "A couple of sentences about what you do and what you're into.",
      } as BlockPropsFor<T>;
    case "social":
      return {
        ...base,
        links: [
          { id: newItemId(), platform: "instagram", url: "", label: "" },
          { id: newItemId(), platform: "github", url: "", label: "" },
        ],
      } as BlockPropsFor<T>;
    case "links":
      return {
        ...base,
        items: [{ id: newItemId(), label: "My portfolio", url: "", description: "", icon: "" }],
      } as BlockPropsFor<T>;
    case "projects":
      return {
        ...base,
        items: [
          {
            id: newItemId(),
            name: "Project name",
            description: "What it is, in one line.",
            imageUrl: "",
            url: "",
            tags: [],
          },
        ],
      } as BlockPropsFor<T>;
    default:
      return base;
  }
}

// Re-exported so inspectors can validate a single field without importing the
// URL module directly, keeping the "definitions own validation" rule intact.
export { urlSchema, optionalUrlSchema };
