import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PreviewFrame } from "@/components/dashboard/preview-frame";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { documentFromRows, draftToSnapshot } from "@/lib/editor/document";
import { getDraft } from "@/lib/supabase/profile";

export const metadata: Metadata = { title: "Preview", robots: { index: false } };

/**
 * Preview the draft, before publishing.
 *
 * Owner-only, and the proxy plus RLS both say so — but the more interesting
 * property is that it renders the unpublished draft through the public
 * renderer, so "what I'll ship" and "what visitors see" are the same code path.
 */
async function Preview() {
  const draft = await getDraft();
  if (!draft) redirect("/onboarding/username");

  const snapshot = draftToSnapshot(documentFromRows(draft.profile, draft.blocks));
  return <PreviewFrame snapshot={snapshot} />;
}

export default function PreviewPage() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
          <ArrowLeft />
          Back
        </Button>
        <span className="text-muted-foreground text-sm">Draft preview</span>
        <Button size="sm" className="ml-auto" render={<Link href="/editor" />}>
          Edit
        </Button>
      </header>

      <Suspense
        fallback={
          <div className="bg-muted/40 flex flex-1 justify-center p-8">
            <Skeleton className="h-full w-full max-w-2xl rounded-xl" />
          </div>
        }
      >
        <Preview />
      </Suspense>
    </div>
  );
}
