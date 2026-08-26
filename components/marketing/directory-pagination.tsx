import Link from "next/link";

/**
 * Prev/Next for a directory listing.
 *
 * Deliberately just two links, not a full page-number row: at directory
 * scale there is no reason yet to jump further than one page at a time, and
 * this is the smallest thing that keeps every page reachable from the last.
 */
export function DirectoryPagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) =>
    target <= 1 ? basePath : `${basePath}?page=${target}`;

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex items-center justify-between border-t border-border pt-8"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="text-sm font-medium hover:underline">
          ← Newer
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="text-sm font-medium hover:underline">
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
