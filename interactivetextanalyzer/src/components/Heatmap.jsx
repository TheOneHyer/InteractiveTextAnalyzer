import { useMemo } from 'react'

// Simple table heatmap with inline styles
export default function Heatmap({ matrix=[], xLabels=[], yLabels=[] }) {
  const flat = useMemo(()=> matrix.flat(),[matrix])
  const max = flat.length? Math.max(...flat): 1
  return (
    <table style={{borderCollapse:'collapse'}}>
      <thead>
        <tr>
          <th style={{position:'sticky', left:0, background:'#222'}}></th>
          {xLabels.map(x => <th key={x} style={{padding:4, fontSize:12}}>{x}</th>)}
        </tr>
      </thead>
      <tbody>
        {matrix.map((row, i) => (
          <tr key={i}>
            <th style={{textAlign:'right', padding:4, fontSize:12, position:'sticky', left:0, background:'#222'}}>{yLabels[i]}</th>
            {row.map((v,j) => {
              const pct = v/max
              const color = `rgba(33,150,243,${pct})`
              return <td key={j} style={{padding:4, background:color, color: pct>0.6? '#fff':'#000', fontSize:11}}>{v}</td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
