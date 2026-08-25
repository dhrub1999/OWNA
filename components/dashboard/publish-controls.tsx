"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { publishProfile, unpublishProfile } from "@/app/(app)/actions";
import { PublishAuthGate } from "@/components/editor/publish-auth-gate";
import { Button } from "@/components/ui/button";

export function PublishControls({
  isLive,
  isAnonymous,
}: {
  isLive: boolean;
  isAnonymous: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [gateOpen, setGateOpen] = useState(false);

  function run(
    action: () => Promise<{ ok: boolean; message?: string }>,
    success: string,
    successDescription?: string,
  ) {
    start(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.message ?? "Something went wrong.");
        return;
      }
      toast.success(success, { description: successDescription });
      // The dashboard reads publication state on the server, so refresh rather
      // than mirroring it into client state that could drift.
      router.refresh();
    });
  }

  function onPublish() {
    if (isAnonymous) {
      setGateOpen(true);
      return;
    }
    run(publishProfile, isLive ? "Republished." : "You're live.");
  }

  const gate = (
    <PublishAuthGate
      open={gateOpen}
      onOpenChange={setGateOpen}
      onAccountReady={(pendingConfirmation) => {
        setGateOpen(false);
        run(
          publishProfile,
          "You're live.",
          pendingConfirmation
            ? "Confirm your email to make sure you can always log back in."
            : undefined,
        );
      }}
    />
  );

  if (isLive) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending} onClick={onPublish}>
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
        {gate}
      </div>
    );
  }

  return (
    <>
      <Button size="sm" disabled={pending} onClick={onPublish}>
        {pending ? <Loader2 className="animate-spin" /> : <Rocket />}
        Publish
      </Button>
      {gate}
    </>
  );
}
