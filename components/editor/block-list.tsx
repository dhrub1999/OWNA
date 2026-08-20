"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { BlockIcon } from "@/components/icons/block-icon";
import { BLOCK_META } from "@/lib/blocks/definitions";
import type { EditorBlock } from "@/lib/editor/document";
import { cn } from "@/lib/utils";
import { useEditor, useEditorDispatch } from "./editor-store";

/**
 * The block outline.
 *
 * dnd-kit is configured with a keyboard sensor and screen-reader announcements,
 * because a page builder whose reordering only works with a mouse is not a page
 * builder everyone can use.
 */
import { useId } from "react";

export function BlockList() {
  const dndId = useId();
  const { document, selectedBlockId } = useEditor();
  const dispatch = useEditorDispatch();
  const blocks = document.blocks;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = blocks.findIndex((block) => block.id === active.id);
    const to = blocks.findIndex((block) => block.id === over.id);
    if (from === -1 || to === -1) return;

    dispatch({
      type: "reorder",
      ids: arrayMove(blocks, from, to).map((block) => block.id),
    });
  }

  if (blocks.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-6 text-center text-xs">
        No blocks yet. Add one below.
      </p>
    );
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Picked up ${labelFor(blocks, active.id)}.`,
          onDragOver: ({ active, over }) =>
            over
              ? `${labelFor(blocks, active.id)} is over ${labelFor(blocks, over.id)}.`
              : `${labelFor(blocks, active.id)} is no longer over a drop target.`,
          onDragEnd: ({ active, over }) =>
            over
              ? `${labelFor(blocks, active.id)} dropped onto ${labelFor(blocks, over.id)}.`
              : `${labelFor(blocks, active.id)} returned to its position.`,
          onDragCancel: ({ active }) =>
            `Dragging ${labelFor(blocks, active.id)} cancelled.`,
        },
      }}
    >
      <SortableContext
        items={blocks.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-1 px-2">
          {blocks.map((block) => (
            <SortableBlockRow
              key={block.id}
              block={block}
              selected={block.id === selectedBlockId}
              onSelect={() => dispatch({ type: "select", id: block.id })}
              onToggleVisible={() => dispatch({ type: "toggle-visible", id: block.id })}
              onDuplicate={() => dispatch({ type: "duplicate", id: block.id })}
              onRemove={() => dispatch({ type: "remove", id: block.id })}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function labelFor(blocks: EditorBlock[], id: string | number): string {
  const block = blocks.find((candidate) => candidate.id === id);
  return block ? BLOCK_META[block.type].label : "block";
}

function SortableBlockRow({
  block,
  selected,
  onSelect,
  onToggleVisible,
  onDuplicate,
  onRemove,
}: {
  block: EditorBlock;
  selected: boolean;
  onSelect: () => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const meta = BLOCK_META[block.type];

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-0.5 rounded-md pr-1 transition-colors",
        selected ? "bg-muted" : "hover:bg-muted/60",
        isDragging && "opacity-60",
        !block.visible && "opacity-50",
      )}
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring cursor-grab rounded p-1.5 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
        aria-label={`Reorder ${meta.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-xs focus-visible:outline-none"
      >
        <BlockIcon type={block.type} className="text-muted-foreground size-3.5 shrink-0" />
        <span className="truncate">{meta.label}</span>
      </button>

      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <IconAction
          label={block.visible ? `Hide ${meta.label}` : `Show ${meta.label}`}
          onClick={onToggleVisible}
        >
          {block.visible ? (
            <Eye className="size-3.5" aria-hidden="true" />
          ) : (
            <EyeOff className="size-3.5" aria-hidden="true" />
          )}
        </IconAction>
        <IconAction label={`Duplicate ${meta.label}`} onClick={onDuplicate}>
          <Copy className="size-3.5" aria-hidden="true" />
        </IconAction>
        <IconAction label={`Delete ${meta.label}`} onClick={onRemove} destructive>
          <Trash2 className="size-3.5" aria-hidden="true" />
        </IconAction>
      </div>
    </li>
  );
}

function IconAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "text-muted-foreground focus-visible:ring-ring rounded p-1 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none",
        destructive ? "hover:text-destructive" : "hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
