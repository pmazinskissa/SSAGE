import type { ComponentType } from 'react';
import ScrollReveal from './ScrollReveal';
import Callout from './Callout';
import PromptExample from './PromptExample';
import CodeExample from './CodeExample';
import BeforeAfter from './BeforeAfter';
import DataReveal from './DataReveal';
import ProcessFlow from './ProcessFlow';
import GlossaryTerm from './GlossaryTerm';
import AutoGlossaryHighlight from './AutoGlossaryHighlight';
import ReflectionPrompt from './ReflectionPrompt';
import DecisionPoint from './DecisionPoint';
import VideoEmbed from './VideoEmbed';
import DownloadResource from './DownloadResource';
import AIExercise from './AIExercise';
import PromptScorer from './PromptScorer';

// HTML element overrides for MDX content
function createHeading(level: 1 | 2 | 3) {
  const Tag = `h${level}` as const;
  return function MdxHeading(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <ScrollReveal>
        <Tag {...props} style={{ fontFamily: 'var(--font-heading)' }} />
      </ScrollReveal>
    );
  };
}

function MdxParagraph(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const { children, ...rest } = props;
  return (
    <p {...rest}>
      <AutoGlossaryHighlight>{children}</AutoGlossaryHighlight>
    </p>
  );
}

function MdxListItem(props: React.LiHTMLAttributes<HTMLLIElement>) {
  const { children, ...rest } = props;
  return (
    <li {...rest}>
      <AutoGlossaryHighlight>{children}</AutoGlossaryHighlight>
    </li>
  );
}

function MdxBlockquote(props: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className="border-l-4 border-l-primary/30 bg-primary/5 px-4 py-3 my-4 rounded-r-card"
      {...props}
    />
  );
}

function MdxTable(props: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border overflow-hidden overflow-x-auto shadow-elevation-1">
        <table className="w-full text-sm" {...props} />
      </div>
    </ScrollReveal>
  );
}

function MdxThead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-primary text-white" {...props} />;
}

function MdxTh(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className="px-4 py-3 text-left font-semibold text-xs text-white" {...props} />;
}

function MdxTd(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  const { children, ...rest } = props;
  return (
    <td className="px-4 py-3 border-t border-border text-text-secondary" {...rest}>
      <AutoGlossaryHighlight>{children}</AutoGlossaryHighlight>
    </td>
  );
}

export const mdxComponents: Record<string, ComponentType<any>> = {
  // Custom components
  ScrollReveal,
  Callout,
  PromptExample,
  CodeExample,
  BeforeAfter,
  DataReveal,
  ProcessFlow,
  GlossaryTerm,
  ReflectionPrompt,
  DecisionPoint,
  VideoEmbed,
  DownloadResource,
  AIExercise,
  PromptScorer,

  // HTML overrides
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  p: MdxParagraph,
  li: MdxListItem,
  blockquote: MdxBlockquote,
  table: MdxTable,
  thead: MdxThead,
  th: MdxTh,
  td: MdxTd,
};

// Named exports for direct imports
export {
  ScrollReveal,
  Callout,
  PromptExample,
  CodeExample,
  BeforeAfter,
  DataReveal,
  ProcessFlow,
  GlossaryTerm,
  AutoGlossaryHighlight,
  ReflectionPrompt,
  DecisionPoint,
  VideoEmbed,
  DownloadResource,
  AIExercise,
  PromptScorer,
};
