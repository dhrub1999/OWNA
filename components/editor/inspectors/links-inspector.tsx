"use client";

import { newItemId } from "@/lib/blocks/definitions";
import { Input } from "@/components/ui/input";
import {
  PanelSection,
  SegmentedField,
  SwitchField,
  TextField,
} from "../controls";
import { RepeatableList } from "../repeatable-list";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function LinksInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"links">(block);

  return (
    <>
      <PanelSection title="Buttons">
        <TextField
          label="Heading"
          value={props.heading}
          onChange={(value) => set("heading", value)}
          placeholder="Optional"
          maxLength={120}
        />
        <RepeatableList
          items={props.items}
          max={50}
          onChange={(items) => set("items", items)}
          onAdd={() =>
            set("items", [
              ...props.items,
              { id: newItemId(), label: "", url: "", description: "", icon: "" },
            ])
          }
          addLabel="Add a button"
          itemLabel={(item, index) => item.label || `Button ${index + 1}`}
          renderItem={(item, update) => (
            <>
              <Input
                value={item.label}
                onChange={(event) => update({ label: event.target.value })}
                placeholder="Label"
                aria-label="Label"
                maxLength={80}
                className="text-xs"
              />
              <Input
                value={item.url}
                onChange={(event) => update({ url: event.target.value })}
                placeholder="example.com/page"
                aria-label="Link"
                spellCheck={false}
                className="text-xs"
              />
              <Input
                value={item.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder="Description (optional)"
                aria-label="Description"
                maxLength={140}
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
            { value: "solid", label: "Solid" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
            { value: "card", label: "Card" },
          ]}
          columns={2}
        />
        <SegmentedField
          label="Layout"
          value={props.layout}
          onChange={(value) => set("layout", value)}
          options={[
            { value: "stack", label: "Stacked" },
            { value: "grid", label: "Two up" },
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
        <SwitchField
          label="Show arrow"
          checked={props.showArrow}
          onChange={(value) => set("showArrow", value)}
        />
      </PanelSection>
    </>
  );
}
