import type { ReactNode } from "react";
import {
  type AnyBlockProps,
  type BlockType,
  parseBlockProps,
  parseBlockStyle,
} from "@/lib/blocks/definitions";
import type { SnapshotBlock } from "@/lib/blocks/snapshot";
import { DividerBlock } from "./divider-block";
import { EmbedBlock } from "./embed-block";
import { GalleryBlock } from "./gallery-block";
import { HeroBlock } from "./hero-block";
import { ImageBlock } from "./image-block";
import { LinksBlock } from "./links-block";
import { ProjectsBlock } from "./projects-block";
import { SocialBlock } from "./social-block";
import { TextBlock } from "./text-block";
import type { BlockRenderContext } from "./types";

/**
 * Type -> renderer.
 *
 * This is one of the two registries that key off lib/blocks/definitions.ts. It
 * holds only presentational components — no inspectors, no editor imports — so
 * that a public profile's bundle contains the blocks it renders and nothing to
 * do with editing them.
 */
// Each renderer is typed against exactly one block's props. The map has to
// erase that to a union so it can be indexed by a runtime type string; the
// pairing itself is still checked, because a wrong component in the literal
// below would not satisfy its key's renderer signature.
type AnyRenderer = (args: {
  props: AnyBlockProps;
  context: BlockRenderContext;
}) => ReactNode;

export const BLOCK_RENDERERS = {
  hero: HeroBlock,
  text: TextBlock,
  social: SocialBlock,
  links: LinksBlock,
  projects: ProjectsBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  embed: EmbedBlock,
  divider: DividerBlock,
} as unknown as Record<BlockType, AnyRenderer>;

/** Landmark element per block, so the page reads sensibly to a screen reader. */
const WRAPPER: Partial<Record<BlockType, "header" | "nav" | "section">> = {
  hero: "header",
  social: "nav",
};

export function BlockRenderer({
  block,
  context,
}: {
  block: SnapshotBlock;
  context: BlockRenderContext;
}) {
  const Renderer = BLOCK_RENDERERS[block.type];
  // A snapshot published by a newer build can contain a type this one does not
  // know. Rendering nothing is the only forward-compatible answer.
  if (!Renderer) return null;

  const props = parseBlockProps(block.type, block.props);
  const style = parseBlockStyle(block.style);
  const Tag = WRAPPER[block.type] ?? "section";

  return (
    <Tag
      className="profile-block"
      data-block-id={block.id}
      data-block-type={block.type}
      data-selected={context.selectedBlockId === block.id ? "true" : undefined}
      data-surface={style.surface}
      data-align={style.align === "inherit" ? undefined : style.align}
      data-full-bleed={style.fullBleed ? "true" : undefined}
      style={style.spacing ? { marginBlock: `${style.spacing}px` } : undefined}
      aria-label={block.type === "social" ? "Social links" : undefined}
    >
      <Renderer props={props} context={context} />
    </Tag>
  );
}
