// @ts-nocheck
import LIcon from './LIcon';

export default function DataRequestList() {
  const rows = [
    ['Dispatch Records','ServiceNow','CSV/API','18 months','~240K records'],
    ['Customer Surveys','Qualtrics','CSV export','12 months','~45K responses'],
    ['Technician Certifications','HR Portal','Excel','Current','820 tech profiles'],
    ['Geographic Maps','GIS System','Shapefile','Current','Service zone data'],
    ['Call Center Logs','Genesys','CSV','12 months','~1.2M interactions'],
  ];
  return (
    <div>
      <h3 style={{fontWeight:700,marginBottom:'1rem',color:'#1E1B4B'}}>Data Request Table</h3>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.8rem'}}>
        <thead>
          <tr style={{background:'#4F46E5',color:'white'}}>
            {['Data Type','Source System','Format','Time Period','Volume'].map(h => <th key={h} style={{padding:'0.5rem 0.6rem',textAlign:'left',fontWeight:600}}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} style={{background:i%2===0?'white':'#F8F9FA'}}>
              {r.map((cell,ci) => <td key={ci} style={{padding:'0.5rem 0.6rem',color:ci===0?'#1E1B4B':'#374151',fontWeight:ci===0?700:400,borderBottom:'1px solid #F3F4F6'}}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

