import { z } from "zod";
import { layoutSchema, themeSchema } from "@/lib/themes/schema";
import { BLOCK_TYPES, type BlockType } from "./definitions";

/**
 * The published snapshot.
 *
 * This mirrors exactly what `public.publish_profile()` builds in SQL. The
 * database is the authority — the snapshot is assembled server-side from the
 * owner's own rows, never posted by a client — and this schema is the reader.
 *
 * Two things it must tolerate, because published rows outlive the code that
 * wrote them:
 *   * a block type this build does not know about, which is dropped;
 *   * props written by an older prop schema, which are re-parsed per block by
 *     the renderer with `parseBlockProps` and fall back to defaults field by
 *     field.
 */

const nullableText = z
  .string()
  .nullish()
  .transform((value) => value ?? "");

export const snapshotBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.unknown().default({}),
  style: z.unknown().default({}),
});

export type SnapshotBlock = {
  id: string;
  type: BlockType;
  props: unknown;
  style: unknown;
};

export const snapshotProfileSchema = z.object({
  username: z.string(),
  displayName: nullableText,
  bio: nullableText,
  avatarUrl: nullableText,
  status: nullableText,
  location: nullableText,
});

export const snapshotSeoSchema = z
  .object({
    title: nullableText,
    description: nullableText,
    ogImageUrl: nullableText,
  })
  .prefault({});

export const snapshotSchema = z.object({
  version: z.number().catch(1).prefault(1),
  profile: snapshotProfileSchema,
  seo: snapshotSeoSchema,
  theme: themeSchema,
  layout: layoutSchema,
  blocks: z.array(snapshotBlockSchema).catch([]).prefault([]),
  publishedAt: z.string().nullish(),
});

export type ProfileSnapshotRaw = z.infer<typeof snapshotSchema>;

export type ProfileSnapshot = Omit<ProfileSnapshotRaw, "blocks"> & {
  blocks: SnapshotBlock[];
};

/**
 * Parse a snapshot from the database.
 *
 * Returns null rather than throwing: a profile whose snapshot cannot be read is
 * a 404 for the visitor, not a 500 for everyone.
 */
export function parseSnapshot(value: unknown): ProfileSnapshot | null {
  const result = snapshotSchema.safeParse(value);
  if (!result.success) return null;

  const known = new Set<string>(BLOCK_TYPES);

  return {
    ...result.data,
    blocks: result.data.blocks
      .filter((block) => known.has(block.type))
      .map((block) => ({ ...block, type: block.type as BlockType })),
  };
}

/**
 * The title and description a profile gets when the user has not written their
 * own. Kept here so the public page, the OG image and the sitemap all agree.
 */
export function snapshotSeo(snapshot: ProfileSnapshot) {
  const { profile, seo } = snapshot;
  const name = profile.displayName.trim() || profile.username;

  const title =
    seo.title.trim() ||
    (profile.status.trim() ? `${name} — ${profile.status.trim()}` : name);

  const description =
    seo.description.trim() ||
    profile.bio.trim() ||
    `${name} on OWNA.`;

  return { name, title, description: description.slice(0, 300) };
}
