"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, PencilLine } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { authErrorCopy } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";
import type { AuthResult } from "./actions";

/**
 * Shared shell for sign in and sign up.
 *
 * Google goes through the browser client because OAuth needs a full-page
 * redirect that a Server Action cannot perform. Email/password goes through a
 * Server Action so the password never lands in a client-side network log we
 * control.
 *
 * Request data (`next`, `error`, and whether the visitor is sitting on an
 * unpublished guest draft) arrives as props rather than through
 * `useSearchParams`. The server has to read the session here anyway to decide
 * whether this page should render at all, so resolving the query string in the
 * same pass costs nothing and keeps one source of truth.
 */
export function AuthForm({
  mode,
  action,
  next,
  errorCode,
  guestDraftUsername,
}: {
  mode: "signin" | "signup";
  action: (formData: FormData) => Promise<AuthResult>;
  next: string | null;
  errorCode: string | null;
  /** Set when an anonymous session already owns an unpublished draft. */
  guestDraftUsername: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  const isSignUp = mode === "signup";
  const linkCopy = authErrorCopy(errorCode);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      // A successful action redirects and never resolves to a value.
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  async function signInWithGoogle() {
    setError(null);
    setGooglePending(true);

    const supabase = createClient();
    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", next);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGooglePending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? "Create your profile" : "Welcome back"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isSignUp
            ? "Your own corner of the internet, in a few minutes."
            : "Sign in to keep building."}
        </p>
      </div>

      {/* Why they were sent here — an expired link, a half-finished OAuth
          round trip. Without this the redirect is indistinguishable from
          having navigated to /login on purpose. */}
      {linkCopy ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>{linkCopy.title}</AlertTitle>
          <AlertDescription>
            <p>{linkCopy.body}</p>
            {linkCopy.action ? (
              <Button
                variant="outline"
                size="sm"
                render={<Link href={linkCopy.action.href} />}
              >
                {linkCopy.action.label}
              </Button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Signing in from here replaces the anonymous session that owns the
          draft, and nothing migrates across — same loss the publish gate warns
          about, reachable by typing the URL. */}
      {guestDraftUsername ? (
        <Alert variant="warning">
          <PencilLine />
          <AlertTitle>You have an unpublished draft</AlertTitle>
          <AlertDescription>
            <p>
              <span className="font-medium">owna/{guestDraftUsername}</span> is
              still a guest draft. Signing into a different account leaves it
              behind, and it can&rsquo;t be recovered afterwards.
            </p>
            <Button variant="outline" size="sm" render={<Link href="/editor" />}>
              Back to my draft
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        variant="outline"
        onClick={signInWithGoogle}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {isSignUp ? (
              <span className="text-muted-foreground text-xs">8+ characters</span>
            ) : (
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4"
              >
                Forgot?
              </Link>
            )}
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={isSignUp ? 8 : undefined}
          />
        </div>

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending || googlePending} className="w-full">
          {pending ? "Just a moment…" : isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link
          href={isSignUp ? "/login" : "/signup"}
          className="text-foreground underline underline-offset-4"
        >
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
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
