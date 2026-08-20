"use client";

import {
  PanelSection,
  SegmentedField,
  TextAreaField,
  TextField,
} from "../controls";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function TextInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"text">(block);

  return (
    <>
      <PanelSection title="Content">
        <TextField
          label="Heading"
          value={props.heading}
          onChange={(value) => set("heading", value)}
          placeholder="About"
          maxLength={120}
        />
        <TextAreaField
          label="Text"
          value={props.body}
          onChange={(value) => set("body", value)}
          placeholder="Line breaks are kept. Formatting isn't — this is plain text."
          maxLength={4000}
          rows={8}
        />
      </PanelSection>

      <PanelSection title="Appearance">
        <SegmentedField
          label="Size"
          value={props.size}
          onChange={(value) => set("size", value)}
          options={[
            { value: "sm", label: "Small" },
            { value: "base", label: "Normal" },
            { value: "lg", label: "Large" },
          ]}
        />
        <SegmentedField
          label="Tone"
          value={props.tone}
          onChange={(value) => set("tone", value)}
          options={[
            { value: "default", label: "Default" },
            { value: "muted", label: "Muted" },
            { value: "accent", label: "Accent" },
          ]}
        />
        <SegmentedField
          label="Alignment"
          value={props.align}
          onChange={(value) => set("align", value)}
          options={[
            { value: "inherit", label: "Auto" },
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
          ]}
        />
      </PanelSection>
    </>
  );
}
