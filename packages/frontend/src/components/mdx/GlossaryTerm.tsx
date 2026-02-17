import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useGlossary } from '../../context/GlossaryContext';
import { scaleIn } from '../../lib/animations';

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
}

export default function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { slug } = useParams<{ slug: string }>();
  const { lookup } = useGlossary();

  const entry = lookup(term);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Check if popup would overflow right edge
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAlignRight(rect.left + 288 > window.innerWidth);
    }
  }, [open]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimeout.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <span
      ref={ref}
      className="relative inline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className="border-b border-dotted border-purple-500 text-purple-600 hover:text-purple-800 cursor-help transition-colors bg-purple-50 rounded-sm px-0.5"
      >
        {children || term}
      </span>
      <AnimatePresence>
        {open && entry && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute z-50 top-full mt-2 w-72 bg-white border border-border rounded-card shadow-elevation-2 p-4 ${alignRight ? 'right-0' : 'left-0'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className="font-semibold text-sm text-text-primary mb-1">{entry.term}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{entry.definition}</p>
            <Link
              to={`/courses/${slug}/glossary`}
              className="flex items-center gap-1 text-xs text-link mt-3 hover:underline"
            >
              View in Glossary <ExternalLink size={12} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
