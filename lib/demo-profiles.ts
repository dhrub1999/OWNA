import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { parseBlockProps, parseBlockStyle } from "@/lib/blocks/definitions";
import { resolvePreset, type ThemePresetId } from "@/lib/themes/presets";

const block = (id: string, type: Parameters<typeof parseBlockProps>[0], props: unknown) => ({
  id,
  type,
  props: parseBlockProps(type, props),
  style: parseBlockStyle({}),
});

/**
 * Creates a generic snapshot template
 */
function createSnapshot(
  preset: ThemePresetId,
  username: string,
  displayName: string,
  status: string,
  location: string,
  blocks: any[]
): ProfileSnapshot {
  const { theme, layout } = resolvePreset(preset);
  
  return {
    version: 1,
    profile: {
      username,
      displayName,
      bio: "",
      avatarUrl: "",
      status,
      location,
    },
    seo: { title: "", description: "", ogImageUrl: "" },
    theme,
    layout,
    blocks,
    publishedAt: null,
  };
}

export const demoProfiles: Record<string, ProfileSnapshot> = {
  consultant: createSnapshot(
    "professional",
    "sarah-consulting",
    "Sarah Jenkins",
    "Accepting new clients",
    "London",
    [
      block("hero-1", "hero", {
        headline: "Sarah Jenkins",
        tagline: "Strategic Growth Consultant",
        bio: "Helping B2B SaaS companies scale from $1M to $10M ARR through operational efficiency and go-to-market strategy.",
        showAvatar: false,
        status: "Accepting new clients",
        location: "London",
      }),
      block("links-1", "links", {
        items: [
          { id: "l1", label: "Book a Discovery Call", url: "example.com", description: "30-min strategy session", icon: "" },
          { id: "l2", label: "Read my Newsletter", url: "example.com", description: "Weekly insights on scaling SaaS", icon: "" },
        ],
      }),
      block("social-1", "social", {
        links: [
          { id: "s1", platform: "linkedin", url: "linkedin.com", label: "" },
          { id: "s2", platform: "twitter", url: "twitter.com", label: "" },
        ],
      }),
    ]
  ),
  jewellery: createSnapshot(
    "editorial",
    "aura-jewellery",
    "AURA",
    "New collection live",
    "Paris",
    [
      block("hero-2", "hero", {
        headline: "AURA",
        tagline: "Handcrafted fine jewellery",
        bio: "Ethically sourced materials, designed and made in our Paris atelier. Pieces meant to be worn every day.",
        showAvatar: false,
        status: "New collection live",
        location: "Paris",
      }),
      block("links-2", "links", {
        items: [
          { id: "l1", label: "Shop the Ethereal Collection", url: "example.com", description: "Our newest arrivals", icon: "" },
          { id: "l2", label: "Custom Bridal Design", url: "example.com", description: "Book a consultation", icon: "" },
        ],
      }),
      block("social-2", "social", {
        links: [
          { id: "s1", platform: "instagram", url: "instagram.com", label: "" },
          { id: "s2", platform: "pinterest", url: "pinterest.com", label: "" },
        ],
      }),
    ]
  ),
  photographer: createSnapshot(
    "portfolio",
    "marc-photo",
    "Marc Dubois",
    "Available for booking",
    "New York",
    [
      block("hero-3", "hero", {
        headline: "Marc Dubois",
        tagline: "Editorial & Commercial Photographer",
        bio: "Capturing light and shadow. Selected clients include Vogue, GQ, and Nike.",
        showAvatar: false,
        status: "Available for booking",
        location: "New York",
      }),
      block("social-3", "social", {
        links: [
          { id: "s1", platform: "instagram", url: "instagram.com", label: "" },
          { id: "s2", platform: "email", url: "mailto:hello@example.com", label: "" },
        ],
      }),
      block("links-3", "links", {
        items: [
          { id: "l1", label: "View Portfolio", url: "example.com", description: "Selected works 2024", icon: "" },
          { id: "l2", label: "Client Galleries", url: "example.com", description: "Private access", icon: "" },
        ],
      }),
    ]
  ),
  freelancer: createSnapshot(
    "cyber",
    "dev-alex",
    "Alex Chen",
    "Building things",
    "Remote",
    [
      block("hero-4", "hero", {
        headline: "Alex Chen",
        tagline: "Full-stack Developer",
        bio: "Specializing in React, Node, and Web3. Turning coffee into scalable applications.",
        showAvatar: false,
        status: "Building things",
        location: "Remote",
      }),
      block("links-4", "links", {
        items: [
          { id: "l1", label: "My GitHub", url: "github.com", description: "Open source contributions", icon: "" },
          { id: "l2", label: "Read my Blog", url: "example.com", description: "Technical writing", icon: "" },
        ],
      }),
      block("social-4", "social", {
        links: [
          { id: "s1", platform: "github", url: "github.com", label: "" },
          { id: "s2", platform: "twitter", url: "twitter.com", label: "" },
        ],
      }),
    ]
  ),
  creative: createSnapshot(
    "glass",
    "maya",
    "Maya Chandra",
    "Type designer",
    "Bengaluru",
    [
      block("hero-5", "hero", {
        headline: "Maya Chandra",
        tagline: "Type designer · Occasional developer",
        bio: "I draw letterforms and argue about kerning. Currently working on a variable serif for screens.",
        showAvatar: false,
        status: "Open to commissions",
        location: "Bengaluru",
      }),
      block("social-5", "social", {
        links: [
          { id: "s1", platform: "instagram", url: "instagram.com/maya", label: "" },
          { id: "s2", platform: "github", url: "github.com/maya", label: "" },
          { id: "s3", platform: "dribbble", url: "dribbble.com/maya", label: "" },
        ],
      }),
      block("links-5", "links", {
        items: [
          { id: "l1", label: "Specimen — Kerala Serif", url: "example.com/specimen", description: "A variable serif in six optical sizes", icon: "" },
          { id: "l2", label: "Commission a typeface", url: "example.com/hire", description: "", icon: "" },
        ],
      }),
    ]
  )
};
