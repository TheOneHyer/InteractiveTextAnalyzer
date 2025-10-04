/**
 * Security utilities for input sanitization and validation
 * These functions run automatically in the background to protect users
 * from potentially malicious content in uploaded files
 */

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Maximum cell content length to prevent DoS
const MAX_CELL_LENGTH = 10000

// Maximum column name length
const MAX_COLUMN_NAME_LENGTH = 200

// Regex patterns for detecting potential threats
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const HTML_TAG_PATTERN = /<[^>]+>/g
const FORMULA_INJECTION_PATTERN = /^[=+\-@]/

/**
 * Sanitizes a string by removing HTML tags and script content
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return String(input)
  }
  
  // Remove script tags and their content
  let sanitized = input.replace(SCRIPT_PATTERN, '')
  
  // Remove HTML tags
  sanitized = sanitized.replace(HTML_TAG_PATTERN, '')
  
  // Trim and limit length
  sanitized = sanitized.slice(0, MAX_CELL_LENGTH)
  
  return sanitized
}

/**
 * Sanitizes cell content to prevent formula injection attacks
 * Formula injection (CSV injection) occurs when cells start with =, +, -, or @
 * @param {*} value - The cell value to sanitize
 * @returns {string} - Sanitized cell value
 */
export const sanitizeCellValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  
  let sanitized = sanitizeString(value)
  
  // Prevent formula injection by prefixing dangerous characters with a space
  if (FORMULA_INJECTION_PATTERN.test(sanitized)) {
    sanitized = ' ' + sanitized
  }
  
  return sanitized
}

/**
 * Sanitizes column names to prevent XSS and injection attacks
 * @param {string} columnName - The column name to sanitize
 * @returns {string} - Sanitized column name
 */
export const sanitizeColumnName = (columnName) => {
  if (typeof columnName !== 'string') {
    return String(columnName)
  }
  
  let sanitized = sanitizeString(columnName)
  
  // Remove any remaining special characters that could be problematic
  sanitized = sanitized.replace(/[<>'"]/g, '')
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, MAX_COLUMN_NAME_LENGTH)
  
  // Ensure we have at least a basic column name
  if (!sanitized) {
    sanitized = 'Column'
  }
  
  return sanitized
}

/**
 * Validates file size to prevent DoS attacks
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file size is acceptable
 */
export const validateFileSize = (file) => {
  if (!file || !file.size) {
    return false
  }
  return file.size <= MAX_FILE_SIZE
}

/**
 * Validates file extension
 * @param {string} filename - The filename to validate
 * @returns {boolean} - True if extension is allowed
 */
export const validateFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return false
  }
  
  const ext = filename.split('.').pop().toLowerCase()
  const allowedExtensions = ['csv', 'xlsx', 'xls']
  return allowedExtensions.includes(ext)
}

/**
 * Sanitizes filename to prevent path traversal attacks
 * @param {string} filename - The filename to sanitize
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'file'
  }
  
  // Remove path separators and null bytes
  let sanitized = filename.replace(/[/\\.\0]/g, '_')
  
  // Remove any non-alphanumeric characters except underscore and hyphen
  sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '')
  
  // Limit length
  sanitized = sanitized.slice(0, 100)
  
  if (!sanitized) {
    sanitized = 'file'
  }
  
  return sanitized
}

/**
 * Sanitizes data from localStorage to prevent injection attacks
 * @param {string} jsonString - JSON string from localStorage
 * @returns {object|null} - Parsed and sanitized object or null if invalid
 */
export const sanitizeLocalStorageData = (jsonString) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return null
  }
  
  try {
    const parsed = JSON.parse(jsonString)
    
    // Validate and sanitize the structure
    const sanitized = {}
    
    // Sanitize array fields
    if (Array.isArray(parsed.selectedColumns)) {
      sanitized.selectedColumns = parsed.selectedColumns
        .filter(c => typeof c === 'string')
        .map(sanitizeColumnName)
    }
    
    if (Array.isArray(parsed.hiddenColumns)) {
      sanitized.hiddenColumns = parsed.hiddenColumns
        .filter(c => typeof c === 'string')
        .map(sanitizeColumnName)
    }
    
    if (Array.isArray(parsed.stopwords)) {
      sanitized.stopwords = parsed.stopwords
        .filter(s => typeof s === 'string')
        .map(s => sanitizeString(s).toLowerCase())
    }
    
    // Sanitize string fields
    if (typeof parsed.analysisType === 'string') {
      const validTypes = ['tfidf', 'ngram', 'assoc', 'ner']
      if (validTypes.includes(parsed.analysisType)) {
        sanitized.analysisType = parsed.analysisType
      }
    }
    
    if (typeof parsed.viewMode === 'string') {
      const validModes = ['list', 'wordcloud', 'network', 'heatmap']
      if (validModes.includes(parsed.viewMode)) {
        sanitized.viewMode = parsed.viewMode
      }
    }
    
    // Sanitize numeric fields
    if (typeof parsed.ngramN === 'number' && parsed.ngramN >= 1 && parsed.ngramN <= 10) {
      sanitized.ngramN = parsed.ngramN
    }
    
    if (typeof parsed.minSupport === 'number' && parsed.minSupport >= 0 && parsed.minSupport <= 1) {
      sanitized.minSupport = parsed.minSupport
    }
    
    // Sanitize boolean fields
    if (typeof parsed.enableStemming === 'boolean') {
      sanitized.enableStemming = parsed.enableStemming
    }
    
    // Sanitize renames object
    if (parsed.renames && typeof parsed.renames === 'object') {
      sanitized.renames = {}
      Object.entries(parsed.renames).forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          sanitized.renames[sanitizeColumnName(key)] = sanitizeColumnName(value)
        }
      })
    }
    
    return sanitized
  } catch (err) {
    // Invalid JSON, return null
    console.warn('Failed to parse localStorage data:', err)
    return null
  }
}

/**
 * Sanitizes a row object by sanitizing all its values
 * @param {object} row - Row object with column-value pairs
 * @returns {object} - Sanitized row object
 */
export const sanitizeRow = (row) => {
  if (!row || typeof row !== 'object') {
    return {}
  }
  
  const sanitized = {}
  Object.entries(row).forEach(([key, value]) => {
    sanitized[sanitizeColumnName(key)] = sanitizeCellValue(value)
  })
  
  return sanitized
}

/**
 * Validates and sanitizes worksheet data
 * @param {object} worksheetData - Object containing rows and columns
 * @returns {object} - Sanitized worksheet data
 */
export const sanitizeWorksheetData = (worksheetData) => {
  if (!worksheetData || typeof worksheetData !== 'object') {
    return { rows: [], columns: [] }
  }
  
  const sanitizedColumns = Array.isArray(worksheetData.columns)
    ? worksheetData.columns.map(sanitizeColumnName)
    : []
  
  const sanitizedRows = Array.isArray(worksheetData.rows)
    ? worksheetData.rows.map(sanitizeRow)
    : []
  
  return {
    rows: sanitizedRows,
    columns: sanitizedColumns
  }
}
