import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditorShell } from "@/components/editor/editor-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { documentFromRows } from "@/lib/editor/document";
import { getDraft } from "@/lib/supabase/profile";

export const metadata: Metadata = { title: "Editor" };

async function Editor() {
  const draft = await getDraft();
  // No profile means the account never finished onboarding.
  if (!draft) redirect("/onboarding/username");

  return (
    <EditorShell
      document={documentFromRows(draft.profile, draft.blocks)}
      revision={draft.profile.updated_at}
    />
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <Editor />
    </Suspense>
  );
}

/**
 * The chrome is in the prerendered shell so the editor's shape appears
 * immediately; only the draft itself waits on the database.
 */
function EditorSkeleton() {
  return (
    <div className="flex fixed inset-0 flex-col overflow-hidden bg-background">
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <span className="text-sm font-semibold tracking-tight">OWNA</span>
        <Skeleton className="ml-auto h-7 w-24" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-64 shrink-0 flex-col gap-2 border-r p-4 lg:flex">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <div className="bg-muted/40 flex flex-1 justify-center p-8">
          <Skeleton className="h-full w-full max-w-2xl rounded-xl" />
        </div>
        <div className="hidden w-80 shrink-0 flex-col gap-3 border-l p-4 lg:flex">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
