import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useGlossary } from '../../context/GlossaryContext';
import { scaleIn } from '../../lib/animations';

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
}

const POPUP_WIDTH = 288;

export default function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
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

  const updatePosition = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let left = rect.left;
    // If popup would overflow right edge, align to right side of trigger
    if (left + POPUP_WIDTH > window.innerWidth - 16) {
      left = rect.right - POPUP_WIDTH;
    }
    // Clamp so it doesn't go off left edge
    if (left < 16) left = 16;
    setPosition({
      top: rect.bottom + 8,
      left,
    });
  }, []);

  useEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

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
      className="inline"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className="border-b border-dotted border-purple-500 text-purple-600 hover:text-purple-800 cursor-help transition-colors bg-purple-50 rounded-sm px-0.5"
      >
        {children || term}
      </span>
      {createPortal(
        <AnimatePresence>
          {open && entry && position && (
            <motion.div
              ref={popupRef}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ top: position.top, left: position.left, width: POPUP_WIDTH }}
              className="fixed z-[9999] bg-white border border-border rounded-card shadow-elevation-2 p-4"
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
        </AnimatePresence>,
        document.body,
      )}
    </span>
  );
}
