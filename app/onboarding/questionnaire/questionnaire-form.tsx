"use client";

import { useState, useTransition } from "react";
import { AvailabilityIcon } from "@/components/availability-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PURPOSE_OPTIONS, type DemoProfileId } from "@/lib/demo-profiles";
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
    <div className="flex flex-col gap-6">
      <ol className="flex gap-1.5" aria-hidden="true">
        {STEPS.map((name, i) => (
          <li
            key={name}
            className={`h-1 flex-1 rounded-full ${i <= step ? "bg-foreground" : "bg-muted"}`}
          />
        ))}
      </ol>

      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <h1 className="text-lg font-semibold">What are you making this for?</h1>
          <div className="grid gap-2">
            {PURPOSE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => advance({ purpose: option.id })}
                className="hover:border-foreground flex flex-col items-start gap-0.5 rounded-lg border p-4 text-left transition-colors"
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-muted-foreground text-sm">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
            advance({
              name,
              username: answers.username || suggestUsername(name),
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">What’s your name?</Label>
            <Input id="name" name="name" defaultValue={answers.name} autoFocus required autoComplete="name" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={back} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <form action={onSubmit} className="flex flex-col gap-5">
          <input type="hidden" name="purpose" value={answers.purpose} />
          <input type="hidden" name="name" value={answers.name} />

          <div className="space-y-2">
            <Label htmlFor="username">Pick your handle</Label>
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
                className="pr-9 font-mono"
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
                <span className="text-destructive">That one’s taken.</span>
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={back} className="flex-1">
              Back
            </Button>
            <Button
              type="submit"
              disabled={availability.state !== "available" || pending}
              className="flex-1"
            >
              {pending ? "Setting things up…" : "Create my OWNA"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
