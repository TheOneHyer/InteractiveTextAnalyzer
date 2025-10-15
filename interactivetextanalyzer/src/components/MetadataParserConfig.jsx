import { useState } from 'react'
import InfoTooltip from './InfoTooltip'

/**
 * MetadataParserConfig Component
 * 
 * Provides UI controls for configuring sheet name metadata parsing
 * including delimiters, case sensitivity, and enabling/disabling features
 */
export default function MetadataParserConfig({ 
  config, 
  onChange, 
  metadata = null,
  onReparse = null 
}) {
  const [showConfig, setShowConfig] = useState(false)
  const [customDelimiter, setCustomDelimiter] = useState('')
  
  const handleDelimiterToggle = (delimiter) => {
    const newDelimiters = config.delimiters.includes(delimiter)
      ? config.delimiters.filter(d => d !== delimiter)
      : [...config.delimiters, delimiter]
    
    onChange({ ...config, delimiters: newDelimiters })
  }
  
  const handleAddCustomDelimiter = () => {
    if (customDelimiter && !config.delimiters.includes(customDelimiter)) {
      onChange({ ...config, delimiters: [...config.delimiters, customDelimiter] })
      setCustomDelimiter('')
    }
  }
  
  const handleRemoveDelimiter = (delimiter) => {
    onChange({ 
      ...config, 
      delimiters: config.delimiters.filter(d => d !== delimiter) 
    })
  }
  
  // Get summary of parsed metadata
  const getMetadataSummary = () => {
    if (!metadata) return null
    
    const sheetNames = Object.keys(metadata)
    const sheetsWithDates = sheetNames.filter(name => metadata[name].date).length
    const allTags = new Set()
    
    sheetNames.forEach(name => {
      if (metadata[name].tags) {
        metadata[name].tags.forEach(tag => allTags.add(tag))
      }
    })
    
    return {
      totalSheets: sheetNames.length,
      sheetsWithDates,
      uniqueTags: allTags.size
    }
  }
  
  const summary = getMetadataSummary()
  
  return (
    <div style={{ marginBottom: 20 }}>
      <div 
        onClick={() => setShowConfig(!showConfig)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h4 style={{ margin: 0 }}>Sheet Name Metadata Parser</h4>
          <InfoTooltip text="Parse metadata like dates and tags from sheet names. For example: 'Sales_10_6_Report' can extract date 10/6 and tags 'Sales' and 'Report'." />
        </div>
        <span style={{ fontSize: 14, fontWeight: 'bold' }}>
          {showConfig ? '−' : '+'}
        </span>
      </div>
      
      {summary && (
        <div style={{ 
          fontSize: 12, 
          color: '#64748b', 
          marginBottom: 10,
          padding: '8px 12px',
          background: '#f1f5f9',
          borderRadius: 4
        }}>
          Parsed: {summary.sheetsWithDates} sheet{summary.sheetsWithDates !== 1 ? 's' : ''} with dates, 
          {' '}{summary.uniqueTags} unique tag{summary.uniqueTags !== 1 ? 's' : ''}
        </div>
      )}
      
      {showConfig && (
        <div style={{ 
          padding: '12px', 
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          background: '#f8fafc'
        }}>
          {/* Date Parsing Toggle */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.parseDates}
                onChange={(e) => onChange({ ...config, parseDates: e.target.checked })}
              />
              <span>Parse dates from sheet names</span>
              <InfoTooltip text="Automatically detect and parse dates in various formats (10_6, 10/6, 2025-10-06, etc.)" />
            </label>
          </div>
          
          {/* Tag Extraction Toggle */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.extractTags}
                onChange={(e) => onChange({ ...config, extractTags: e.target.checked })}
              />
              <span>Extract text tags</span>
              <InfoTooltip text="Extract text components as tags for filtering and organization" />
            </label>
          </div>
          
          {/* Case Sensitivity Toggle */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.caseSensitive}
                onChange={(e) => onChange({ ...config, caseSensitive: e.target.checked })}
              />
              <span>Case sensitive parsing</span>
              <InfoTooltip text="Treat 'Sales' and 'sales' as different tags" />
            </label>
          </div>
          
          {/* Delimiter Configuration */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
              Delimiters
              <InfoTooltip text="Characters used to split sheet names into components" />
            </div>
            
            {/* Common Delimiters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {['_', '-', ' ', '|', '.', ','].map(delim => (
                <label 
                  key={delim}
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 4,
                    padding: '4px 8px',
                    background: config.delimiters.includes(delim) ? '#dbeafe' : '#fff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  <input
                    type="checkbox"
                    checked={config.delimiters.includes(delim)}
                    onChange={() => handleDelimiterToggle(delim)}
                  />
                  <code style={{ 
                    padding: '2px 4px', 
                    background: '#f1f5f9',
                    borderRadius: 2
                  }}>
                    {delim === ' ' ? 'space' : delim}
                  </code>
                </label>
              ))}
            </div>
            
            {/* Current Custom Delimiters */}
            {config.delimiters.filter(d => !['_', '-', ' ', '|', '.', ','].includes(d)).length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Custom:</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {config.delimiters
                    .filter(d => !['_', '-', ' ', '|', '.', ','].includes(d))
                    .map(delim => (
                      <span 
                        key={delim}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 6px',
                          background: '#dbeafe',
                          border: '1px solid #93c5fd',
                          borderRadius: 4,
                          fontSize: 12
                        }}
                      >
                        <code>{delim}</code>
                        <button
                          onClick={() => handleRemoveDelimiter(delim)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            fontSize: 14,
                            color: '#ef4444'
                          }}
                          title="Remove delimiter"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
            
            {/* Add Custom Delimiter */}
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomDelimiter()
                  }
                }}
                placeholder="Add custom delimiter..."
                maxLength={3}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: 13,
                  border: '1px solid #cbd5e1',
                  borderRadius: 4
                }}
              />
              <button
                onClick={handleAddCustomDelimiter}
                disabled={!customDelimiter}
                className="btn secondary"
                style={{
                  padding: '4px 12px',
                  fontSize: 13,
                  background: customDelimiter ? '#e2e8f0' : '#f1f5f9',
                  cursor: customDelimiter ? 'pointer' : 'not-allowed'
                }}
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Reparse Button */}
          {onReparse && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={onReparse}
                className="btn secondary"
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: 13,
                  background: '#3b82f6',
                  color: 'white'
                }}
              >
                Reparse Sheet Names
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
