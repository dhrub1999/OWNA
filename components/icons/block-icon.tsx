import {
  AtSign,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Link2,
  Minus,
  Play,
  Type,
  UserRound,
} from "lucide-react";
import type { BlockType } from "@/lib/blocks/definitions";

/**
 * Block icons.
 *
 * The registry in lib/blocks/definitions.ts names an icon as a string so that
 * it can stay free of React. This is where that name becomes a component —
 * explicitly, rather than through Lucide's dynamic import, so the editor bundle
 * contains nine icons instead of the whole set.
 */
const ICONS = {
  hero: UserRound,
  text: Type,
  social: AtSign,
  links: Link2,
  projects: LayoutGrid,
  image: ImageIcon,
  gallery: Images,
  embed: Play,
  divider: Minus,
} as const;

export function BlockIcon({
  type,
  className,
}: {
  type: BlockType;
  className?: string;
}) {
  const Icon = ICONS[type] ?? Type;
  return <Icon className={className} aria-hidden="true" />;
}
