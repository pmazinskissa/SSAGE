import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import type { GlossaryEntry } from '@playbook/shared';
import { api } from '../lib/api';

interface GlossaryContextValue {
  entries: GlossaryEntry[];
  loading: boolean;
  lookup: (term: string) => GlossaryEntry | undefined;
}

const GlossaryContext = createContext<GlossaryContextValue>({
  entries: [],
  loading: true,
  lookup: () => undefined,
});

export function GlossaryProvider({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getGlossary(slug)
      .then(setEntries)
      .catch((err) => console.error('Failed to load glossary:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const lookup = useCallback(
    (term: string) =>
      entries.find((e) => e.term.toLowerCase() === term.toLowerCase()),
    [entries]
  );

  const value = useMemo(() => ({ entries, loading, lookup }), [entries, loading, lookup]);

  return (
    <GlossaryContext.Provider value={value}>
      {children}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  return useContext(GlossaryContext);
}
