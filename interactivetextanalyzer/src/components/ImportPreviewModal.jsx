import { useState, useMemo, useEffect } from 'react'
import './ImportPreviewModal.css'

const COLUMN_TYPES = ['text', 'number', 'date', 'boolean']

// Normalize value with synonym detection
const normalizeValue = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).toLowerCase().trim()
  
  // Map synonyms for common boolean-like values
  const synonymMap = {
    'y': 'yes', 'yes': 'yes', 'true': 'yes', '1': 'yes', 't': 'yes',
    'n': 'no', 'no': 'no', 'false': 'no', '0': 'no', 'f': 'no'
  }
  
  return synonymMap[str] || str
}

// Helper function to detect if column is categorical
const detectCategorical = (rows, column) => {
  const values = rows
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
  
  if (values.length === 0) return false
  
  // Check if all values are single words (or empty)
  const allSingleWord = values.every(val => {
    const str = String(val).trim()
    return str.split(/\s+/).length === 1
  })
  
  if (!allSingleWord) return false
  
  // Get unique normalized values
  const uniqueNormalized = new Set(values.map(normalizeValue))
  
  // Categorical if less than 10 unique normalized values
  return uniqueNormalized.size < 10 && uniqueNormalized.size > 0
}

// Helper function to detect data type from sample values
const detectColumnType = (rows, column, sampleSize = 10) => {
  // Get non-empty sample values
  const samples = rows
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
    .slice(0, sampleSize)
  
  if (samples.length === 0) return 'text'
  
  // Check for boolean first (subset of categorical)
  const booleanValues = ['true', 'false', 'yes', 'no', '1', '0', 't', 'f', 'y', 'n']
  const isBooleanish = samples.every(val => 
    booleanValues.includes(String(val).toLowerCase().trim())
  )
  if (isBooleanish) return 'boolean'
  
  // Check for number (before categorical)
  const isNumeric = samples.every(val => {
    const str = String(val).trim()
    return !isNaN(str) && !isNaN(parseFloat(str))
  })
  if (isNumeric) return 'number'
  
  // Check for date patterns (before categorical)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
    /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
  ]
  const isDateish = samples.every(val => {
    const str = String(val).trim()
    return datePatterns.some(pattern => pattern.test(str)) || !isNaN(Date.parse(str))
  })
  if (isDateish) return 'date'
  
  // Don't return 'categorical' as a type - it will be flagged separately
  return 'text'
}

// Get unique values for a categorical column
const getCategoricalValues = (rows, column) => {
  const values = rows
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
  
  const uniqueNormalized = new Set(values.map(normalizeValue))
  return Array.from(uniqueNormalized).sort()
}


