"use client";

import { useRef, useState } from "react";
import { Check, GripVertical, Lock, Monitor, Smartphone } from "lucide-react";
import { BlockIcon } from "@/components/icons/block-icon";
import { Logo } from "@/components/logo";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { BLOCK_LIST, BLOCK_META, type BlockType, starterBlockProps } from "@/lib/blocks/definitions";
import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { DEMO_PRESETS, demoProfiles } from "@/lib/demo-profiles";
import { PRESET_SWATCHES, THEME_PRESETS, resolvePreset, type ThemePresetId } from "@/lib/themes/presets";
import { cn } from "@/lib/utils";

type Device = "desktop" | "mobile";
type StageEntry = { key: string; type: BlockType; props: unknown };

/** The persona the stage opens on — the same real seed the design handoff
 *  uses for this hero layout ("photographer" → the Portfolio preset). */
const SEED = demoProfiles.photographer;
const SEED_PRESET: ThemePresetId = DEMO_PRESETS.photographer;
const START_TYPES = ["hero", "gallery"] as const;

const GROUP_LABELS: Record<string, string> = {
  identity: "You",
  content: "Content",
  media: "Media",
  structure: "Structure",
};

const DEVICES: { value: Device; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];

// Real starter content (`starterBlockProps`) leaves image/gallery blocks with
// no URL, and both renderers render nothing for an empty URL — correct for
// the real editor, but a click that visibly does nothing undercuts the point
// of a hero that is supposed to demonstrate a working editor. Picsum
// placeholders here are the same convention lib/demo-profiles.ts already uses
// for its own illustrative content, not a parallel system.
const PLACEHOLDER_IMAGE = "https://picsum.photos/seed/owna-editor-image/1200/900";
const PLACEHOLDER_GALLERY = [
  { id: "eg1", url: "https://picsum.photos/seed/owna-editor-a/700/700", alt: "", caption: "", shape: "square", position: "center" },
  { id: "eg2", url: "https://picsum.photos/seed/owna-editor-b/700/700", alt: "", caption: "", shape: "square", position: "center" },
  { id: "eg3", url: "https://picsum.photos/seed/owna-editor-c/700/700", alt: "", caption: "", shape: "square", position: "center" },
];

function seedEntries(): StageEntry[] {
  const byType = new Map(SEED.blocks.map((block) => [block.type, block] as const));
  return START_TYPES.map((type) => ({
    key: `seed-${type}`,
    type,
    props: structuredClone(byType.get(type)?.props ?? starterBlockProps(type)),
  }));
}

function starterFor(type: BlockType): unknown {
  const base = starterBlockProps(type);
  if (type === "image") return { ...base, url: PLACEHOLDER_IMAGE };
  if (type === "gallery") return { ...base, images: PLACEHOLDER_GALLERY };
  return base;
}

const SCROLL_MS = 340;

/** Eases the canvas viewport to its new bottom rather than jumping to it —
 *  `scrollTo({ behavior: "smooth" })` is a flatter, less deliberate motion
 *  than the rest of this stage's transitions. */
