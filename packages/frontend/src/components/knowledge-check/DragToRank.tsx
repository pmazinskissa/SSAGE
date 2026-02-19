import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { DragToRankQuestion } from '@playbook/shared';

interface SortableItemProps {
  id: string;
  text: string;
  disabled: boolean;
}

function SortableItem({ id, text, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 rounded-card border-2 bg-white transition-shadow select-none ${
        isDragging ? 'shadow-elevation-2 border-primary' : 'border-border'
      } ${disabled ? 'opacity-80 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      aria-label={`Reorder ${text}`}
    >
      <GripVertical size={18} className="flex-shrink-0 text-text-secondary/50" />
      <span className="text-sm text-text-primary">{text}</span>
    </div>
  );
}

interface Props {
  question: DragToRankQuestion;
  orderedIds: string[];
  onAnswer: (ids: string[]) => void;
  disabled: boolean;
}

export default function DragToRank({ question, orderedIds, onAnswer, disabled }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize with shuffled order if not already set
  const [initialized] = useState(() => {
    if (orderedIds.length === 0) {
      const shuffled = [...question.items]
        .sort(() => Math.random() - 0.5)
        .map((item) => item.id);
      onAnswer(shuffled);
    }
    return true;
  });

  const items = orderedIds.length > 0 ? orderedIds : question.items.map((i) => i.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    onAnswer(arrayMove(items, oldIndex, newIndex));
  };

  const itemMap = new Map(question.items.map((i) => [i.id, i.text]));

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary mb-2">Drag items to rank them in the correct order (top = first)</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id, index) => (
            <div key={id} className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-secondary/60 w-5 text-right">{index + 1}.</span>
              <div className="flex-1">
                <SortableItem id={id} text={itemMap.get(id) || id} disabled={disabled} />
              </div>
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
