import { describe, it, expect, beforeEach } from 'vitest'
import {
  normalizeColumnName,
  removeEmptyColumns,
  calculateColumnNameFrequency,
  calculateSheetSimilarity,
  autoDetectSheetsForAnalysis,
  getIncludedSheets,
  getExcludedSheets
} from '../utils/sheetUtils'

describe('Sheet Management Utilities', () => {
  describe('normalizeColumnName', () => {
    it('should normalize column name to lowercase', () => {
      expect(normalizeColumnName('ProductName')).toBe('productname')
      expect(normalizeColumnName('CUSTOMER_ID')).toBe('customerid')
    })

    it('should remove special characters', () => {
      expect(normalizeColumnName('Product-Name')).toBe('productname')
      expect(normalizeColumnName('Customer_ID')).toBe('customerid')
      expect(normalizeColumnName('Price ($)')).toBe('price')
    })

    it('should trim whitespace', () => {
      expect(normalizeColumnName('  Product Name  ')).toBe('productname')
    })

    it('should handle empty or null inputs', () => {
      expect(normalizeColumnName('')).toBe('')
      expect(normalizeColumnName(null)).toBe('')
      expect(normalizeColumnName(undefined)).toBe('')
    })
  })

  describe('removeEmptyColumns', () => {
    it('should remove columns with all null values', () => {
      const rows = [
        { col1: 'a', col2: null, col3: 'c' },
        { col1: 'b', col2: null, col3: 'd' }
      ]
      const columns = ['col1', 'col2', 'col3']
      const result = removeEmptyColumns(rows, columns)
      expect(result).toEqual(['col1', 'col3'])
    })

    it('should remove columns with all undefined values', () => {
      const rows = [
        { col1: 'a', col2: undefined, col3: 'c' },
        { col1: 'b', col2: undefined, col3: 'd' }
      ]
      const columns = ['col1', 'col2', 'col3']
      const result = removeEmptyColumns(rows, columns)
      expect(result).toEqual(['col1', 'col3'])
    })

    it('should remove columns with all empty strings', () => {
      const rows = [
        { col1: 'a', col2: '', col3: 'c' },
        { col1: 'b', col2: '  ', col3: 'd' }
      ]
      const columns = ['col1', 'col2', 'col3']
      const result = removeEmptyColumns(rows, columns)
      expect(result).toEqual(['col1', 'col3'])
    })

    it('should keep columns with at least one non-empty value', () => {
      const rows = [
        { col1: 'a', col2: '', col3: 'c' },
        { col1: 'b', col2: 'x', col3: 'd' }
      ]
      const columns = ['col1', 'col2', 'col3']
      const result = removeEmptyColumns(rows, columns)
      expect(result).toEqual(['col1', 'col2', 'col3'])
    })

    it('should handle empty rows array', () => {
      const columns = ['col1', 'col2', 'col3']
      const result = removeEmptyColumns([], columns)
      expect(result).toEqual(columns)
    })

    it('should handle null or undefined inputs', () => {
      expect(removeEmptyColumns(null, ['col1'])).toEqual(['col1'])
      expect(removeEmptyColumns([{ col1: 'a' }], null)).toEqual(null)
    })
  })

  describe('calculateColumnNameFrequency', () => {
    it('should count column names across multiple sheets', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'name', 'price'],
          rows: [
            { id: 1, name: 'Item1', price: 10 }
          ]
        },
        Sheet2: {
          columns: ['id', 'name', 'quantity'],
          rows: [
            { id: 2, name: 'Item2', quantity: 5 }
          ]
        }
      }
      const frequency = calculateColumnNameFrequency(workbookData)
      expect(frequency.get('id')).toBe(2)
      expect(frequency.get('name')).toBe(2)
      expect(frequency.get('price')).toBe(1)
      expect(frequency.get('quantity')).toBe(1)
    })

    it('should normalize column names when counting', () => {
      const workbookData = {
        Sheet1: {
          columns: ['Product-ID', 'Product_Name'],
          rows: [
            { 'Product-ID': 1, 'Product_Name': 'Item1' }
          ]
        },
        Sheet2: {
          columns: ['ProductID', 'ProductName'],
          rows: [
            { ProductID: 2, ProductName: 'Item2' }
          ]
        }
      }
      const frequency = calculateColumnNameFrequency(workbookData)
      expect(frequency.get('productid')).toBe(2)
      expect(frequency.get('productname')).toBe(2)
    })

    it('should exclude empty columns from count', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'empty', 'name'],
          rows: [
            { id: 1, empty: '', name: 'Item1' },
            { id: 2, empty: null, name: 'Item2' }
          ]
        }
      }
      const frequency = calculateColumnNameFrequency(workbookData)
      expect(frequency.get('id')).toBe(1)
      expect(frequency.get('name')).toBe(1)
      expect(frequency.has('empty')).toBe(false)
    })

    it('should handle empty workbook', () => {
      const frequency = calculateColumnNameFrequency({})
      expect(frequency.size).toBe(0)
    })

    it('should handle sheets with missing data', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'name'],
          rows: [{ id: 1, name: 'Item1' }]
        },
        Sheet2: null,
        Sheet3: {
          columns: null,
          rows: null
        }
      }
      const frequency = calculateColumnNameFrequency(workbookData)
      expect(frequency.get('id')).toBe(1)
      expect(frequency.get('name')).toBe(1)
    })
  })

  describe('calculateSheetSimilarity', () => {
    let globalFrequency

    beforeEach(() => {
      globalFrequency = new Map()
      globalFrequency.set('id', 3)
      globalFrequency.set('name', 3)
      globalFrequency.set('price', 2)
      globalFrequency.set('quantity', 2)
    })

    it('should calculate 100% similarity when all columns match', () => {
      const rows = [{ id: 1, name: 'Item', price: 10 }]
      const columns = ['id', 'name', 'price']
      const similarity = calculateSheetSimilarity(rows, columns, globalFrequency)
      expect(similarity).toBe(1.0)
    })

    it('should calculate 0% similarity when no columns match', () => {
      const rows = [{ metadata: 'test', info: 'data' }]
      const columns = ['metadata', 'info']
      const similarity = calculateSheetSimilarity(rows, columns, globalFrequency)
      expect(similarity).toBe(0.0)
    })

    it('should calculate 75% similarity when 3 of 4 columns match', () => {
      const rows = [{ id: 1, name: 'Item', price: 10, metadata: 'test' }]
      const columns = ['id', 'name', 'price', 'metadata']
      const similarity = calculateSheetSimilarity(rows, columns, globalFrequency)
      expect(similarity).toBe(0.75)
    })

    it('should calculate 50% similarity when 2 of 4 columns match', () => {
      const rows = [{ id: 1, name: 'Item', foo: 10, bar: 'test' }]
      const columns = ['id', 'name', 'foo', 'bar']
      const similarity = calculateSheetSimilarity(rows, columns, globalFrequency)
      expect(similarity).toBe(0.5)
    })

    it('should normalize column names before comparing', () => {
      const rows = [{ 'Product-ID': 1, 'Product_Name': 'Item' }]
      const columns = ['Product-ID', 'Product_Name']
      
      const normalizedFrequency = new Map()
      normalizedFrequency.set('productid', 2)
      normalizedFrequency.set('productname', 2)
      
      const similarity = calculateSheetSimilarity(rows, columns, normalizedFrequency)
      expect(similarity).toBe(1.0)
    })

    it('should exclude empty columns from similarity calculation', () => {
      const rows = [
        { id: 1, name: 'Item', empty: '', metadata: 'test' },
        { id: 2, name: 'Item2', empty: null, metadata: 'test2' }
      ]
      const columns = ['id', 'name', 'empty', 'metadata']
      
      // Only id and name are in global frequency
      const similarity = calculateSheetSimilarity(rows, columns, globalFrequency)
      // 2 matches (id, name) out of 3 non-empty columns (id, name, metadata) = 2/3 ≈ 0.667
      expect(similarity).toBeCloseTo(0.667, 2)
    })

    it('should return 0 for empty columns array', () => {
      const similarity = calculateSheetSimilarity([{ id: 1 }], [], globalFrequency)
      expect(similarity).toBe(0)
    })

    it('should return 0 for null or undefined inputs', () => {
      expect(calculateSheetSimilarity(null, ['id'], globalFrequency)).toBe(0)
      expect(calculateSheetSimilarity([{ id: 1 }], null, globalFrequency)).toBe(0)
      expect(calculateSheetSimilarity([{ id: 1 }], ['id'], new Map())).toBe(0)
    })

    it('should return 0 when all columns are empty', () => {
      const rows = [
        { col1: '', col2: null },
        { col1: '  ', col2: undefined }
      ]
      const columns = ['col1', 'col2']
      const similarity = calculateSheetSimilarity(rows, columns, globalFrequency)
      expect(similarity).toBe(0)
    })
  })

  describe('autoDetectSheetsForAnalysis', () => {
    it('should include single sheet by default', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'name'],
          rows: [{ id: 1, name: 'Item' }]
        }
      }
      const result = autoDetectSheetsForAnalysis(workbookData)
      expect(result).toEqual({ Sheet1: true })
    })

    it('should include sheets with >= 75% similarity', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'name', 'price'],
          rows: [{ id: 1, name: 'Item1', price: 10 }]
        },
        Sheet2: {
          columns: ['id', 'name', 'quantity'],
          rows: [{ id: 2, name: 'Item2', quantity: 5 }]
        },
        Metadata: {
          columns: ['author', 'created', 'version'],
          rows: [{ author: 'John', created: '2024-01-01', version: '1.0' }]
        }
      }
      // With 3 sheets, common columns are {id, name} (appear in 2/3 sheets)
      // Sheet1: 2/3 = 66.7% match, Sheet2: 2/3 = 66.7% match
      // Use 60% threshold to include data sheets and exclude metadata
      const result = autoDetectSheetsForAnalysis(workbookData, 0.6)
      expect(result.Sheet1).toBe(true)
      expect(result.Sheet2).toBe(true)
      expect(result.Metadata).toBe(false)
    })

    it('should use custom threshold when provided', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'name', 'price', 'quantity'],
          rows: [{ id: 1, name: 'Item', price: 10, quantity: 5 }]
        },
        Sheet2: {
          columns: ['id', 'name', 'metadata'],
          rows: [{ id: 2, name: 'Item', metadata: 'test' }]
        }
      }
      
      // Common columns (appear in both): {id, name}
      // Sheet1: 2/4 = 50%, Sheet2: 2/3 = 66.7%
      
      // With 50% threshold, both should be included
      const result = autoDetectSheetsForAnalysis(workbookData, 0.5)
      expect(result.Sheet1).toBe(true)
      expect(result.Sheet2).toBe(true)
      
      // With 60% threshold, only Sheet2 should be included (66.7% > 60%)
      const result2 = autoDetectSheetsForAnalysis(workbookData, 0.6)
      expect(result2.Sheet1).toBe(false)
      expect(result2.Sheet2).toBe(true)
    })

    it('should exclude sheets with all empty columns', () => {
      const workbookData = {
        Sheet1: {
          columns: ['id', 'name'],
          rows: [{ id: 1, name: 'Item' }]
        },
        EmptySheet: {
          columns: ['col1', 'col2'],
          rows: [
            { col1: '', col2: null },
            { col1: null, col2: '' }
          ]
        }
      }
      const result = autoDetectSheetsForAnalysis(workbookData)
      expect(result.Sheet1).toBe(true)
      expect(result.EmptySheet).toBe(false)
    })

    it('should handle sheets with missing or invalid data', () => {
      const workbookData = {
        ValidSheet: {
          columns: ['id', 'name'],
          rows: [{ id: 1, name: 'Item' }]
        },
        NullSheet: null,
        InvalidSheet: {
          columns: null,
          rows: null
        }
      }
      const result = autoDetectSheetsForAnalysis(workbookData)
      expect(result.ValidSheet).toBe(true)
      expect(result.NullSheet).toBe(false)
      expect(result.InvalidSheet).toBe(false)
    })

    it('should handle empty workbook', () => {
      const result = autoDetectSheetsForAnalysis({})
      expect(result).toEqual({})
    })
  })

  describe('getIncludedSheets', () => {
    it('should return array of sheets marked for inclusion', () => {
      const sheetInclusion = {
        Sheet1: true,
        Sheet2: true,
        Metadata: false,
        Info: false
      }
      const result = getIncludedSheets(sheetInclusion)
      expect(result).toEqual(['Sheet1', 'Sheet2'])
    })

    it('should return empty array when no sheets included', () => {
      const sheetInclusion = {
        Sheet1: false,
        Sheet2: false
      }
      const result = getIncludedSheets(sheetInclusion)
      expect(result).toEqual([])
    })

    it('should handle empty object', () => {
      const result = getIncludedSheets({})
      expect(result).toEqual([])
    })
  })

  describe('getExcludedSheets', () => {
    it('should return array of sheets marked for exclusion', () => {
      const sheetInclusion = {
        Sheet1: true,
        Sheet2: true,
        Metadata: false,
        Info: false
      }
      const result = getExcludedSheets(sheetInclusion)
      expect(result).toEqual(['Metadata', 'Info'])
    })

    it('should return empty array when all sheets included', () => {
      const sheetInclusion = {
        Sheet1: true,
        Sheet2: true
      }
      const result = getExcludedSheets(sheetInclusion)
      expect(result).toEqual([])
    })

    it('should handle empty object', () => {
      const result = getExcludedSheets({})
      expect(result).toEqual([])
    })
  })

  describe('Integration test: Complete workflow', () => {
    it('should correctly detect and separate data sheets from metadata sheets', () => {
      const workbookData = {
        'Q1 Sales': {
          columns: ['ProductID', 'Product Name', 'Price', 'Quantity'],
          rows: [
            { 'ProductID': 1, 'Product Name': 'Widget A', 'Price': 10, 'Quantity': 100 },
            { 'ProductID': 2, 'Product Name': 'Widget B', 'Price': 15, 'Quantity': 50 }
          ]
        },
        'Q2 Sales': {
          columns: ['Product-ID', 'Product_Name', 'Price', 'Units Sold'],
          rows: [
            { 'Product-ID': 3, 'Product_Name': 'Widget C', 'Price': 20, 'Units Sold': 75 },
            { 'Product-ID': 4, 'Product_Name': 'Widget D', 'Price': 25, 'Units Sold': 60 }
          ]
        },
        'Document Info': {
          columns: ['Author', 'Created Date', 'Version', 'Notes'],
          rows: [
            { 'Author': 'John Doe', 'Created Date': '2024-01-01', 'Version': '1.0', 'Notes': 'Initial version' }
          ]
        }
      }
      
      const sheetInclusion = autoDetectSheetsForAnalysis(workbookData)
      const included = getIncludedSheets(sheetInclusion)
      const excluded = getExcludedSheets(sheetInclusion)
      
      expect(included).toContain('Q1 Sales')
      expect(included).toContain('Q2 Sales')
      expect(excluded).toContain('Document Info')
    })
  })
})
