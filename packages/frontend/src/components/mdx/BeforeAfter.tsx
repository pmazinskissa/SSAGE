import type { ReactNode } from 'react';
import ScrollReveal from './ScrollReveal';

interface BeforeAfterProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
}

function toBullets(content: ReactNode) {
  if (typeof content !== 'string') return <div className="text-sm text-text-secondary leading-relaxed">{content}</div>;
  const items = content.split('.').map(s => s.trim()).filter(Boolean);
  return (
    <ul className="text-sm text-text-secondary space-y-1.5 list-none p-0 m-0">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 items-start">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function BeforeAfter({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterProps) {
  return (
    <ScrollReveal>
      <div className="my-6 grid grid-cols-1 md:grid-cols-2 rounded-card border border-border overflow-hidden shadow-elevation-1">
        <div className="p-5 bg-error/5 border-b md:border-b-0 md:border-r border-border">
          <p className="text-xs font-bold uppercase tracking-wider text-error mb-3">
            {beforeLabel}
          </p>
          {toBullets(before)}
        </div>
        <div className="p-5 bg-success/5">
          <p className="text-xs font-bold uppercase tracking-wider text-success mb-3">
            {afterLabel}
          </p>
          {toBullets(after)}
        </div>
      </div>
    </ScrollReveal>
  );
}