function scrollToEnd(el: HTMLDivElement) {
  const from = el.scrollTop;
  const to = el.scrollHeight - el.clientHeight;
  if (to - from < 2) return;
  const start = performance.now();
  function step(now: number) {
    const t = Math.min(1, (now - start) / SCROLL_MS);
    el.scrollTop = from + (to - from) * (1 - (1 - t) ** 3);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const BLOCK_GROUPS = Object.entries(
  BLOCK_LIST.reduce<Record<string, typeof BLOCK_LIST>>((acc, meta) => {
    (acc[meta.group] ??= []).push(meta);
    return acc;
  }, {}),
);

/**
 * The hero's live editor.
 *
 * This is not a recreation of the editor — it renders through the real
 * `ProfileRenderer` using the real theme presets from `lib/themes/presets.ts`,
 * driven by state local to this component rather than the persisted-document
 * reducer in `components/editor/editor-store.tsx`. That reducer exists for a
 * signed-in owner's draft — autosave, undo history, a publish flow tied to
 * auth — none of which applies to an anonymous visitor poking at the hero.
 * Add and remove are the only moves this stage offers; reordering needs none
 * of that machinery either, so drag-and-drop isn't here.
 */
export function EditorStage() {
  const [entries, setEntries] = useState<StageEntry[]>(seedEntries);
  const [preset, setPreset] = useState<ThemePresetId>(SEED_PRESET);
  const [device, setDevice] = useState<Device>("desktop");
  const viewportRef = useRef<HTMLDivElement>(null);

  const usedTypes = new Set(entries.map((entry) => entry.type));

  function addBlock(type: BlockType) {
    setEntries((prev) => [...prev, { key: crypto.randomUUID(), type, props: starterFor(type) }]);
    // The new block hasn't painted yet on the tick this fires — same delay
    // the design reference uses before measuring `scrollHeight`.
    setTimeout(() => {
      const el = viewportRef.current;
      if (el) scrollToEnd(el);
    }, 80);
  }

  function removeBlock(key: string) {
    setEntries((prev) => {
      const target = prev.find((entry) => entry.key === key);
      if (!target || target.type === "hero") return prev;
      return prev.filter((entry) => entry.key !== key);
    });
  }

  const { theme, layout } = resolvePreset(preset);
  const snapshot: ProfileSnapshot = {
    version: 1,
    profile: SEED.profile,
    seo: { title: "", description: "", ogImageUrl: "" },
    theme,
    layout,
    blocks: entries.map((entry) => ({
      id: entry.key,
      type: entry.type,
      props: entry.props,
      style: {},
    })),
    publishedAt: null,
  };

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-border bg-card shadow-[0_1px_2px_rgba(17,17,17,0.04),0_24px_60px_-28px_var(--ow-shadow)]">
      {/* Toolbar */}
      <div className="flex min-h-13 shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-1.5">
        <Logo className="h-4.5 w-auto shrink-0 text-foreground" />

        <div
          role="radiogroup"
          aria-label="Preview size"
          className="mx-auto flex items-center gap-0.5 rounded-md bg-background p-0.5"
        >
          {DEVICES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={device === value}
              onClick={() => setDevice(value)}
              className={cn(
                "flex cursor-pointer items-center rounded p-1.5 text-muted-foreground transition-colors",
                device === value && "bg-card text-foreground shadow-sm",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>

        <p className="hidden items-center gap-1.5 px-2 text-xs whitespace-nowrap text-muted-foreground editor:flex">
          <Check className="size-3" aria-hidden="true" />
          Saved
        </p>

        <span className="inline-flex h-8 shrink-0 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground">
          Publish
        </span>
      </div>

      <div className="flex flex-col editor:flex-row editor:items-stretch">
        {/* Sidebar */}
        <div className="flex max-h-65 flex-col overflow-auto border-b border-border editor:max-h-140 editor:flex-[0_1_208px] editor:border-r editor:border-b-0">
          <div className="border-b border-border py-3">
            <p className="mb-2 px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Your page
            </p>
            <ul className="flex flex-col">
              {entries.map((entry) => {
                const meta = BLOCK_META[entry.type];
                const locked = entry.type === "hero";
                return (
                  <li key={entry.key} className="flex items-center gap-1.5 py-1 pr-2.5 pl-4 text-xs">
                    <GripVertical className="size-3.5 shrink-0 text-[var(--ow-faint)]" aria-hidden="true" />
                    <span className="flex-1 truncate">{meta.label}</span>
                    {locked ? (
                      <Lock
                        className="size-2.5 shrink-0 text-[var(--ow-faint)]"
                        aria-label="The hero always stays"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeBlock(entry.key)}
                        aria-label={`Remove ${meta.label}`}
                        className="cursor-pointer rounded px-0.5 text-sm leading-none text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-4 p-4">
            {BLOCK_GROUPS.map(([group, items]) => (
              <div key={group}>
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {GROUP_LABELS[group] ?? group}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((meta) => {
                    const disabled = Boolean(meta.singleton && usedTypes.has(meta.type));
                    return (
                      <button
                        key={meta.type}
                        type="button"
                        disabled={disabled}
                        title={disabled ? `You already have a ${meta.label.toLowerCase()}` : meta.description}
                        onClick={() => addBlock(meta.type as BlockType)}
                        className={cn(
                          "flex items-center gap-2 rounded-md border border-border px-2 py-2 text-left text-xs transition-colors",
                          disabled
                            ? "cursor-not-allowed text-muted-foreground opacity-50"
                            : "cursor-pointer hover:border-foreground/25 hover:bg-secondary/60",
                        )}
                      >
                        <BlockIcon type={meta.type as BlockType} className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            ref={viewportRef}
            className="flex h-95 items-start justify-center overflow-x-hidden overflow-y-auto overscroll-contain bg-background p-3.5 editor:h-115 editor:p-5"
          >
            <div
              className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(17,17,17,0.05),0_12px_30px_-18px_var(--ow-shadow)] transition-[max-width] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ maxWidth: device === "mobile" ? 390 : 620 }}
            >
              <ProfileRenderer snapshot={snapshot} isPreview />
            </div>
          </div>

          <div className="shrink-0 border-t border-border px-4 py-3">
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Theme</p>
              <p className="font-mono text-[10px] text-muted-foreground">{THEME_PRESETS.length} presets</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {THEME_PRESETS.map((item) => {
                const swatch = PRESET_SWATCHES[item.id];
                const active = item.id === preset;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.description}
                    aria-pressed={active}
                    onClick={() => setPreset(item.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border py-1.25 pr-2.5 pl-1.5 text-left text-[11px] transition-colors",
                      active
                        ? "border-primary bg-[var(--ow-accent-soft)]"
                        : "border-border bg-card hover:border-foreground/25",
                    )}
                  >
                    <span
                      className="flex size-4.5 shrink-0 items-center justify-center rounded"
                      style={{ background: swatch.background, border: `1px solid ${swatch.border}` }}
                    >
                      <span className="size-1.75 rounded-full" style={{ background: swatch.accent }} />
                    </span>
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
