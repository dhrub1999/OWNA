"use client";

import { useState } from "react";
import { newItemId } from "@/lib/blocks/definitions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "../image-field";
import {
  PanelSection,
  SegmentedField,
  SwitchField,
  TextField,
} from "../controls";
import { RepeatableList } from "../repeatable-list";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function ProjectsInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"projects">(block);

  return (
    <>
      <PanelSection title="Projects">
        <TextField
          label="Heading"
          value={props.heading}
          onChange={(value) => set("heading", value)}
          maxLength={120}
        />
        <RepeatableList
          items={props.items}
          max={40}
          onChange={(items) => set("items", items)}
          onAdd={() =>
            set("items", [
              ...props.items,
              {
                id: newItemId(),
                name: "",
                description: "",
                imageUrl: "",
                url: "",
                tags: [],
              },
            ])
          }
          addLabel="Add a project"
          itemLabel={(item, index) => item.name || `Project ${index + 1}`}
          renderItem={(item, update) => (
            <>
              <Input
                value={item.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="Name"
                aria-label="Project name"
                maxLength={80}
                className="text-xs"
              />
              <Textarea
                value={item.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder="One line about it"
                aria-label="Description"
                maxLength={300}
                rows={2}
                className="text-xs"
              />
              <Input
                value={item.url}
                onChange={(event) => update({ url: event.target.value })}
                placeholder="Link (optional)"
                aria-label="Project link"
                spellCheck={false}
                className="text-xs"
              />
              <TagsInput
                tags={item.tags}
                onChange={(tags) => update({ tags })}
              />
              <ImageField
                label="Cover"
                value={item.imageUrl}
                onChange={(url) => update({ imageUrl: url })}
              />
            </>
          )}
        />
      </PanelSection>

      <PanelSection title="Appearance">
        <SegmentedField
          label="Layout"
          value={props.layout}
          onChange={(value) => set("layout", value)}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
        <SegmentedField
          label="Columns"
          value={props.columns}
          onChange={(value) => set("columns", value)}
          options={[
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 3, label: "3" },
          ]}
        />
        <SegmentedField
          label="Image shape"
          value={props.imageRatio}
          onChange={(value) => set("imageRatio", value)}
          options={[
            { value: "16:9", label: "Wide" },
            { value: "4:3", label: "Photo" },
            { value: "1:1", label: "Square" },
            { value: "none", label: "None" },
          ]}
          columns={2}
        />
        <SwitchField
          label="Show descriptions"
          checked={props.showDescription}
          onChange={(value) => set("showDescription", value)}
        />
        <SwitchField
          label="Show tags"
          checked={props.showTags}
          onChange={(value) => set("showTags", value)}
        />
      </PanelSection>
    </>
  );
}

/**
 * Tags are edited as a comma-separated string because that is how people
 * type them; the schema stores an array. The input keeps its own local text
 * so an in-progress trailing comma (typed while starting the next tag) isn't
 * immediately stripped by re-rendering from the parsed array.
 */
function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [text, setText] = useState(tags.join(", "));

  function handleChange(next: string) {
    setText(next);
    onChange(
      next
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    );
  }

  return (
    <Input
      value={text}
      onChange={(event) => handleChange(event.target.value)}
      placeholder="Tags, comma separated"
      aria-label="Tags"
      className="text-xs"
    />
  );
}
