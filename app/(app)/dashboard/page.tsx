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
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardBody() {
  const [draft, user] = await Promise.all([getDraft(), getUser()]);
  if (!draft) redirect("/onboarding/username");

  const publication = await getPublicationState(draft.profile.id);
  const document = documentFromRows(draft.profile, draft.blocks);
  const snapshot = draftToSnapshot(document);

  const url = profileUrl(draft.profile.username);
  const blockCount = draft.blocks.length;

  return (
    <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:min-h-0 lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-r">
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
          <div className="mt-4">
            <PublishControls
              isLive={publication.isLive}
              isAnonymous={Boolean(user?.is_anonymous)}
            />
          </div>
        </div>

        <div>
          <ShareCard url={url} label={profileUrlLabel(draft.profile.username)} />
          {!publication.isLive ? (
            <p className="text-muted-foreground mt-2 text-xs">
              This link won’t work for anyone else until you publish.
            </p>
          ) : null}
        </div>
      </div>

      <div className="bg-muted/40 flex flex-1 flex-col p-4 sm:p-8 lg:min-h-0 lg:min-w-0 lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-xl border bg-background shadow-sm lg:max-w-md">
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
          <div className="pointer-events-none">
            <ProfileRenderer snapshot={snapshot} isPreview className="min-h-[60vh]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col p-4 sm:p-6 lg:min-h-0 lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-l">
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
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <AppHeader />
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1">
            <div className="flex flex-1 flex-col lg:flex-row">
              <div className="p-4 sm:p-6 lg:w-80 lg:shrink-0 lg:border-r">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="mt-6 h-10 w-full" />
              </div>
              <div className="bg-muted/40 flex flex-1 flex-col p-4 sm:p-8 lg:min-w-0">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
              <div className="p-4 sm:p-6 lg:w-72 lg:shrink-0 lg:border-l">
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        }
      >
        <DashboardBody />
      </Suspense>
    </div>
  );
}
