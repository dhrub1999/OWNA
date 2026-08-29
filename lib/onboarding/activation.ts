import type { BlockRow, ProfileRow } from "@/lib/supabase/profile";

/**
 * What a new profile is still missing.
 *
 * Publishing is not the finish line — a live page with a name and nothing else
 * is the state most abandoned profiles are stuck in. These are the four things
 * that separate that from a page worth sending someone, in the order they are
 * worth doing.
 *
 * Derived from the draft's real contents rather than from a stored "completed
 * steps" list. A checklist that can disagree with the page is a checklist that
 * will, the first time someone deletes a block.
 *
 * Pure, so the rules can be tested without a database.
 */

export type ActivationStep = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

/** Does a block of this type carry at least one entry? */
function hasItems(blocks: BlockRow[], type: string): boolean {
  return blocks.some((block) => {
    if (block.type !== type) return false;
    const props = block.props as { items?: unknown } | null;
    return Array.isArray(props?.items) && props.items.length > 0;
  });
}

function hasText(blocks: BlockRow[], type: string, field: string): boolean {
  return blocks.some((block) => {
    if (block.type !== type) return false;
    const props = block.props as Record<string, unknown> | null;
    const value = props?.[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function activationSteps({
  profile,
  blocks,
  isLive,
}: {
  profile: ProfileRow;
  blocks: BlockRow[];
  isLive: boolean;
}): ActivationStep[] {
  return [
    {
      id: "bio",
      label: "Say what you do",
      // Either place is a real answer: the hero's own bio field, or the
      // profile-level one it falls back to when the block leaves it blank.
      done:
        Boolean(profile.bio?.trim()) || hasText(blocks, "hero", "bio"),
      href: "/editor",
    },
    {
      id: "avatar",
      label: "Add a photo",
      // Either place is a real answer: the account-level photo, or the
      // hero block's own photo when it sets one instead.
      done:
        Boolean(profile.avatar_url?.trim()) ||
        hasText(blocks, "hero", "avatarUrl"),
      href: "/editor",
    },
    {
      id: "links",
      label: "Add somewhere to go next",
      done: hasItems(blocks, "links") || hasItems(blocks, "social"),
      href: "/editor",
    },
    {
      id: "publish",
      label: "Publish it",
      done: isLive,
      href: "/dashboard",
    },
  ];
}
