/**
 * Centralized Categorical Data Utilities
 * 
 * This module provides utilities for handling categorical data including
 * normalization, synonym detection, and value extraction.
 */

/**
 * Normalize a value with synonym detection (for categorical filtering)
 * Maps common boolean-like values to standardized forms
 * @param {*} val - Value to normalize
 * @returns {string|null} Normalized string value or null
 */
export const normalizeValue = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).toLowerCase().trim()
  
  // Map synonyms for common boolean-like values
  const synonymMap = {
    'y': 'yes', 'yes': 'yes', 'true': 'yes', '1': 'yes', 't': 'yes',
    'n': 'no', 'no': 'no', 'false': 'no', '0': 'no', 'f': 'no'
  }
  
  return synonymMap[str] || str
}

/**
 * Get unique categorical values for a column
 * @param {Array} rows - Array of data rows
 * @param {string} column - Column name to extract values from
 * @returns {string[]} Sorted array of unique normalized values
 */
export const getCategoricalValues = (rows, column) => {
  const values = rows
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
  
  const uniqueNormalized = new Set(values.map(normalizeValue))
  return Array.from(uniqueNormalized).sort()
}
