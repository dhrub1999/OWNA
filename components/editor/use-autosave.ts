"use client";

import { useCallback, useEffect, useRef } from "react";
import { saveDraft } from "@/app/(app)/actions";
import { useEditor, useEditorDispatch } from "./editor-store";

const DEBOUNCE_MS = 800;

/**
 * Debounced autosave.
 *
 * Saves are serialized: if one is in flight the next waits rather than racing,
 * because two overlapping saves would each carry a revision the other is about
 * to invalidate and one of them would come back as a spurious conflict.
 *
 * Returns `flush`, which the Publish button awaits — publishing builds its
 * snapshot from the database, so an unsaved edit would silently not ship.
 */
export function useAutosave() {
  const state = useEditor();
  const dispatch = useEditorDispatch();

  // The save fires from a timer, by which point the `state` captured in the
  // effect's closure is stale. This ref carries the current one across. Written
  // in an effect, not during render: a ref mutation during render is invisible
  // to React and misbehaves under concurrent rendering.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  const inFlight = useRef(false);

  const flush = useCallback(async (): Promise<boolean> => {
    if (inFlight.current) return false;

    const { document, revision, status } = latest.current;
    if (status === "saving" || status === "saved" || status === "idle") return true;

    inFlight.current = true;
    dispatch({ type: "save-start" });

    try {
      const result = await saveDraft(revision, document);

      if (result.ok) {
        dispatch({ type: "save-success", revision: result.revision });
        return true;
      }

      if (result.reason === "conflict") {
        dispatch({ type: "save-conflict", message: result.message });
      } else {
        dispatch({ type: "save-error", message: result.message });
      }
      return false;
    } catch {
      dispatch({ type: "save-error", message: "Couldn't reach the server." });
      return false;
    } finally {
      inFlight.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (state.status !== "dirty") return;

    const timer = setTimeout(() => {
      void flush();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // Re-running on every document change is the point: each edit restarts the
    // debounce window.
  }, [state.document, state.status, flush]);

  // A conflict is not something to retry into — the other tab's version is
  // already on the server, and hammering it would only overwrite more of it.
  useEffect(() => {
    if (state.status !== "dirty" && state.status !== "error") return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.status]);

  return { flush, status: state.status, savedAt: state.savedAt };
}
