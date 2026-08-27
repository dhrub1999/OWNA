"use client";

import { BlockIcon } from "@/components/icons/block-icon";
import { BLOCK_LIST, type BlockType } from "@/lib/blocks/definitions";
import { cn } from "@/lib/utils";
import { useEditor, useEditorDispatch } from "./editor-store";

const GROUP_LABELS: Record<string, string> = {
  identity: "You",
  content: "Content",
  media: "Media",
  structure: "Structure",
};

/**
 * Add a block.
 *
 * Singletons — currently just the hero — are disabled rather than hidden once
 * present, so the palette stays a stable map of what the product can do instead
 * of a list that changes shape as you build.
 */
export function BlockLibrary() {
  const { document } = useEditor();
  const dispatch = useEditorDispatch();

  const used = new Set(document.blocks.map((block) => block.type));

  const groups = Object.entries(
    BLOCK_LIST.reduce<Record<string, typeof BLOCK_LIST>>((acc, meta) => {
      (acc[meta.group] ??= []).push(meta);
      return acc;
    }, {}),
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {groups.map(([group, items]) => (
        <div key={group}>
          <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
            {GROUP_LABELS[group] ?? group}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((meta) => {
              const disabled = Boolean(meta.singleton && used.has(meta.type));
              return (
                <button
                  key={meta.type}
                  type="button"
                  disabled={disabled}
                  title={disabled ? `You already have a ${meta.label.toLowerCase()}` : meta.description}
                  onClick={() =>
                    dispatch({ type: "add-block", blockType: meta.type as BlockType })
                  }
                  className={cn(
                    "focus-visible:ring-ring flex items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    disabled
                      ? "text-muted-foreground cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-foreground/25 hover:bg-muted/60",
                  )}
                >
                  <BlockIcon
                    type={meta.type as BlockType}
                    className="text-muted-foreground size-3.5 shrink-0"
                  />
                  <span className="truncate">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
