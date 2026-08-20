"use client";

import { useState, useTransition } from "react";
import { AvailabilityIcon } from "@/components/availability-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsernameAvailability } from "@/lib/hooks/use-username-availability";
import { profileUrlLabel } from "@/lib/site";
import { sanitizeUsernameInput } from "@/lib/validations/username";
import { claimUsername } from "../actions";

export function UsernameForm({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const availability = useUsernameAvailability(value);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await claimUsername(formData);
      // A successful claim redirects and never resolves to a value.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            name="username"
            value={value}
            onChange={(event) => setValue(sanitizeUsernameInput(event.target.value))}
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
          ) : value ? (
            <span className="font-mono">{profileUrlLabel(value)}</span>
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
        disabled={availability.state !== "available" || pending}
        className="w-full"
      >
        {pending ? "Setting things up…" : "Claim it"}
      </Button>
    </form>
  );
}
