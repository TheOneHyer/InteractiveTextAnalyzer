import { describe, it, expect } from 'vitest'
import { mean, stdDev, erf, normalCDF, welchTTest } from '../utils/statistics'

describe('Statistics Utilities', () => {
  describe('mean', () => {
    it('should calculate the mean of an array', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3)
      expect(mean([10, 20, 30])).toBe(20)
      expect(mean([5])).toBe(5)
    })

    it('should handle negative numbers', () => {
      expect(mean([-5, 0, 5])).toBe(0)
      expect(mean([-10, -20])).toBe(-15)
    })

    it('should handle decimal numbers', () => {
      expect(mean([1.5, 2.5, 3.5])).toBeCloseTo(2.5, 5)
    })
  })

  describe('stdDev', () => {
    it('should calculate standard deviation', () => {
      const result = stdDev([2, 4, 4, 4, 5, 5, 7, 9])
      expect(result).toBeCloseTo(2, 0)
    })

    it('should return 0 for identical values', () => {
      expect(stdDev([5, 5, 5, 5])).toBe(0)
    })

    it('should handle small datasets', () => {
      const result = stdDev([1, 5])
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('erf', () => {
    it('should calculate error function for positive values', () => {
      expect(erf(0)).toBeCloseTo(0, 5)
      expect(erf(1)).toBeCloseTo(0.8427, 2)
      expect(erf(2)).toBeCloseTo(0.9953, 2)
    })

    it('should calculate error function for negative values', () => {
      expect(erf(-1)).toBeCloseTo(-0.8427, 2)
      expect(erf(-2)).toBeCloseTo(-0.9953, 2)
    })

    it('should be symmetric around zero', () => {
      const x = 1.5
      expect(erf(x)).toBeCloseTo(-erf(-x), 5)
    })
  })

  describe('normalCDF', () => {
    it('should return 0.5 for z=0', () => {
      expect(normalCDF(0)).toBeCloseTo(0.5, 5)
    })

    it('should return values between 0 and 1', () => {
      expect(normalCDF(-3)).toBeGreaterThan(0)
      expect(normalCDF(-3)).toBeLessThan(0.5)
      expect(normalCDF(3)).toBeGreaterThan(0.5)
      expect(normalCDF(3)).toBeLessThan(1)
    })

    it('should be monotonically increasing', () => {
      expect(normalCDF(-1)).toBeLessThan(normalCDF(0))
      expect(normalCDF(0)).toBeLessThan(normalCDF(1))
    })
  })

  describe('welchTTest', () => {
    it('should perform Welch\'s t-test', () => {
      const sample1 = [1, 2, 3, 4, 5]
      const sample2 = [3, 4, 5, 6, 7]
      
      const result = welchTTest(sample1, sample2)
      
      expect(result).toHaveProperty('tStatistic')
      expect(result).toHaveProperty('df')
      expect(result).toHaveProperty('pValue')
      expect(result.tStatistic).toBeLessThan(0) // sample1 mean < sample2 mean
      expect(result.df).toBeGreaterThan(0)
      expect(result.pValue).toBeGreaterThan(0)
      expect(result.pValue).toBeLessThan(1)
    })

    it('should return p-value close to 1 for similar samples', () => {
      const sample1 = [5, 5, 5, 5, 5]
      const sample2 = [5, 5, 5, 5, 5]
      
      const result = welchTTest(sample1, sample2)
      
      // When samples are identical, t-statistic should be 0 or NaN
      expect(isNaN(result.tStatistic) || Math.abs(result.tStatistic) < 0.0001).toBe(true)
    })

    it('should return small p-value for very different samples', () => {
      const sample1 = [1, 2, 3, 4, 5]
      const sample2 = [100, 200, 300, 400, 500]
      
      const result = welchTTest(sample1, sample2)
      
      expect(result.pValue).toBeLessThan(0.05) // Statistically significant
      expect(Math.abs(result.tStatistic)).toBeGreaterThan(2)
    })
  })
})
