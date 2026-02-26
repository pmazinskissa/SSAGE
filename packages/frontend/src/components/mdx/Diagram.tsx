import { useEffect, useRef, useState } from 'react';
import ScrollReveal from './ScrollReveal';

interface DiagramProps {
  code: string;
  title?: string;
}

function resolveVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export default function Diagram({ code, title }: DiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: resolveVar('--color-primary-light', '#EEF2FF'),
            primaryBorderColor: resolveVar('--color-primary', '#4F46E5'),
            primaryTextColor: resolveVar('--color-text-primary', '#1A1A2E'),
            lineColor: resolveVar('--color-border', '#E5E7EB'),
            secondaryColor: resolveVar('--color-surface', '#F8F9FA'),
            tertiaryColor: resolveVar('--color-background', '#FFFFFF'),
            fontFamily: 'inherit',
            fontSize: '14px',
          },
        });
        const { svg: renderedSvg } = await mermaid.render(idRef.current, code);
        if (!cancelled) setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border bg-white p-4 shadow-elevation-1">
        {title && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            {title}
          </p>
        )}
        <div
          ref={containerRef}
          className="flex justify-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </ScrollReveal>
  );
}
