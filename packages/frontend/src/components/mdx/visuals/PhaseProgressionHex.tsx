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
    { name: 'Implement Solutions',  description: 'Deploy through Agile delivery methods',                   color: '#22C55E', textColor: '#16A34A', startCol: 3,            filled: new Set([0,1,2, 4,5, 8,9, 11,12,13, 15,16, 18]) },
    // Row 5: 18 hexes (6–23), starts after Implement Solutions
    { name: 'Sustain Improvements', description: 'Monitor, govern, and continuously improve',               color: '#9CA3AF', textColor: '#6B7280', startCol: 6,            filled: new Set([1,2,3, 5,6,7, 9,10, 12,13,14,15,16,17]) },
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
          Unlike traditional problem-solving approaches, AI-Enabled Problem Solving allows teams to engage in interactive problem solving where prioritized opportunities guide targeted data diagnosis, which in turn leads to prototype solutions that can be implemented for immediate improvements. Learnings from the prototype are cycled back into the process to reveal enhancements and added features which will produce additional improvements. The key concept is to repeatedly layer small improvements in rapid succession to create an environment of continuous improvement. As improvements are implemented, Teams must be conscious of associated Change Management and Sustainment activities which are crucial to long-term success.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {phases.map((phase, row) => {
              const endCol = (phase as any).endCol ?? TOTAL_COLS;
              const numCols = endCol - phase.startCol;
              const leftPad = phase.startCol * hexW;
              const localW = numCols * hexW + hexW * 0.5;
              return (
                <React.Fragment key={row}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Left spacer creates the staircase effect */}
                    <div style={{ width: leftPad, flexShrink: 0 }} />
                    {/* Hex row */}
                    <svg viewBox={`0 0 ${localW} ${rowH}`} preserveAspectRatio="xMinYMid meet" style={{ width: localW, height: rowH, display: 'block', flexShrink: 0 }}>
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
                    {/* Connecting line */}
                    <div style={{ flex: 1, height: 1, background: '#D1D5DB', minWidth: 6 }} />
                    {/* Right-side label */}
                    <div style={{ paddingLeft: 8, width: 180, flexShrink: 0, lineHeight: 1.2 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: phase.textColor }}>{phase.name}</div>
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
