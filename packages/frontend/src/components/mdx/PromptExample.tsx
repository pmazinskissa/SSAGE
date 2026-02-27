import Markdown from 'react-markdown';
import ScrollReveal from './ScrollReveal';

interface PromptExampleProps {
  prompt: string;
  response: string;
  model?: string;
}

export default function PromptExample({ prompt, response, model = 'AI' }: PromptExampleProps) {
  return (
    <ScrollReveal>
      <div className="my-6">
        <div style={{ background: '#F3F4F6', borderRadius: 12, padding: '1rem', maxWidth: 560, margin: '0 auto' }}>
          {/* User prompt — right-aligned bubble */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <div style={{ background: '#4F46E5', color: 'white', borderRadius: '12px 12px 2px 12px', padding: '0.75rem 1rem', maxWidth: '80%', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {prompt.replace(/\\n/g, '\n')}
            </div>
          </div>
          {/* AI response — left-aligned bubble */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px 12px 12px 2px', padding: '0.75rem 1rem', maxWidth: '90%', fontSize: '0.83rem', lineHeight: 1.7, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="prose prose-sm max-w-none text-text-primary prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-text-primary">
                <Markdown>{response.replace(/\\n/g, '\n')}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
