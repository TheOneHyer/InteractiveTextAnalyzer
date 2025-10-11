/**
 * File Handling Utilities
 * 
 * This module provides functions for parsing CSV and Excel files,
 * including handling of rich text, formulas, and edge cases.
 */

/**
 * Parse a CSV line handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {string[]} Array of parsed values
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/**
 * Parse CSV text into rows and columns
 * @param {string} text - CSV text content
 * @returns {Object} Object with rows and columns arrays
 */
export function parseCsv(text) {
  const lines = text.trim().split('\n')
  if (lines.length === 0) {
    return { rows: [], columns: [] }
  }
  
  const columns = parseCSVLine(lines[0])
  const rows = lines.slice(1).filter(line => line.trim()).map(line => {
    const values = parseCSVLine(line)
    const row = {}
    columns.forEach((col, i) => {
      row[col] = values[i] || ''
    })
    return row
  })
  
  return { rows, columns }
}

/**
 * Parse ExcelJS worksheet into rows and columns
 * Handles rich text, formulas, and other cell types
 * @param {Object} ws - ExcelJS worksheet object
 * @returns {Object} Object with rows and columns arrays
 */
export function parseWorksheet(ws) {
  const rows = []
  const columns = []
  
  // Get column headers from first row
  const headerRow = ws.getRow(1)
  headerRow.eachCell((cell, colNumber) => {
    const header = cell.value || `Column${colNumber}`
    columns.push(String(header))
  })
  
  // Get data rows (skip header row)
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return // Skip header
    }
    const rowData = {}
    columns.forEach((col, i) => {
      const cellValue = row.getCell(i + 1).value
      
      // Handle rich text and formula values
      if (cellValue && typeof cellValue === 'object' && cellValue.richText) {
        rowData[col] = cellValue.richText.map(t => t.text).join('')
      } else if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
        rowData[col] = cellValue.result
      } else {
        rowData[col] = cellValue || ''
      }
    })
    rows.push(rowData)
  })
  
  return { rows, columns }
}
