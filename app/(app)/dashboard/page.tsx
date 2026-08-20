import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Paintbrush, PencilLine, Eye } from "lucide-react";
import { AppHeader } from "@/components/dashboard/app-header";
import { PublishControls } from "@/components/dashboard/publish-controls";
import { ShareCard } from "@/components/dashboard/share-card";
import { ProfileRenderer } from "@/components/public/profile-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { draftToSnapshot, documentFromRows } from "@/lib/editor/document";
import { profileUrl, profileUrlLabel } from "@/lib/site";
import { getDraft, getPublicationState } from "@/lib/supabase/profile";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardBody() {
  const draft = await getDraft();
  if (!draft) redirect("/onboarding/username");

  const publication = await getPublicationState(draft.profile.id);
  const document = documentFromRows(draft.profile, draft.blocks);
  const snapshot = draftToSnapshot(document);

  const url = profileUrl(draft.profile.username);
  const blockCount = draft.blocks.length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {draft.profile.display_name || draft.profile.username}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {publication.isLive ? (
              <Badge variant="secondary">Live</Badge>
            ) : (
              <Badge variant="outline">
                {publication.hasEverPublished ? "Offline" : "Draft"}
              </Badge>
            )}
            <span className="text-muted-foreground text-sm">
              {blockCount} block{blockCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <PublishControls isLive={publication.isLive} />
      </div>

      <div className="mt-6">
        <ShareCard url={url} label={profileUrlLabel(draft.profile.username)} />
        {!publication.isLive ? (
          <p className="text-muted-foreground mt-2 text-xs">
            This link won’t work for anyone else until you publish.
          </p>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* A live render of the draft, scaled down. Not a screenshot — it is the
            same renderer the public page uses, so it can never be out of date. */}
        <div className="overflow-hidden rounded-xl border">
          <div className="bg-muted/40 flex items-center gap-2 border-b px-3 py-2">
            <span className="text-muted-foreground text-xs">Preview</span>
            <Button
              variant="ghost"
              size="xs"
              className="ml-auto"
              render={<Link href="/preview" />}
            >
              <Eye />
              Full size
            </Button>
          </div>
          <div className="pointer-events-none max-h-[28rem] overflow-hidden">
            <ProfileRenderer snapshot={snapshot} isPreview />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button className="justify-start" render={<Link href="/editor" />}>
            <PencilLine />
            Edit profile
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            render={<Link href="/editor" />}
          >
            <Paintbrush />
            Customize
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            render={<Link href="/preview" />}
          >
            <Eye />
            Preview
          </Button>

          <div className="text-muted-foreground mt-4 rounded-lg border border-dashed p-4 text-center text-xs">
            <BarChart3 className="mx-auto mb-2 size-4" aria-hidden="true" />
            Visitor stats are coming. We’re not tracking anything yet.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <AppHeader />
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="mt-6 h-10 w-full" />
            <Skeleton className="mt-8 h-72 w-full" />
          </div>
        }
      >
        <DashboardBody />
      </Suspense>
    </>
  );
}
