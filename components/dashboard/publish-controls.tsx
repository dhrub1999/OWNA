"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { publishProfile, unpublishProfile } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";

export function PublishControls({ isLive }: { isLive: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message?: string }>, success: string) {
    start(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.message ?? "Something went wrong.");
        return;
      }
      toast.success(success);
      // The dashboard reads publication state on the server, so refresh rather
      // than mirroring it into client state that could drift.
      router.refresh();
    });
  }

  if (isLive) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(publishProfile, "Republished.")}
        >
          {pending ? <Loader2 className="animate-spin" /> : <Rocket />}
          Republish
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => run(unpublishProfile, "Your page is offline.")}
        >
          <Undo2 />
          Take offline
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" disabled={pending} onClick={() => run(publishProfile, "You're live.")}>
      {pending ? <Loader2 className="animate-spin" /> : <Rocket />}
      Publish
    </Button>
  );
}
