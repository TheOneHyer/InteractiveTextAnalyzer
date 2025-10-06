import { describe, it, expect } from 'vitest'

// Normalize value with synonym detection (for categorical filtering)
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

// Get unique categorical values for a column
const getCategoricalValues = (rows, column) => {
  const values = rows
    .map(row => row[column])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
  
  const uniqueNormalized = new Set(values.map(normalizeValue))
  return Array.from(uniqueNormalized).sort()
}

// Auto-detect categorical columns based on unique value count
const detectCategoricalColumns = (rows, columns) => {
  const detected = {}
  columns.forEach(col => {
    const uniqueValues = new Set(
      rows.map(row => row[col])
        .filter(val => val !== null && val !== undefined && String(val).trim() !== '')
        .map(normalizeValue)
    )
    // Auto-detect as categorical if 5 or fewer unique values
    if (uniqueValues.size > 0 && uniqueValues.size <= 5) {
      detected[col] = 'categorical'
    }
  })
  return detected
}

describe('Categorical Detection', () => {
  describe('normalizeValue', () => {
    it('should normalize boolean-like values to yes/no', () => {
      expect(normalizeValue('y')).toBe('yes')
      expect(normalizeValue('Y')).toBe('yes')
      expect(normalizeValue('yes')).toBe('yes')
      expect(normalizeValue('true')).toBe('yes')
      expect(normalizeValue('1')).toBe('yes')
      expect(normalizeValue('t')).toBe('yes')
      
      expect(normalizeValue('n')).toBe('no')
      expect(normalizeValue('N')).toBe('no')
      expect(normalizeValue('no')).toBe('no')
      expect(normalizeValue('false')).toBe('no')
      expect(normalizeValue('0')).toBe('no')
      expect(normalizeValue('f')).toBe('no')
    })
    
    it('should handle non-boolean values', () => {
      expect(normalizeValue('positive')).toBe('positive')
      expect(normalizeValue('negative')).toBe('negative')
      expect(normalizeValue('neutral')).toBe('neutral')
    })
    
    it('should handle null and undefined', () => {
      expect(normalizeValue(null)).toBe(null)
      expect(normalizeValue(undefined)).toBe(null)
    })
    
    it('should trim whitespace', () => {
      expect(normalizeValue('  test  ')).toBe('test')
      expect(normalizeValue(' positive ')).toBe('positive')
    })
    
    it('should convert to lowercase', () => {
      expect(normalizeValue('POSITIVE')).toBe('positive')
      expect(normalizeValue('Negative')).toBe('negative')
      expect(normalizeValue('NeUtRaL')).toBe('neutral')
    })
  })
  
  describe('getCategoricalValues', () => {
    const testRows = [
      { sentiment: 'positive', category: 'Books', empty: '' },
      { sentiment: 'negative', category: 'Electronics', empty: null },
      { sentiment: 'positive', category: 'Books', empty: undefined },
      { sentiment: 'neutral', category: 'Games', empty: '' }
    ]
    
    it('should return unique normalized values', () => {
      const values = getCategoricalValues(testRows, 'sentiment')
      expect(values).toEqual(['negative', 'neutral', 'positive'])
    })
    
    it('should handle duplicates', () => {
      const values = getCategoricalValues(testRows, 'category')
      expect(values).toEqual(['Books', 'Electronics', 'Games'].map(v => v.toLowerCase()).sort())
    })
    
    it('should filter out null, undefined and empty strings', () => {
      const values = getCategoricalValues(testRows, 'empty')
      expect(values).toEqual([])
    })
    
    it('should sort values alphabetically', () => {
      const rows = [
        { val: 'zebra' },
        { val: 'apple' },
        { val: 'banana' }
      ]
      const values = getCategoricalValues(rows, 'val')
      expect(values).toEqual(['apple', 'banana', 'zebra'])
    })
  })
  
  describe('detectCategoricalColumns', () => {
    it('should detect columns with 5 or fewer unique values', () => {
      const rows = [
        { sentiment: 'positive', category: 'Books', id: 1 },
        { sentiment: 'negative', category: 'Electronics', id: 2 },
        { sentiment: 'positive', category: 'Books', id: 3 },
        { sentiment: 'neutral', category: 'Games', id: 4 }
      ]
      const columns = ['sentiment', 'category', 'id']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      expect(detected.sentiment).toBe('categorical')
      expect(detected.category).toBe('categorical')
      expect(detected.id).toBe('categorical') // 4 unique values
    })
    
    it('should not detect columns with more than 5 unique values', () => {
      const rows = [
        { review: 'Great product', rating: 1 },
        { review: 'Good quality', rating: 2 },
        { review: 'Average', rating: 3 },
        { review: 'Below average', rating: 4 },
        { review: 'Poor', rating: 5 },
        { review: 'Terrible', rating: 6 }
      ]
      const columns = ['review', 'rating']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      expect(detected.review).toBeUndefined() // 6 unique reviews
      expect(detected.rating).toBeUndefined() // 6 unique ratings
    })
    
    it('should handle empty or null values correctly', () => {
      const rows = [
        { status: 'active', empty: '' },
        { status: 'inactive', empty: null },
        { status: 'active', empty: undefined },
        { status: 'pending', empty: '' }
      ]
      const columns = ['status', 'empty']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      expect(detected.status).toBe('categorical')
      expect(detected.empty).toBeUndefined() // All empty/null values
    })
    
    it('should normalize boolean-like values when counting', () => {
      const rows = [
        { bool: 'y' },
        { bool: 'yes' },
        { bool: 'true' },
        { bool: 'n' },
        { bool: 'no' }
      ]
      const columns = ['bool']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      // Should detect 2 unique normalized values (yes/no)
      expect(detected.bool).toBe('categorical')
    })
    
    it('should handle exactly 5 unique values (boundary case)', () => {
      const rows = [
        { rating: 'excellent' },
        { rating: 'good' },
        { rating: 'average' },
        { rating: 'poor' },
        { rating: 'terrible' }
      ]
      const columns = ['rating']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      expect(detected.rating).toBe('categorical')
    })
    
    it('should handle exactly 6 unique values (boundary case)', () => {
      const rows = [
        { rating: 'excellent' },
        { rating: 'good' },
        { rating: 'average' },
        { rating: 'poor' },
        { rating: 'terrible' },
        { rating: 'awful' }
      ]
      const columns = ['rating']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      expect(detected.rating).toBeUndefined() // More than 5
    })
    
    it('should return empty object when no categorical columns detected', () => {
      const rows = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `value${i}` }))
      const columns = ['id', 'value']
      
      const detected = detectCategoricalColumns(rows, columns)
      
      expect(Object.keys(detected)).toHaveLength(0)
    })
  })
  
  describe('categorical filtering', () => {
    const testRows = [
      { id: 1, category: 'Books', sentiment: 'positive' },
      { id: 2, category: 'Electronics', sentiment: 'negative' },
      { id: 3, category: 'Books', sentiment: 'positive' },
      { id: 4, category: 'Games', sentiment: 'neutral' }
    ]
    
    it('should filter by single categorical value', () => {
      const filtered = testRows.filter(row => {
        const val = row.category
        const normalized = normalizeValue(val)
        return ['books'].includes(normalized)
      })
      
      expect(filtered).toHaveLength(2)
      expect(filtered.every(r => normalizeValue(r.category) === 'books')).toBe(true)
    })
    
    it('should filter by multiple categorical values', () => {
      const selectedValues = ['books', 'games']
      const filtered = testRows.filter(row => {
        const val = row.category
        const normalized = normalizeValue(val)
        return selectedValues.includes(normalized)
      })
      
      expect(filtered).toHaveLength(3)
    })
    
    it('should handle empty filter (show all)', () => {
      const selectedValues = []
      const filtered = testRows.filter(row => {
        if (selectedValues.length === 0) return true
        const val = row.sentiment
        const normalized = normalizeValue(val)
        return selectedValues.includes(normalized)
      })
      
      expect(filtered).toHaveLength(4)
    })
  })
})
