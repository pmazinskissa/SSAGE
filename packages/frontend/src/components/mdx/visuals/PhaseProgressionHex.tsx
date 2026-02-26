import ScrollReveal from '../ScrollReveal';

export default function PhaseProgressionHex() {
  const phases = [
    { name: 'Diagnose Data', color: '#93C5FD', textColor: '#3B82F6', startCol: 1, filled: new Set([2, 6, 8]) },
    { name: 'Prioritize Opps', color: '#6366F1', textColor: '#6366F1', startCol: 2, filled: new Set([0, 3, 5, 7, 9]) },
    { name: 'Design & Prototype', color: '#4338CA', textColor: '#4338CA', startCol: 3, filled: new Set([0, 1, 3, 4, 5, 7, 8, 10]) },
    { name: 'Implement Solutions', color: '#22C55E', textColor: '#16A34A', startCol: 4, filled: new Set([0, 1, 2, 3, 4, 5, 6, 8, 9]) },
    { name: 'Sustain Improvements', color: '#9CA3AF', textColor: '#6B7280', startCol: 3, filled: new Set([0, 1, 2, 3, 4, 5, 6, 7, 9, 10]) },
    { name: 'Change Management', color: '#4B5563', textColor: '#4B5563', startCol: 0, filled: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) },
  ];
  const TOTAL_COLS = 14;
  const r = 18;
  const sw = Math.sqrt(3);
  const hexW = r * sw;
  const rowH = r * 2 + 2;
  const hexPoints = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i * 60 + 30) * Math.PI / 180;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');
  return (
    <ScrollReveal>
      <div className="my-8">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {phases.map((phase, row) => {
            const numCols = TOTAL_COLS - phase.startCol;
            const leftPad = phase.startCol * hexW;
            const localW = numCols * hexW + hexW * 0.5;
            return (
              <div key={row} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 220, flexShrink: 0, textAlign: 'right', paddingRight: '8px', fontSize: '1.1rem', fontWeight: 700, color: phase.textColor, lineHeight: 1.2 }}>
                  {phase.name}
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
            );
          })}
        </div>
      </div>
    </ScrollReveal>
  );
}
