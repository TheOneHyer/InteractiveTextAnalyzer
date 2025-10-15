/**
 * Sheet Metadata Parser Utilities
 * 
 * Provides utilities for parsing metadata from Excel sheet names,
 * including text tags and flexible date parsing.
 */

/**
 * Parse a flexible date string into a standard ISO date
 * Supports various formats:
 * - 10_6 -> 2025-10-06
 * - 10/6 -> 2025-10-06
 * - 2025-10-06 -> 2025-10-06
 * - 10-6 -> 2025-10-06
 * - 06_10_2025 -> 2025-10-06
 * - etc.
 * 
 * @param {string} dateStr - Date string to parse
 * @param {number} currentYear - Current year to use if year not specified
 * @returns {string|null} ISO formatted date (YYYY-MM-DD) or null if invalid
 */
export function parseFlexibleDate(dateStr, currentYear = new Date().getFullYear()) {
  if (!dateStr) return null
  
  // Clean the string - replace common separators with a standard separator
  const cleaned = String(dateStr).trim()
    .replace(/[\/\-_\.]/g, '-')
    .replace(/\s+/g, '-')
  
  // Try to parse as ISO format first (YYYY-MM-DD)
  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    const y = parseInt(year, 10)
    const m = parseInt(month, 10)
    const d = parseInt(day, 10)
    
    if (isValidDate(y, m, d)) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }
  
  // Try to parse as DD-MM-YYYY or MM-DD-YYYY
  const fullDateMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (fullDateMatch) {
    const [, first, second, year] = fullDateMatch
    const y = parseInt(year, 10)
    const n1 = parseInt(first, 10)
    const n2 = parseInt(second, 10)
    
    // Try MM-DD-YYYY first (more common in US)
    if (isValidDate(y, n1, n2)) {
      return `${y}-${String(n1).padStart(2, '0')}-${String(n2).padStart(2, '0')}`
    }
    
    // Try DD-MM-YYYY
    if (isValidDate(y, n2, n1)) {
      return `${y}-${String(n2).padStart(2, '0')}-${String(n1).padStart(2, '0')}`
    }
  }
  
  // Try to parse as M-D (without year) or MM-DD
  const shortDateMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})$/)
  if (shortDateMatch) {
    const [, first, second] = shortDateMatch
    const n1 = parseInt(first, 10)
    const n2 = parseInt(second, 10)
    
    // Try MM-DD format with current year
    if (isValidDate(currentYear, n1, n2)) {
      return `${currentYear}-${String(n1).padStart(2, '0')}-${String(n2).padStart(2, '0')}`
    }
    
    // Try DD-MM format with current year
    if (isValidDate(currentYear, n2, n1)) {
      return `${currentYear}-${String(n2).padStart(2, '0')}-${String(n1).padStart(2, '0')}`
    }
  }
  
  return null
}

/**
 * Check if year, month, day form a valid date
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {number} day - Day (1-31)
 * @returns {boolean} True if valid date
 */
function isValidDate(year, month, day) {
  if (month < 1 || month > 12) return false
  if (day < 1) return false
  
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  
  // Check for leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  if (isLeapYear) {
    daysInMonth[1] = 29
  }
  
  return day <= daysInMonth[month - 1]
}

/**
 * Parse metadata from a sheet name using configurable options
 * 
 * @param {string} sheetName - Sheet name to parse
 * @param {Object} options - Parser options
 * @param {string[]} options.delimiters - Delimiters to split on (default: ['_', '-', ' '])
 * @param {boolean} options.caseSensitive - Case sensitive parsing (default: false)
 * @param {boolean} options.parseDates - Try to parse date components (default: true)
 * @param {boolean} options.extractTags - Extract text tags (default: true)
 * @returns {Object} Parsed metadata
 */
