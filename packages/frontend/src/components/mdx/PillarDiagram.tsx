import { motion } from 'framer-motion';
import { stagger, fadeInUp } from '../../lib/animations';
import ScrollReveal from './ScrollReveal';

interface Pillar {
  title: string;
  subtitle?: string;
  items?: string[];
  icon?: string;
}

interface PillarDiagramProps {
  pillars: Pillar[];
  base?: string;
  title?: string;
}

const ACCENTS = [
  { grad: ['#4F46E5', '#4338CA'], light: '#EEF2FF', border: '#C7D2FE', bullet: '#4F46E5', tag: 'bg-indigo-50 text-indigo-700' },
  { grad: ['#7C3AED', '#6D28D9'], light: '#F5F3FF', border: '#DDD6FE', bullet: '#7C3AED', tag: 'bg-violet-50 text-violet-700' },
  { grad: ['#2563EB', '#1D4ED8'], light: '#EFF6FF', border: '#BFDBFE', bullet: '#2563EB', tag: 'bg-blue-50 text-blue-700' },
  { grad: ['#0891B2', '#0E7490'], light: '#ECFEFF', border: '#A5F3FC', bullet: '#0891B2', tag: 'bg-cyan-50 text-cyan-700' },
];

export default function PillarDiagram({ pillars, base, title }: PillarDiagramProps) {
  const n = pillars.length;

  // SVG connecting visual dimensions
  const svgW = 600;
  const pillarSpacing = svgW / n;

  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden">
        {title && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center">
            <p className="text-sm font-bold text-white">{title}</p>
          </div>
        )}

        <div className="p-5">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {/* Pillar columns */}
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(n, 4)}, 1fr)` }}>
              {pillars.map((pillar, i) => {
                const a = ACCENTS[i % ACCENTS.length];
                return (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="rounded-xl overflow-hidden flex flex-col border shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderColor: a.border, background: a.light }}
                  >
                    {/* Header with gradient */}
                    <div className="text-white px-4 py-3.5 text-center relative"
                      style={{ background: `linear-gradient(135deg, ${a.grad[0]}, ${a.grad[1]})` }}>
                      {pillar.icon && <span className="text-xl block mb-1">{pillar.icon}</span>}
                      <p className="text-sm font-bold leading-tight">{pillar.title}</p>
                      {pillar.subtitle && (
                        <p className="text-[10px] font-medium opacity-80 mt-0.5">{pillar.subtitle}</p>
                      )}
                      {/* Bottom notch */}
                      <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                        style={{ background: a.grad[1] }} />
                    </div>

                    {/* Items */}
                    {pillar.items && pillar.items.length > 0 && (
                      <ul className="p-4 pt-5 space-y-2.5 flex-1">
                        {pillar.items.map((item, j) => (
                          <li key={j} className="text-xs text-text-secondary flex items-start gap-2.5 leading-relaxed">
                            <span className="mt-1 w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                              style={{ background: a.bullet }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Connecting SVG arrows */}
            {base && (
              <div className="mt-1">
                <svg viewBox={`0 0 ${svgW} 28`} className="w-full" style={{ display: 'block' }}>
                  {pillars.map((_, i) => {
                    const cx = pillarSpacing * i + pillarSpacing / 2;
                    return (
                      <g key={i}>
                        <line x1={cx} y1={0} x2={cx} y2={18}
                          stroke={ACCENTS[i % ACCENTS.length].bullet} strokeWidth="2" opacity="0.4" />
                        <polygon
                          points={`${cx - 5},14 ${cx + 5},14 ${cx},22`}
                          fill={ACCENTS[i % ACCENTS.length].bullet} opacity="0.4" />
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Foundation base */}
            {base && (
              <motion.div variants={fadeInUp}
                className="text-white text-center py-3.5 px-4 rounded-xl shadow-sm relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #2563EB)' }}>
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
                <p className="text-sm font-bold tracking-wide relative">{base}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </ScrollReveal>
  );
}
