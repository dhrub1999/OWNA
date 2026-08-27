"use client";

import Link from "next/link";

/**
 * The catch-all for an unhandled error anywhere below the root layout.
 *
 * Next swaps the failed segment for this and keeps the layout, so the fonts,
 * theme and page chrome are all still in place — this only has to say what
 * happened and offer a way forward.
 *
 * Styled with plain classes rather than the shared Button for the same reason
 * app/[username]/not-found.tsx is: this boundary also wraps the public profile
 * route, and that bundle should not grow a UI library for a screen most
 * visitors will never see.
 *
 * Nothing is logged here. A Server Component error is already recorded on the
 * server before it ever reaches the client, and `digest` is the identifier that
 * ties this screen to that log line — which is worth more to whoever is
 * debugging than a duplicate in the browser console.
 */
const linkClass =
  "inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  // `retry` is Next 16's name for the prop that used to be called `reset`.
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="text-muted-foreground text-sm">Something broke</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          That didn’t work
        </h1>
        <p className="text-muted-foreground mt-3">
          Nothing you did caused this, and nothing you saved has been lost.
          Trying again usually clears it.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className={`${linkClass} bg-primary text-primary-foreground hover:bg-primary/85`}
          >
            Try again
          </button>
          <Link href="/" className={`${linkClass} border hover:bg-muted`}>
            Back to OWNA
          </Link>
        </div>

        {/* The one detail worth surfacing: quoting it lets us find the exact
            server-side log line for this failure. */}
        {error.digest ? (
          <p className="text-muted-foreground mt-8 font-mono text-xs">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
