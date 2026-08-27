"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { upgradeAnonymousAccount } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
 *
 * The dialog has three faces, tracked by `view`. They are mutually exclusive
 * screens rather than sections of one form because each asks a different
 * question, and stacking them would bury the form under warnings that only
 * apply to a minority of visitors.
 */
type View = "create" | "confirm-login" | "email-taken";

export function PublishAuthGate({
  open,
  onOpenChange,
  onAccountReady,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called once credentials are attached, so the caller can resume
   * publishing. `pendingConfirmation` is true when Supabase still needs the
   * visitor to click a confirmation link — publishing proceeds either way,
   * this is only for the caller's success message.
   */
  onAccountReady: (pendingConfirmation: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);
  const [view, setView] = useState<View>("create");

  function onCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const formData = new FormData(event.currentTarget);
      const result = await upgradeAnonymousAccount(formData);
      if (!result.ok) {
        // A taken address is not a validation error to retype past — it means
        // there is a second account in play, and the visitor has to decide
        // which one they want. Nothing is lost yet either way.
        if (result.emailTaken) {
          setView("email-taken");
          return;
        }
        setError(result.error);
        return;
      }
      onAccountReady(result.pendingConfirmation);
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
      // The common failure is the same collision as the email path: that
      // Google account is already an OWNA. Route it to the same explanation
      // rather than showing a provider error string.
      if (
        linkError.code === "identity_already_exists" ||
        linkError.code === "email_exists"
      ) {
        setView("email-taken");
      } else {
        setError(linkError.message);
      }
      setGooglePending(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setView("create");
      setError(null);
    }
    onOpenChange(next);
  }

  if (view === "confirm-login") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in instead?</DialogTitle>
            <DialogDescription>
              Logging in switches to your existing account. This draft —
              everything you just built here — won’t come with you, and there’s
              no way to get it back afterward.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setView("create")}>
              Cancel
            </Button>
            <Button render={<Link href="/login?next=/dashboard" />}>
              Log in anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (view === "email-taken") {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>That email already has an OWNA</DialogTitle>
            <DialogDescription>
              {email ? (
                <>
                  <span className="text-foreground font-medium">{email}</span> is
                  already registered.
                </>
              ) : (
                "That account is already registered."
              )}{" "}
              You can save this draft under a different address, or sign into the
              account you already have.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="warning">
            <AlertCircle />
            <AlertTitle>Signing in leaves this draft behind</AlertTitle>
            <AlertDescription>
              <p>
                Your existing account has its own page. This one can’t be moved
                across, and it can’t be recovered once you switch.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setEmail("");
                setError(null);
                setView("create");
              }}
            >
              Use a different email
            </Button>
            <Button
              variant="outline"
              render={<Link href="/login?next=/dashboard" />}
            >
              Sign into my existing account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <PasswordInput
              id="gate-password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
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
          <button
            type="button"
            onClick={() => setView("confirm-login")}
            className="text-foreground cursor-pointer underline underline-offset-4"
          >
            Log in
          </button>{" "}
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
