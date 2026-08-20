"use client";

import { MousePointerSquareDashed } from "lucide-react";
import { BLOCK_META } from "@/lib/blocks/definitions";
import { BLOCK_INSPECTORS } from "./inspectors";
import {
  PanelSection,
  SegmentedField,
  SliderField,
  SwitchField,
} from "./controls";
import { useEditorDispatch, useSelectedBlock } from "./editor-store";

/**
 * The properties panel for whatever is selected.
 *
 * Every block gets its own content and appearance sections from the inspector
 * registry, plus the shared placement controls below — the handful of settings
 * that mean the same thing whatever the block is.
 */
export function Inspector() {
  const block = useSelectedBlock();
  const dispatch = useEditorDispatch();

  if (!block) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 px-6 py-16 text-center">
        <MousePointerSquareDashed className="size-5" aria-hidden="true" />
        <p className="text-xs">
          Pick a block from the outline, or click one in the preview.
        </p>
      </div>
    );
  }

  const BlockInspector = BLOCK_INSPECTORS[block.type];
  const meta = BLOCK_META[block.type];

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{meta.label}</h2>
        <p className="text-muted-foreground text-[11px]">{meta.description}</p>
      </div>

      <BlockInspector block={block} />

      <PanelSection title="Placement" defaultOpen={false}>
        <SegmentedField
          label="Surface"
          value={block.style.surface}
          onChange={(surface) =>
            dispatch({ type: "update-style", id: block.id, patch: { surface } })
          }
          options={[
            { value: "none", label: "Plain" },
            { value: "card", label: "Card" },
            { value: "accent", label: "Accent" },
          ]}
        />
        <SegmentedField
          label="Alignment"
          value={block.style.align}
          onChange={(align) =>
            dispatch({ type: "update-style", id: block.id, patch: { align } })
          }
          options={[
            { value: "inherit", label: "Auto" },
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
          ]}
        />
        <SliderField
          label="Extra space"
          value={block.style.spacing}
          onChange={(spacing) =>
            dispatch({ type: "update-style", id: block.id, patch: { spacing } })
          }
          min={0}
          max={96}
        />
        <SwitchField
          label="Edge to edge"
          checked={block.style.fullBleed}
          onChange={(fullBleed) =>
            dispatch({ type: "update-style", id: block.id, patch: { fullBleed } })
          }
          hint="Ignore the page width for this block"
        />
        <SwitchField
          label="Visible"
          checked={block.visible}
          onChange={() => dispatch({ type: "toggle-visible", id: block.id })}
          hint="Hidden blocks are left out when you publish"
        />
      </PanelSection>
    </div>
  );
}
