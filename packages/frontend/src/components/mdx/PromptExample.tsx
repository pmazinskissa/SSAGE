import { User, Bot } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface PromptExampleProps {
  prompt: string;
  response: string;
  model?: string;
}

export default function PromptExample({ prompt, response, model = 'AI' }: PromptExampleProps) {
  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border bg-surface overflow-hidden shadow-elevation-1">
        <div className="border-b border-border bg-primary/5 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Example: Prompt & Response
          </span>
        </div>

        {/* User prompt */}
        <div className="flex gap-3 p-4 bg-white border-l-4 border-l-primary border-b border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary mb-1">You</p>
            <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
              {prompt.replace(/\\n/g, '\n')}
            </p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-3 p-4 bg-gray-50 border-l-4 border-l-success">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-success" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-secondary mb-1">{model}</p>
            <p className="text-sm font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
              {response.replace(/\\n/g, '\n')}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
