import { demoProfiles, type DemoProfileId } from "@/lib/demo-profiles";
import type { ProfileSnapshot } from "@/lib/blocks/snapshot";

/**
 * Turn half-answered onboarding questions into a renderable profile.
 *
 * This is what makes the questionnaire show its own outcome instead of
 * describing it. Three abstract questions become a page that visibly becomes
 * yours as you answer them, which is a different experience from filling in a
 * form and hoping.
 *
 * It renders the curated demo content for the chosen purpose, with the
 * visitor's own name and handle written into it. The alternative was to render
 * what `completeOnboarding` actually seeds — `starterBlockProps`, which is
 * deliberately near-empty so the editor opens ready to be filled in. Truthful,
 * and useless: it previews as a blank page, at the exact moment someone is
 * deciding whether this is worth their next ten minutes.
 *
 * So the preview answers the question actually being asked at this step, which
 * is "what does this style look like", not "what will my unedited page look
 * like". The theme, the layout and the block structure are exactly what gets
 * seeded; only the placeholder copy is richer. The caption beside it says so —
 * see `LivePreview`. Overstating that in the UI would be the real bait and
 * switch, so the labelling is load-bearing, not decoration.
 *
 * Pure and synchronous, so the preview updates on every keystroke with no
 * round trip, and so it can be tested without rendering anything.
 */

/** Stands in until the first question is answered. */
export const FALLBACK_PURPOSE: DemoProfileId = "consultant";

export type PreviewAnswers = {
  purpose: DemoProfileId | "";
  name: string;
  username: string;
};

export function previewSnapshot(answers: PreviewAnswers): ProfileSnapshot {
  const demo = demoProfiles[answers.purpose || FALLBACK_PURPOSE];
  const displayName = answers.name.trim() || "Your name";

  return {
    ...demo,
    profile: {
      ...demo.profile,
      username: answers.username || "yourname",
      displayName,
    },
    blocks: demo.blocks.map((block, index) => ({
      ...block,
      id: `preview-${index}`,
      // The hero carries an explicit headline in the curated content, so it
      // does not fall back to the profile the way a seeded block would. Writing
      // the name in here is what makes the preview visibly theirs the moment
      // they type it.
      props:
        block.type === "hero" && isRecord(block.props)
          ? { ...block.props, headline: displayName }
          : block.props,
    })),
    publishedAt: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
