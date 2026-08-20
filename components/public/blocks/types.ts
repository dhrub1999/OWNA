import type { BlockPropsFor, BlockType } from "@/lib/blocks/definitions";
import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import type { Layout } from "@/lib/themes/schema";

/**
 * What every block renderer receives.
 *
 * The context carries the profile so a block can fall back to account-level
 * values — an empty hero headline shows the profile's display name — without
 * any renderer needing to fetch anything. That is the rule that keeps these
 * components usable in both trees: they are pure functions of their props, so
 * the server renders them for the public page and the editor renders the very
 * same components in the browser for the live preview.
 */
export type BlockRenderContext = {
  profile: ProfileSnapshot["profile"];
  layout: Layout;
  /** True inside the editor preview. Blocks use it to disable navigation. */
  isPreview?: boolean;
  /** Editor only: which block the inspector currently has open, so the canvas
   *  can outline it. Undefined on the public page, where it costs nothing. */
  selectedBlockId?: string | null;
};

export type BlockRendererProps<T extends BlockType> = {
  props: BlockPropsFor<T>;
  context: BlockRenderContext;
};
