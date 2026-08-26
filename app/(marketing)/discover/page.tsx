import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { DirectoryGrid } from "@/components/marketing/directory-grid";
import { DirectoryPagination } from "@/components/marketing/directory-pagination";
import { snapshotSeo } from "@/lib/blocks/snapshot";
import { PURPOSE_OPTIONS } from "@/lib/demo-profiles";
import { jsonLdScript } from "@/lib/seo/structured-data";
import { profileUrl, siteUrl } from "@/lib/site";
import { getDirectoryProfileCount, getDirectoryProfiles } from "@/lib/supabase/queries";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Real OWNA pages, reviewed before they're listed — consultants, photographers, freelancers, artists and makers.",
  alternates: { canonical: "/discover" },
};

/**
 * `searchParams` is genuinely per-request, unlike `[persona]` (known ahead of
 * time via generateStaticParams elsewhere in this route group) — so only the
 * part of the page that reads it sits inside Suspense, keeping the title,
 * intro and category nav in the prerendered shell.
 */
export default function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Discover
      </h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
        Real OWNA pages, reviewed before they show up here.
      </p>

      <nav aria-label="Categories" className="mt-10 flex flex-wrap gap-3">
        {PURPOSE_OPTIONS.map((option) => (
          <Link
            key={option.id}
            href={`/discover/${option.id}`}
            className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary/60"
          >
            {option.label}
          </Link>
        ))}
      </nav>

      <Suspense fallback={<div className="mt-16" aria-hidden />}>
        <DiscoverResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DiscoverResults({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [count, entries] = await Promise.all([
    getDirectoryProfileCount(),
    getDirectoryProfiles({ offset, limit: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${siteUrl()}/discover`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.map((entry, index) => ({
        "@type": "ListItem",
        position: offset + index + 1,
        url: profileUrl(entry.username),
        name: snapshotSeo(entry.snapshot).name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionJsonLd) }}
      />
      <DirectoryGrid entries={entries} />
      <DirectoryPagination page={page} totalPages={totalPages} basePath="/discover" />
    </>
  );
}
