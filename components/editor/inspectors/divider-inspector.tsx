"use client";

import { PanelSection, SegmentedField, SliderField } from "../controls";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function DividerInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"divider">(block);

  return (
    <PanelSection title="Divider">
      <SegmentedField
        label="Style"
        value={props.variant}
        onChange={(value) => set("variant", value)}
        options={[
          { value: "line", label: "Line" },
          { value: "dashed", label: "Dashed" },
          { value: "dots", label: "Dots" },
          { value: "space", label: "Space" },
        ]}
        columns={2}
      />
      {props.variant !== "space" ? (
        <>
          <SliderField
            label="Thickness"
            value={props.thickness}
            onChange={(value) => set("thickness", value)}
            min={1}
            max={8}
          />
          <SegmentedField
            label="Width"
            value={props.width}
            onChange={(value) => set("width", value)}
            options={[
              { value: "full", label: "Full" },
              { value: "half", label: "Half" },
              { value: "short", label: "Short" },
            ]}
          />
        </>
      ) : null}
      <SliderField
        label={props.variant === "space" ? "Height" : "Space around"}
        value={props.height}
        onChange={(value) => set("height", value)}
        min={0}
        max={200}
      />
    </PanelSection>
  );
}
