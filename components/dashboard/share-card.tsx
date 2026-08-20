"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Copy and share the public link.
 *
 * `navigator.share` is only offered when the browser actually has it —
 * feature-detected rather than sniffed — and copying is always available as the
 * path that works everywhere.
 */
export function ShareCard({ url, label }: { url: string; label: string }) {
  const [copied, setCopied] = useState(false);

  // The server has no `navigator`, so this has to differ between the server
  // render and the client. useSyncExternalStore is the sanctioned way to say
  // that: React uses the third argument for the server snapshot and swaps in
  // the real value after hydration, with no mismatch and no effect.
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="bg-muted min-w-0 flex-1 truncate rounded-md px-3 py-2 font-mono text-sm">
        {label}
      </code>

      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>

      {canShare ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void navigator.share({ url, title: label }).catch(() => {
              // The user dismissed the share sheet. Not an error.
            });
          }}
        >
          <Share2 />
          Share
        </Button>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        render={<a href={url} target="_blank" rel="noopener noreferrer" />}
      >
        <ExternalLink />
        Open
      </Button>
    </div>
  );
}
