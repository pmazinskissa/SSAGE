import { createContext, useContext, useRef, type ReactNode } from 'react';

/**
 * Provides a single shared Set of already-highlighted glossary terms
 * across all AutoGlossaryHighlight instances on a lesson page.
 * This ensures each term is only linked on its first occurrence
 * across all paragraphs, list items, and table cells — not per block.
 */
const GlossarySeenContext = createContext<React.MutableRefObject<Set<string>> | null>(null);

export function GlossarySeenProvider({ children }: { children: ReactNode }) {
  const seenRef = useRef(new Set<string>());
  return (
    <GlossarySeenContext.Provider value={seenRef}>
      {children}
    </GlossarySeenContext.Provider>
  );
}

export function useGlossarySeen() {
  return useContext(GlossarySeenContext);
}
