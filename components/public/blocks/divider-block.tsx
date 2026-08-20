import type { BlockRendererProps } from "./types";

export function DividerBlock({ props }: BlockRendererProps<"divider">) {
  if (props.variant === "space") {
    return <div aria-hidden="true" style={{ height: `${props.height}px` }} />;
  }

  return (
    <hr
      className="profile-divider"
      data-variant={props.variant}
      data-width={props.width}
      style={
        {
          "--divider-thickness": `${props.thickness}px`,
          marginBlock: `${props.height / 2}px`,
        } as React.CSSProperties
      }
    />
  );
}
