"use client";

import { useCallback, useMemo } from "react";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { draftToSnapshot } from "@/lib/editor/document";
import { useEditor, useEditorDispatch, type Device } from "./editor-store";

/**
 * Live preview.
 *
 * This mounts the very same `ProfileRenderer` the public page uses, fed a
 * snapshot built from the draft in the same shape `publish_profile()` produces
 * in SQL. The preview is therefore not a model of the published page — it is
 * the published page's renderer — so the two cannot drift.
 *
 * The device frames are real widths on a container-query context. Every block's
 * responsive CSS keys off `@container`, not the viewport, which is why the
 * mobile frame here behaves like an actual 390px phone rather than a narrow box
 * on a wide screen.
 */
const FRAME_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "834px",
  mobile: "390px",
};

export function Canvas() {
  const { document, device, selectedBlockId } = useEditor();
  const dispatch = useEditorDispatch();

  const snapshot = useMemo(() => draftToSnapshot(document), [document]);

  // Selection by delegation: the renderer tags each block wrapper with its id,
  // so the canvas needs no per-block editor chrome injected into the markup.
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-block-id]",
      );
      dispatch({ type: "select", id: target?.dataset.blockId ?? null });
    },
    [dispatch],
  );

  const hiddenCount = document.blocks.filter((block) => !block.visible).length;

  return (
    <div className="bg-muted/40 absolute inset-0 flex flex-col overflow-auto overscroll-contain">
      <div className="flex min-h-full shrink-0 justify-center p-4 sm:p-8">
        <div
          className="bg-background w-full overflow-hidden rounded-xl border shadow-sm transition-[max-width] duration-200"
          style={{ maxWidth: FRAME_WIDTH[device] }}
        >
          {/* Click-to-select. The keyboard path to the same thing is the block
              outline in the left panel, which is a real list of buttons. */}
          <div onClick={onClick} data-editing="true">
            <ProfileRenderer
              snapshot={snapshot}
              isPreview
              selectedBlockId={selectedBlockId}
              className="min-h-[60vh]"
            />
          </div>
        </div>
      </div>

      {hiddenCount > 0 ? (
        <p className="text-muted-foreground border-t px-4 py-2 text-center text-xs">
          {hiddenCount} hidden block{hiddenCount === 1 ? "" : "s"} won’t be
          published.
        </p>
      ) : null}
    </div>
  );
}
