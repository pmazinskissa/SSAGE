import { Pencil, Boxes } from 'lucide-react';
import ScrollReveal from '../ScrollReveal';

const designItems = [
  'Convert the business vision to high-level requirements',
  'Define and structure the solution to have an effective process flow, mechanics, and user-friendliness',
  'Optionally, prepare any template files to pre-load during development phase',
];

const prototypeItems = [
  'Develop an initial prototype by leveraging Generative AI Chatbots and development programs',
  'Conduct preliminary testing and fix issues (repeat)',
  'Improve the solution architecture and features',
  'Prepare and share the solution package for deployment',
];

const headerBg = '#1E1B4B';
const headerText = '#FFFFFF';
const preBg = '#E9ECF0';
const preHeaderText = '#1E1B4B';
const bodyBg = '#F8F9FA';

export default function DesignPrototypeStages() {
  return (
    <ScrollReveal>
      <div className="my-8" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', border: '1px solid #CBD5E1' }}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '39%' }} />
            <col style={{ width: '39%' }} />
          </colgroup>

          {/* Icon row */}
          <thead>
            <tr>
              <td style={{ background: 'white', border: '1px solid #CBD5E1' }} />
              <td style={{ background: 'white', textAlign: 'center', padding: '0.75rem 0 0.5rem', border: '1px solid #CBD5E1' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#DBEAFE' }}>
                  <Pencil size={22} color="#3B82F6" strokeWidth={1.8} />
                </div>
              </td>
              <td style={{ background: 'white', textAlign: 'center', padding: '0.75rem 0 0.5rem', border: '1px solid #CBD5E1' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: '50%', background: '#DBEAFE' }}>
                  <Boxes size={22} color="#3B82F6" strokeWidth={1.8} />
                </div>
              </td>
            </tr>

            {/* Header row */}
            <tr>
              <th style={{ background: preBg, color: preHeaderText, padding: '0.6rem 0.8rem', textAlign: 'left', fontWeight: 700, fontSize: '0.85rem', border: '1px solid #CBD5E1' }}>
                Pre-Development Phase
              </th>
              <th style={{ background: headerBg, color: headerText, padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #CBD5E1' }}>
                Design
              </th>
              <th style={{ background: headerBg, color: headerText, padding: '0.6rem 0.8rem', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', border: '1px solid #CBD5E1' }}>
                Prototype
              </th>
            </tr>
          </thead>

          {/* Body row */}
          <tbody>
            <tr>
              <td style={{ background: preBg, padding: '1rem 0.8rem', verticalAlign: 'top', color: '#374151', fontSize: '0.82rem', lineHeight: 1.5, border: '1px solid #CBD5E1' }}>
                Prioritized opportunity identified during the previous phase
              </td>
              <td style={{ background: bodyBg, padding: '1rem 0.8rem', verticalAlign: 'top', border: '1px solid #CBD5E1' }}>
                {designItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', lineHeight: 1.5, marginBottom: i < designItems.length - 1 ? '0.6rem' : 0 }}>
                    <span style={{ color: '#6B7280', flexShrink: 0, marginTop: '0.15rem' }}>&bull;</span>
                    {item}
                  </div>
                ))}
              </td>
              <td style={{ background: bodyBg, padding: '1rem 0.8rem', verticalAlign: 'top', border: '1px solid #CBD5E1' }}>
                {prototypeItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: '#374151', lineHeight: 1.5, marginBottom: i < prototypeItems.length - 1 ? '0.6rem' : 0 }}>
                    <span style={{ color: '#6B7280', flexShrink: 0, marginTop: '0.15rem' }}>&bull;</span>
                    {item}
                  </div>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ScrollReveal>
  );
}
