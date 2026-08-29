"use client";

import { ProfileRenderer } from "@/components/public/profile-renderer";
import {
  type BuildFlowPreset,
  buildFlowSnapshot,
} from "@/lib/marketing/build-flow-presets";
import { cn } from "@/lib/utils";

/**
 * The page the editor on the left is building.
 *
 * This is the real `ProfileRenderer`, driven by a real snapshot — the same
 * component sections 4 and 6 mount, and the same one that serves published
 * profiles. Re-theming is a preset swap and revealing a block is a longer
 * slice of the block array, so nothing here can drift from what the product
 * actually renders.
 *
 * The reveal and colour transitions are in globals.css under
 * `.build-flow-preview`: a block arriving is a fresh mount, which is what makes
 * a plain CSS mount animation fire for the new block and never re-run for the
 * ones already on screen.
 */
export function BuildFlowPreview({
  preset,
  revealed,
  isPublished,
}: {
  preset: BuildFlowPreset;
  revealed: number;
  isPublished: boolean;
}) {
  const snapshot = buildFlowSnapshot(preset, revealed);

  return (
    // The ring lives out here rather than on the masked element: a ring is a
    // box-shadow, and the mask below would clip it away.
    <div
      className={cn(
        "w-full max-w-[380px] rounded-[30px] transition-shadow duration-500 stage:max-w-[440px]",
        isPublished ? "ring-4 ring-primary/10" : "ring-0 ring-transparent",
      )}
    >
      <div
        className={cn(
          "h-[520px] overflow-hidden rounded-[30px] border transition-colors duration-500 stage:h-[min(600px,64dvh)]",
          // Masked at the foot for the same reason as section 6: a fixed-height
          // window otherwise cuts the page off mid-block.
          "[mask-image:linear-gradient(to_bottom,#000_84%,transparent_99%)]",
          isPublished ? "border-primary/55" : "border-border",
        )}
        style={{ background: preset.theme.colors.background }}
      >
        <div className="build-flow-preview pointer-events-none h-full overflow-hidden">
          <ProfileRenderer snapshot={snapshot} isPreview />
        </div>
      </div>
    </div>
  );
}
