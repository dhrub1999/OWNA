import { z } from "zod";
import {
  BLOCK_TYPES,
  type BlockPropsFor,
  type BlockStyle,
  type BlockType,
  blockStyleSchema,
  parseBlockProps,
  parseBlockStyle,
} from "@/lib/blocks/definitions";
import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { type Layout, type Theme, layoutSchema, parseLayout, parseTheme, themeSchema } from "@/lib/themes/schema";
import type { Tables } from "@/types/database";

export type BlockRow = Tables<"blocks">;
export type ProfileRow = Tables<"profiles">;

/**
 * The editor document.
 *
 * While someone is editing, the client holds the whole draft in memory and
 * autosave sends it back as one object. This module defines that object, and it
 * is the contract both sides check against — the client for its own state, the
 * Server Action because a Server Action is a public endpoint and must never
 * trust the shape of what arrives.
 */

export type EditorBlock = {
  id: string;
  type: BlockType;
  props: BlockPropsFor<BlockType>;
  style: BlockStyle;
  visible: boolean;
};

export type EditorProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  status: string;
  location: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  visibility: "public" | "unlisted" | "private";
  directoryOptIn: boolean;
  directoryPersona: string;
};

export type EditorDocument = {
  profile: EditorProfile;
  theme: Theme;
  layout: Layout;
  blocks: EditorBlock[];
};

const text = (max: number) => z.string().max(max).catch("").prefault("");

export const editorProfileSchema = z.object({
  id: z.uuid(),
  username: z.string(),
  displayName: text(80),
  bio: text(500),
  avatarUrl: text(2048),
  status: text(60),
  location: text(60),
  seoTitle: text(120),
  seoDescription: text(300),
  ogImageUrl: text(2048),
  visibility: z.enum(["public", "unlisted", "private"]).catch("public"),
  directoryOptIn: z.boolean().catch(false),
  // Free-form here (validated against the persona set by the SelectField's
  // own options and by the DB check constraint); "" means "not chosen yet".
  directoryPersona: text(20),
});

export const editorBlockSchema = z.object({
  id: z.uuid(),
  type: z.enum(BLOCK_TYPES),
  // Left unknown here and re-parsed per type below, because the correct prop
  // schema depends on the sibling `type` field.
  props: z.unknown(),
  style: z.unknown(),
  visible: z.boolean().catch(true),
});

export const editorDocumentSchema = z.object({
  profile: editorProfileSchema,
  theme: themeSchema,
  layout: layoutSchema,
  // A hard ceiling so a malformed or malicious save cannot ask the database to
  // absorb an unbounded array.
  blocks: z.array(editorBlockSchema).max(80),
});

/** Parse an incoming document and normalize every block's props by its type. */
export function parseEditorDocument(value: unknown): EditorDocument | null {
  const result = editorDocumentSchema.safeParse(value);
  if (!result.success) return null;

  return {
    profile: result.data.profile,
    theme: result.data.theme,
    layout: result.data.layout,
    blocks: result.data.blocks.map((block) => ({
      id: block.id,
      type: block.type,
      props: parseBlockProps(block.type, block.props),
      style: parseBlockStyle(block.style),
      visible: block.visible,
    })),
  };
}

/** Build the client's starting state from the rows the editor page loaded. */
export function documentFromRows(
  profile: ProfileRow,
  blocks: BlockRow[],
): EditorDocument {
  return {
    profile: {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name ?? "",
      bio: profile.bio ?? "",
      avatarUrl: profile.avatar_url ?? "",
      status: profile.status ?? "",
      location: profile.location ?? "",
      seoTitle: profile.seo_title ?? "",
      seoDescription: profile.seo_description ?? "",
      ogImageUrl: profile.og_image_url ?? "",
      visibility: profile.visibility as "public" | "unlisted" | "private",
      directoryOptIn: profile.directory_opt_in,
      directoryPersona: profile.directory_persona ?? "",
    },
    theme: parseTheme(profile.theme),
    layout: parseLayout(profile.layout),
    blocks: blocks.map((block) => ({
      id: block.id,
      type: block.type as BlockType,
      props: parseBlockProps(block.type as BlockType, block.props),
      style: parseBlockStyle(block.style),
      visible: block.visible,
    })),
  };
}

/**
 * Render the draft through the same component the public page uses.
 *
 * The preview is not an approximation of the published page — it is the
 * published page's renderer, fed a snapshot assembled from the draft in the
 * same shape `publish_profile()` produces in SQL. Hidden blocks are dropped
 * here exactly as they are dropped at publish.
 */
export function draftToSnapshot(document: EditorDocument): ProfileSnapshot {
  const { profile, theme, layout, blocks } = document;

  return {
    version: 1,
    profile: {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      status: profile.status,
      location: profile.location,
    },
    seo: {
      title: profile.seoTitle,
      description: profile.seoDescription,
      ogImageUrl: profile.ogImageUrl,
    },
    theme,
    layout,
    blocks: blocks
      .filter((block) => block.visible)
      .map((block) => ({
        id: block.id,
        type: block.type,
        props: block.props,
        style: block.style,
      })),
    publishedAt: null,
  };
}

export { blockStyleSchema };
