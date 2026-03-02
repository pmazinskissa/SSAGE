import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface DataRevealProps {
  value: number;
  previousValue?: number;
  unit?: string;
  label: string;
  direction?: 'up' | 'down';
}

export default function DataReveal({
  value,
  previousValue,
  unit = '',
  label,
  direction,
}: DataRevealProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [isInView, value]);

  const change = previousValue != null ? value - previousValue : null;
  const percentChange =
    change != null && previousValue ? Math.round((change / previousValue) * 100) : null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="bg-white rounded-card border border-border/40 p-6 shadow-elevation-1 my-6 text-center"
    >
      <p className="text-4xl font-bold text-primary">
        {displayValue.toLocaleString()}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
      <p className="text-sm text-text-secondary mt-2">{label}</p>
      {percentChange != null && (
        <p
          className={`text-xs font-semibold mt-1 ${
            (direction || (change! > 0 ? 'up' : 'down')) === 'up'
              ? 'text-success'
              : 'text-error'
          }`}
        >
          {change! > 0 ? '+' : ''}
          {percentChange}% from {previousValue?.toLocaleString()}
        </p>
      )}
    </motion.div>
  );
}
