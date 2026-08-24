"use client";

import { newItemId } from "@/lib/blocks/definitions";
import { Input } from "@/components/ui/input";
import { ImageField } from "../image-field";
import { FocalPointField } from "../focal-point-field";
import {
  PanelSection,
  SegmentedField,
  SliderField,
  SwitchField,
  TextField,
} from "../controls";
import { RepeatableList } from "../repeatable-list";
import { useBlockProps, type InspectorProps } from "./use-block-props";

export function GalleryInspector({ block }: InspectorProps) {
  const [props, set] = useBlockProps<"gallery">(block);
  const isBento = props.layout === "bento";

  const missingAlt = props.images.filter(
    (image) => image.url.trim() && !image.alt.trim(),
  ).length;
  const hiddenByBento = isBento ? Math.max(0, props.images.length - 6) : 0;

  return (
    <>
      <PanelSection title="Images">
        <TextField
          label="Heading"
          value={props.heading}
          onChange={(value) => set("heading", value)}
          placeholder="Optional"
          maxLength={120}
        />
        <RepeatableList
          items={props.images}
          max={isBento ? 6 : 60}
          onChange={(images) => set("images", images)}
          onAdd={() =>
            set("images", [
              ...props.images,
              {
                id: newItemId(),
                url: "",
                alt: "",
                caption: "",
                shape: "square",
                position: "center",
              },
            ])
          }
          addLabel="Add an image"
          itemLabel={(item, index) => item.alt || item.caption || `Image ${index + 1}`}
          renderItem={(item, update) => (
            <>
              <ImageField
                label="File"
                value={item.url}
                onChange={(url) => update({ url })}
              />
              <Input
                value={item.alt}
                onChange={(event) => update({ alt: event.target.value })}
                placeholder="Alt text"
                aria-label="Alt text"
                maxLength={200}
                className="text-xs"
              />
              <Input
                value={item.caption}
                onChange={(event) => update({ caption: event.target.value })}
                placeholder="Caption"
                aria-label="Caption"
                maxLength={200}
                className="text-xs"
              />
              {isBento ? (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <SegmentedField
                      label="Shape"
                      value={item.shape}
                      onChange={(shape) => update({ shape })}
                      options={[
                        { value: "square", label: "Square" },
                        { value: "landscape", label: "Landscape" },
                        { value: "portrait", label: "Portrait" },
                      ]}
                    />
                  </div>
                  <FocalPointField
                    label="Focal point"
                    value={item.position}
                    onChange={(position) => update({ position })}
                  />
                </div>
              ) : null}
            </>
          )}
        />
        {missingAlt > 0 ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-500">
            {missingAlt} image{missingAlt === 1 ? "" : "s"} without alt text.
          </p>
        ) : null}
        {hiddenByBento > 0 ? (
          <p className="text-muted-foreground text-[11px]">
            Only the first 6 images show in Bento layout — the rest are still
            saved.
          </p>
        ) : null}
      </PanelSection>

      <PanelSection title="Appearance">
        <SegmentedField
          label="Layout"
          value={props.layout}
          onChange={(value) => set("layout", value)}
          options={[
            { value: "grid", label: "Grid" },
            { value: "masonry", label: "Masonry" },
            { value: "bento", label: "Bento" },
          ]}
        />
        {!isBento ? (
          <SegmentedField
            label="Columns"
            value={props.columns}
            onChange={(value) => set("columns", value)}
            options={[
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
            ]}
          />
        ) : null}
        <SliderField
          label="Gap"
          value={props.gap}
          onChange={(value) => set("gap", value)}
          min={0}
          max={32}
        />
        <SwitchField
          label="Show captions"
          checked={props.showCaptions}
          onChange={(value) => set("showCaptions", value)}
        />
        <SwitchField
          label="Click to enlarge"
          checked={props.lightbox}
          onChange={(value) => set("lightbox", value)}
        />
      </PanelSection>
    </>
  );
}
