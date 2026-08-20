"use client";

import { ImageField } from "../image-field";
import {
  PanelSection,
  SegmentedField,
  TextField,
} from "../controls";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function ImageInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"image">(block);

  return (
    <>
      <PanelSection title="Image">
        <ImageField
          label="File"
          value={props.url}
          onChange={(value) => set("url", value)}
        />
        <TextField
          label="Alt text"
          value={props.alt}
          onChange={(value) => set("alt", value)}
          placeholder="Describe the image"
          maxLength={200}
          // A warning, not a block: an empty alt is legitimate for a purely
          // decorative image, and guessing on the user's behalf would be worse
          // than saying nothing.
          warning={
            props.url && !props.alt.trim()
              ? "No alt text. Screen readers will skip this image."
              : null
          }
        />
        <TextField
          label="Caption"
          value={props.caption}
          onChange={(value) => set("caption", value)}
          maxLength={200}
        />
        <TextField
          label="Link"
          value={props.href}
          onChange={(value) => set("href", value)}
          placeholder="Optional"
        />
      </PanelSection>

      <PanelSection title="Appearance">
        <SegmentedField
          label="Shape"
          value={props.ratio}
          onChange={(value) => set("ratio", value)}
          options={[
            { value: "auto", label: "Auto" },
            { value: "16:9", label: "Wide" },
            { value: "4:3", label: "Photo" },
            { value: "1:1", label: "Square" },
            { value: "3:4", label: "Tall" },
          ]}
          columns={3}
        />
        <SegmentedField
          label="Fit"
          value={props.fit}
          onChange={(value) => set("fit", value)}
          options={[
            { value: "cover", label: "Fill" },
            { value: "contain", label: "Fit" },
          ]}
        />
        <SegmentedField
          label="Width"
          value={props.width}
          onChange={(value) => set("width", value)}
          options={[
            { value: "full", label: "Full" },
            { value: "inset", label: "Inset" },
            { value: "half", label: "Half" },
          ]}
        />
      </PanelSection>
    </>
  );
}
