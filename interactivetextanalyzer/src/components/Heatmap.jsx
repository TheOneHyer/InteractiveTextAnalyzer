import { useMemo, useState } from 'react'

// Simple table heatmap with inline styles
export default function Heatmap({ matrix=[], xLabels=[], yLabels=[] }) {
  const [showValues, setShowValues] = useState(false)
  const flat = useMemo(()=> matrix.flat(),[matrix])
  const max = flat.length? Math.max(...flat): 1
  
  // Get CSS variable colors - fallback to defaults if not available
  const getSurfaceColor = () => {
    if (typeof window === 'undefined') return '#1e293b'
    const computed = getComputedStyle(document.documentElement)
    return computed.getPropertyValue('--c-surface').trim() || '#1e293b'
  }
  
  const getTextColor = () => {
    if (typeof window === 'undefined') return '#f1f5f9'
    const computed = getComputedStyle(document.documentElement)
    return computed.getPropertyValue('--c-text').trim() || '#f1f5f9'
  }
  
  const surfaceColor = getSurfaceColor()
  const textColor = getTextColor()
  
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', userSelect: 'none'}}>
          <input 
            type="checkbox" 
            checked={showValues} 
            onChange={(e) => setShowValues(e.target.checked)}
            style={{cursor: 'pointer', width: '16px', height: '16px'}}
          />
          <span>Show values</span>
        </label>
      </div>
      <div style={{
        maxWidth: '100%',
        maxHeight: '500px',
        overflow: 'auto',
        border: '1px solid var(--c-border, #334155)',
        borderRadius: '8px'
      }}>
        <table style={{borderCollapse:'collapse', width: '100%'}}>
          <thead>
            <tr>
              <th style={{
                position:'sticky', 
                left:0, 
                top: 0,
                background: surfaceColor,
                zIndex: 3,
                padding: '8px',
                borderBottom: '2px solid var(--c-border, #334155)',
                borderRight: '2px solid var(--c-border, #334155)'
              }}></th>
              {xLabels.map(x => (
                <th 
                  key={x} 
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: surfaceColor,
                    zIndex: 2,
                    padding: '8px 10px', 
                    fontSize: 12, 
                    fontWeight: 600,
                    color: textColor,
                    borderBottom: '2px solid var(--c-border, #334155)',
                    minWidth: '80px',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={x}
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th style={{
                  textAlign:'right', 
                  padding: '8px 10px', 
                  fontSize: 12, 
                  fontWeight: 600,
                  position:'sticky', 
                  left:0, 
                  background: surfaceColor,
                  zIndex: 1,
                  color: textColor,
                  borderRight: '2px solid var(--c-border, #334155)',
                  minWidth: '120px',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={yLabels[i]}
                >
                  {yLabels[i]}
                </th>
                {row.map((v,j) => {
                  const pct = v/max
                  // Use a blue-to-orange gradient for better visibility
                  const color = pct === 0 
                    ? 'var(--c-bg, #0f172a)' 
                    : `rgba(255, 153, 0, ${Math.max(0.15, pct * 0.85)})`
                  const textCol = pct > 0.5 ? '#000' : textColor
                  
                  return (
                    <td 
                      key={j} 
                      style={{
                        padding: '8px 10px', 
                        background: color, 
                        color: textCol, 
                        fontSize: 11,
                        textAlign: 'center',
                        fontWeight: 500,
                        minWidth: '80px',
                        borderRight: '1px solid var(--c-border, #334155)',
                        borderBottom: '1px solid var(--c-border, #334155)',
                        cursor: 'default'
                      }}
                      title={`${yLabels[i]} - ${xLabels[j]}: ${v}`}
                    >
                      {showValues ? v : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
