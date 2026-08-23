"use client";

import { useId } from "react";
import type { GalleryImagePosition } from "@/lib/blocks/definitions";
import { objectPositionFor } from "@/lib/blocks/gallery";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field } from "./controls";
import { cn } from "@/lib/utils";

const POSITIONS: { value: GalleryImagePosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "center-left", label: "Center left" },
  { value: "center", label: "Center" },
  { value: "center-right", label: "Center right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

/**
 * A 3x3 focal-point picker for a bento gallery image that may get cropped.
 * Maps directly to CSS object-position. Modeled on ColorField's popover
 * trigger + panel shape rather than SegmentedField, since 9 always-expanded
 * labeled buttons would bloat an already-dense image row.
 */
export function FocalPointField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GalleryImagePosition;
  onChange: (value: GalleryImagePosition) => void;
}) {
  const name = useId();

  return (
    <Field label={label}>
      <Popover>
        <PopoverTrigger
          type="button"
          className="border-input relative size-8 shrink-0 rounded-md border bg-muted/40"
          aria-label={`${label}: choose focal point`}
        >
          <span
            className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{
              left: objectPositionFor(value).split(" ")[0],
              top: objectPositionFor(value).split(" ")[1],
            }}
            aria-hidden="true"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div
            role="radiogroup"
            aria-label={label}
            className="grid grid-cols-3 gap-1"
          >
            {POSITIONS.map((position) => {
              const selected = position.value === value;
              return (
                <label
                  key={position.value}
                  className={cn(
                    "relative flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors",
                    "has-focus-visible:ring-ring has-focus-visible:ring-2 has-focus-visible:ring-offset-1",
                    selected
                      ? "border-foreground/25 bg-muted"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={position.value}
                    checked={selected}
                    onChange={() => onChange(position.value)}
                    className="sr-only"
                  />
                  <span className="sr-only">{position.label}</span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      selected ? "bg-foreground" : "bg-muted-foreground/50",
                    )}
                    aria-hidden="true"
                  />
                </label>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