// Eye icon SVG component
const EyeIcon = ({ visible }) => {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5Z" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="12.5" r="3.5" 
          stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )
  } else {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L21 21M10.5 10.5C10.0353 10.9653 9.75 11.6 9.75 12.3C9.75 13.7 10.9 14.85 12.3 14.85C13 14.85 13.6347 14.5647 14.1 14.1M7 7C4.5 8.5 2.73 10.39 1 12.5C2.73 16.89 7 20 12 20C14 20 15.8 19.5 17.5 18.5L7 7ZM12 5C17 5 21.27 8.11 23 12.5C22.18 14.34 21 15.96 19.5 17.22L12 5Z" 
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  }
}

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
  const [removeBlankColumns, setRemoveBlankColumns] = useState(false)
  const [autoDetectSynonyms, setAutoDetectSynonyms] = useState(true)
  const [trimWhitespace, setTrimWhitespace] = useState(true)
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true)
  const [ignoredRows, setIgnoredRows] = useState([])
  const [removeAfterIncomplete, setRemoveAfterIncomplete] = useState(false)
  const [categoricalColumns, setCategoricalColumns] = useState([]) // Columns flagged as categorical
  const [categoricalFilters, setCategoricalFilters] = useState({}) // { columnName: [selected values] }

  const sheets = Object.keys(workbookData)
  const currentData = useMemo(() => 
    workbookData[activeSheet] || { rows: [], columns: [] },
    [workbookData, activeSheet]
  )
  
  // Auto-detect column types when data changes
  useEffect(() => {
    if (currentData.rows.length > 0 && currentData.columns.length > 0) {
      const detectedTypes = {}
      const detectedCategorical = []
      currentData.columns.forEach(col => {
        // Only auto-detect if not already set by user
        if (!columnTypes[col]) {
          detectedTypes[col] = detectColumnType(currentData.rows, col)
        }
        // Auto-detect categorical columns
        if (detectCategorical(currentData.rows, col)) {
          detectedCategorical.push(col)
        }
      })
      if (Object.keys(detectedTypes).length > 0) {
        setColumnTypes(prev => ({ ...prev, ...detectedTypes }))
      }
      if (detectedCategorical.length > 0) {
        setCategoricalColumns(prev => {
          const combined = [...new Set([...prev, ...detectedCategorical])]
          return combined
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData])
  
  // Apply transformations to preview data
  const processedData = useMemo(() => {
    let rows = [...currentData.rows]
    let columns = [...currentData.columns]
    
    // Add original index to each row for tracking
    rows = rows.map((row, idx) => ({ ...row, __originalIndex: idx }))

    // Skip first n rows (but protect header row - first row is always header)
    // This means we skip rows AFTER the header
    if (skipFirstRows > 0 && rows.length > 1) {
      // Keep first row (header) and skip next n rows
      const headerRow = rows[0]
      rows = [headerRow, ...rows.slice(skipFirstRows + 1)]
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

    // Remove rows after first incomplete row (after empty rows removed)
    if (removeAfterIncomplete) {
      const firstIncompleteIndex = rows.findIndex(row => {
        // Check if any column has empty/null/undefined value
        return columns.some(col => {
          const val = row[col]
          return val === null || val === undefined || String(val).trim() === ''
        })
      })
      if (firstIncompleteIndex > 0) {
        rows = rows.slice(0, firstIncompleteIndex)
      }
    }

    // Note: We don't filter ignored rows here - they stay visible in preview
    // with 'row-ignored' styling. They'll be filtered out when data is confirmed.

    // Remove columns after first blank if enabled
    if (removeAfterBlank) {
      const firstBlankIndex = columns.findIndex(col => 
        !col || col.trim() === '' || col.startsWith('Column')
      )
      if (firstBlankIndex > 0) {
        columns = columns.slice(0, firstBlankIndex)
      }
    }
    
    // Remove blank columns if enabled (columns with all blank values after header)
    if (removeBlankColumns) {
      columns = columns.filter(col => {
        // Skip internal tracking properties
        if (col.startsWith('__')) return false
        // Check if any row has a non-blank value for this column
        return rows.some(row => {
          const val = row[col]
          return val !== null && val !== undefined && String(val).trim() !== ''
        })
      })
    }

    // Apply whitespace trimming
    if (trimWhitespace) {
      rows = rows.map(row => {
        const newRow = { __originalIndex: row.__originalIndex }
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

    // Apply categorical filters
    Object.entries(categoricalFilters).forEach(([col, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0 && columns.includes(col)) {
        rows = rows.filter(row => {
          const val = row[col]
          if (val === null || val === undefined) return false
          const normalized = normalizeValue(val)
          return selectedValues.includes(normalized)
        })
      }
    })

    return { rows, columns, columnGroups }
  }, [currentData, skipFirstRows, removeEmptyRows, removeAfterBlank, removeBlankColumns, trimWhitespace, autoDetectSynonyms, hiddenColumns, removeAfterIncomplete, categoricalFilters])

  const displayRows = processedData.rows.slice(0, rowsToShow)
  const displayColumns = processedData.columns.filter(col => !hiddenColumns.includes(col))

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRows = currentData.rows.length
    const processedRows = processedData.rows.length
    const totalColumns = currentData.columns.length
    const visibleColumns = displayColumns.length
    
    // Calculate total character count from all cells
    let charCount = 0
    currentData.rows.forEach(row => {
      currentData.columns.forEach(col => {
        const val = row[col]
        if (val !== null && val !== undefined) {
          charCount += String(val).length
        }
      })
    })
    
    return {
      totalRows,
      processedRows,
      totalColumns,
      visibleColumns,
      charCount
    }
  }, [currentData, processedData, displayColumns])

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

  const toggleRowIgnored = (rowIndex) => {
    setIgnoredRows(prev => 
      prev.includes(rowIndex) ? prev.filter(i => i !== rowIndex) : [...prev, rowIndex]
    )
  }

  const setColumnType = (col, type) => {
    setColumnTypes(prev => ({ ...prev, [col]: type }))
  }

  const toggleCategoricalFilter = (col, value) => {
    setCategoricalFilters(prev => {
      const current = prev[col] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [col]: updated }
    })
  }

  const getCategoricalValuesForColumn = (col) => {
    return getCategoricalValues(currentData.rows, col)
  }

  const handleConfirm = () => {
    const config = {
      fileType,
      hiddenColumns,
      columnTypes,
      categoricalColumns,
      markedColumns,
      skipFirstRows,
      removeAfterBlank,
      removeBlankColumns,
      trimWhitespace,
      removeEmptyRows,
      ignoredRows,
      removeAfterIncomplete,
      categoricalFilters,
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
                  <option value={20}>20 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                  <option value={200}>200 rows</option>
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

          {/* Statistics - inconspicuous */}
          <div className="import-stats">
            <span className="stat-item">Rows: {stats.processedRows}/{stats.totalRows}</span>
            <span className="stat-item">Cols: {stats.visibleColumns}/{stats.totalColumns}</span>
            <span className="stat-item">Chars: {stats.charCount.toLocaleString()}</span>
          </div>

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
                  checked={removeAfterIncomplete} 
                  onChange={e => setRemoveAfterIncomplete(e.target.checked)} 
                />
                <span>Remove rows after first incomplete row</span>
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
                  checked={removeBlankColumns} 
                  onChange={e => setRemoveBlankColumns(e.target.checked)} 
                />
                <span>Remove blank columns (all rows empty)</span>
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

          {/* Column Configuration and Categorical Filters - Side by Side */}
          <div className="config-and-filters-container">
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
                          title={hiddenColumns.includes(col) ? 'Show column' : 'Hide column'}
                        >
                          <EyeIcon visible={!hiddenColumns.includes(col)} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Categorical Filters */}
            {(() => {
              const categCols = processedData.columns.filter(col => 
                (categoricalColumns.includes(col) || columnTypes[col] === 'boolean')
              )
              return categCols.length > 0 ? (
                <div className="import-section">
                  <label>Categorical Filters</label>
                  <div className="categorical-filters">
                    {categCols.map(col => {
                      const values = getCategoricalValuesForColumn(col)
                      const selectedValues = categoricalFilters[col] || []
                      return (
                        <div key={col} className="categorical-filter-group">
                          <div className="categorical-filter-header">
                            <strong>{col}</strong>
                            <span className="subtle">({values.length} unique)</span>
                          </div>
                          <div className="categorical-filter-values">
                            {values.map(value => (
                              <label key={value} className="categorical-filter-option">
                                <input
                                  type="checkbox"
                                  checked={selectedValues.length === 0 || selectedValues.includes(value)}
                                  onChange={() => toggleCategoricalFilter(col, value)}
                                />
                                <span>{value}</span>
                              </label>
                            ))}
                          </div>
                          {selectedValues.length > 0 && (
                            <button 
                              className="btn secondary" 
                              style={{ fontSize: 11, padding: '2px 8px', marginTop: 4 }}
                              onClick={() => setCategoricalFilters(prev => ({ ...prev, [col]: [] }))}
                            >
                              Clear Filter
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null
            })()}
          </div>

          {/* Data Preview */}
          <div className="import-section">
            <label>
              Data Preview 
              <span className="subtle"> (showing {displayRows.length} of {processedData.rows.length} rows, {displayColumns.length} of {currentData.columns.length} columns)</span>
            </label>
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th className="row-select-header">Ignore</th>
                    {displayColumns.map(col => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, idx) => {
                    const originalIdx = row.__originalIndex
                    const isIgnored = ignoredRows.includes(originalIdx)
                    return (
                      <tr key={idx} className={isIgnored ? 'row-ignored' : ''}>
                        <td className="row-select-cell">
                          <input
                            type="checkbox"
                            checked={isIgnored}
                            onChange={() => toggleRowIgnored(originalIdx)}
                            title="Ignore this row"
                          />
                        </td>
                        {displayColumns.map(col => (
                          <td key={col}>{String(row[col] || '').slice(0, 100)}</td>
                        ))}
                      </tr>
                    )
                  })}
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
