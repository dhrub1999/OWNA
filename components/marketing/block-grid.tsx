import Image from "next/image";
import {
  BLOCK_META,
  BLOCK_TYPES,
  SOCIAL_PLATFORMS,
  type BlockType,
} from "@/lib/blocks/definitions";
import { THEME_PRESETS } from "@/lib/themes/presets";
import { cn } from "@/lib/utils";

/**
 * Section 4: "Nine blocks. A link list gives you one." — the block grid.
 *
 * Titles come from `BLOCK_META[type].label` — a block renamed in
 * lib/blocks/definitions.ts renames itself here — but the body copy below is
 * written out in full rather than derived. An earlier version built each
 * sentence from `BLOCK_META[type].description` plus one appended clause; that
 * makes maintenance easier but can't reproduce this copy's own punctuation
 * (an em dash mid-sentence, not two sentences stitched together), and the
 * design handoff calls this copy final. `social`'s count is the one line kept
 * dynamic — SOCIAL_PLATFORMS is still the authority on how many platforms
 * exist, so this can't go stale the way a hand-typed "Thirteen" could.
 */
const SOCIAL_COUNT_WORD =
  SOCIAL_PLATFORMS.length === 13 ? "Thirteen" : String(SOCIAL_PLATFORMS.length);

const BODY: Record<BlockType, string> = {
  hero: "Your photo, name and one line about you — plus availability and location, which a bio link flattens into the same row as everything else.",
  gallery: "A grid of images. Tap one, it opens full size.",
  projects: "Cards for the things you've made, with the story behind each one.",
  links: "Buttons pointing anywhere you like — the one block a link-in-bio tool gives you.",
  social: `Icons for the platforms you're on. ${SOCIAL_COUNT_WORD} to choose from, email included.`,
  embed: "A Spotify or YouTube player. Paste the URL, it plays in place.",
  text: "A heading and a paragraph, in your own words.",
  image: "A single picture, optionally linked.",
  divider: "A line or a gap.",
};

/**
 * Screenshots of the real blocks, rendered on real pages, rather than the
 * striped placeholders the mock used. Mixed themes on purpose: the cells are
 * profile surfaces, not page chrome, so they keep their own colours in both
 * light and dark mode the same way the theme presets in section 3 do.
 *
 * All thumbnails are cropped to exactly 16:9 at the same source width, and
 * every card renders them at the card's full width, so the UI inside each
 * screenshot appears at the same scale and `object-cover` crops nothing.
 */
const SHOT = "/assets/products";

/** The one type whose screenshot file doesn't share its block-type name. */
const FILE: Partial<Record<BlockType, string>> = { social: "social-links" };

const ALT: Record<Exclude<BlockType, "hero">, string> = {
  gallery: "A gallery block laid out as a grid of photographs",
  projects: "A project card with an image, a name and a description",
  links: "A list of link buttons, each with a title, subtitle and arrow",
  social: "A row of social platform icons under a heading",
  embed: "A YouTube player embedded in a page under its own heading",
  text: "A text block with a heading and a paragraph",
  image: "A single image block showing one photograph",
  divider: "",
};

/** The seven standard cards, in the design handoff's own order. */
const STANDARD_TYPES: Exclude<BlockType, "hero" | "divider">[] = [
  "gallery",
  "projects",
  "links",
  "social",
  "embed",
  "text",
  "image",
];

const CARD = "flex flex-col overflow-hidden rounded-[24px] border border-border bg-card";
const CARD_TEXT = "flex flex-col gap-2 px-6 pt-6 pb-5";
const TITLE = "text-xl font-bold tracking-[-0.02em]";
const LEAD = "text-[15px] leading-[1.55] text-muted-foreground";

// The image spans the whole card, so these are card widths, not content widths.
const THUMB_SIZES = "(max-width: 640px) calc(100vw - 32px), (max-width: 1280px) 30vw, 380px";
const HERO_SIZES = "(max-width: 640px) calc(100vw - 32px), 280px";

/** A 16:9 block screenshot, full bleed at the foot of its card. */
function Thumb({ type }: { type: Exclude<BlockType, "hero" | "divider"> }) {
  return (
    <div className="mt-auto aspect-16/9 w-full bg-background">
      <Image
        src={`${SHOT}/${FILE[type] ?? type}.jpg`}
        alt={ALT[type]}
        width={974}
        height={548}
        sizes={THUMB_SIZES}
        quality={90}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function BlockGrid() {
  return (
    <section className="scroll-mt-20 border-t border-border py-[clamp(64px,8vw,112px)]" id="product">
      <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)]">
        <div className="flex max-w-[900px] flex-col gap-4.5">
          <h2 className="font-display max-w-[22ch] text-[clamp(27px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
            Nine blocks. A link list gives you one.
          </h2>
          <p className="max-w-[54ch] text-[clamp(16px,1.5vw,19px)] leading-[1.55] text-muted-foreground">
            Each block is real content — a gallery, a case study, a player, a bio that carries
            availability and location. Not a button pointing at content somewhere else.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          {/* Hero: the one portrait card, so a 16:9 window never cuts the
              availability/location chips its own copy promises. */}
          <div className={cn(CARD, "flex-[3_1_520px] flex-row flex-wrap")}>
            <div className={cn(CARD_TEXT, "min-w-0 flex-[1_1_240px] justify-center p-[clamp(20px,3vw,28px)]")}>
              <h3 className={TITLE}>{BLOCK_META.hero.label}</h3>
              <p className={cn(LEAD, "max-w-[34ch]")}>{BODY.hero}</p>
            </div>
            <div className="aspect-[922/1206] w-[min(280px,100%)] shrink-0 bg-background">
              <Image
                src={`${SHOT}/hero.jpg`}
                alt="A profile hero with a photo, name, role, bio, availability and location"
                width={922}
                height={1206}
                sizes={HERO_SIZES}
                quality={90}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {STANDARD_TYPES.map((type) => (
            <div key={type} className={cn(CARD, "flex-[1_1_260px]")}>
              <div className={CARD_TEXT}>
                <h3 className={TITLE}>{BLOCK_META[type].label}</h3>
                <p className={LEAD}>{BODY[type]}</p>
              </div>
              <Thumb type={type} />
            </div>
          ))}

          {/* Divider — a full-width strip. A block that renders as a line
              reads better as one long rule than as a tall card with a short
              line marooned at the bottom. */}
          <div className={cn(CARD, "flex-[1_1_100%] flex-row flex-wrap items-center gap-4")}>
            <div className="flex flex-[1_1_200px] flex-col gap-2 px-7 py-6">
              <h3 className={TITLE}>{BLOCK_META.divider.label}</h3>
              <p className={LEAD}>{BODY.divider}</p>
            </div>
            <div aria-hidden="true" className="flex flex-1 items-center pr-7">
              <div className="h-px w-full bg-border" />
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-baseline justify-between gap-5 border-t border-border pt-6">
          <p className="max-w-[60ch] text-base leading-[1.55] text-muted-foreground">
            Use what you need, leave out the rest. Nothing you don&rsquo;t add ever renders.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {BLOCK_TYPES.length} blocks / {THEME_PRESETS.length} themes / 1 page
          </p>
        </div>
      </div>
    </section>
  );
}
