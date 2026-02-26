import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { X } from 'lucide-react';
import type { FillInBlankQuestion } from '@playbook/shared';

function DraggableChip({
  word,
  disabled,
  isSelected,
  onClick,
}: {
  word: string;
  disabled: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bank:${word}`,
    disabled,
  });

  const style: React.CSSProperties = {
    touchAction: 'none',
    ...(transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          zIndex: 999,
          position: 'relative' as const,
        }
      : {}),
  };

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      type="button"
      onClick={onClick}
      style={style}
      className={`px-3 py-1.5 text-sm rounded-full border-2 select-none ${
        isDragging
          ? 'border-primary bg-primary text-white shadow-lg cursor-grabbing'
          : isSelected
          ? 'border-primary bg-primary text-white shadow-md'
          : 'border-border bg-white text-text-primary hover:border-primary/50'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {word}
    </button>
  );
}

function DroppableBlank({
  index,
  word,
  hasSelection,
  disabled,
  onSlotClick,
}: {
  index: number;
  word: string | undefined;
  hasSelection: boolean;
  disabled: boolean;
  onSlotClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${index}` });

  if (word) {
    return (
      <span
        ref={setNodeRef}
        className={`inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-full text-sm font-medium
          bg-primary/10 border-2 border-primary text-primary transition-all
          ${isOver ? 'ring-2 ring-primary ring-offset-1' : ''}
          ${!disabled ? 'cursor-pointer hover:bg-primary/20' : ''}`}
        onClick={!disabled ? onSlotClick : undefined}
      >
        {word}
        {!disabled && (
          <X
            size={12}
            className="opacity-60 hover:opacity-100 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); onSlotClick(); }}
          />
        )}
      </span>
    );
  }

  return (
    <span
      ref={setNodeRef}
      onClick={!disabled && hasSelection ? onSlotClick : undefined}
      className={`inline-flex items-center justify-center mx-1 px-4 py-0.5 rounded-full text-sm
        border-2 border-dashed min-w-[80px] transition-colors
        ${
          isOver
            ? 'border-primary bg-primary/10 text-primary'
            : hasSelection
            ? 'border-primary/60 bg-primary/5 text-primary/70 cursor-pointer'
            : 'border-border text-text-secondary/40'
        }`}
    >
      {isOver ? 'drop here' : hasSelection ? 'place here' : '_____'}
    </span>
  );
}

interface Props {
  question: FillInBlankQuestion;
  answers: Record<number, string>;
  onAnswer: (answers: Record<number, string>) => void;
  disabled: boolean;
}

export default function FillInBlank({ question, answers, onAnswer, disabled }: Props) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const placed = answers;
  const placedWords = new Set(Object.values(placed));
  const wordBank = question.word_bank || [];
  const availableWords = wordBank.filter((w) => !placedWords.has(w));

  const placeWord = (blankIndex: number, word: string) => {
    const newPlaced = { ...placed };
    // Remove word from any other slot it was already in
    const prevSlot = Object.entries(newPlaced).find(([, w]) => w === word)?.[0];
    if (prevSlot !== undefined) delete newPlaced[Number(prevSlot)];
    // Replace whatever was in the target slot
    newPlaced[blankIndex] = word;
    onAnswer(newPlaced);
  };

  const removeWord = (blankIndex: number) => {
    const newPlaced = { ...placed };
    delete newPlaced[blankIndex];
    onAnswer(newPlaced);
  };

  const handleChipClick = (word: string) => {
    if (disabled) return;
    setSelectedWord((prev) => (prev === word ? null : word));
  };

  const handleSlotClick = (blankIndex: number) => {
    if (disabled) return;
    if (selectedWord) {
      placeWord(blankIndex, selectedWord);
      setSelectedWord(null);
    } else {
      removeWord(blankIndex);
    }
  };

  const handleDragStart = (_event: DragStartEvent) => {
    setSelectedWord(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const word = activeId.startsWith('bank:') ? activeId.slice(5) : activeId;
    const target = over.id as string;

    if (target.startsWith('slot:')) {
      const slotIdx = parseInt(target.slice(5), 10);
      placeWord(slotIdx, word);
    }
  };

  let blankIndex = 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Word Bank */}
        {wordBank.length > 0 && (
          <div className="p-3 rounded-card bg-surface/50 border border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary/70 mb-2">
              Word Bank
            </p>
            <div className="flex flex-wrap gap-2">
              {availableWords.map((word) => (
                <DraggableChip
                  key={word}
                  word={word}
                  disabled={disabled}
                  isSelected={selectedWord === word}
                  onClick={() => handleChipClick(word)}
                />
              ))}
              {availableWords.length === 0 && (
                <span className="text-xs text-text-secondary/50 italic">All words placed</span>
              )}
            </div>
          </div>
        )}

        {/* Sentence with droppable blank slots */}
        <div className="text-sm text-text-primary leading-loose">
          {question.segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={i}>{seg.value}</span>;
            }
            const idx = blankIndex++;
            return (
              <DroppableBlank
                key={i}
                index={idx}
                word={placed[idx]}
                hasSelection={!!selectedWord}
                disabled={disabled}
                onSlotClick={() => handleSlotClick(idx)}
              />
            );
          })}
        </div>

        {wordBank.length > 0 && (
          <p className="text-xs text-text-secondary/60">
            Drag words into the blanks, or click a word then click a blank to place it.
          </p>
        )}
      </div>
    </DndContext>
  );
}
