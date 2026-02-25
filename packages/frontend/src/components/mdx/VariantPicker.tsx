import { useState, Children, type ReactNode } from 'react';
import ScrollReveal from './ScrollReveal';

interface VariantPickerProps {
  children: ReactNode;
  labels?: string[];
}

const OPTION_LABELS = ['Option A', 'Option B', 'Option C', 'Option D'];

export default function VariantPicker({ children, labels }: VariantPickerProps) {
  const childArray = Children.toArray(children);
  const [active, setActive] = useState(0);

  const tabLabels = labels ?? OPTION_LABELS.slice(0, childArray.length);

  return (
    <ScrollReveal>
      <div className="my-8 rounded-card border-2 border-dashed border-amber-400 bg-amber-50/30 shadow-elevation-1 overflow-hidden">
        {/* Review banner */}
        <div className="bg-amber-100/80 border-b border-amber-300 px-4 py-2.5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">?</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Review — Pick your preferred variant
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex bg-amber-50/60 border-b border-amber-200">
          {tabLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`px-5 py-3 text-sm font-semibold transition-all relative ${
                active === i
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-amber-100/40'
              }`}
            >
              {label}
              {active === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Active variant */}
        <div className="p-5 bg-white/80">
          {childArray[active]}
        </div>
      </div>
    </ScrollReveal>
  );
}
