import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGlossary } from '../context/GlossaryContext';
import SearchInput from '../components/ui/SearchInput';
import { fadeInUp, stagger } from '../lib/animations';

export default function GlossaryFullPage() {
  const { entries, loading } = useGlossary();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return entries;
    const lower = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(lower) ||
        e.definition.toLowerCase().includes(lower)
    );
  }, [entries, search]);

  // Group by first letter
  const grouped = useMemo(() => {
    const groups: Record<string, typeof entries> = {};
    filtered.forEach((entry) => {
      const letter = entry.term[0]?.toUpperCase() || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(entry);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (loading) {
    return (
      <div className="max-w-prose mx-auto px-6 sm:px-12 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/3" />
          <div className="h-10 bg-surface rounded w-full" />
          <div className="h-20 bg-surface rounded w-full" />
          <div className="h-20 bg-surface rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-prose mx-auto px-6 sm:px-12 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1
          className="text-2xl sm:text-3xl font-bold text-text-primary mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Glossary
        </h1>
        <p className="text-text-secondary mb-6">
          {entries.length} terms — browse or search for definitions.
        </p>
      </motion.div>

      <div className="mb-8">
        <SearchInput
          placeholder="Search glossary terms..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-secondary text-center py-12">
          No terms match "{search}"
        </p>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {grouped.map(([letter, terms]) => (
            <div key={letter} className="mb-8">
              <motion.h2
                variants={fadeInUp}
                className="text-lg font-bold text-primary mb-3 border-b border-border pb-1"
              >
                {letter}
              </motion.h2>
              <div className="space-y-4">
                {terms.map((entry) => (
                  <motion.div
                    key={entry.term}
                    variants={fadeInUp}
                    className="pb-4 border-b border-border last:border-b-0"
                  >
                    <h3 className="font-semibold text-text-primary">{entry.term}</h3>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                      {entry.definition}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
