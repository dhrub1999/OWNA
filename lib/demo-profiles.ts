import type { ProfileSnapshot } from "@/lib/blocks/snapshot";
import { parseBlockProps, parseBlockStyle, starterBlockProps } from "@/lib/blocks/definitions";
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

/**
 * Also doubles as the id space for onboarding's "what are you making this
 * for?" question — see PURPOSE_OPTIONS/templateForPurpose below. One curated
 * persona serves both the marketing page's illustrations and a real starting
 * draft, so the two can never drift apart.
 */
export type DemoProfileId =
  | "consultant"
  | "jewellery"
  | "photographer"
  | "freelancer"
  | "creative";

export const demoProfiles: Record<DemoProfileId, ProfileSnapshot> = {
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
        avatarUrl: "https://i.pravatar.cc/480?img=47",
        showAvatar: true,
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
      block("gallery-2", "gallery", {
        heading: "The Ethereal Collection",
        images: [
          { id: "g1", url: "https://picsum.photos/seed/aura-ring-gold/700/700", alt: "Gold ring", caption: "The Ethereal ring", shape: "square", position: "center" },
          { id: "g2", url: "https://picsum.photos/seed/aura-necklace-pearl/700/700", alt: "Pearl necklace", caption: "Moonlit necklace", shape: "square", position: "center" },
          { id: "g3", url: "https://picsum.photos/seed/aura-earrings-drop/700/700", alt: "Drop earrings", caption: "Tidal earrings", shape: "square", position: "center" },
        ],
        layout: "grid",
        columns: 3,
        gap: 8,
        showCaptions: true,
        lightbox: true,
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
        avatarUrl: "https://i.pravatar.cc/480?img=13",
        showAvatar: true,
        status: "Available for booking",
        location: "New York",
      }),
      block("gallery-3", "gallery", {
        heading: "Selected work",
        images: [
          { id: "g1", url: "https://picsum.photos/seed/marc-portrait-editorial/700/900", alt: "Editorial portrait", caption: "", shape: "portrait", position: "center" },
          { id: "g2", url: "https://picsum.photos/seed/marc-street-mono/900/700", alt: "Street photography", caption: "", shape: "landscape", position: "center" },
          { id: "g3", url: "https://picsum.photos/seed/marc-studio-campaign/700/700", alt: "Studio campaign shot", caption: "", shape: "square", position: "center" },
          { id: "g4", url: "https://picsum.photos/seed/marc-portrait-bw/700/900", alt: "Black and white portrait", caption: "", shape: "portrait", position: "center" },
          { id: "g5", url: "https://picsum.photos/seed/marc-location-fashion/900/700", alt: "Location fashion shoot", caption: "", shape: "landscape", position: "center" },
          { id: "g6", url: "https://picsum.photos/seed/marc-detail-shot/700/700", alt: "Detail shot", caption: "", shape: "square", position: "center" },
        ],
        layout: "bento",
        columns: 3,
        gap: 8,
        showCaptions: false,
        lightbox: true,
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
        avatarUrl: "https://i.pravatar.cc/480?img=68",
        showAvatar: true,
        status: "Building things",
        location: "Remote",
      }),
      block("projects-4", "projects", {
        heading: "Recent work",
        items: [
          { id: "p1", name: "Ledgerline", description: "Real-time expense tracking for small teams, built on Next.js and Postgres.", imageUrl: "https://picsum.photos/seed/alex-project-ledgerline/720/480", url: "example.com", tags: ["Next.js", "Postgres"] },
          { id: "p2", name: "Kiln", description: "A queue-based image pipeline for a print-on-demand marketplace.", imageUrl: "https://picsum.photos/seed/alex-project-kiln/720/480", url: "example.com", tags: ["Node", "Redis"] },
          { id: "p3", name: "Fielded", description: "Web3 attendance verification for hybrid meetups.", imageUrl: "https://picsum.photos/seed/alex-project-fielded/720/480", url: "example.com", tags: ["Solidity", "React"] },
        ],
        layout: "grid",
        columns: 3,
        imageRatio: "16:9",
        showTags: true,
        showDescription: true,
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
        avatarUrl: "https://i.pravatar.cc/480?img=44",
        showAvatar: true,
        status: "Open to commissions",
        location: "Bengaluru",
      }),
      block("gallery-5", "gallery", {
        heading: "Recent work",
        images: [
          { id: "g1", url: "https://picsum.photos/seed/maya-specimen-serif/700/900", alt: "Kerala Serif specimen sheet", caption: "Kerala Serif, six optical sizes", shape: "portrait", position: "center" },
          { id: "g2", url: "https://picsum.photos/seed/maya-sketchbook-letters/900/700", alt: "Letterform sketches", caption: "Sketchbook studies", shape: "landscape", position: "center" },
          { id: "g3", url: "https://picsum.photos/seed/maya-poster-type/700/700", alt: "Type poster", caption: "Commissioned poster", shape: "square", position: "center" },
        ],
        layout: "masonry",
        columns: 3,
        gap: 8,
        showCaptions: true,
        lightbox: true,
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

// ---------------------------------------------------------------------------
// Onboarding questionnaire: "what are you making this for?"
// ---------------------------------------------------------------------------

export const PURPOSE_OPTIONS: {
  id: DemoProfileId;
  label: string;
  description: string;
}[] = [
  {
    id: "consultant",
    label: "Coaching or consulting",
    description: "A home for your services and how to book you.",
  },
  {
    id: "photographer",
    label: "Photography",
    description: "A gallery-first page that puts your work up front.",
  },
  {
    id: "freelancer",
    label: "Freelance or independent work",
    description: "Portfolio, projects and a way to get in touch.",
  },
  {
    id: "creative",
    label: "Creative portfolio",
    description: "For artists, writers and makers of things.",
  },
  {
    id: "jewellery",
    label: "Selling products",
    description: "Showcase what you make or sell.",
  },
];

/**
 * Turn a curated persona into a seed for a real draft.
 *
 * What travels is the theme, the layout and the *shape* of the page — which
 * block types, in which order — because that is what "consultant" vs.
 * "photographer" actually means as a starting point. The demo blocks' own
 * props do not travel: they are Sarah Jenkins' bio, Maya's Instagram handle,
 * fictional copy written to look good in a marketing screenshot, and would
 * otherwise land verbatim on a real stranger's page. Each block gets the same
 * starter placeholder content a manually-added block gets instead.
 */
export function templateForPurpose(purpose: DemoProfileId) {
  const snapshot = demoProfiles[purpose];
  return {
    theme: snapshot.theme,
    layout: snapshot.layout,
    blocks: snapshot.blocks.map(({ type, style }) => ({
      type,
      props: starterBlockProps(type),
      style,
    })),
  };
}
