"use client";

/**
 * The boundary of last resort: an error thrown by the root layout itself.
 *
 * This file replaces the root layout when it renders, which means none of the
 * app's scaffolding is available — no globals.css, no next/font, and no
 * ThemeProvider, so the `class`-based theme toggle cannot reach it either. That
 * is why everything below is inline: a self-contained document is the only kind
 * that can be relied on at the point where the document itself failed.
 *
 * Light and dark are handled with `prefers-color-scheme` alone, since the OS
 * preference is the only signal still available here.
 *
 * If this screen is ever seen in production, something is wrong at the very top
 * of the tree — this is the fallback, not a page anyone should reach.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  // `retry` is Next 16's name for the prop that used to be called `reset`.
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <title>Something went wrong · OWNA</title>
        <style>{`
          :root {
            color-scheme: light dark;
            --ground: #ffffff;
            --ink: #0b0e14;
            --muted: #5b6572;
            --line: #e2e6ec;
            --accent: #0b0e14;
            --accent-ink: #ffffff;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --ground: #0b0e14;
              --ink: #eef1f5;
              --muted: #98a2b0;
              --line: #232a35;
              --accent: #eef1f5;
              --accent-ink: #0b0e14;
            }
          }
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6rem 1.5rem;
            background: var(--ground);
            color: var(--ink);
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          .box { max-width: 28rem; text-align: center; }
          .kicker { margin: 0; font-size: .875rem; color: var(--muted); }
          h1 {
            margin: .75rem 0 0;
            font-size: 1.875rem;
            font-weight: 600;
            letter-spacing: -.02em;
            text-wrap: balance;
          }
          p.body { margin: .75rem 0 0; color: var(--muted); }
          .actions {
            margin-top: 2rem;
            display: flex;
            flex-direction: column;
            gap: .75rem;
            justify-content: center;
          }
          @media (min-width: 40rem) { .actions { flex-direction: row; } }
          a, button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 2.5rem;
            padding: 0 1.25rem;
            border-radius: .5rem;
            font: inherit;
            font-size: .875rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: opacity .15s ease;
          }
          button { border: 0; background: var(--accent); color: var(--accent-ink); }
          a { border: 1px solid var(--line); background: none; color: var(--ink); }
          a:hover, button:hover { opacity: .85; }
          a:focus-visible, button:focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
          }
          .ref {
            margin-top: 2rem;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: .75rem;
            color: var(--muted);
          }
          @media (prefers-reduced-motion: reduce) {
            a, button { transition: none; }
          }
        `}</style>

        <div className="box">
          <p className="kicker">Something broke</p>
          <h1>OWNA couldn’t load</h1>
          <p className="body">
            This one is on us. Reloading usually clears it — nothing you saved
            has been lost.
          </p>

          <div className="actions">
            <button type="button" onClick={() => retry()}>
              Try again
            </button>
            {/* A plain anchor, deliberately. `next/link` navigates on the
                client through the same router that just failed to render the
                document — the only reliable way out of here is a full page
                load. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Back to OWNA</a>
          </div>

          {error.digest ? <p className="ref">Reference: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
