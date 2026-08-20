"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  type BlockPropsFor,
  type BlockStyle,
  type BlockType,
  parseBlockStyle,
  starterBlockProps,
} from "@/lib/blocks/definitions";
import type { EditorBlock, EditorDocument, EditorProfile } from "@/lib/editor/document";
import { resolvePreset, type ThemePresetId } from "@/lib/themes/presets";
import type { Layout, Theme } from "@/lib/themes/schema";

/**
 * Editor state.
 *
 * The client is the source of truth while someone is editing; autosave pushes
 * the whole document to the server on a debounce. That is what makes the
 * preview instant — nothing in the edit loop waits on a round trip.
 *
 * A plain reducer rather than a state library: the document is one object, the
 * actions are a closed set, and history is just a bounded array of previous
 * documents. There is nothing here a dependency would make simpler.
 */

export type Device = "desktop" | "tablet" | "mobile";
export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

const HISTORY_LIMIT = 50;
/** Consecutive edits to the same field within this window collapse into one
 *  undo step, so undo does not walk back through a paragraph letter by letter. */
const COALESCE_MS = 700;

export type EditorState = {
  document: EditorDocument;
  past: EditorDocument[];
  future: EditorDocument[];
  /** Identifies the field last edited, for history coalescing. */
  lastEditKey: string | null;
  lastEditAt: number;

  selectedBlockId: string | null;
  device: Device;
  status: SaveStatus;
  statusMessage: string | null;
  /** profiles.updated_at as last confirmed by the server. */
  revision: string;
  savedAt: number | null;
};

export type EditorAction =
  | { type: "select"; id: string | null }
  | { type: "add-block"; blockType: BlockType; index?: number }
  | { type: "update-props"; id: string; patch: Record<string, unknown>; field?: string }
  | { type: "update-style"; id: string; patch: Partial<BlockStyle> }
  | { type: "reorder"; ids: string[] }
  | { type: "duplicate"; id: string }
  | { type: "remove"; id: string }
  | { type: "toggle-visible"; id: string }
  | { type: "set-theme"; theme: Theme }
  | { type: "set-layout"; layout: Layout }
  | { type: "apply-preset"; preset: ThemePresetId }
  | { type: "update-profile"; patch: Partial<EditorProfile>; field?: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "set-device"; device: Device }
  | { type: "save-start" }
  | { type: "save-success"; revision: string }
  | { type: "save-error"; message: string }
  | { type: "save-conflict"; message: string };

export function createInitialState(
  document: EditorDocument,
  revision: string,
): EditorState {
  return {
    document,
    past: [],
    future: [],
    lastEditKey: null,
    lastEditAt: 0,
    selectedBlockId: document.blocks[0]?.id ?? null,
    device: "desktop",
    status: "idle",
    statusMessage: null,
    revision,
    savedAt: null,
  };
}

/** Every document change funnels through here so history and dirty state stay honest. */
function commit(
  state: EditorState,
  document: EditorDocument,
  editKey: string | null = null,
): EditorState {
  const now = Date.now();
  const coalesce =
    editKey !== null &&
    editKey === state.lastEditKey &&
    now - state.lastEditAt < COALESCE_MS;

  return {
    ...state,
    document,
    past: coalesce
      ? state.past
      : [...state.past, state.document].slice(-HISTORY_LIMIT),
    future: [],
    lastEditKey: editKey,
    lastEditAt: now,
    status: "dirty",
    statusMessage: null,
  };
}

