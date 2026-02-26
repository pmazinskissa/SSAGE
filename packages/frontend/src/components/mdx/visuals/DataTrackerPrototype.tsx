// @ts-nocheck

export default function DataTrackerPrototype() {
  const rows = [
    {item:'Dispatch Records (18 mo)',by:'Lead Analyst',date:'Feb 10',status:'Validated',source:'ServiceNow',notes:'Cleaned, 98% complete'},
    {item:'Customer NPS Surveys',by:'Data Engineer',date:'Feb 10',status:'Received',source:'Qualtrics',notes:'Awaiting PII review'},
    {item:'Tech Certifications',by:'Lead Analyst',date:'Feb 11',status:'Validated',source:'HR Portal',notes:'820 profiles loaded'},
    {item:'GIS Service Zones',by:'PM',date:'Feb 12',status:'In Progress',source:'GIS System',notes:'Format conversion needed'},
    {item:'Call Center Logs',by:'Data Engineer',date:'Feb 12',status:'Requested',source:'Genesys',notes:'Estimated 3 days'},
  ];
  const statusColors = {'Validated':'#22C55E','Received':'#3B82F6','In Progress':'#F59E0B','Requested':'#9CA3AF'};
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>Data Ingestion Validation Tracker</h3>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.78rem',minWidth:600}}>
          <thead>
            <tr style={{background:'#4F46E5',color:'white'}}>
              {['Data Item','Requested By','Date','Status','Source','Notes'].map(h => <th key={h} style={{padding:'0.5rem 0.6rem',textAlign:'left',fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} style={{background:i%2===0?'white':'#F8F9FA',borderBottom:'1px solid #F3F4F6'}}>
                <td style={{padding:'0.4rem 0.6rem',fontWeight:600,color:'#1A1A2E'}}>{r.item}</td>
                <td style={{padding:'0.4rem 0.6rem',color:'#374151'}}>{r.by}</td>
                <td style={{padding:'0.4rem 0.6rem',color:'#374151',whiteSpace:'nowrap'}}>{r.date}</td>
                <td style={{padding:'0.4rem 0.6rem'}}><span style={{background:`${statusColors[r.status]}20`,color:statusColors[r.status],padding:'0.15rem 0.5rem',borderRadius:20,fontSize:'0.72rem',fontWeight:700,whiteSpace:'nowrap'}}>{r.status}</span></td>
                <td style={{padding:'0.4rem 0.6rem',color:'#6B7280'}}>{r.source}</td>
                <td style={{padding:'0.4rem 0.6rem',color:'#9CA3AF',fontStyle:'italic'}}>{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

