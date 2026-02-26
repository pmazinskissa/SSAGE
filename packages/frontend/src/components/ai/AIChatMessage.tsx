import React, { useCallback } from 'react';
import Markdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { User, Bot } from 'lucide-react';

interface AIChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export default function AIChatMessage({ role, content, streaming }: AIChatMessageProps) {
  const navigate = useNavigate();

  const handleLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      // Use client-side navigation for internal course links
      if (href.startsWith('/courses/')) {
        e.preventDefault();
        navigate(href);
      }
    },
    [navigate],
  );
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary/10' : 'bg-success/10'
        }`}
      >
        {isUser ? (
          <User size={14} className="text-primary" />
        ) : (
          <Bot size={14} className="text-success" />
        )}
      </div>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white border border-border text-text-primary rounded-bl-sm'
        }`}
      >
        {content ? (
          isUser ? (
            <span>{content}</span>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-pre:bg-surface prose-pre:text-text-primary prose-code:text-xs prose-code:bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-primary prose-a:underline prose-a:decoration-primary/30 hover:prose-a:decoration-primary">
              <Markdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href || '#'}
                      onClick={(e) => handleLinkClick(e, href || '')}
                      className="text-primary underline decoration-primary/30 hover:decoration-primary transition-colors"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </Markdown>
            </div>
          )
        ) : streaming ? (
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-text-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
