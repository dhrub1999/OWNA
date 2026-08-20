"use client";

import { useState } from "react";
import { Layers, PanelRight, Paintbrush, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EditorDocument } from "@/lib/editor/document";
import { cn } from "@/lib/utils";
import { BlockLibrary } from "./block-library";
import { BlockList } from "./block-list";
import { Canvas } from "./canvas";
import { EditorProvider, useEditor } from "./editor-store";
import { Inspector } from "./inspector";
import { PagePanel } from "./page-panel";
import { ThemePanel } from "./theme-panel";
import { Toolbar } from "./toolbar";
import { useAutosave } from "./use-autosave";

/**
 * The editor.
 *
 * Three panes on a wide screen — outline, canvas, properties — collapsing to
 * the canvas plus two slide-over sheets below `lg`. The canvas is never the
 * thing that gets hidden, because seeing the page is the whole point.
 */
export function EditorShell({
  document,
  revision,
}: {
  document: EditorDocument;
  revision: string;
}) {
  return (
    <EditorProvider document={document} revision={revision}>
      <EditorLayout />
    </EditorProvider>
  );
}

function EditorLayout() {
  const { flush } = useAutosave();
  const [mobilePanel, setMobilePanel] = useState<"blocks" | "props" | null>(null);

  return (
    <div className="flex absolute inset-0 flex-col overflow-hidden bg-background">
      <Toolbar flush={flush} />
      <ConflictBanner />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r lg:flex lg:min-h-0">
          <LeftPanel />
        </aside>

        <main className="relative min-w-0 flex-1 lg:min-h-0">
          <Canvas />
        </main>

        <aside className="hidden w-80 shrink-0 flex-col overflow-hidden border-l lg:flex lg:min-h-0">
          <RightPanel />
        </aside>
      </div>

      <nav className="flex shrink-0 items-center justify-around border-t p-2 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobilePanel("blocks")}
          aria-haspopup="dialog"
        >
          <Layers />
          Blocks
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobilePanel("props")}
          aria-haspopup="dialog"
        >
          <PanelRight />
          Design
        </Button>
      </nav>

      {mobilePanel ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={mobilePanel === "blocks" ? "Blocks" : "Properties"}
          className="bg-background fixed inset-x-0 bottom-0 z-40 flex h-[70dvh] flex-col rounded-t-2xl border-t shadow-2xl lg:hidden"
        >
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-medium">
              {mobilePanel === "blocks" ? "Blocks" : "Design"}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMobilePanel(null)}
              aria-label="Close"
            >
              <X />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mobilePanel === "blocks" ? <LeftPanel /> : <RightPanel />}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LeftPanel() {
  return (
    <>
      <div className="border-b py-3">
        <p className="text-muted-foreground mb-2 px-4 text-[11px] font-semibold tracking-wide uppercase">
          Your page
        </p>
        <BlockList />
      </div>
      <BlockLibrary />
    </>
  );
}

function RightPanel() {
  return (
    <Tabs defaultValue="block" className="flex min-h-0 flex-col gap-0 flex-1">
      <TabsList className="mx-3 mt-3 grid grid-cols-3">
        <TabsTrigger value="block" className="text-xs">
          <Settings2 className="size-3.5" aria-hidden="true" />
          Block
        </TabsTrigger>
        <TabsTrigger value="design" className="text-xs">
          <Paintbrush className="size-3.5" aria-hidden="true" />
          Design
        </TabsTrigger>
        <TabsTrigger value="page" className="text-xs">
          Page
        </TabsTrigger>
      </TabsList>

      <TabsContent value="block" className="mt-3 flex-1 min-h-0 overflow-y-auto">
        <Inspector />
      </TabsContent>
      <TabsContent value="design" className="mt-3 flex-1 min-h-0 overflow-y-auto">
        <ThemePanel />
      </TabsContent>
      <TabsContent value="page" className="mt-3 flex-1 min-h-0 overflow-y-auto">
        <PagePanel />
      </TabsContent>
    </Tabs>
  );
}

/**
 * A second tab saved over this one.
 *
 * Reloading is the honest resolution: the other tab's version is already on the
 * server, and there is no merge we could perform that would not silently pick a
 * winner on the user's behalf.
 */
function ConflictBanner() {
  const { status, statusMessage } = useEditor();
  if (status !== "conflict") return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-3 border-b px-4 py-2 text-sm",
        "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
      )}
    >
      <span>{statusMessage ?? "This profile was edited somewhere else."}</span>
      <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
