import Link from "next/link";
import { Check } from "lucide-react";
import type { ActivationStep } from "@/lib/onboarding/activation";

/**
 * The short list of things left to do on a new profile.
 *
 * Disappears the moment every step is done, rather than sticking around as a
 * row of green ticks. A checklist with nothing left on it is decoration, and
 * decoration in the first slot of the sidebar is worse than empty space.
 *
 * Completed steps stay as plain text with no link. They are there to show
 * progress, not to invite a second visit to a job already finished.
 */
export function ActivationChecklist({ steps }: { steps: ActivationStep[] }) {
  const remaining = steps.filter((step) => !step.done).length;
  if (remaining === 0) return null;

  const done = steps.length - remaining;

  return (
    <section
      aria-labelledby="activation-heading"
      className="border-border rounded-lg border p-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="activation-heading" className="text-sm font-medium">
          Finish your page
        </h2>
        <span className="text-muted-foreground text-xs tabular-nums">
          {done} of {steps.length}
        </span>
      </div>

      <div
        className="bg-muted mt-2 h-1 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-500"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-3 flex flex-col gap-1.5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className={[
                "flex size-4 shrink-0 items-center justify-center rounded-full border",
                step.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              ].join(" ")}
            >
              {step.done ? <Check className="size-2.5" /> : null}
            </span>

            {step.done ? (
              <span className="text-muted-foreground line-through">
                {step.label}
              </span>
            ) : (
              <Link
                href={step.href}
                className="hover:text-primary underline-offset-4 hover:underline"
              >
                {step.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
