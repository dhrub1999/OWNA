import Image from "next/image";
import { BlurFade } from "@/components/magicui/blur-fade";
import {
  BLOCK_META,
  BLOCK_TYPES,
  SOCIAL_PLATFORMS,
} from "@/lib/blocks/definitions";
import { THEME_PRESETS } from "@/lib/themes/presets";
import { cn } from "@/lib/utils";

/**
 * Section 2: the nine blocks that build an OWNA page.
 *
 * The argument is structural rather than written down: eight lit cells against
 * one dead one. `Links` is the only block a link-in-bio tool gives you, so it is
 * the only cell rendered as an empty shell — dashed, quieter, three flat pills
 * and a full stop. There is no second card and no checkmark list.
 *
 * Every title and body sentence comes from BLOCK_META, so a block renamed in
 * lib/blocks/definitions.ts renames itself here. The counts in the footer are
 * read from BLOCK_TYPES and THEME_PRESETS for the same reason.
 */

/** The one extra sentence per cell that BLOCK_META does not carry. */
const EXTRA: Partial<Record<(typeof BLOCK_TYPES)[number], string>> = {
  hero: "Plus availability and location, which a bio link flattens into the same single line as everything else.",
  gallery: "Tap one, it opens full size.",
  // SOCIAL_PLATFORMS is the authority; email is one of the thirteen, not a
  // fourteenth, so this does not say "plus email".
  social: `${SOCIAL_PLATFORMS.length === 13 ? "Thirteen" : String(SOCIAL_PLATFORMS.length)} to choose from, email included.`,
  embed: "Paste the URL, it plays in place.",
};

function body(type: (typeof BLOCK_TYPES)[number]) {
  const extra = EXTRA[type];
  return extra
    ? `${BLOCK_META[type].description} ${extra}`
    : BLOCK_META[type].description;
}

/**
 * Screenshots of the real blocks, rendered on real pages, rather than the
 * striped placeholders the mock used. Mixed themes on purpose: the cells are
 * profile surfaces, not page chrome, so they keep their own colours in both
 * light and dark mode the same way the theme presets in section 3 do.
 *
 * All six thumbnails are cropped to exactly 16:9 at the same source width, and
 * every card renders them at the card's full width. Two consequences, both of
 * which earlier drafts got wrong:
 *
 *   * the UI inside each screenshot appears at the same scale, because the
 *     sources are all crops of the same page render shown at the same width;
 *   * `object-cover` crops nothing, because the frame's ratio already matches
 *     the file's. Nothing is letterboxed and no frame background is visible.
 *
 * Cropping at render time instead is what made the scale look arbitrary: each
 * cell cut a different amount, from 27% of one block to 100% of another, and
 * the amount changed again at every breakpoint.
 */
const SHOT = "/assets/products";

/**
 * Card, copy, and image.
 *
 * The image is full bleed — flush to the card's left, right and bottom edges,
 * with the card's `overflow-hidden` rounding its bottom corners. It carries no
 * padding, border or radius of its own. A padded, separately-bordered frame put
 * two nested rectangles around every screenshot, which is what read as heavy.
 */
const CARD =
  "flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-card";
const COPY = "flex flex-col gap-2.5 px-7 pt-7 pb-6";
const TITLE = "text-[21px] font-bold tracking-[-0.02em]";
const LEAD = "text-[15px] leading-[1.55] text-muted-foreground";

// The image spans the whole card, so these are card widths, not content widths.
const THUMB_SIZES =
  "(max-width: 768px) calc(100vw - 48px), (max-width: 1100px) 46vw, 400px";
const HERO_SIZES = "(max-width: 768px) calc(100vw - 48px), 300px";

