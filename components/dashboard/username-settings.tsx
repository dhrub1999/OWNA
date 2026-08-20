"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { renameUsername } from "@/app/(app)/actions";
import { AvailabilityIcon } from "@/components/availability-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsernameAvailability } from "@/lib/hooks/use-username-availability";
import { profileUrlLabel } from "@/lib/site";
import { sanitizeUsernameInput } from "@/lib/validations/username";

export function UsernameSettings({ current }: { current: string }) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [pending, start] = useTransition();

  const unchanged = value === current;
  // Checking whether you already own a name would always come back "taken".
  const availability = useUsernameAvailability(value, { skip: unchanged });

  function onSubmit() {
    start(async () => {
      const result = await renameUsername(value);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`You’re now at ${profileUrlLabel(result.username)}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            value={value}
            onChange={(event) => setValue(sanitizeUsernameInput(event.target.value))}
            spellCheck={false}
            autoCapitalize="none"
            className="pr-9 font-mono"
            aria-describedby="username-help"
          />
          <span className="absolute top-1/2 right-3 -translate-y-1/2">
            <AvailabilityIcon state={availability.state} />
          </span>
        </div>
        <p
          id="username-help"
          role="status"
          aria-live="polite"
          className="text-muted-foreground text-sm"
        >
          {availability.state === "invalid" ? (
            <span className="text-destructive">{availability.message}</span>
          ) : availability.state === "taken" ? (
            <span className="text-destructive">That one’s taken.</span>
          ) : (
            <span className="font-mono">{profileUrlLabel(value || current)}</span>
          )}
        </p>
      </div>

      <Button
        size="sm"
        className="self-start"
        disabled={unchanged || availability.state !== "available" || pending}
        onClick={onSubmit}
      >
        {pending ? <Loader2 className="animate-spin" /> : null}
        Change address
      </Button>
    </div>
  );
}
