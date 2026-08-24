"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { upgradeAnonymousAccount } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

/**
 * Publishing is where a guest draft has to become an account.
 *
 * "Create free account" attaches real credentials to the *same* session
 * (`upgradeAnonymousAccount` / `linkIdentity`) rather than signing up fresh,
 * so the page just built stays owned by the same `auth.uid()`. "Log in"
 * switches to a different, already-registered account instead — the guest
 * draft does not follow, and the copy says so rather than pretending it will.
 */
export function PublishAuthGate({
  open,
  onOpenChange,
  onAccountReady,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called once credentials are attached, so the caller can resume publishing. */
  onAccountReady: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  function onCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData(event.currentTarget);
      const result = await upgradeAnonymousAccount(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onAccountReady();
    });
  }

  async function onGoogle() {
    setError(null);
    setGooglePending(true);

    const supabase = createClient();
    const callback = new URL("/auth/callback", window.location.origin);
    // The redirect back through /auth/callback lands on a profile that already
    // exists (it was created before this gate ever opened), so it forwards
    // straight to `next` — the toolbar picks the interrupted publish back up
    // from the `publish=1` marker.
    callback.searchParams.set("next", "/editor?publish=1");

    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    if (linkError) {
      setError(linkError.message);
      setGooglePending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save your OWNA</DialogTitle>
          <DialogDescription>
            Create a free account to publish this page. Nothing you’ve built will
            be lost.
          </DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          variant="outline"
          onClick={onGoogle}
          disabled={googlePending || pending}
          className="w-full"
        >
          <GoogleMark />
          {googlePending ? "Redirecting…" : "Continue with Google"}
        </Button>

        <div className="flex items-center gap-3">
          <span className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <span className="bg-border h-px flex-1" />
        </div>

        <form onSubmit={onCreateAccount} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="gate-email">Email</Label>
            <Input
              id="gate-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gate-password">Password</Label>
              <span className="text-muted-foreground text-xs">8+ characters</span>
            </div>
            <Input
              id="gate-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={pending || googlePending} className="w-full">
            {pending ? "Just a moment…" : "Create account & publish"}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/login?next=/dashboard" className="text-foreground underline underline-offset-4">
            Log in
          </Link>{" "}
          — this switches accounts, so this draft won’t come with you.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.03-6.45-4.75H1.7v2.98A11.5 11.5 0 0 0 12 23.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.55 14.16a6.9 6.9 0 0 1 0-4.32V6.86H1.7a11.5 11.5 0 0 0 0 10.28l3.85-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.3 15.11.25 12 .25A11.5 11.5 0 0 0 1.7 6.86l3.85 2.98C6.46 7.12 9 4.77 12 4.77Z"
      />
    </svg>
  );
}
