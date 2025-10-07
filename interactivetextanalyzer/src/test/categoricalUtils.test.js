import { describe, it, expect } from 'vitest'
import { normalizeValue, getCategoricalValues } from '../utils/categoricalUtils'

describe('Categorical Utilities', () => {
  describe('normalizeValue', () => {
    it('should normalize boolean-like values to yes', () => {
      expect(normalizeValue('y')).toBe('yes')
      expect(normalizeValue('Y')).toBe('yes')
      expect(normalizeValue('yes')).toBe('yes')
      expect(normalizeValue('YES')).toBe('yes')
      expect(normalizeValue('true')).toBe('yes')
      expect(normalizeValue('True')).toBe('yes')
      expect(normalizeValue('1')).toBe('yes')
      expect(normalizeValue('t')).toBe('yes')
      expect(normalizeValue('T')).toBe('yes')
    })

    it('should normalize boolean-like values to no', () => {
      expect(normalizeValue('n')).toBe('no')
      expect(normalizeValue('N')).toBe('no')
      expect(normalizeValue('no')).toBe('no')
      expect(normalizeValue('NO')).toBe('no')
      expect(normalizeValue('false')).toBe('no')
      expect(normalizeValue('False')).toBe('no')
      expect(normalizeValue('0')).toBe('no')
      expect(normalizeValue('f')).toBe('no')
      expect(normalizeValue('F')).toBe('no')
    })

    it('should handle null and undefined', () => {
      expect(normalizeValue(null)).toBeNull()
      expect(normalizeValue(undefined)).toBeNull()
    })

    it('should preserve other values as lowercase', () => {
      expect(normalizeValue('active')).toBe('active')
      expect(normalizeValue('PENDING')).toBe('pending')
      expect(normalizeValue('InProgress')).toBe('inprogress')
    })

    it('should trim whitespace', () => {
      expect(normalizeValue('  yes  ')).toBe('yes')
      expect(normalizeValue('  active  ')).toBe('active')
    })

    it('should handle numbers', () => {
      expect(normalizeValue(123)).toBe('123')
      expect(normalizeValue(0)).toBe('no')
      expect(normalizeValue(1)).toBe('yes')
    })
  })

  describe('getCategoricalValues', () => {
    it('should extract unique normalized values', () => {
      const rows = [
        { status: 'Active' },
        { status: 'active' },
        { status: 'Pending' },
        { status: 'Active' }
      ]
      
      const result = getCategoricalValues(rows, 'status')
      expect(result).toEqual(['active', 'pending'])
    })

    it('should filter out null and undefined', () => {
      const rows = [
        { status: 'Active' },
        { status: null },
        { status: undefined },
        { status: 'Pending' }
      ]
      
      const result = getCategoricalValues(rows, 'status')
      expect(result).toEqual(['active', 'pending'])
    })

    it('should filter out empty strings', () => {
      const rows = [
        { status: 'Active' },
        { status: '' },
        { status: '   ' },
        { status: 'Pending' }
      ]
      
      const result = getCategoricalValues(rows, 'status')
      expect(result).toEqual(['active', 'pending'])
    })

    it('should normalize boolean-like values', () => {
      const rows = [
        { flag: 'y' },
        { flag: 'yes' },
        { flag: 'true' },
        { flag: 'n' },
        { flag: 'no' },
        { flag: 'false' }
      ]
      
      const result = getCategoricalValues(rows, 'flag')
      expect(result).toEqual(['no', 'yes'])
    })

    it('should return sorted values', () => {
      const rows = [
        { priority: 'high' },
        { priority: 'low' },
        { priority: 'medium' }
      ]
      
      const result = getCategoricalValues(rows, 'priority')
      expect(result).toEqual(['high', 'low', 'medium'])
    })

    it('should handle empty array', () => {
      const result = getCategoricalValues([], 'status')
      expect(result).toEqual([])
    })

    it('should handle column that doesn\'t exist', () => {
      const rows = [
        { status: 'Active' },
        { status: 'Pending' }
      ]
      
      const result = getCategoricalValues(rows, 'nonexistent')
      expect(result).toEqual([])
    })
  })
})
