/**
 * Data Helper Utilities
 * 
 * This module provides functions for data transformation, filtering,
 * and column detection operations.
 */

import { normalizeValue } from './categoricalUtils'

/**
 * Auto-detect categorical columns based on unique value count
 * Columns with 5 or fewer unique values are considered categorical
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column names
 * @returns {string[]} Array of categorical column names
 */
export function detectCategoricalColumns(rows, columns) {
  const detected = []
  columns.forEach(col => {
    const uniqueValues = new Set(
      rows.map(row => row[col])
        .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
        .map(normalizeValue)
    )
    // Auto-detect as categorical if 5 or fewer unique values
    if (uniqueValues.size > 0 && uniqueValues.size <= 5) {
      detected.push(col)
    }
  })
  return detected
}

/**
 * Get rows for active sheet, handling '__ALL__' special case
 * @param {string} activeSheet - Active sheet name or '__ALL__'
 * @param {Object} workbookData - Workbook data object with sheets
 * @returns {Array} Array of rows
 */
export function getActiveSheetRows(activeSheet, workbookData) {
  if (activeSheet === '__ALL__') {
    return Object.values(workbookData).flatMap(s => s.rows)
  }
  return (activeSheet && workbookData[activeSheet]?.rows) || []
}

/**
 * Get columns for active sheet, handling '__ALL__' special case
 * @param {string} activeSheet - Active sheet name or '__ALL__'
 * @param {Object} workbookData - Workbook data object with sheets
 * @returns {string[]} Array of column names
 */
export function getActiveSheetColumns(activeSheet, workbookData) {
  if (activeSheet === '__ALL__') {
    return [...new Set(Object.values(workbookData).flatMap(s => s.columns))]
  }
  return (activeSheet && workbookData[activeSheet]?.columns) || []
}

/**
 * Apply categorical filters to rows
 * @param {Array} rows - Array of data rows
 * @param {Object} categoricalFilters - Object mapping column names to selected values
 * @returns {Array} Filtered array of rows
 */
export function applyCategoricalFilters(rows, categoricalFilters) {
  let filtered = rows
  
  Object.entries(categoricalFilters).forEach(([col, selectedValues]) => {
    if (selectedValues && selectedValues.length > 0) {
      filtered = filtered.filter(row => {
        const val = row[col]
        if (val === null || val === undefined) {
          return false
        }
        const normalized = normalizeValue(val)
        return selectedValues.includes(normalized)
      })
    }
  })
  
  return filtered
}

/**
 * Apply text search filter to rows
 * @param {Array} rows - Array of data rows
 * @param {string} searchText - Search text to filter by
 * @param {string[]} columns - Columns to search in
 * @returns {Array} Filtered array of rows
 */
export function applyTextSearchFilter(rows, searchText, columns) {
  if (!searchText.trim()) {
    return rows
  }
  
  const searchLower = searchText.toLowerCase().trim()
  
  return rows.filter(row => {
    return columns.some(col => {
      const val = row[col]
      if (val === null || val === undefined) {
        return false
      }
      return String(val).toLowerCase().includes(searchLower)
    })
  })
}
