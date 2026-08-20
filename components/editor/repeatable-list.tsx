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
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A reorderable list of sub-items inside one block: social links, buttons,
 * projects, gallery images.
 *
 * The keyboard sensor is not optional. dnd-kit only becomes operable without a
 * mouse when it is wired up, and a builder whose reordering is mouse-only fails
 * the accessibility bar the product sets for itself.
 */
export function RepeatableList<T extends { id: string }>({
  items,
  onChange,
  onAdd,
  addLabel,
  renderItem,
  itemLabel,
  max = 50,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  onAdd: () => void;
  addLabel: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  itemLabel: (item: T, index: number) => string;
  max?: number;
}) {
  const sensors = useSensors(
    // A small distance threshold so a click on an input inside a row is not
    // swallowed as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;

    onChange(arrayMove(items, from, to));
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => (
              <SortableRow
                key={item.id}
                id={item.id}
                label={itemLabel(item, index)}
                onRemove={() => onChange(items.filter((other) => other.id !== item.id))}
              >
                {renderItem(item, (patch) =>
                  onChange(
                    items.map((other) =>
                      other.id === item.id ? { ...other, ...patch } : other,
                    ),
                  ),
                )}
              </SortableRow>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {items.length >= max ? (
        <p className="text-muted-foreground text-[11px]">
          That’s the maximum of {max}.
        </p>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus aria-hidden="true" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function SortableRow({
  id,
  label,
  onRemove,
  children,
}: {
  id: string;
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`bg-muted/40 rounded-lg border p-2 ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring cursor-grab rounded p-1 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
          aria-label={`Reorder ${label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" aria-hidden="true" />
        </button>
        <span className="min-w-0 flex-1 truncate text-xs font-medium">{label}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="text-muted-foreground hover:text-destructive focus-visible:ring-ring rounded p-1 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </li>
  );
}