function replaceBlock(
  document: EditorDocument,
  id: string,
  update: (block: EditorBlock) => EditorBlock,
): EditorDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) =>
      block.id === id ? update(block) : block,
    ),
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "select":
      return { ...state, selectedBlockId: action.id };

    case "set-device":
      return { ...state, device: action.device };

    case "add-block": {
      const block: EditorBlock = {
        id: crypto.randomUUID(),
        type: action.blockType,
        props: starterBlockProps(action.blockType),
        style: parseBlockStyle({}),
        visible: true,
      };

      const blocks = [...state.document.blocks];
      blocks.splice(action.index ?? blocks.length, 0, block);

      return {
        ...commit(state, { ...state.document, blocks }),
        selectedBlockId: block.id,
      };
    }

    case "update-props":
      return commit(
        state,
        replaceBlock(state.document, action.id, (block) => ({
          ...block,
          props: { ...block.props, ...action.patch } as BlockPropsFor<BlockType>,
        })),
        action.field ? `${action.id}:${action.field}` : null,
      );

    case "update-style":
      return commit(
        state,
        replaceBlock(state.document, action.id, (block) => ({
          ...block,
          style: { ...block.style, ...action.patch },
        })),
      );

    case "reorder": {
      const byId = new Map(state.document.blocks.map((block) => [block.id, block]));
      const blocks = action.ids
        .map((id) => byId.get(id))
        .filter((block): block is EditorBlock => Boolean(block));

      // Anything the caller forgot stays put at the end rather than vanishing.
      for (const block of state.document.blocks) {
        if (!action.ids.includes(block.id)) blocks.push(block);
      }

      return commit(state, { ...state.document, blocks });
    }

    case "duplicate": {
      const index = state.document.blocks.findIndex((b) => b.id === action.id);
      if (index === -1) return state;

      const source = state.document.blocks[index];
      const copy: EditorBlock = {
        ...source,
        id: crypto.randomUUID(),
        props: structuredClone(source.props),
        style: { ...source.style },
      };

      const blocks = [...state.document.blocks];
      blocks.splice(index + 1, 0, copy);

      return {
        ...commit(state, { ...state.document, blocks }),
        selectedBlockId: copy.id,
      };
    }

    case "remove": {
      const blocks = state.document.blocks.filter((b) => b.id !== action.id);
      return {
        ...commit(state, { ...state.document, blocks }),
        selectedBlockId:
          state.selectedBlockId === action.id ? null : state.selectedBlockId,
      };
    }

    case "toggle-visible":
      return commit(
        state,
        replaceBlock(state.document, action.id, (block) => ({
          ...block,
          visible: !block.visible,
        })),
      );

    case "set-theme":
      return commit(state, { ...state.document, theme: action.theme }, "theme");

    case "set-layout":
      return commit(state, { ...state.document, layout: action.layout }, "layout");

    case "apply-preset": {
      const { theme, layout } = resolvePreset(action.preset);
      return commit(state, { ...state.document, theme, layout });
    }

    case "update-profile":
      return commit(
        state,
        {
          ...state.document,
          profile: { ...state.document.profile, ...action.patch },
        },
        action.field ? `profile:${action.field}` : null,
      );

    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...state,
        document: previous,
        past: state.past.slice(0, -1),
        future: [state.document, ...state.future].slice(0, HISTORY_LIMIT),
        lastEditKey: null,
        status: "dirty",
      };
    }

    case "redo": {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return {
        ...state,
        document: next,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: rest,
        lastEditKey: null,
        status: "dirty",
      };
    }

    case "save-start":
      return { ...state, status: "saving", statusMessage: null };

    case "save-success":
      return {
        ...state,
        // Not "saved" if the user typed again while the request was in flight —
        // that edit still needs its own save.
        status: state.status === "saving" ? "saved" : state.status,
        revision: action.revision,
        savedAt: Date.now(),
        statusMessage: null,
      };

    case "save-error":
      return { ...state, status: "error", statusMessage: action.message };

    case "save-conflict":
      return { ...state, status: "conflict", statusMessage: action.message };

    default:
      return state;
  }
}

const StateContext = createContext<EditorState | null>(null);
const DispatchContext = createContext<Dispatch<EditorAction> | null>(null);

export function EditorProvider({
  document,
  revision,
  children,
}: {
  document: EditorDocument;
  revision: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    editorReducer,
    { document, revision },
    (init) => createInitialState(init.document, init.revision),
  );

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useEditor(): EditorState {
  const state = useContext(StateContext);
  if (!state) throw new Error("useEditor must be used inside EditorProvider");
  return state;
}

export function useEditorDispatch(): Dispatch<EditorAction> {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) throw new Error("useEditorDispatch must be used inside EditorProvider");
  return dispatch;
}

/** The block currently open in the inspector, if any. */
export function useSelectedBlock(): EditorBlock | null {
  const { document, selectedBlockId } = useEditor();
  return useMemo(
    () => document.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [document.blocks, selectedBlockId],
  );
}
