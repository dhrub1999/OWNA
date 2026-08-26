import { allFontClassNames } from "@/lib/themes/fonts";
import { type CSSVars, themeToCssVars } from "@/lib/themes/to-css-vars";
import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { BlockRenderer } from "./blocks";
import type { BlockRenderContext } from "./blocks/types";

/**
 * Renders a published profile.
 *
 * Everything it needs arrives in one object. There is no fetching here, no
 * awaiting, and no server-only import — which is what lets the editor mount the
 * exact same component in the browser and get a preview that cannot drift from
 * production.
 *
 * The theme is applied as inline custom properties rather than a generated
 * stylesheet: see lib/themes/to-css-vars.ts for why that matters for both CSP
 * and preview performance.
 */
export function ProfileRenderer({
  snapshot,
  isPreview = false,
  selectedBlockId,
  className,
}: {
  snapshot: ProfileSnapshot;
  isPreview?: boolean;
  selectedBlockId?: string | null;
  className?: string;
}) {
  const { theme, layout, blocks, profile } = snapshot;
  const vars = themeToCssVars(theme, layout);

  const context: BlockRenderContext = {
    profile,
    layout,
    isPreview,
    selectedBlockId,
  };

  return (
    <main
      className={`profile-root ${allFontClassNames}${className ? ` ${className}` : ""}`}
      style={
        {
          ...vars,
          "--p-justify": layout.align === "center" ? "center" : "flex-start",
        } as CSSVars
      }
      data-bg={theme.background.kind}
      data-editing={isPreview ? "true" : undefined}
      data-layout-style={layout.style}
    >
      <div className="profile-container">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} context={context} />
        ))}

        {blocks.length === 0 ? (
          <p className="profile-muted" style={{ textAlign: "center" }}>
            Nothing here yet.
          </p>
        ) : null}
      </div>
    </main>
  );
}
