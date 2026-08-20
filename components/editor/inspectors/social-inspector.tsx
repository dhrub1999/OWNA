"use client";

import {
  SOCIAL_META,
  SOCIAL_PLATFORMS,
  newItemId,
  type SocialPlatform,
} from "@/lib/blocks/definitions";
import { Input } from "@/components/ui/input";
import { PanelSection, SegmentedField, SelectField, TextField } from "../controls";
import { RepeatableList } from "../repeatable-list";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function SocialInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"social">(block);

  return (
    <>
      <PanelSection title="Links">
        <TextField
          label="Heading"
          value={props.heading}
          onChange={(value) => set("heading", value)}
          placeholder="Optional"
          maxLength={120}
        />
        <RepeatableList
          items={props.links}
          max={20}
          onChange={(links) => set("links", links)}
          onAdd={() =>
            set("links", [
              ...props.links,
              { id: newItemId(), platform: "website", url: "", label: "" },
            ])
          }
          addLabel="Add a link"
          itemLabel={(item) => SOCIAL_META[item.platform]?.label ?? "Link"}
          renderItem={(item, update) => (
            <>
              <select
                value={item.platform}
                onChange={(event) =>
                  update({ platform: event.target.value as SocialPlatform })
                }
                aria-label="Platform"
                className="border-input bg-background h-8 w-full rounded-md border px-2 text-sm"
              >
                {SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {SOCIAL_META[platform].label}
                  </option>
                ))}
              </select>
              <Input
                value={item.url}
                onChange={(event) => update({ url: event.target.value })}
                placeholder={SOCIAL_META[item.platform]?.placeholder}
                aria-label="Link"
                spellCheck={false}
                className="text-xs"
              />
            </>
          )}
        />
      </PanelSection>

      <PanelSection title="Appearance">
        <SegmentedField
          label="Style"
          value={props.style}
          onChange={(value) => set("style", value)}
          options={[
            { value: "icon", label: "Icons" },
            { value: "icon-label", label: "Labels" },
            { value: "button", label: "Buttons" },
          ]}
        />
        <SegmentedField
          label="Layout"
          value={props.layout}
          onChange={(value) => set("layout", value)}
          options={[
            { value: "row", label: "Row" },
            { value: "column", label: "Column" },
            { value: "grid", label: "Grid" },
          ]}
        />
        <SelectField
          label="Icon shape"
          value={props.shape}
          onChange={(value) => set("shape", value)}
          options={[
            { value: "circle", label: "Circle" },
            { value: "rounded", label: "Rounded" },
            { value: "square", label: "Square" },
          ]}
        />
        <SegmentedField
          label="Size"
          value={props.size}
          onChange={(value) => set("size", value)}
          options={[
            { value: "sm", label: "S" },
            { value: "md", label: "M" },
            { value: "lg", label: "L" },
          ]}
        />
      </PanelSection>
    </>
  );
}
