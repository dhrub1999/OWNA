"use client";

import { Check, Loader2, X } from "lucide-react";
import type { Availability } from "@/lib/hooks/use-username-availability";

/** The little status glyph inside a username input. Shared by onboarding and settings. */
export function AvailabilityIcon({ state }: { state: Availability["state"] }) {
  switch (state) {
    case "checking":
      return (
        <Loader2
          className="text-muted-foreground size-4 animate-spin"
          aria-hidden="true"
        />
      );
    case "available":
      return <Check className="size-4 text-emerald-600" aria-hidden="true" />;
    case "taken":
    case "invalid":
      return <X className="text-destructive size-4" aria-hidden="true" />;
    default:
      return null;
  }
}
