import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizeCellValue,
  sanitizeColumnName,
  validateFileSize,
  validateFileExtension,
  sanitizeFilename,
  sanitizeLocalStorageData,
  sanitizeRow,
  sanitizeWorksheetData
} from '../utils/security'

describe('Security Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("XSS")</script>World'
      const result = sanitizeString(input)
      expect(result).toBe('Hello World')
    })

    it('should remove HTML tags', () => {
      const input = 'Hello <div>World</div>'
      const result = sanitizeString(input)
      expect(result).toBe('Hello World')
    })

    it('should handle multiple script tags', () => {
      const input = '<script>alert(1)</script>Hello<script>alert(2)</script>'
      const result = sanitizeString(input)
      expect(result).toBe('Hello')
    })

    it('should handle non-string inputs', () => {
      expect(sanitizeString(123)).toBe('123')
      expect(sanitizeString(null)).toBe('null')
      expect(sanitizeString(undefined)).toBe('undefined')
    })

    it('should limit string length', () => {
      const longString = 'a'.repeat(20000)
      const result = sanitizeString(longString)
      expect(result.length).toBe(10000)
    })

    it('should handle nested tags', () => {
      const input = '<div><script>alert("test")</script></div>'
      const result = sanitizeString(input)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('<div>')
    })
  })

  describe('sanitizeCellValue', () => {
    it('should prevent formula injection with equals sign', () => {
      const input = '=SUM(A1:A10)'
      const result = sanitizeCellValue(input)
      expect(result).toBe(' =SUM(A1:A10)')
      expect(result.charAt(0)).toBe(' ')
    })

    it('should prevent formula injection with plus sign', () => {
      const input = '+1+1'
      const result = sanitizeCellValue(input)
      expect(result).toBe(' +1+1')
    })

    it('should prevent formula injection with minus sign', () => {
      const input = '-1-1'
      const result = sanitizeCellValue(input)
      expect(result).toBe(' -1-1')
    })

    it('should prevent formula injection with @ sign', () => {
      const input = '@SUM(1,2)'
      const result = sanitizeCellValue(input)
      expect(result).toBe(' @SUM(1,2)')
    })

    it('should handle null and undefined', () => {
      expect(sanitizeCellValue(null)).toBe('')
      expect(sanitizeCellValue(undefined)).toBe('')
    })

    it('should remove HTML tags from cell values', () => {
      const input = '<b>Bold text</b>'
      const result = sanitizeCellValue(input)
      expect(result).toBe('Bold text')
    })

    it('should handle normal text without injection', () => {
      const input = 'Normal text value'
      const result = sanitizeCellValue(input)
      expect(result).toBe('Normal text value')
    })
  })

  describe('sanitizeColumnName', () => {
    it('should remove HTML tags from column names', () => {
      const input = '<script>alert("XSS")</script>Column'
      const result = sanitizeColumnName(input)
      expect(result).toBe('Column')
    })

    it('should remove quotes and angle brackets', () => {
      const input = 'Column"name<test>'
      const result = sanitizeColumnName(input)
      expect(result).toBe('Columnname')
      expect(result).not.toContain('"')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should trim whitespace', () => {
      const input = '  Column Name  '
      const result = sanitizeColumnName(input)
      expect(result).toBe('Column Name')
    })

    it('should limit length', () => {
      const longName = 'Column' + 'X'.repeat(300)
      const result = sanitizeColumnName(longName)
      expect(result.length).toBeLessThanOrEqual(200)
    })

    it('should provide default name for empty strings', () => {
      expect(sanitizeColumnName('')).toBe('Column')
      expect(sanitizeColumnName('   ')).toBe('Column')
    })

    it('should handle non-string inputs', () => {
      expect(sanitizeColumnName(123)).toBe('123')
      expect(sanitizeColumnName(null)).toBe('null')
    })
  })

  describe('validateFileSize', () => {
    it('should accept files under 10MB', () => {
      const file = { size: 5 * 1024 * 1024 } // 5MB
      expect(validateFileSize(file)).toBe(true)
    })

    it('should reject files over 10MB', () => {
      const file = { size: 15 * 1024 * 1024 } // 15MB
      expect(validateFileSize(file)).toBe(false)
    })

    it('should accept files exactly at 10MB', () => {
      const file = { size: 10 * 1024 * 1024 } // 10MB
      expect(validateFileSize(file)).toBe(true)
    })

    it('should reject null or invalid files', () => {
      expect(validateFileSize(null)).toBe(false)
      expect(validateFileSize({})).toBe(false)
      expect(validateFileSize(undefined)).toBe(false)
    })
  })

  describe('validateFileExtension', () => {
    it('should accept CSV files', () => {
      expect(validateFileExtension('data.csv')).toBe(true)
      expect(validateFileExtension('DATA.CSV')).toBe(true)
    })

    it('should accept Excel files', () => {
      expect(validateFileExtension('data.xlsx')).toBe(true)
      expect(validateFileExtension('data.xls')).toBe(true)
      expect(validateFileExtension('DATA.XLSX')).toBe(true)
    })

    it('should reject invalid extensions', () => {
      expect(validateFileExtension('data.exe')).toBe(false)
      expect(validateFileExtension('data.js')).toBe(false)
      expect(validateFileExtension('data.txt')).toBe(false)
    })

    it('should handle files without extensions', () => {
      expect(validateFileExtension('data')).toBe(false)
    })

    it('should handle null or invalid inputs', () => {
      expect(validateFileExtension(null)).toBe(false)
      expect(validateFileExtension(undefined)).toBe(false)
      expect(validateFileExtension('')).toBe(false)
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      const input = '../../../etc/passwd'
      const result = sanitizeFilename(input)
      expect(result).not.toContain('/')
      expect(result).not.toContain('..')
    })

    it('should remove special characters', () => {
      const input = 'file!@#$%^&*().txt'
      const result = sanitizeFilename(input)
      expect(result).toMatch(/^[a-zA-Z0-9_-]+$/)
    })

    it('should limit length to 100 characters', () => {
      const longName = 'file' + 'x'.repeat(200)
      const result = sanitizeFilename(longName)
      expect(result.length).toBeLessThanOrEqual(100)
    })

    it('should return default for empty or invalid inputs', () => {
      expect(sanitizeFilename('')).toBe('file')
      expect(sanitizeFilename(null)).toBe('file')
      expect(sanitizeFilename('!!!!')).toBe('file')
    })

    it('should preserve alphanumeric characters', () => {
      const input = 'MyFile123'
      const result = sanitizeFilename(input)
      expect(result).toBe('MyFile123')
    })
  })

  describe('sanitizeLocalStorageData', () => {
    it('should parse and sanitize valid JSON', () => {
      const input = JSON.stringify({
        selectedColumns: ['col1', 'col2'],
        analysisType: 'tfidf',
        ngramN: 2
      })
      const result = sanitizeLocalStorageData(input)
      expect(result).toEqual({
        selectedColumns: ['col1', 'col2'],
        analysisType: 'tfidf',
        ngramN: 2
      })
    })

    it('should reject invalid analysis types', () => {
      const input = JSON.stringify({
        analysisType: 'malicious'
      })
      const result = sanitizeLocalStorageData(input)
      expect(result).not.toHaveProperty('analysisType')
    })

    it('should validate numeric ranges', () => {
      const input = JSON.stringify({
        ngramN: 100,
        minSupport: 5
      })
      const result = sanitizeLocalStorageData(input)
      expect(result).not.toHaveProperty('ngramN')
      expect(result).not.toHaveProperty('minSupport')
    })

    it('should sanitize column names in arrays', () => {
      const input = JSON.stringify({
        selectedColumns: ['<script>alert(1)</script>col']
      })
      const result = sanitizeLocalStorageData(input)
      expect(result.selectedColumns[0]).not.toContain('<script>')
    })

    it('should handle malformed JSON', () => {
      const result = sanitizeLocalStorageData('invalid json')
      expect(result).toBeNull()
    })

    it('should return null for non-string inputs', () => {
      expect(sanitizeLocalStorageData(null)).toBeNull()
      expect(sanitizeLocalStorageData(undefined)).toBeNull()
      expect(sanitizeLocalStorageData(123)).toBeNull()
    })

    it('should sanitize renames object', () => {
      const input = JSON.stringify({
        renames: {
          'oldName<script>': 'newName<script>'
        }
      })
      const result = sanitizeLocalStorageData(input)
      expect(result.renames).toBeDefined()
      Object.values(result.renames).forEach(value => {
        expect(value).not.toContain('<script>')
      })
    })
  })

  describe('sanitizeRow', () => {
    it('should sanitize all cell values in a row', () => {
      const input = {
        col1: '=SUM(A1:A10)',
        col2: '<script>alert("XSS")</script>',
        col3: 'normal text'
      }
      const result = sanitizeRow(input)
      expect(result.col1).toBe(' =SUM(A1:A10)')
      expect(result.col2).toBe('')
      expect(result.col3).toBe('normal text')
    })

    it('should sanitize column names', () => {
      const input = {
        '<script>col</script>': 'value'
      }
      const result = sanitizeRow(input)
      expect(Object.keys(result)[0]).not.toContain('<script>')
    })

    it('should handle null or invalid inputs', () => {
      expect(sanitizeRow(null)).toEqual({})
      expect(sanitizeRow(undefined)).toEqual({})
    })

    it('should handle empty objects', () => {
      const result = sanitizeRow({})
      expect(result).toEqual({})
    })
  })

  describe('sanitizeWorksheetData', () => {
    it('should sanitize columns and rows', () => {
      const input = {
        columns: ['col1<script>', 'col2', 'col3'],
        rows: [
          { col1: '=SUM(1,2)', col2: 'normal', col3: '<b>bold</b>' },
          { col1: 'test', col2: 'data', col3: 'value' }
        ]
      }
      const result = sanitizeWorksheetData(input)
      
      expect(result.columns).toHaveLength(3)
      result.columns.forEach(col => {
        expect(col).not.toContain('<script>')
      })
      
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].col1).toBe(' =SUM(1,2)')
      expect(result.rows[0].col3).toBe('bold')
    })

    it('should handle missing columns or rows', () => {
      expect(sanitizeWorksheetData({ columns: [] })).toEqual({
        columns: [],
        rows: []
      })
      
      expect(sanitizeWorksheetData({ rows: [] })).toEqual({
        columns: [],
        rows: []
      })
    })

    it('should handle null or invalid inputs', () => {
      expect(sanitizeWorksheetData(null)).toEqual({
        columns: [],
        rows: []
      })
    })

    it('should handle non-array columns and rows', () => {
      const input = {
        columns: 'not an array',
        rows: 'not an array'
      }
      const result = sanitizeWorksheetData(input)
      expect(result.columns).toEqual([])
      expect(result.rows).toEqual([])
    })
  })

  describe('Integration tests', () => {
    it('should handle complex malicious input', () => {
      const maliciousRow = {
        '<script>alert(1)</script>name': '=CMD|"/c calc"!A1',
        'email<img src=x onerror=alert(1)>': '+1+1',
        'description': '<script>document.cookie</script>user input'
      }
      
      const result = sanitizeRow(maliciousRow)
      
      // Check that all keys are sanitized
      Object.keys(result).forEach(key => {
        expect(key).not.toContain('<script>')
        expect(key).not.toContain('<img')
      })
      
      // Check that all values are sanitized
      Object.values(result).forEach(value => {
        expect(value).not.toContain('<script>')
        // Formula injection should be prefixed
        if (value.startsWith(' ')) {
          expect(value.charAt(0)).toBe(' ')
        }
      })
    })

    it('should preserve legitimate data while sanitizing threats', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        score: '95',
        notes: 'Good performance in Q4 2024'
      }
      
      const result = sanitizeRow(input)
      
      expect(result.name).toBe('John Doe')
      expect(result.email).toBe('john@example.com')
      expect(result.score).toBe('95')
      expect(result.notes).toBe('Good performance in Q4 2024')
    })
  })
})
