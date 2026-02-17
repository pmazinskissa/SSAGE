import { type ReactNode, useMemo, Children, isValidElement, cloneElement } from 'react';
import { useGlossary } from '../../context/GlossaryContext';
import GlossaryTerm from './GlossaryTerm';

/**
 * Recursively walks React children and wraps glossary term matches
 * found in text nodes with <GlossaryTerm> components.
 * Only highlights the first occurrence of each term per block.
 */
export default function AutoGlossaryHighlight({ children }: { children: ReactNode }) {
  const { entries } = useGlossary();

  const termPattern = useMemo(() => {
    if (entries.length === 0) return null;
    // Sort by length descending so longer terms match first (e.g., "AI First" before "AI")
    const sorted = [...entries].sort((a, b) => b.term.length - a.term.length);
    const escaped = sorted.map((e) => escapeRegex(e.term));
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  }, [entries]);

  if (!termPattern || entries.length === 0) {
    return <>{children}</>;
  }

  const matched = new Set<string>();
  return <>{processChildren(children, termPattern, entries, matched)}</>;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processChildren(
  children: ReactNode,
  pattern: RegExp,
  entries: { term: string; definition: string }[],
  matched: Set<string>,
): ReactNode {
  return Children.map(children, (child) => {
    // Text node — scan for glossary terms
    if (typeof child === 'string') {
      return highlightTerms(child, pattern, entries, matched);
    }

    // React element — skip if it's already a GlossaryTerm, otherwise recurse into children
    if (isValidElement(child)) {
      // Don't recurse into GlossaryTerm (already highlighted), code blocks, or interactive elements
      const type = child.type;
      if (
        type === GlossaryTerm ||
        type === 'code' ||
        type === 'pre' ||
        type === 'a' ||
        type === 'button' ||
        type === 'input' ||
        type === 'select' ||
        type === 'textarea'
      ) {
        return child;
      }

      const props = child.props as { children?: ReactNode };
      if (props.children) {
        return cloneElement(child, {}, processChildren(props.children, pattern, entries, matched));
      }
    }

    return child;
  });
}

function highlightTerms(
  text: string,
  pattern: RegExp,
  entries: { term: string; definition: string }[],
  matched: Set<string>,
): ReactNode {
  // Reset lastIndex for global regex
  pattern.lastIndex = 0;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    const matchedText = match[0];
    const termLower = matchedText.toLowerCase();

    // Only highlight first occurrence of each term
    if (matched.has(termLower)) continue;

    // Find the matching entry for proper casing in the tooltip
    const entry = entries.find((e) => e.term.toLowerCase() === termLower);
    if (!entry) continue;

    matched.add(termLower);

    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add highlighted term
    parts.push(
      <GlossaryTerm key={`gt-${key++}`} term={entry.term}>
        {matchedText}
      </GlossaryTerm>
    );

    lastIndex = match.index + matchedText.length;
  }

  // If no matches found, return original text
  if (parts.length === 0) return text;

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
