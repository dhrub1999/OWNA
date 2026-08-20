"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { cn } from "@/lib/utils";

const FRAMES = [
  { value: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { value: "tablet", label: "Tablet", width: "834px", icon: Tablet },
  { value: "mobile", label: "Mobile", width: "390px", icon: Smartphone },
] as const;

type FrameValue = (typeof FRAMES)[number]["value"];

/**
 * Device frames for the draft preview.
 *
 * The frames set a real width on a container-query context, and every block's
 * responsive rules key off `@container`. That is what makes the mobile frame
 * truthful on a desktop monitor — with viewport media queries it would just be
 * a narrow column showing the desktop layout.
 */
export function PreviewFrame({ snapshot }: { snapshot: ProfileSnapshot }) {
  const [frame, setFrame] = useState<FrameValue>("desktop");
  const active = FRAMES.find((option) => option.value === frame) ?? FRAMES[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="radiogroup"
        aria-label="Preview size"
        className="flex justify-center gap-1 border-b py-2"
      >
        {FRAMES.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors",
              "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2",
              frame === value ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60",
            )}
          >
            <input
              type="radio"
              name="preview-frame"
              className="sr-only"
              checked={frame === value}
              onChange={() => setFrame(value)}
            />
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </label>
        ))}
      </div>

      <div className="bg-muted/40 flex-1 overflow-auto p-4 sm:p-8">
        <div
          className="bg-background mx-auto overflow-hidden rounded-xl border shadow-sm transition-[max-width] duration-200"
          style={{ maxWidth: active.width }}
        >
          <ProfileRenderer snapshot={snapshot} />
        </div>
      </div>
    </div>
  );
}
