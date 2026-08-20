import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { parseBlockProps, parseBlockStyle } from "@/lib/blocks/definitions";
import { resolvePreset, type ThemePresetId } from "@/lib/themes/presets";

/**
 * A sample profile for the landing page.
 *
 * Built as a real snapshot and rendered through the real renderer, so the
 * homepage is a demonstration rather than a mockup — if a block regresses, the
 * marketing page shows it.
 */
export function demoSnapshot(preset: ThemePresetId = "dark"): ProfileSnapshot {
  const { theme, layout } = resolvePreset(preset);

  const block = (id: string, type: Parameters<typeof parseBlockProps>[0], props: unknown) => ({
    id,
    type,
    props: parseBlockProps(type, props),
    style: parseBlockStyle({}),
  });

  return {
    version: 1,
    profile: {
      username: "maya",
      displayName: "Maya Chandra",
      bio: "",
      avatarUrl: "",
      status: "Building a type foundry",
      location: "Bengaluru",
    },
    seo: { title: "", description: "", ogImageUrl: "" },
    theme,
    layout,
    blocks: [
      block("demo-hero", "hero", {
        headline: "Maya Chandra",
        tagline: "Type designer · Occasional developer",
        bio: "I draw letterforms and argue about kerning. Currently working on a variable serif for screens.",
        showAvatar: false,
        status: "Open to commissions",
        location: "Bengaluru",
      }),
      block("demo-social", "social", {
        links: [
          { id: "s1", platform: "instagram", url: "instagram.com/maya", label: "" },
          { id: "s2", platform: "github", url: "github.com/maya", label: "" },
          { id: "s3", platform: "dribbble", url: "dribbble.com/maya", label: "" },
        ],
      }),
      block("demo-links", "links", {
        items: [
          {
            id: "l1",
            label: "Specimen — Kerala Serif",
            url: "example.com/specimen",
            description: "A variable serif in six optical sizes",
            icon: "",
          },
          { id: "l2", label: "Commission a typeface", url: "example.com/hire", description: "", icon: "" },
        ],
      }),
    ],
    publishedAt: null,
  };
}
