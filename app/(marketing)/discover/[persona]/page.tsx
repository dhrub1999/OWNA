import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DirectoryGrid } from "@/components/marketing/directory-grid";
import { DirectoryPagination } from "@/components/marketing/directory-pagination";
import { snapshotSeo } from "@/lib/blocks/snapshot";
import { PURPOSE_OPTIONS, type DemoProfileId } from "@/lib/demo-profiles";
import { jsonLdScript } from "@/lib/seo/structured-data";
import { profileUrl, siteUrl } from "@/lib/site";
import { getDirectoryProfileCount, getDirectoryProfiles } from "@/lib/supabase/queries";

const PAGE_SIZE = 24;

function findPersona(id: string) {
  return PURPOSE_OPTIONS.find((option) => option.id === id);
}

export function generateStaticParams() {
  return PURPOSE_OPTIONS.map((option) => ({ persona: option.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ persona: string }>;
}): Promise<Metadata> {
  const { persona } = await params;
  const option = findPersona(persona);
  if (!option) return {};

  return {
    title: `${option.label} — Discover`,
    description: `${option.description} Real OWNA pages in this category, reviewed before they're listed.`,
    alternates: { canonical: `/discover/${persona}` },
  };
}

/**
 * `params` is known ahead of time (generateStaticParams enumerates the fixed
 * persona set), so awaiting it here stays in the prerendered shell. Only
 * `searchParams` — genuinely per-request — sits inside Suspense, in
 * DiscoverPersonaResults below.
 */
export default async function DiscoverPersonaPage({
  params,
  searchParams,
}: {
  params: Promise<{ persona: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { persona } = await params;
  const option = findPersona(persona);
  if (!option) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20 sm:px-12 sm:py-28">
      <Link href="/discover" className="text-muted-foreground text-sm hover:underline">
        ← Discover
      </Link>
      <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        {option.label}
      </h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
        {option.description}
      </p>

      <Suspense fallback={<div className="mt-16" aria-hidden />}>
        <DiscoverPersonaResults persona={persona as DemoProfileId} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function DiscoverPersonaResults({
  persona,
  searchParams,
}: {
  persona: DemoProfileId;
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [count, entries] = await Promise.all([
    getDirectoryProfileCount(persona),
    getDirectoryProfiles({ persona, offset, limit: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const option = findPersona(persona);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: `${siteUrl()}/discover/${persona}`,
    name: option?.label,
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
      <DirectoryPagination
        page={page}
        totalPages={totalPages}
        basePath={`/discover/${persona}`}
      />
    </>
  );
}
