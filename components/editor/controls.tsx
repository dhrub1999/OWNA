"use client";

import { useId, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Inspector controls.
 *
 * Every property panel is built from these, which is what keeps the panels
 * short enough to read and makes labelling, spacing and keyboard behaviour
 * consistent without each one re-deciding it.
 */

export function Field({
  label,
  hint,
  htmlFor,
  children,
  warning,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  warning?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-xs font-medium">
          {label}
        </Label>
        {hint ? (
          <span className="text-muted-foreground text-[11px]">{hint}</span>
        ) : null}
      </div>
      {children}
      {warning ? (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-500">
          <AlertTriangle className="mt-px size-3 shrink-0" aria-hidden="true" />
          {warning}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  warning,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  warning?: string | null;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} warning={warning}>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint ?? (maxLength ? `${value.length}/${maxLength}` : undefined)}
    >
      <Textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function SwitchField({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <div>
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        {hint ? (
          <p className="text-muted-foreground text-[11px]">{hint}</p>
        ) : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "px",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <Field label={label} hint={`${value}${unit}`}>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => {
          const first = Array.isArray(next) ? next[0] : next;
          if (typeof first === "number") onChange(first);
        }}
        aria-label={label}
      />
    </Field>
  );
}

/**
 * A small set of mutually exclusive choices.
 *
 * Radio semantics rather than buttons, so arrow keys move between options the
 * way a keyboard user expects.
 */
export function SegmentedField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  columns,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (value: T) => void;
  columns?: number;
}) {
  const name = useId();

  return (
    <Field label={label}>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <label
              key={String(option.value)}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
                "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-1",
                selected
                  ? "border-foreground/25 bg-muted"
                  : "border-transparent hover:bg-muted/60 text-muted-foreground",
              )}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.icon}
              <span className="truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="border-input bg-background focus-visible:ring-ring h-8 w-full rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * Colour input.
 *
 * The text field accepts a typed hex and the picker covers everything else.
 * Only a well-formed hex is committed — the theme schema rejects anything else,
 * so letting a half-typed value through would just flash a fallback colour.
 */
export function ColorField({
  label,
  value,
  onChange,
  warning,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  warning?: string | null;
}) {
  const [draft, setDraft] = useState(value);
  const id = useId();

  // Keep the text input in step when the colour changes from elsewhere, e.g.
  // applying a preset or hitting undo.
  if (
    draft.toLowerCase() !== value.toLowerCase() &&
    document.activeElement?.id !== id
  ) {
    setDraft(value);
  }

  function commit(next: string) {
    setDraft(next);
    if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(next))
      onChange(next.toLowerCase());
  }

  return (
    <Field label={label} htmlFor={id} warning={warning}>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            className="border-input size-8 shrink-0 rounded-md border"
            style={{ backgroundColor: value }}
            aria-label={`${label}: choose colour`}
          />
          <PopoverContent className="w-auto p-3">
            <HexColorPicker color={value} onChange={(next) => commit(next)} />
          </PopoverContent>
        </Popover>
        <Input
          id={id}
          value={draft}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setDraft(value)}
          spellCheck={false}
          className="font-mono text-xs"
        />
      </div>
    </Field>
  );
}

export function PanelSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-xs font-semibold tracking-wide uppercase"
      >
        {title}
        <span
          className="text-muted-foreground transition-transform"
          style={{ display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ›
        </span>
      </button>
      {open ? (
        <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>
      ) : null}
    </div>
  );
}
