"use client";

import { useCallback } from "react";
import type { BlockPropsFor, BlockType } from "@/lib/blocks/definitions";
import type { EditorBlock } from "@/lib/editor/document";
import { useEditorDispatch } from "../editor-store";

/**
 * Read and write one block's props.
 *
 * The `field` passed through to the reducer is what lets consecutive edits to
 * the same input collapse into a single undo step, so undo walks back through
 * decisions rather than keystrokes.
 */
export function useBlockProps<T extends BlockType>(block: EditorBlock) {
  const dispatch = useEditorDispatch();
  const props = block.props as BlockPropsFor<T>;

  const set = useCallback(
    <K extends keyof BlockPropsFor<T>>(key: K, value: BlockPropsFor<T>[K]) => {
      dispatch({
        type: "update-props",
        id: block.id,
        patch: { [key]: value } as Record<string, unknown>,
        field: String(key),
      });
    },
    [block.id, dispatch],
  );

  return [props, set] as const;
}

export type InspectorProps = { block: EditorBlock };
