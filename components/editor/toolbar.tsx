"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  CloudOff,
  ExternalLink,
  Loader2,
  Monitor,
  Redo2,
  Smartphone,
  Tablet,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { publishProfile } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { profileUrlLabel } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useEditor, useEditorDispatch, type Device } from "./editor-store";

const DEVICES: { value: Device; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];

export function Toolbar({ flush }: { flush: () => Promise<boolean> }) {
  const state = useEditor();
  const dispatch = useEditorDispatch();
  const [publishing, startPublish] = useTransition();
  const [justPublished, setJustPublished] = useState(false);

  const username = state.document.profile.username;

  function onPublish() {
    startPublish(async () => {
      // Publishing builds its snapshot from the database, so anything still
      // sitting in the debounce window has to land first or it silently
      // wouldn't ship.
      const saved = await flush();
      if (!saved && state.status !== "saved" && state.status !== "idle") {
        toast.error("Couldn't save your latest changes. Nothing was published.");
        return;
      }

      const result = await publishProfile();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      setJustPublished(true);
      toast.success("You're live.", {
        description: profileUrlLabel(result.username),
        action: {
          label: "Copy link",
          onClick: () => {
            void navigator.clipboard.writeText(`https://${profileUrlLabel(result.username)}`);
          },
        },
      });
    });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
      <Link href="/dashboard" className="px-1 text-sm font-semibold tracking-tight">
        OWNA
      </Link>

      <div className="ml-1 flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch({ type: "undo" })}
          disabled={state.past.length === 0}
          aria-label="Undo"
          title="Undo"
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch({ type: "redo" })}
          disabled={state.future.length === 0}
          aria-label="Redo"
          title="Redo"
        >
          <Redo2 />
        </Button>
      </div>

      <div
        role="radiogroup"
        aria-label="Preview size"
        className="bg-muted mx-auto flex items-center gap-0.5 rounded-lg p-0.5"
      >
        {DEVICES.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            title={label}
            className={cn(
              "relative flex cursor-pointer items-center rounded-md p-1.5 transition-colors",
              "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-2",
              state.device === value
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <input
              type="radio"
              name="device"
              className="sr-only"
              checked={state.device === value}
              onChange={() => dispatch({ type: "set-device", device: value })}
            />
            <Icon className="size-4" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </label>
        ))}
      </div>

      <SaveStatusPill />

      <Button
        variant="ghost"
        size="sm"
        render={<Link href={`/${username}`} target="_blank" />}
        title="Open your public page"
      >
        <ExternalLink />
        <span className="hidden sm:inline">View</span>
      </Button>

      <Button size="sm" onClick={onPublish} disabled={publishing}>
        {publishing ? <Loader2 className="animate-spin" /> : null}
        {justPublished && state.status === "saved" ? "Republish" : "Publish"}
      </Button>
    </header>
  );
}

function SaveStatusPill() {
  const { status, statusMessage } = useEditor();

  const content: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    idle: { icon: null, label: "", className: "" },
    dirty: {
      icon: <span className="bg-muted-foreground size-1.5 rounded-full" />,
      label: "Unsaved",
      className: "text-muted-foreground",
    },
    saving: {
      icon: <Loader2 className="size-3 animate-spin" aria-hidden="true" />,
      label: "Saving",
      className: "text-muted-foreground",
    },
    saved: {
      icon: <Check className="size-3" aria-hidden="true" />,
      label: "Saved",
      className: "text-muted-foreground",
    },
    error: {
      icon: <CloudOff className="size-3" aria-hidden="true" />,
      label: "Not saved",
      className: "text-destructive",
    },
    conflict: {
      icon: <TriangleAlert className="size-3" aria-hidden="true" />,
      label: "Edited elsewhere",
      className: "text-amber-600 dark:text-amber-500",
    },
  };

  const state = content[status];
  if (!state?.label) return <span className="w-20" aria-hidden="true" />;

  return (
    <p
      role="status"
      aria-live="polite"
      title={statusMessage ?? undefined}
      className={cn("flex items-center gap-1.5 px-2 text-xs whitespace-nowrap", state.className)}
    >
      {state.icon}
      <span className="hidden sm:inline">{state.label}</span>
    </p>
  );
}
