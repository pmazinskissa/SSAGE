import { useState } from 'react';
import { motion } from 'framer-motion';
import { stagger, fadeInUp } from '../../lib/animations';
import ScrollReveal from './ScrollReveal';

interface CycleStep {
  title: string;
  description?: string;
  icon?: string;
}

interface CycleFlowProps {
  steps: CycleStep[];
  title?: string;
  centerLabel?: string;
}

const PALETTE = [
  { fill: '#4F46E5', light: '#EEF2FF', dark: '#3730A3' },
  { fill: '#7C3AED', light: '#F5F3FF', dark: '#5B21B6' },
  { fill: '#2563EB', light: '#EFF6FF', dark: '#1E40AF' },
  { fill: '#059669', light: '#ECFDF5', dark: '#065F46' },
  { fill: '#D97706', light: '#FFFBEB', dark: '#92400E' },
  { fill: '#DC2626', light: '#FEF2F2', dark: '#991B1B' },
  { fill: '#0891B2', light: '#ECFEFF', dark: '#155E75' },
  { fill: '#EA580C', light: '#FFF7ED', dark: '#9A3412' },
];

export default function CycleFlow({ steps, title, centerLabel }: CycleFlowProps) {
  const n = steps.length;
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 560, H = 560;
  const CX = W / 2, CY = H / 2;
  const R = n <= 4 ? 175 : 185;
  const NW = n <= 4 ? 142 : 128;
  const NH = n <= 4 ? 56 : 50;
  const CR = 46;

  const positions = steps.map((_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a), a };
  });

  return (
    <ScrollReveal>
      <div className="my-6 rounded-card border border-border bg-white shadow-elevation-1 overflow-hidden">
        {title && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-center">
            <p className="text-sm font-bold text-white">{title}</p>
          </div>
        )}

        {/* Desktop: SVG diagram */}
        <div className="hidden md:block p-5">
          <div className="mx-auto" style={{ maxWidth: 500 }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: 'block' }}>
              <defs>
                <filter id="cf-sh" x="-12%" y="-12%" width="124%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
                </filter>
                <filter id="cf-gl" x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="10" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="cf-cg">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#4338CA" />
                </radialGradient>
                <marker id="cf-ah" viewBox="0 0 12 10" refX="10" refY="5"
                  markerWidth="9" markerHeight="7" orient="auto">
                  <path d="M0,1L10,5L0,9Z" fill="#818CF8" />
                </marker>
                {PALETTE.map((c, i) => (
                  <linearGradient key={i} id={`cf-ng${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor={c.light} />
                  </linearGradient>
                ))}
              </defs>

              {/* Wide soft track ring */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth="32" />

              {/* Arrow arcs */}
              {positions.map((p, i) => {
                const q = positions[(i + 1) % n];
                const gap = n <= 4 ? 0.38 : 0.28;
                const a1 = p.a + gap, a2 = q.a - gap;
                const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
                const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
                const sw = ((a2 - a1 + 2 * Math.PI) % (2 * Math.PI)) > Math.PI ? 1 : 0;
                return (
                  <path key={i} d={`M${x1},${y1} A${R},${R} 0 ${sw} 1 ${x2},${y2}`}
                    fill="none" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round"
                    markerEnd="url(#cf-ah)" opacity="0.55" />
                );
              })}

              {/* Center node */}
              {centerLabel && (
                <g filter="url(#cf-gl)">
                  <circle cx={CX} cy={CY} r={CR} fill="url(#cf-cg)" />
                  <foreignObject x={CX - CR + 6} y={CY - 14} width={(CR - 6) * 2} height={28}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <span style={{ color: '#fff', fontSize: 10, fontWeight: 700,
                        textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                        textAlign: 'center' as const, lineHeight: '1.2' }}>
                        {centerLabel}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              )}

              {/* Step nodes */}
              {positions.map((pos, i) => {
                const step = steps[i];
                const c = PALETTE[i % PALETTE.length];
                const x = pos.x - NW / 2, y = pos.y - NH / 2;
                const active = hovered === i;
                const tooltipAbove = pos.y > CY;

                return (
                  <g key={i} filter="url(#cf-sh)" style={{ cursor: 'default' }}
                    onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                    <rect x={x} y={y} width={NW} height={NH} rx={12}
                      fill={`url(#cf-ng${i % PALETTE.length})`}
                      stroke={c.fill} strokeWidth={active ? 2.5 : 1.5} />
                    {/* Number badge */}
                    <circle cx={x + 18} cy={pos.y} r={12} fill={c.fill} />
                    <text x={x + 18} y={pos.y + 4} textAnchor="middle"
                      fill="#fff" fontSize={11} fontWeight="700"
                      style={{ fontFamily: 'system-ui, sans-serif' }}>
                      {i + 1}
                    </text>
                    {/* Title */}
                    <foreignObject x={x + 34} y={pos.y - 9} width={NW - 42} height={20}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: c.dark, lineHeight: '1.3',
                        whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {step.title}
                      </div>
                    </foreignObject>
                    {/* Hover tooltip */}
                    {active && step.description && (
                      <foreignObject
                        x={pos.x - 105}
                        y={tooltipAbove ? pos.y - NH / 2 - 58 : pos.y + NH / 2 + 8}
                        width={210} height={50}>
                        <div style={{ background: '#1E1B4B', color: '#fff', padding: '6px 10px',
                          borderRadius: 8, fontSize: 10, lineHeight: '1.4',
                          textAlign: 'center' as const, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
                          {step.description}
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Description legend */}
          {steps.some(s => s.description) && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                {steps.map((step, i) => {
                  const c = PALETTE[i % PALETTE.length];
                  return step.description ? (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold mt-0.5"
                        style={{ background: c.fill }}>{i + 1}</span>
                      <p className="text-[11px] text-text-secondary leading-snug">
                        <strong style={{ color: c.dark }}>{step.title}:</strong> {step.description}
                      </p>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mobile: vertical list */}
        <motion.div className="md:hidden p-4 space-y-1" variants={stagger} initial="hidden"
          whileInView="visible" viewport={{ once: true }}>
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface/50">
                <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm"
                  style={{ background: PALETTE[i % PALETTE.length].fill }}>
                  {step.icon ?? i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed line-clamp-2">{step.description}</p>
                  )}
                </div>
              </div>
              {i < n - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-0.5 h-4 bg-primary/30 rounded-full" />
                </div>
              )}
            </motion.div>
          ))}
          <div className="flex justify-center pt-1">
            <span className="text-[10px] text-primary font-semibold bg-primary/5 rounded-full px-3 py-1">
              ↻ Cycle repeats
            </span>
          </div>
        </motion.div>
      </div>
    </ScrollReveal>
  );
}
