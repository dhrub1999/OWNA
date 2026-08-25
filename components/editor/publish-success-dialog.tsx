"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, MailWarning } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { profileUrl, profileUrlLabel } from "@/lib/site";
import { FeedbackPrompt } from "./feedback-prompt";

/**
 * The first time a page goes live.
 *
 * Every publish after this one gets the toast, and that is the right treatment
 * for a routine save. The first is not routine: it is the moment the thing
 * someone has been building stops being a draft and acquires a real address,
 * and it is also the only moment they are guaranteed to be paying attention
 * when we ask them to share it. A toast that disappears in four seconds spends
 * that moment on nothing.
 *
 * The URL is the subject of the dialog rather than a detail inside it, because
 * the URL is what they came for.
 */
export function PublishSuccessDialog({
  open,
  onOpenChange,
  username,
  pendingConfirmation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  /** Their email still needs confirming, so the nudge rides along. */
  pendingConfirmation: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const url = profileUrl(username);
  const label = profileUrlLabel(username);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused outright. The URL is on screen and
      // selectable, so there is nothing to recover from and nothing to say.
    }
  }

  const share = `Just built my page with OWNA: ${url}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span
            aria-hidden="true"
            className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full"
          >
            <Check className="size-6" />
          </span>
          <DialogTitle className="text-center text-2xl">
            You&rsquo;re live
          </DialogTitle>
          <DialogDescription className="text-center">
            Anyone with this link can see your page now.
          </DialogDescription>
        </DialogHeader>

        <div className="border-border bg-muted/40 flex items-center gap-2 rounded-lg border p-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm">
            {label}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copy}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="size-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </div>

        {pendingConfirmation ? (
          <Alert variant="warning">
            <MailWarning />
            <AlertTitle>One thing left</AlertTitle>
            <AlertDescription>
              <p>
                Confirm your email so you can get back into this page from any
                other browser.
              </p>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            render={
              <a href={url} target="_blank" rel="noreferrer noopener" />
            }
          >
            <ExternalLink className="size-4" />
            View my page
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <ShareLink
              label="X"
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(share)}`}
            />
            <ShareLink
              label="LinkedIn"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
            />
            <ShareLink
              label="WhatsApp"
              href={`https://wa.me/?text=${encodeURIComponent(share)}`}
            />
          </div>
        </div>

        <FeedbackPrompt />

        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground"
        >
          Keep editing
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function ShareLink({ label, href }: { label: string; href: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      render={<a href={href} target="_blank" rel="noreferrer noopener" />}
    >
      {label}
    </Button>
  );
}
