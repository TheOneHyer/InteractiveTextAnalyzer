import { describe, it, expect } from 'vitest'
import {
  parseFlexibleDate,
  parseSheetMetadata,
  parseWorkbookMetadata,
  getAllTags,
  getAllDates,
  filterSheetsByTag,
  filterSheetsByDate
} from '../utils/sheetMetadataParser'

describe('parseFlexibleDate', () => {
  const currentYear = 2025
  
  it('should parse MM_DD format with underscores', () => {
    expect(parseFlexibleDate('10_6', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('12_25', currentYear)).toBe('2025-12-25')
  })
  
  it('should parse MM/DD format with slashes', () => {
    expect(parseFlexibleDate('10/6', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('12/25', currentYear)).toBe('2025-12-25')
  })
  
  it('should parse MM-DD format with dashes', () => {
    expect(parseFlexibleDate('10-6', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('12-25', currentYear)).toBe('2025-12-25')
  })
  
  it('should parse YYYY-MM-DD ISO format', () => {
    expect(parseFlexibleDate('2025-10-06', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('2024-12-25', currentYear)).toBe('2024-12-25')
  })
  
  it('should parse MM-DD-YYYY format', () => {
    expect(parseFlexibleDate('10-06-2025', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('12-25-2024', currentYear)).toBe('2024-12-25')
  })
  
  it('should handle single-digit months and days', () => {
    expect(parseFlexibleDate('1_5', currentYear)).toBe('2025-01-05')
    expect(parseFlexibleDate('3/9', currentYear)).toBe('2025-03-09')
  })
  
  it('should handle dots as separators', () => {
    expect(parseFlexibleDate('10.6', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('12.25', currentYear)).toBe('2025-12-25')
  })
  
  it('should return null for invalid dates', () => {
    expect(parseFlexibleDate('13-45', currentYear)).toBeNull()
    expect(parseFlexibleDate('2-30', currentYear)).toBeNull() // February 30th doesn't exist
    expect(parseFlexibleDate('invalid', currentYear)).toBeNull()
  })
  
  it('should handle leap years correctly', () => {
    expect(parseFlexibleDate('2-29-2024', 2024)).toBe('2024-02-29') // 2024 is a leap year
    expect(parseFlexibleDate('2-29-2023', 2023)).toBeNull() // 2023 is not a leap year
  })
  
  it('should return null for empty or null input', () => {
    expect(parseFlexibleDate('', currentYear)).toBeNull()
    expect(parseFlexibleDate(null, currentYear)).toBeNull()
  })
  
  it('should handle whitespace', () => {
    expect(parseFlexibleDate('  10 / 6  ', currentYear)).toBe('2025-10-06')
    expect(parseFlexibleDate('10 - 6', currentYear)).toBe('2025-10-06')
  })
})

describe('parseSheetMetadata', () => {
  it('should parse sheet name with date and tags using default delimiters', () => {
    const result = parseSheetMetadata('Data_10_6_Analysis')
    expect(result.originalName).toBe('Data_10_6_Analysis')
    expect(result.date).toBe('2025-10-06')
    expect(result.tags).toContain('Data')
    expect(result.tags).toContain('Analysis')
  })
  
  it('should parse sheet name with only tags', () => {
    const result = parseSheetMetadata('Sales_Report_Q1')
    expect(result.tags).toContain('Sales')
    expect(result.tags).toContain('Report')
    expect(result.tags).toContain('Q1')
  })
  
  it('should handle case sensitivity', () => {
    const caseSensitive = parseSheetMetadata('Data_Analysis', { caseSensitive: true })
    const caseInsensitive = parseSheetMetadata('Data_Analysis', { caseSensitive: false })
    
    expect(caseSensitive.tags).toContain('Data')
    expect(caseSensitive.tags).toContain('Analysis')
    expect(caseInsensitive.tags).toContain('data')
    expect(caseInsensitive.tags).toContain('analysis')
  })
  
  it('should use custom delimiters', () => {
    const result = parseSheetMetadata('Data|10/6|Analysis', { delimiters: ['|'] })
    expect(result.tags).toContain('Data')
    expect(result.tags).toContain('Analysis')
    expect(result.date).toBe('2025-10-06')
  })
  
  it('should disable date parsing when parseDates is false', () => {
    const result = parseSheetMetadata('Data_10_6_Analysis', { parseDates: false })
    expect(result.date).toBeNull()
    expect(result.tags).toContain('Data')
    expect(result.tags).toContain('10')
    expect(result.tags).toContain('6')
    expect(result.tags).toContain('Analysis')
  })
  
  it('should disable tag extraction when extractTags is false', () => {
    const result = parseSheetMetadata('Data_10_6_Analysis', { extractTags: false })
    expect(result.tags).toEqual([])
  })
  
  it('should handle empty sheet name', () => {
    const result = parseSheetMetadata('')
    expect(result.originalName).toBe('')
    expect(result.tags).toEqual([])
    expect(result.date).toBeNull()
  })
  
  it('should parse complex sheet names with multiple dates', () => {
    const result = parseSheetMetadata('Report_2024-10-06_vs_2024-11-15')
    expect(result.date).toBe('2024-10-06') // Should capture first valid date
    expect(result.tags).toContain('Report')
  })
  
  it('should handle sheet names with hyphens as delimiters', () => {
    const result = parseSheetMetadata('Sales-2024-Q4-Final')
    expect(result.tags).toContain('Sales')
    expect(result.tags).toContain('Q4')
    expect(result.tags).toContain('Final')
  })
  
  it('should handle sheet names with spaces', () => {
    const result = parseSheetMetadata('Sales Report 10 6', { delimiters: [' '] })
    expect(result.tags).toContain('Sales')
    expect(result.tags).toContain('Report')
    expect(result.date).toBe('2025-10-06')
  })
})

describe('parseWorkbookMetadata', () => {
  it('should parse metadata for all sheets in workbook', () => {
    const workbookData = {
      'Data_10_6': { rows: [], columns: [] },
      'Report_11_15': { rows: [], columns: [] },
      'Summary': { rows: [], columns: [] }
    }
    
    const metadata = parseWorkbookMetadata(workbookData)
    
    expect(metadata['Data_10_6'].date).toBe('2025-10-06')
    expect(metadata['Report_11_15'].date).toBe('2025-11-15')
    expect(metadata['Summary'].date).toBeNull()
    expect(metadata['Summary'].tags).toContain('Summary')
  })
  
  it('should apply custom options to all sheets', () => {
    const workbookData = {
      'Data_Analysis': { rows: [], columns: [] },
      'Sales_Report': { rows: [], columns: [] }
    }
    
    const metadata = parseWorkbookMetadata(workbookData, { caseSensitive: true })
    
    expect(metadata['Data_Analysis'].tags).toContain('Data')
    expect(metadata['Sales_Report'].tags).toContain('Sales')
  })
})

describe('getAllTags', () => {
  it('should return all unique tags from workbook metadata', () => {
    const metadata = {
      'Sheet1': { tags: ['Data', 'Sales'], date: null },
      'Sheet2': { tags: ['Report', 'Sales'], date: null },
      'Sheet3': { tags: ['Analysis'], date: null }
    }
    
    const tags = getAllTags(metadata)
    
    expect(tags).toContain('Data')
    expect(tags).toContain('Sales')
    expect(tags).toContain('Report')
    expect(tags).toContain('Analysis')
    expect(tags.length).toBe(4)
  })
  
  it('should handle metadata with no tags', () => {
    const metadata = {
      'Sheet1': { tags: [], date: null },
      'Sheet2': { tags: [], date: null }
    }
    
    const tags = getAllTags(metadata)
    expect(tags).toEqual([])
  })
  
  it('should return sorted tags', () => {
    const metadata = {
      'Sheet1': { tags: ['Zebra', 'Apple'], date: null },
      'Sheet2': { tags: ['Banana'], date: null }
    }
    
    const tags = getAllTags(metadata)
    expect(tags).toEqual(['Apple', 'Banana', 'Zebra'])
  })
})

describe('getAllDates', () => {
  it('should return all unique dates from workbook metadata', () => {
    const metadata = {
      'Sheet1': { tags: [], date: '2025-10-06' },
      'Sheet2': { tags: [], date: '2025-11-15' },
      'Sheet3': { tags: [], date: '2025-10-06' }
    }
    
    const dates = getAllDates(metadata)
    
    expect(dates).toContain('2025-10-06')
    expect(dates).toContain('2025-11-15')
    expect(dates.length).toBe(2)
  })
  
  it('should handle metadata with no dates', () => {
    const metadata = {
      'Sheet1': { tags: ['Data'], date: null },
      'Sheet2': { tags: ['Report'], date: null }
    }
    
    const dates = getAllDates(metadata)
    expect(dates).toEqual([])
  })
  
  it('should return sorted dates', () => {
    const metadata = {
      'Sheet1': { tags: [], date: '2025-12-01' },
      'Sheet2': { tags: [], date: '2025-10-15' },
      'Sheet3': { tags: [], date: '2025-11-20' }
    }
    
    const dates = getAllDates(metadata)
    expect(dates).toEqual(['2025-10-15', '2025-11-20', '2025-12-01'])
  })
})

describe('filterSheetsByTag', () => {
  const metadata = {
    'Sales_Report': { tags: ['Sales', 'Report'], date: null },
    'Sales_Data': { tags: ['Sales', 'Data'], date: null },
    'Analysis_Report': { tags: ['Analysis', 'Report'], date: null }
  }
  
  it('should filter sheets by tag', () => {
    const sheets = filterSheetsByTag(metadata, 'Sales')
    expect(sheets).toContain('Sales_Report')
    expect(sheets).toContain('Sales_Data')
    expect(sheets.length).toBe(2)
  })
  
  it('should handle case sensitivity', () => {
    const caseSensitive = filterSheetsByTag(metadata, 'sales', true)
    const caseInsensitive = filterSheetsByTag(metadata, 'sales', false)
    
    expect(caseSensitive.length).toBe(0)
    expect(caseInsensitive.length).toBe(2)
  })
  
  it('should return empty array if no matches', () => {
    const sheets = filterSheetsByTag(metadata, 'NonExistent')
    expect(sheets).toEqual([])
  })
})

describe('filterSheetsByDate', () => {
  const metadata = {
    'Sheet1': { tags: [], date: '2025-10-06' },
    'Sheet2': { tags: [], date: '2025-11-15' },
    'Sheet3': { tags: [], date: '2025-10-06' }
  }
  
  it('should filter sheets by date', () => {
    const sheets = filterSheetsByDate(metadata, '2025-10-06')
    expect(sheets).toContain('Sheet1')
    expect(sheets).toContain('Sheet3')
    expect(sheets.length).toBe(2)
  })
  
  it('should return empty array if no matches', () => {
    const sheets = filterSheetsByDate(metadata, '2025-12-01')
    expect(sheets).toEqual([])
  })
  
  it('should return empty array for null date', () => {
    const sheets = filterSheetsByDate(metadata, null)
    expect(sheets).toEqual([])
  })
})
