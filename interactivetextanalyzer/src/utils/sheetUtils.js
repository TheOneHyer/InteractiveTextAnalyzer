/**
 * Sheet Management Utilities
 * 
 * Provides utilities for managing sheets including similarity detection,
 * normalization, and automatic detection of sheets suitable for analysis.
 */

/**
 * Normalize column name for comparison
 * @param {string} columnName - Column name to normalize
 * @returns {string} Normalized column name
 */
export const normalizeColumnName = (columnName) => {
  if (!columnName) return ''
  return String(columnName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
}

/**
 * Remove completely empty columns from a sheet's columns array
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column names
 * @returns {Array} Array of non-empty column names
 */
export const removeEmptyColumns = (rows, columns) => {
  if (!rows || !columns || rows.length === 0) return columns
  
  return columns.filter(col => {
    // Check if column has at least one non-empty value
    return rows.some(row => {
      const val = row[col]
      return val !== null && val !== undefined && String(val).trim() !== ''
    })
  })
}

/**
 * Calculate column name frequency across all sheets
 * @param {Object} workbookData - Workbook data object with sheet names as keys
 * @returns {Map} Map of normalized column names to their frequency counts
 */
export const calculateColumnNameFrequency = (workbookData) => {
  const frequencyMap = new Map()
  
  Object.keys(workbookData).forEach(sheetName => {
    const sheet = workbookData[sheetName]
    if (!sheet || !sheet.rows || !sheet.columns) return
    
    // Get non-empty columns for this sheet
    const nonEmptyColumns = removeEmptyColumns(sheet.rows, sheet.columns)
    
    // Normalize and count
    nonEmptyColumns.forEach(col => {
      const normalized = normalizeColumnName(col)
      if (normalized) {
        frequencyMap.set(normalized, (frequencyMap.get(normalized) || 0) + 1)
      }
    })
  })
  
  return frequencyMap
}

/**
 * Calculate similarity between a sheet's columns and the global column frequency
 * @param {Array} rows - Array of data rows for the sheet
 * @param {Array} columns - Array of column names for the sheet
 * @param {Map} globalFrequency - Global column name frequency map
 * @returns {number} Similarity ratio (0.0 to 1.0)
 */
export const calculateSheetSimilarity = (rows, columns, globalFrequency) => {
  if (!rows || !columns || columns.length === 0 || globalFrequency.size === 0) {
    return 0
  }
  
  // Get non-empty columns
  const nonEmptyColumns = removeEmptyColumns(rows, columns)
  if (nonEmptyColumns.length === 0) return 0
  
  // Normalize columns
  const normalizedColumns = nonEmptyColumns.map(normalizeColumnName).filter(c => c)
  if (normalizedColumns.length === 0) return 0
  
  // Count how many normalized columns appear in the global frequency map
  let matchCount = 0
  normalizedColumns.forEach(normalized => {
    if (globalFrequency.has(normalized)) {
      matchCount++
    }
  })
  
  // Calculate similarity as ratio of matching columns
  return matchCount / normalizedColumns.length
}

/**
 * Auto-detect which sheets should be included for analysis
 * Compares each sheet against common columns that appear in majority of sheets
 * @param {Object} workbookData - Workbook data object with sheet names as keys
 * @param {number} threshold - Similarity threshold (default: 0.75 for 75%)
 * @returns {Object} Object with sheet names as keys and boolean values indicating inclusion
 */
export const autoDetectSheetsForAnalysis = (workbookData, threshold = 0.75) => {
  const sheetNames = Object.keys(workbookData)
  
  // If only one sheet, include it by default
  if (sheetNames.length === 1) {
    return { [sheetNames[0]]: true }
  }
  
  // Build column frequency map across all sheets
  const columnFrequency = new Map()
  const sheetCount = sheetNames.length
  
  sheetNames.forEach(sheetName => {
    const sheet = workbookData[sheetName]
    if (!sheet || !sheet.rows || !sheet.columns) return
    
    const nonEmptyColumns = removeEmptyColumns(sheet.rows, sheet.columns)
    const normalizedColumns = new Set(nonEmptyColumns.map(normalizeColumnName).filter(c => c))
    
    normalizedColumns.forEach(col => {
      columnFrequency.set(col, (columnFrequency.get(col) || 0) + 1)
    })
  })
  
  // Find "common" columns that appear in majority of sheets (> 50% of sheets)
  const majorityThreshold = sheetCount / 2
  const commonColumns = new Set()
  columnFrequency.forEach((count, col) => {
    if (count > majorityThreshold) {
      commonColumns.add(col)
    }
  })
  
  // Calculate similarity for each sheet against common columns
  const sheetInclusion = {}
  sheetNames.forEach(sheetName => {
    const sheet = workbookData[sheetName]
    if (!sheet || !sheet.rows || !sheet.columns) {
      sheetInclusion[sheetName] = false
      return
    }
    
    const nonEmptyColumns = removeEmptyColumns(sheet.rows, sheet.columns)
    const normalizedColumns = new Set(nonEmptyColumns.map(normalizeColumnName).filter(c => c))
    
    if (normalizedColumns.size === 0) {
      sheetInclusion[sheetName] = false
      return
    }
    
    // If there are no common columns (all sheets are unique), include all
    if (commonColumns.size === 0) {
      sheetInclusion[sheetName] = true
      return
    }
    
    // Calculate how many of this sheet's columns are common columns
    let matchCount = 0
    normalizedColumns.forEach(col => {
      if (commonColumns.has(col)) {
        matchCount++
      }
    })
    
    const similarity = matchCount / normalizedColumns.size
    sheetInclusion[sheetName] = similarity >= threshold
  })
  
  return sheetInclusion
}

/**
 * Get sheets marked for inclusion
 * @param {Object} sheetInclusion - Object mapping sheet names to inclusion boolean
 * @returns {Array} Array of sheet names marked for inclusion
 */
export const getIncludedSheets = (sheetInclusion) => {
  return Object.keys(sheetInclusion).filter(name => sheetInclusion[name])
}

/**
 * Get sheets marked for exclusion
 * @param {Object} sheetInclusion - Object mapping sheet names to inclusion boolean
 * @returns {Array} Array of sheet names marked for exclusion
 */
export const getExcludedSheets = (sheetInclusion) => {
  return Object.keys(sheetInclusion).filter(name => !sheetInclusion[name])
}
