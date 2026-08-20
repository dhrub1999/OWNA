import Link from "next/link";

/**
 * An unclaimed username.
 *
 * Someone typing a name that does not exist already believes this URL should be
 * somebody's page. Offering them the name is worth more than a dead end.
 *
 * Styled with plain classes rather than the shared Button: this segment sits
 * inside the public profile route, and it is not worth pulling a UI library
 * into that bundle for two links on a 404.
 */
const linkClass =
  "inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export default function ProfileNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="text-muted-foreground text-sm">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Nobody’s here yet
        </h1>
        <p className="text-muted-foreground mt-3">
          This name hasn’t been claimed. It could be yours.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className={`${linkClass} bg-primary text-primary-foreground hover:bg-primary/85`}
          >
            Claim it
          </Link>
          <Link href="/" className={`${linkClass} border hover:bg-muted`}>
            Back to OWNA
          </Link>
        </div>
      </div>
    </main>
  );
}
