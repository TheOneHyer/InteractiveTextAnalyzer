import { useState, useMemo } from 'react'
import './ImportPreviewModal.css'

const COLUMN_TYPES = ['text', 'number', 'date', 'boolean']

function ImportPreviewModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  workbookData, 
  fileName,
  detectedFileType
}) {
  const [activeSheet, setActiveSheet] = useState(Object.keys(workbookData)[0] || null)
  const [rowsToShow, setRowsToShow] = useState(10)
  const [fileType, setFileType] = useState(detectedFileType)
  const [hiddenColumns, setHiddenColumns] = useState([])
  const [columnTypes, setColumnTypes] = useState({})
  const [markedColumns, setMarkedColumns] = useState([])
  const [skipFirstRows, setSkipFirstRows] = useState(0)
  const [removeAfterBlank, setRemoveAfterBlank] = useState(false)
  const [autoDetectSynonyms, setAutoDetectSynonyms] = useState(true)
  const [trimWhitespace, setTrimWhitespace] = useState(true)
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true)

  const sheets = Object.keys(workbookData)
  const currentData = workbookData[activeSheet] || { rows: [], columns: [] }
  
  // Apply transformations to preview data
  const processedData = useMemo(() => {
    let rows = [...currentData.rows]
    let columns = [...currentData.columns]

    // Skip first n rows
    if (skipFirstRows > 0) {
      rows = rows.slice(skipFirstRows)
    }

    // Remove empty rows
    if (removeEmptyRows) {
      rows = rows.filter(row => {
        return columns.some(col => {
          const val = row[col]
          return val !== null && val !== undefined && String(val).trim() !== ''
        })
      })
    }

    // Remove columns after first blank if enabled
    if (removeAfterBlank) {
      const firstBlankIndex = columns.findIndex(col => 
        !col || col.trim() === '' || col.startsWith('Column')
      )
      if (firstBlankIndex > 0) {
        columns = columns.slice(0, firstBlankIndex)
      }
    }

    // Apply whitespace trimming
    if (trimWhitespace) {
      rows = rows.map(row => {
        const newRow = {}
        columns.forEach(col => {
          const val = row[col]
          newRow[col] = typeof val === 'string' ? val.trim() : val
        })
        return newRow
      })
    }

    // Auto-detect synonymous columns
    const columnGroups = {}
    if (autoDetectSynonyms) {
      columns.forEach((col, idx) => {
        const normalized = col.toLowerCase().trim().replace(/[_\s-]+/g, '')
        if (!columnGroups[normalized]) {
          columnGroups[normalized] = []
        }
        columnGroups[normalized].push({ original: col, index: idx })
      })
      
      // Mark potential duplicates
      Object.values(columnGroups).forEach(group => {
        if (group.length > 1) {
          // Keep first, hide others
          for (let i = 1; i < group.length; i++) {
            if (!hiddenColumns.includes(group[i].original)) {
              // Just flag them, don't auto-hide
            }
          }
        }
      })
    }

    return { rows, columns, columnGroups }
  }, [currentData, skipFirstRows, removeEmptyRows, removeAfterBlank, trimWhitespace, autoDetectSynonyms, hiddenColumns])

  const displayRows = processedData.rows.slice(0, rowsToShow)
  const displayColumns = processedData.columns.filter(col => !hiddenColumns.includes(col))

  const toggleColumnVisibility = (col) => {
    setHiddenColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const toggleColumnMark = (col) => {
    setMarkedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    )
  }

  const setColumnType = (col, type) => {
    setColumnTypes(prev => ({ ...prev, [col]: type }))
  }

  const handleConfirm = () => {
    const config = {
      fileType,
      hiddenColumns,
      columnTypes,
      markedColumns,
      skipFirstRows,
      removeAfterBlank,
      trimWhitespace,
      removeEmptyRows,
      processedData
    }
    onConfirm(config)
  }

  const getSynonymousColumns = (col) => {
    const normalized = col.toLowerCase().trim().replace(/[_\s-]+/g, '')
    const group = processedData.columnGroups[normalized] || []
    return group.length > 1 ? group.map(g => g.original) : []
  }

  if (!isOpen) return null

  return (
    <div className="import-modal-overlay" onClick={onClose}>
      <div className="import-modal" onClick={e => e.stopPropagation()}>
        <div className="import-modal-header">
          <h2>Import File Preview</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="import-modal-body">
          {/* File Info Section */}
          <div className="import-section">
            <div className="import-section-row">
              <div className="import-field">
                <label htmlFor="import-filename">File Name</label>
                <input id="import-filename" type="text" value={fileName} disabled />
              </div>
              <div className="import-field">
                <label htmlFor="import-filetype">File Type</label>
                <select id="import-filetype" value={fileType} onChange={e => setFileType(e.target.value)}>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="xls">Excel (XLS)</option>
                  <option value="txt">Text</option>
                </select>
              </div>
              <div className="import-field">
                <label htmlFor="import-rowstoshow">Rows to Preview</label>
                <select id="import-rowstoshow" value={rowsToShow} onChange={e => setRowsToShow(Number(e.target.value))}>
                  <option value={10}>10 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sheet Tabs */}
          {sheets.length > 1 && (
            <div className="import-section">
              <label>Sheets</label>
              <div className="sheet-tabs">
                {sheets.map(sheet => (
                  <button
                    key={sheet}
                    className={`sheet-tab ${sheet === activeSheet ? 'active' : ''}`}
                    onClick={() => setActiveSheet(sheet)}
                  >
                    {sheet}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Cleaning Options */}
          <div className="import-section">
            <label>Data Cleaning Options</label>
            <div className="import-options">
              <label className="import-checkbox">
                <input 
                  type="checkbox" 
                  checked={trimWhitespace} 
                  onChange={e => setTrimWhitespace(e.target.checked)} 
                />
                <span>Trim whitespace from all cells</span>
              </label>
              <label className="import-checkbox">
                <input 
                  type="checkbox" 
                  checked={removeEmptyRows} 
                  onChange={e => setRemoveEmptyRows(e.target.checked)} 
                />
                <span>Remove completely empty rows</span>
              </label>
              <label className="import-checkbox">
                <input 
                  type="checkbox" 
                  checked={removeAfterBlank} 
                  onChange={e => setRemoveAfterBlank(e.target.checked)} 
                />
                <span>Remove columns after first blank column</span>
              </label>
              <label className="import-checkbox">
                <input 
                  type="checkbox" 
                  checked={autoDetectSynonyms} 
                  onChange={e => setAutoDetectSynonyms(e.target.checked)} 
                />
                <span>Auto-detect synonymous columns</span>
              </label>
              <div className="import-field-inline">
                <label>Skip first</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={skipFirstRows} 
                  onChange={e => setSkipFirstRows(Math.max(0, Number(e.target.value)))}
                  style={{ width: '60px' }}
                />
                <span>rows</span>
              </div>
            </div>
          </div>

          {/* Column Configuration */}
          <div className="import-section">
            <label>Column Configuration</label>
            <div className="column-config-grid">
              <div className="column-config-header">
                <span>Column Name</span>
                <span>Type</span>
                <span>Mark for Analysis</span>
                <span>Visibility</span>
              </div>
              <div className="column-config-list">
                {processedData.columns.map(col => {
                  const synonyms = getSynonymousColumns(col)
                  const hasSynonyms = synonyms.length > 1
                  return (
                    <div key={col} className={`column-config-row ${hasSynonyms ? 'has-synonyms' : ''}`}>
                      <div className="column-name">
                        {col}
                        {hasSynonyms && (
                          <span className="synonym-badge" title={`Similar to: ${synonyms.filter(s => s !== col).join(', ')}`}>
                            ~{synonyms.length}
                          </span>
                        )}
                      </div>
                      <select 
                        value={columnTypes[col] || 'text'} 
                        onChange={e => setColumnType(col, e.target.value)}
                        className="column-type-select"
                      >
                        {COLUMN_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button 
                        className={`mark-btn ${markedColumns.includes(col) ? 'marked' : ''}`}
                        onClick={() => toggleColumnMark(col)}
                      >
                        {markedColumns.includes(col) ? '✓' : '○'}
                      </button>
                      <button 
                        className={`visibility-btn ${hiddenColumns.includes(col) ? 'hidden' : 'visible'}`}
                        onClick={() => toggleColumnVisibility(col)}
                      >
                        {hiddenColumns.includes(col) ? '👁️‍🗨️' : '👁️'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Data Preview */}
          <div className="import-section">
            <label>
              Data Preview 
              <span className="subtle"> (showing {displayRows.length} of {processedData.rows.length} rows, {displayColumns.length} of {processedData.columns.length} columns)</span>
            </label>
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    {displayColumns.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, idx) => (
                    <tr key={idx}>
                      {displayColumns.map(col => (
                        <td key={col}>{String(row[col] || '').slice(0, 100)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="import-modal-footer">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn accent" onClick={handleConfirm}>Import Data</button>
        </div>
      </div>
    </div>
  )
}

export default ImportPreviewModal
