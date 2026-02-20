import { useMemo } from 'react';
import type { MatchingQuestion as MatchingQuestionType } from '@playbook/shared';

interface Props {
  question: MatchingQuestionType;
  selectedMatches: Record<string, string>;
  onAnswer: (matches: Record<string, string>) => void;
  disabled: boolean;
}

// Deterministic shuffle based on question id so order is stable across re-renders
// but different from the correct answer order
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const copy = [...arr];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = ((hash >>> 0) % (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MatchingQuestion({ question, selectedMatches, onAnswer, disabled }: Props) {
  const rightOptions = useMemo(
    () => seededShuffle(
      question.pairs.map((p) => ({ id: p.id, text: p.right })),
      question.pairs.map((p) => p.id).join('-'),
    ),
    [question.pairs],
  );

  const handleChange = (pairId: string, value: string) => {
    onAnswer({ ...selectedMatches, [pairId]: value });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-secondary mb-2">Match each item on the left with the correct item on the right</p>
      {question.pairs.map((pair) => (
        <div key={pair.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="sm:flex-1 min-w-0 text-sm text-text-primary font-medium p-3 bg-surface rounded-card border border-border">
            {pair.left}
          </span>
          <span className="hidden sm:block text-text-secondary flex-shrink-0">&rarr;</span>
          <select
            value={selectedMatches[pair.id] || ''}
            onChange={(e) => handleChange(pair.id, e.target.value)}
            disabled={disabled}
            className={`sm:flex-1 min-w-0 p-3 text-sm rounded-card border-2 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              selectedMatches[pair.id] ? 'border-primary' : 'border-border'
            } ${disabled ? 'pointer-events-none opacity-80' : ''}`}
          >
            <option value="">Select...</option>
            {rightOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
