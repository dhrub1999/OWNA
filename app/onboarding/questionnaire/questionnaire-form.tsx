"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { AvailabilityIcon } from "@/components/availability-icon";
import { LivePreview } from "@/components/onboarding/live-preview";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PURPOSE_OPTIONS, templateForPurpose, type DemoProfileId } from "@/lib/demo-profiles";
import { useUsernameAvailability } from "@/lib/hooks/use-username-availability";
import { profileUrlLabel } from "@/lib/site";
import { sanitizeUsernameInput, suggestUsername } from "@/lib/validations/username";
import { completeOnboarding, saveOnboardingAnswers } from "./actions";

type Answers = { purpose: DemoProfileId | ""; name: string; username: string };

const STEPS = ["purpose", "name", "username"] as const;

export function QuestionnaireForm({
  initialAnswers,
}: {
  initialAnswers: Partial<Record<keyof Answers, string>>;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    purpose: (initialAnswers.purpose as DemoProfileId) ?? "",
    name: initialAnswers.name ?? "",
    username: initialAnswers.username ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // A reload mid-questionnaire is restored from this same row, so every step
  // persists as soon as it is answered rather than only on final submit.
  function persist(partial: Partial<Answers>) {
    void saveOnboardingAnswers(partial);
  }

  function advance(partial: Partial<Answers>) {
    setAnswers((prev) => ({ ...prev, ...partial }));
    persist(partial);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      // A successful submit redirects and never resolves to a value.
      const result = await completeOnboarding(formData);
      if (result?.error) setError(result.error);
    });
  }

  const availability = useUsernameAvailability(answers.username, { skip: step !== 2 });

  return (
    <OnboardingShell
      step={step}
      totalSteps={STEPS.length}
      preview={<LivePreview answers={answers} />}
    >
      {step > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={back}
          className="text-muted-foreground -ml-2 mb-4"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      ) : null}

      {step === 0 ? (
        <div className="flex flex-col gap-6">
          <Heading
            title="What are you making this for?"
            hint="It picks your starting layout and colours. Change anything later."
          />

          <div className="grid gap-2">
            {PURPOSE_OPTIONS.map((option) => (
              <PurposeCard
                key={option.id}
                option={option}
                selected={answers.purpose === option.id}
                onSelect={() => advance({ purpose: option.id })}
              />
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
            advance({
              name,
              username: answers.username || suggestUsername(name),
            });
          }}
        >
          <Heading
            title="What should it say at the top?"
            hint="Your name, or whatever you want people to read first."
          />

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={answers.name}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, name: event.target.value }))
              }
              autoFocus
              required
              autoComplete="name"
              placeholder="Maya Tanaka"
              className="h-11 text-base"
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            Continue
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form action={onSubmit} className="flex flex-col gap-6">
          <input type="hidden" name="purpose" value={answers.purpose} />
          <input type="hidden" name="name" value={answers.name} />

          <Heading
            title="Claim your address"
            hint="This is where your page lives. You can change it in settings."
          />

          <div className="space-y-2">
            <Label htmlFor="username">Handle</Label>
            <div className="relative">
              <Input
                id="username"
                name="username"
                value={answers.username}
                onChange={(event) => {
                  const value = sanitizeUsernameInput(event.target.value);
                  setAnswers((prev) => ({ ...prev, username: value }));
                  persist({ username: value });
                }}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                aria-describedby="username-status"
                className="h-11 pr-10 font-mono text-base"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2">
                <AvailabilityIcon state={availability.state} />
              </span>
            </div>
            <p
              id="username-status"
              role="status"
              aria-live="polite"
              className="text-muted-foreground text-sm"
            >
              {availability.state === "invalid" ? (
                <span className="text-destructive">{availability.message}</span>
              ) : availability.state === "taken" ? (
                <span className="text-destructive">That one&rsquo;s taken.</span>
              ) : answers.username ? (
                <span className="font-mono">{profileUrlLabel(answers.username)}</span>
              ) : (
                "Letters, numbers, dashes and underscores."
              )}
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={availability.state !== "available" || pending}
            className="w-full"
          >
            {pending ? "Setting things up…" : "Create my OWNA"}
          </Button>
        </form>
      ) : null}
    </OnboardingShell>
  );
}

function Heading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="space-y-2">
      <h1 className="font-display text-3xl font-bold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{hint}</p>
    </div>
  );
}

/**
 * A purpose option, carrying the palette it will actually apply.
 *
 * The swatches are read from the same `templateForPurpose` call that seeds the
 * draft, so the colours on the card are the colours you get. A hand-picked
 * decorative palette here would be a promise the template does not keep.
 */
function PurposeCard({
  option,
  selected,
  onSelect,
}: {
  option: (typeof PURPOSE_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const { theme } = templateForPurpose(option.id);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "group focus-visible:ring-ring/50 flex cursor-pointer items-center gap-4 rounded-xl border p-4 text-left transition-all focus-visible:ring-3 focus-visible:outline-none",
        "active:scale-[0.99]",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-foreground/30 hover:bg-muted/40",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="border-border flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
        style={{ backgroundColor: theme.colors.background }}
      >
        <span
          className="size-4 rounded-full"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-medium">{option.label}</span>
        <span className="text-muted-foreground block text-sm">
          {option.description}
        </span>
      </span>

      {selected ? (
        <Check className="text-primary size-4 shrink-0" aria-hidden="true" />
      ) : null}
    </button>
  );
}
