import type { BlockRendererProps } from "./types";

const SIZE_VAR = {
  sm: "var(--p-text-sm)",
  base: "var(--p-text-base)",
  lg: "var(--p-text-lg)",
} as const;

const TONE_COLOR = {
  default: undefined,
  muted: "var(--p-muted)",
  accent: "var(--p-accent)",
} as const;

/**
 * Plain text only.
 *
 * The body is rendered as a text node with `white-space: pre-wrap`, so line
 * breaks survive and markup does not. There is no sanitizer in this codebase
 * because there is nothing to sanitize — rich text is a later feature that will
 * arrive with one.
 */
export function TextBlock({ props }: BlockRendererProps<"text">) {
  if (!props.heading.trim() && !props.body.trim()) return null;

  return (
    <div
      style={{
        textAlign: props.align === "inherit" ? undefined : props.align,
        color: TONE_COLOR[props.tone],
      }}
    >
      {props.heading.trim() ? (
        <h2 className="profile-heading">{props.heading}</h2>
      ) : null}
      {props.body.trim() ? (
        <p className="profile-text-body" style={{ fontSize: SIZE_VAR[props.size] }}>
          {props.body}
        </p>
      ) : null}
    </div>
  );
}