/** A 16:9 block screenshot, full bleed at the foot of its card. */
function Thumb({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="mt-auto aspect-16/9 w-full bg-secondary">
      <Image
        src={src}
        alt={alt}
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
    <section
      className="scroll-mt-20 border-b border-border bg-secondary/50 py-28 sm:py-32"
      id="product"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <BlurFade inView direction="up" className="flex max-w-[900px] flex-col gap-5">
          <h2 className="font-display max-w-[20ch] text-[clamp(34px,4.6vw,56px)] leading-[1.03] font-extrabold tracking-[-0.035em] text-balance">
            You are more than a list of links.
          </h2>
          <p className="max-w-[52ch] text-[clamp(17px,1.6vw,20px)] leading-[1.5] text-muted-foreground">
            Nine blocks build an OWNA page. A link-in-bio tool gives you one of
            them.
          </p>
        </BlurFade>

        {/* Six tracks above 1100px, four between 768 and 1100, one below.
            Every cell spans at least two tracks: the handoff gave Image and
            Divider one track each, which measured out at ~184px and left them
            with 84px and 169px of dead space under their copy while every other
            cell sat at 16px. */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:max-stage:grid-cols-4 stage:grid-cols-6">
          {/* Hero. The one portrait card: a 16:9 window would cut the
              availability and location chips, which are exactly what its copy
              promises. Side by side from md up so the shot stays a tall,
              legible card rather than a wide sliver. */}
          <BlurFade inView direction="up" className="md:col-span-4">
            <div className={cn(CARD, "md:flex-row")}>
              <div className={cn(COPY, "flex-1 justify-center md:py-7")}>
                <h3 className={TITLE}>{BLOCK_META.hero.label}</h3>
                <p className={cn(LEAD, "max-w-[34ch]")}>{body("hero")}</p>
              </div>
              <div className="aspect-[922/1206] w-full shrink-0 bg-secondary md:w-[300px]">
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
          </BlurFade>

          <BlurFade inView direction="up" delay={0.04} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.links.label}</h3>
                <p className={LEAD}>{body("links")}</p>
              </div>
              <Thumb
                src={`${SHOT}/links.jpg`}
                alt="A list of link buttons, each with a title, subtitle and arrow"
              />
            </div>
          </BlurFade>

          <BlurFade inView direction="up" delay={0.08} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.projects.label}</h3>
                <p className={LEAD}>{body("projects")}</p>
              </div>
              <Thumb
                src={`${SHOT}/projects.jpg`}
                alt="A project card with an image, a name and a description"
              />
            </div>
          </BlurFade>

          <BlurFade inView direction="up" delay={0.12} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.gallery.label}</h3>
                <p className={LEAD}>{body("gallery")}</p>
              </div>
              <Thumb
                src={`${SHOT}/gallery.jpg`}
                alt="A gallery block laid out as a grid of photographs"
              />
            </div>
          </BlurFade>

          <BlurFade inView direction="up" delay={0.16} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.social.label}</h3>
                <p className={LEAD}>{body("social")}</p>
              </div>
              <Thumb
                src={`${SHOT}/social-links.jpg`}
                alt="A row of social platform icons under a heading"
              />
            </div>
          </BlurFade>

          <BlurFade inView direction="up" delay={0.2} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.text.label}</h3>
                <p className={LEAD}>{body("text")}</p>
              </div>
              <Thumb
                src={`${SHOT}/text.jpg`}
                alt="A text block with a heading and a paragraph"
              />
            </div>
          </BlurFade>

          <BlurFade inView direction="up" delay={0.24} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.embed.label}</h3>
                <p className={LEAD}>{body("embed")}</p>
              </div>
              <Thumb
                src={`${SHOT}/embed.jpg`}
                alt="A YouTube player embedded in a page under its own heading"
              />
            </div>
          </BlurFade>

          <BlurFade inView direction="up" delay={0.28} className="md:col-span-2">
            <div className={CARD}>
              <div className={COPY}>
                <h3 className={TITLE}>{BLOCK_META.image.label}</h3>
                <p className={LEAD}>{body("image")}</p>
              </div>
              <Thumb
                src={`${SHOT}/image.jpg`}
                alt="A single image block showing one photograph"
              />
            </div>
          </BlurFade>

          {/* Divider — a full-width strip above 1100px. A block that renders as
              a line reads better as one long rule than as a tall card with a
              short line marooned at the bottom.

              Between 768 and 1100 it shares a row with Image, whose screenshot
              makes that row tall; `self-start` stops this card stretching to
              match and opening a gap above its rule. */}
          <BlurFade
            inView
            direction="up"
            delay={0.3}
            className="md:max-stage:col-span-2 md:max-stage:self-start stage:col-span-6"
          >
            <div
              className={cn(CARD, "stage:flex-row stage:items-center stage:gap-10")}
            >
              <div className={cn(COPY, "stage:shrink-0 stage:py-7")}>
                <h3 className={TITLE}>{BLOCK_META.divider.label}</h3>
                <p className={LEAD}>{body("divider")}</p>
              </div>
              <div
                className="mt-auto flex min-h-[48px] items-center px-7 pb-7 stage:mt-0 stage:min-h-0 stage:flex-1 stage:pb-0 stage:pl-0"
                aria-hidden="true"
              >
                <div className="h-px w-full bg-border" />
              </div>
            </div>
          </BlurFade>
        </div>

        <div className="mt-10 flex flex-col items-start gap-6 border-t border-border pt-7 md:flex-row md:flex-wrap md:items-baseline md:justify-between">
          <p className="max-w-[62ch] text-[17px] leading-[1.55] text-muted-foreground">
            Drop in what you need, leave out what you don&rsquo;t. Freelancers,
            studios, shops and students all end up with pages that look nothing
            alike.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {BLOCK_TYPES.length} blocks / {THEME_PRESETS.length} themes / 1 page
          </p>
        </div>
      </div>
    </section>
  );
}
