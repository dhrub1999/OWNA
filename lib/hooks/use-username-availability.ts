"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usernameFormatError } from "@/lib/validations/username";

export type Availability =
  | { state: "idle" }
  | { state: "invalid"; message: string }
  | { state: "checking" }
  | { state: "available" }
  | { state: "taken" };

const DEBOUNCE_MS = 350;

/**
 * Is this name free?
 *
 * The answer is advisory. `profiles.username` has a unique index, and that is
 * what actually decides — this exists so the form can say "taken" before
 * someone commits, and the claim action still has to handle losing the race.
 *
 * The effect only writes state from inside its async callback; everything the
 * UI reads is derived during render from `value` and the last result. That
 * keeps a debounced network check from turning into a chain of extra renders
 * on every keystroke.
 */
export function useUsernameAvailability(
  value: string,
  { skip = false }: { skip?: boolean } = {},
): Availability {
  const [result, setResult] = useState<{ value: string; available: boolean } | null>(
    null,
  );

  const formatError = usernameFormatError(value);
  const shouldCheck = !skip && Boolean(value) && !formatError;

  useEffect(() => {
    if (!shouldCheck) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("username_available", {
        candidate: value,
      });
      if (cancelled) return;
      setResult({ value, available: !error && Boolean(data) });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, shouldCheck]);

  if (!value || skip) return { state: "idle" };
  if (formatError) return { state: "invalid", message: formatError };
  // A result for a previous value tells us nothing about this one.
  if (result?.value !== value) return { state: "checking" };
  return result.available ? { state: "available" } : { state: "taken" };
}
