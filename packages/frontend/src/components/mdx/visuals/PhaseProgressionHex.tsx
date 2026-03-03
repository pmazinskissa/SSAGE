import React from 'react';
import ScrollReveal from '../ScrollReveal';

export default function PhaseProgressionHex() {
  const phases = [
    // Row 1: 22 hexes (0–21), F/E pattern: F3 E1 F2 E1 F2 E2 F1 E1 F1 E3 F1 E2 F1 E1
    { name: 'Diagnose Data',        description: 'Connect to data sources, surface patterns and anomalies', color: '#93C5FD', textColor: '#3B82F6', startCol: 0, endCol: 22, filled: new Set([0,1,2, 4,5, 7,8, 11, 13, 17, 20]) },
    // Row 2: 22 hexes (1–22), F/E pattern: F2 E2 F1 E2 F2 E2 F2 E2 F2 E1 F1 E2 (+1 empty)
    { name: 'Prioritize Opps',      description: 'Rank based on impact, feasibility, criticality',          color: '#6366F1', textColor: '#6366F1', startCol: 1, endCol: 23, filled: new Set([0,1, 4, 7,8, 11,12, 15,16, 18]) },
    // Row 3: 22 hexes (2–23), F/E pattern: F3 E1 F2 E2 F2 E1 F3 E1 F2 E1 F2 E1 (+1 empty)
    { name: 'Design & Prototype',   description: 'Create and test AI-powered solutions',                    color: '#4338CA', textColor: '#4338CA', startCol: 2,            filled: new Set([0,1,2, 4,5, 8,9, 11,12,13, 15,16, 18,19]) },
    // Row 4: 19 hexes (5–23), F/E pattern: F3 E1 F2 E2 F2 E1 F3 E1 F2 E1 F1
    { name: 'Implement Solutions',  description: 'Deploy through Agile delivery methods',                   color: '#22C55E', textColor: '#16A34A', startCol: 5,            filled: new Set([0,1,2, 4,5, 8,9, 11,12,13, 15,16, 18]) },
    // Row 5: 22 hexes (2–23), E/F pattern (opposite): E3 F3 E1 F3 E1 F2 E1 F8
    { name: 'Sustain Improvements', description: 'Monitor, govern, and continuously improve',               color: '#9CA3AF', textColor: '#6B7280', startCol: 2,            filled: new Set([3,4,5, 7,8,9, 11,12, 14,15,16,17,18,19,20,21]) },
    // Row 6: 24 hexes (0–23), F/E pattern: F3 E2 F19
    { name: 'Change Management',    description: 'Enable organizational readiness and adoption',            color: '#4B5563', textColor: '#4B5563', startCol: 0,            filled: new Set([0,1,2, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]) },
  ] as const;

  const TOTAL_COLS = 24;
  const r = 11;
  const sw = Math.sqrt(3);
  const hexW = r * sw;
  const rowH = r * 2 + 8;

  const hexPoints = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 + 30) * Math.PI / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');

  return (
    <ScrollReveal>
      <div className="my-8">
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1B4B', marginBottom: '0.25rem' }}>
          AI-Enabled Problem Solving — Phase Progression
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
          Effective AI-enabled problem solving requires progressively broader engagement — from targeted data diagnosis to organization-wide change management.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: 'fit-content', margin: '0 auto' }}>
            {phases.map((phase, row) => {
              const endCol = (phase as any).endCol ?? TOTAL_COLS;
              const numCols = endCol - phase.startCol;
              const leftPad = phase.startCol * hexW;
              const localW = numCols * hexW + hexW * 0.5;
              return (
                <React.Fragment key={row}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                    <div style={{ width: 165, flexShrink: 0, textAlign: 'right', paddingRight: '8px', lineHeight: 1.2 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: phase.textColor }}>{phase.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '1px' }}>{phase.description}</div>
                    </div>
                    <div style={{ paddingLeft: leftPad, flexShrink: 0 }}>
                      <svg viewBox={`0 0 ${localW} ${rowH}`} preserveAspectRatio="xMinYMid meet" style={{ width: localW, height: rowH, display: 'block' }}>
                        {Array.from({ length: numCols }, (_, col) => {
                          const cx = col * hexW + hexW / 2;
                          const cy = r + 1;
                          const isFilled = phase.filled.has(col);
                          return (
                            <polygon
                              key={col}
                              points={hexPoints(cx, cy)}
                              fill={isFilled ? phase.color : 'none'}
                              stroke={isFilled ? phase.color : '#D1D5DB'}
                              strokeWidth={isFilled ? 1.5 : 1}
                              opacity={isFilled ? 0.9 : 0.35}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
