// @ts-nocheck
import LIcon from './LIcon';

export default function LLMOutputFormatting() {
  const UserBubble = ({text}) => (
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'0.75rem'}}>
      <div style={{background:'#4F46E5',color:'white',borderRadius:'1.25rem 1.25rem 0.25rem 1.25rem',padding:'0.75rem 1rem',maxWidth:'78%',fontSize:'0.84rem',lineHeight:1.55}}>
        {text}
      </div>
    </div>
  );
  const AIBubble = ({children}) => (
    <div style={{display:'flex',justifyContent:'flex-start',marginBottom:'0.75rem'}}>
      <div style={{background:'white',border:'1px solid #E5E7EB',borderRadius:'1.25rem 1.25rem 1.25rem 0.25rem',padding:'0.75rem 1rem',maxWidth:'88%',fontSize:'0.84rem',lineHeight:1.6,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
        {children}
      </div>
    </div>
  );
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'0.75rem',color:'#1E1B4B'}}>Multi-turn Chat — FCR + Visualization Ask</h3>
      <div style={{background:'#F3F4F6',borderRadius:12,padding:'1rem',maxWidth:560,margin:'0 auto'}}>
        <UserBubble text="What are the FCR industry benchmarks for telecom/cable companies?"/>
        <AIBubble>
          <div style={{fontWeight:700,color:'#4F46E5',marginBottom:'0.4rem',fontSize:'0.83rem'}}>FCR Benchmarks — Telecom</div>
          <div style={{fontSize:'0.8rem',color:'#374151',lineHeight:1.6}}>
            <strong>Industry average:</strong> 71–76% &nbsp;|&nbsp; <strong>Top quartile:</strong> &gt;85%<br/>
            <strong>Metro Cable current:</strong> <span style={{color:'#EF4444',fontWeight:700}}>68%</span> (below average)<br/>
            <span style={{color:'#6B7280',fontSize:'0.75rem'}}>Key drivers: skill matching (35%), misrouting (25%), parts (18%)</span>
          </div>
        </AIBubble>
        <UserBubble text="Can you suggest a chart type to visualize FCR rates by geographic region? I want to show where Metro Cable lags most."/>
        <AIBubble>
          <div style={{fontWeight:700,color:'#0D9488',marginBottom:'0.4rem',fontSize:'0.83rem'}}>Visualization Suggestion</div>
          <div style={{fontSize:'0.8rem',color:'#374151',lineHeight:1.6}}>
            A <strong>choropleth heat map</strong> overlaid on service zones would work best — darker colors indicate lower FCR. Pair it with a <strong>ranked bar chart</strong> sorted by FCR rate to show the gap between regions and the 85% top-quartile benchmark line.<br/><br/>
            Alternative: A <strong>small multiples scatter plot</strong> (one panel per region) comparing technician count vs. FCR rate could reveal whether staffing density correlates with performance gaps.
          </div>
        </AIBubble>
      </div>
    </div>
  );
}

