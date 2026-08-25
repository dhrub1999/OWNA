import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * The frame every onboarding step sits in.
 *
 * Two panes above `lg`: questions on the left at a readable measure, the live
 * preview on the right. Below `lg` the preview drops out of the flow entirely
 * rather than stacking above or below the form — on a phone it would either
 * push the input under the keyboard or shrink to the point of saying nothing,
 * and a preview too small to read is worse than no preview. Small screens get
 * the URL chip instead, which is the one part that stays legible.
 *
 * The right pane is decorative in the accessibility sense: every fact it shows
 * is already in the form the visitor just filled in, so it carries
 * `aria-hidden` internally and screen readers are not walked through a second
 * copy of their own answers.
 */
export function OnboardingShell({
  step,
  totalSteps,
  children,
  preview,
}: {
  /** Zero-based. */
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  preview?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:max-w-[52%] lg:px-16 lg:py-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="OWNA home"
            className="text-foreground hover:text-logo-hover transition-colors"
          >
            <Logo className="h-7 w-auto" />
          </Link>
          <p className="text-muted-foreground text-xs tabular-nums">
            Step {step + 1} of {totalSteps}
          </p>
        </div>

        <ol className="mt-6 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, i) => (
            <li
              key={i}
              className={[
                "h-1 flex-1 rounded-full transition-colors duration-500",
                i <= step ? "bg-primary" : "bg-border",
              ].join(" ")}
            />
          ))}
        </ol>

        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {preview ? (
        <div className="bg-muted/40 border-border hidden flex-1 items-center justify-center border-l px-10 py-12 lg:flex">
          {preview}
        </div>
      ) : null}
    </div>
  );
}
