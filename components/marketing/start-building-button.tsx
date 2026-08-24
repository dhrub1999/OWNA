"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * The landing page's "Create your OWNA" CTA.
 *
 * Product-first: this signs the visitor in anonymously — a no-op if they
 * already have a session, e.g. returning to an in-progress draft — before
 * sending them into the questionnaire, so building a page never waits on an
 * account existing yet. Falls back to the plain signup route if anonymous
 * sign-in is unavailable, so the CTA still works either way.
 */
export function StartBuildingButton({
  children,
  className,
  size,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          router.push("/signup");
          return;
        }
      }

      router.push("/onboarding/questionnaire");
    });
  }

  return (
    <Button onClick={onClick} disabled={pending} className={className} size={size} variant={variant}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}