export function parseSheetMetadata(sheetName, options = {}) {
  const {
    delimiters = ['_', '-', ' '],
    caseSensitive = false,
    parseDates = true,
    extractTags = true
  } = options
  
  if (!sheetName) {
    return {
      originalName: '',
      tags: [],
      date: null,
      components: []
    }
  }
  
  const workingName = caseSensitive ? sheetName : sheetName.toLowerCase()
  
  // Create a regex pattern from delimiters
  const delimiterPattern = delimiters.map(d => 
    d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  ).join('|')
  const splitRegex = new RegExp(`(${delimiterPattern})`)
  
  // Split the name while preserving delimiters for reconstruction
  const parts = sheetName.split(new RegExp(delimiterPattern))
    .map(p => p.trim())
    .filter(p => p.length > 0)
  
  const result = {
    originalName: sheetName,
    tags: [],
    date: null,
    components: []
  }
  
  // Try to find and parse dates
  if (parseDates) {
    for (const part of parts) {
      const parsedDate = parseFlexibleDate(part)
      if (parsedDate) {
        result.date = parsedDate
        result.components.push({ type: 'date', value: parsedDate, original: part })
        continue
      }
      
      // Check if this looks like a date component (only digits and separators)
      if (/^[\d\/\-_\.]+$/.test(part)) {
        result.components.push({ type: 'date-like', value: part, original: part })
      } else if (extractTags) {
        result.tags.push(part)
        result.components.push({ type: 'tag', value: part, original: part })
      }
    }
  } else if (extractTags) {
    // Just extract all parts as tags
    for (const part of parts) {
      result.tags.push(part)
      result.components.push({ type: 'tag', value: part, original: part })
    }
  }
  
  return result
}

/**
 * Parse metadata from all sheets in a workbook
 * 
 * @param {Object} workbookData - Workbook data object with sheet names as keys
 * @param {Object} options - Parser options (same as parseSheetMetadata)
 * @returns {Object} Object mapping sheet names to parsed metadata
 */
export function parseWorkbookMetadata(workbookData, options = {}) {
  const metadata = {}
  
  Object.keys(workbookData).forEach(sheetName => {
    metadata[sheetName] = parseSheetMetadata(sheetName, options)
  })
  
  return metadata
}

/**
 * Get all unique tags across all sheets
 * 
 * @param {Object} workbookMetadata - Workbook metadata from parseWorkbookMetadata
 * @returns {string[]} Array of unique tags
 */
export function getAllTags(workbookMetadata) {
  const tagSet = new Set()
  
  Object.values(workbookMetadata).forEach(metadata => {
    if (metadata.tags) {
      metadata.tags.forEach(tag => tagSet.add(tag))
    }
  })
  
  return Array.from(tagSet).sort()
}

/**
 * Get all dates across all sheets
 * 
 * @param {Object} workbookMetadata - Workbook metadata from parseWorkbookMetadata
 * @returns {string[]} Array of unique ISO dates
 */
export function getAllDates(workbookMetadata) {
  const dateSet = new Set()
  
  Object.values(workbookMetadata).forEach(metadata => {
    if (metadata.date) {
      dateSet.add(metadata.date)
    }
  })
  
  return Array.from(dateSet).sort()
}

/**
 * Filter sheets by tag
 * 
 * @param {Object} workbookMetadata - Workbook metadata from parseWorkbookMetadata
 * @param {string} tag - Tag to filter by
 * @param {boolean} caseSensitive - Case sensitive comparison
 * @returns {string[]} Array of sheet names matching the tag
 */
export function filterSheetsByTag(workbookMetadata, tag, caseSensitive = false) {
  const compareTag = caseSensitive ? tag : tag.toLowerCase()
  const sheets = []
  
  Object.entries(workbookMetadata).forEach(([sheetName, metadata]) => {
    if (metadata.tags) {
      const hasTag = metadata.tags.some(t => {
        const compareWith = caseSensitive ? t : t.toLowerCase()
        return compareWith === compareTag
      })
      
      if (hasTag) {
        sheets.push(sheetName)
      }
    }
  })
  
  return sheets
}

/**
 * Filter sheets by date
 * 
 * @param {Object} workbookMetadata - Workbook metadata from parseWorkbookMetadata
 * @param {string} date - ISO date string to filter by
 * @returns {string[]} Array of sheet names matching the date
 */
export function filterSheetsByDate(workbookMetadata, date) {
  const sheets = []
  
  Object.entries(workbookMetadata).forEach(([sheetName, metadata]) => {
    if (metadata.date === date) {
      sheets.push(sheetName)
    }
  })
  
  return sheets
}
