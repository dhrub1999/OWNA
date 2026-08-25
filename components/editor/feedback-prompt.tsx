"use client";

import { useState, useTransition } from "react";
import { Check, MessageCircleHeart } from "lucide-react";
import { submitFeedback } from "@/app/(app)/feedback-actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HEARD_ABOUT_OPTIONS } from "@/lib/validations/feedback";

/**
 * Lives inside the "You're live" dialog, below the share actions.
 *
 * This is the one moment someone is guaranteed to be happy with the product,
 * so it is the only place feedback gets asked for at all — entirely optional,
 * closed by default, and never shown again after this dialog (which is itself
 * gated to a single first publish). No separate "dismiss and never ask again"
 * state to maintain: not asking twice falls out of where this lives.
 */
export function FeedbackPrompt() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [heardAbout, setHeardAbout] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-sm">
        <Check className="text-primary size-4" aria-hidden="true" />
        Thanks — that helps.
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground -mx-2 justify-start"
      >
        <MessageCircleHeart className="size-4" />
        Got a sec? Tell us how we did
      </Button>
    );
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await submitFeedback({ message, heardAbout });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="border-border bg-muted/40 flex flex-col gap-3 rounded-lg border p-3">
      <Textarea
        autoFocus
        placeholder="What do you think so far?"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className="bg-background min-h-20"
      />

      <Select
        value={heardAbout}
        onValueChange={(value) => setHeardAbout(value ?? undefined)}
      >
        <SelectTrigger className="bg-background w-full">
          <SelectValue placeholder="Where'd you hear about OWNA? (optional)" />
        </SelectTrigger>
        <SelectContent>
          {HEARD_ABOUT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
          className="text-muted-foreground"
        >
          Never mind
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={send}
          disabled={pending || !message.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
