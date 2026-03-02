import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, FileText, BookOpen, Book } from 'lucide-react';
import { api } from '../lib/api';
import SearchInput from '../components/ui/SearchInput';
import Card from '../components/ui/Card';
import type { SearchResult } from '@playbook/shared';

export default function SearchPage() {
  const { slug } = useParams<{ slug: string }>();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!slug || q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.searchContent(slug, q);
      setResults(data);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const lessons = results.filter((r) => r.type === 'lesson');
  const modules = results.filter((r) => r.type === 'module');
  const glossary = results.filter((r) => r.type === 'glossary');

  const highlightMatch = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-text-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const ResultSection = ({
    title,
    icon: Icon,
    items,
  }: {
    title: string;
    icon: typeof FileText;
    items: SearchResult[];
  }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-medium">
            {items.length}
          </span>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <Card key={`${item.type}-${item.module_slug}-${item.lesson_slug}-${i}`} className="p-3 hover:shadow-elevation-2 transition-shadow">
              <Link
                to={
                  item.type === 'glossary'
                    ? `/courses/${slug}/glossary`
                    : item.type === 'module'
                      ? `/courses/${slug}`
                      : `/courses/${slug}/modules/${item.module_slug}/lessons/${item.lesson_slug}`
                }
                className="block"
              >
                <p className="text-sm font-medium text-text-primary">{highlightMatch(item.title)}</p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {highlightMatch(item.match_context)}
                </p>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-12 py-8">
      <h1
        className="text-2xl font-bold text-text-primary mb-6"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        Search
      </h1>

      <div className="mb-6">
        <SearchInput
          placeholder="Search lessons, modules, glossary..."
          onChange={handleSearch}
          debounceMs={300}
        />
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-text-secondary mt-2">Searching...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-text-secondary/40 mb-4" />
          <p className="text-lg font-semibold text-text-primary">No results found</p>
          <p className="text-text-secondary mt-2">
            Try different keywords or check spelling.
          </p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-text-secondary/40 mb-4" />
          <p className="text-text-secondary">Type at least 2 characters to search</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <ResultSection title="Lessons" icon={FileText} items={lessons} />
          <ResultSection title="Modules" icon={BookOpen} items={modules} />
          <ResultSection title="Glossary" icon={Book} items={glossary} />
        </div>
      )}
    </div>
  );
}
