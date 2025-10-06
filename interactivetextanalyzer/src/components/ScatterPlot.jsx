import { useMemo, useState } from 'react'

// Simple scatter plot for embeddings visualization
export default function ScatterPlot({ data = [], xLabel = 'Dimension 1', yLabel = 'Dimension 2' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  
  const { points, xMin, xMax, yMin, yMax } = useMemo(() => {
    if (!data.length) return { points: [], xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
    
    const xValues = data.map(d => d.x)
    const yValues = data.map(d => d.y)
    
    return {
      points: data,
      xMin: Math.min(...xValues),
      xMax: Math.max(...xValues),
      yMin: Math.min(...yValues),
      yMax: Math.max(...yValues)
    }
  }, [data])
  
  const width = 500
  const height = 400
  const padding = 50
  const plotWidth = width - 2 * padding
  const plotHeight = height - 2 * padding
  
  const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth
  const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * plotHeight
  
  // Get CSS variable colors
  const getTextColor = () => {
    if (typeof window === 'undefined') return '#94a3b8'
    const computed = getComputedStyle(document.documentElement)
    return computed.getPropertyValue('--c-text-muted').trim() || '#94a3b8'
  }
  
  const getAccentColor = () => {
    if (typeof window === 'undefined') return '#ff9900'
    const computed = getComputedStyle(document.documentElement)
    return computed.getPropertyValue('--c-accent').trim() || '#ff9900'
  }
  
  const textColor = getTextColor()
  const accentColor = getAccentColor()
  
  if (!points.length) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: height,
        color: textColor 
      }}>
        No data to display
      </div>
    )
  }
  
  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} style={{ background: 'var(--c-bg, #0f172a)', borderRadius: '8px' }}>
        {/* Axes */}
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={width - padding} 
          y2={height - padding} 
          stroke={textColor} 
          strokeWidth="2" 
        />
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={height - padding} 
          stroke={textColor} 
          strokeWidth="2" 
        />
        
        {/* Axis labels */}
        <text 
          x={width / 2} 
          y={height - 10} 
          textAnchor="middle" 
          fill={textColor} 
          fontSize="12"
          fontWeight="600"
        >
          {xLabel}
        </text>
        <text 
          x={10} 
          y={height / 2} 
          textAnchor="middle" 
          fill={textColor} 
          fontSize="12"
          fontWeight="600"
          transform={`rotate(-90, 10, ${height / 2})`}
        >
          {yLabel}
        </text>
        
        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={scaleX(point.x)}
            cy={scaleY(point.y)}
            r={hoveredPoint === i ? 6 : 4}
            fill={accentColor}
            fillOpacity={hoveredPoint === i ? 1 : 0.7}
            stroke={hoveredPoint === i ? '#fff' : 'none'}
            strokeWidth={hoveredPoint === i ? 2 : 0}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={() => setHoveredPoint(i)}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>
      
      {/* Tooltip */}
      {hoveredPoint !== null && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'var(--c-surface, #1e293b)',
          border: '1px solid var(--c-border, #334155)',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '12px',
          color: 'var(--c-text, #f1f5f9)',
          maxWidth: '200px',
          wordWrap: 'break-word',
          pointerEvents: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Document {hoveredPoint + 1}
          </div>
          {points[hoveredPoint].label && (
            <div style={{ fontSize: '11px', color: textColor }}>
              {points[hoveredPoint].label}
            </div>
          )}
          <div style={{ fontSize: '10px', marginTop: '4px', color: textColor }}>
            x: {points[hoveredPoint].x.toFixed(3)}, y: {points[hoveredPoint].y.toFixed(3)}
          </div>
        </div>
      )}
    </div>
  )
}
