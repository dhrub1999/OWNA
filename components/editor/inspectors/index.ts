import type { BlockType } from "@/lib/blocks/definitions";
import { DividerInspector } from "./divider-inspector";
import { EmbedInspector } from "./embed-inspector";
import { GalleryInspector } from "./gallery-inspector";
import { HeroInspector } from "./hero-inspector";
import { ImageInspector } from "./image-inspector";
import { LinksInspector } from "./links-inspector";
import { ProjectsInspector } from "./projects-inspector";
import { SocialInspector } from "./social-inspector";
import { TextInspector } from "./text-inspector";
import type { InspectorProps } from "./use-block-props";

/**
 * Type -> property panel.
 *
 * The second of the two registries keyed off lib/blocks/definitions.ts. It is
 * imported only by the editor, which is what keeps every control, colour picker
 * and drag handle out of the public profile's bundle.
 */
export const BLOCK_INSPECTORS: Record<
  BlockType,
  (props: InspectorProps) => React.ReactNode
> = {
  hero: HeroInspector,
  text: TextInspector,
  social: SocialInspector,
  links: LinksInspector,
  projects: ProjectsInspector,
  image: ImageInspector,
  gallery: GalleryInspector,
  embed: EmbedInspector,
  divider: DividerInspector,
};
