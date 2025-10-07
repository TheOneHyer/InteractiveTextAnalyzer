import { describe, it, expect } from 'vitest'
import { simplePCA, loadDimReductionLibs, applyDimensionalityReduction } from '../utils/dimensionalityReduction'

describe('Dimensionality Reduction Utilities', () => {
  describe('simplePCA', () => {
    it('should reduce high-dimensional vectors to 2D', () => {
      const vectors = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6],
        [3, 4, 5, 6, 7],
        [4, 5, 6, 7, 8]
      ]
      
      const result = simplePCA(vectors)
      
      expect(result).toHaveLength(4)
      result.forEach(point => {
        expect(point).toHaveProperty('x')
        expect(point).toHaveProperty('y')
        expect(typeof point.x).toBe('number')
        expect(typeof point.y).toBe('number')
      })
    })

    it('should return empty array for empty input', () => {
      expect(simplePCA([])).toEqual([])
      expect(simplePCA(null)).toEqual([])
      expect(simplePCA(undefined)).toEqual([])
    })

    it('should handle single vector', () => {
      const vectors = [[1, 2, 3]]
      const result = simplePCA(vectors)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('x')
      expect(result[0]).toHaveProperty('y')
    })

    it('should preserve relative distances', () => {
      // Two groups of similar vectors
      const vectors = [
        [1, 1, 1, 1],
        [1.1, 1.1, 1.1, 1.1],
        [10, 10, 10, 10],
        [10.1, 10.1, 10.1, 10.1]
      ]
      
      const result = simplePCA(vectors)
      
      // Points 0 and 1 should be close
      const dist01 = Math.hypot(result[0].x - result[1].x, result[0].y - result[1].y)
      // Points 2 and 3 should be close
      const dist23 = Math.hypot(result[2].x - result[3].x, result[2].y - result[3].y)
      // Points 0 and 2 should be far
      const dist02 = Math.hypot(result[0].x - result[2].x, result[0].y - result[2].y)
      
      expect(dist01).toBeLessThan(dist02)
      expect(dist23).toBeLessThan(dist02)
    })

    it('should handle vectors with different scales', () => {
      const vectors = [
        [100, 1, 1],
        [200, 2, 2],
        [300, 3, 3]
      ]
      
      const result = simplePCA(vectors)
      
      expect(result).toHaveLength(3)
      expect(result.every(p => isFinite(p.x) && isFinite(p.y))).toBe(true)
    })
  })

  describe('loadDimReductionLibs', () => {
    it('should load dimensionality reduction libraries', async () => {
      const libs = await loadDimReductionLibs()
      
      expect(libs).toHaveProperty('pca')
      expect(libs).toHaveProperty('loaded')
      expect(libs.loaded).toBe(true)
      expect(typeof libs.pca).toBe('function')
    })

    it('should return PCA function that works', async () => {
      const libs = await loadDimReductionLibs()
      const vectors = [[1, 2, 3], [4, 5, 6]]
      
      const result = libs.pca(vectors)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('x')
      expect(result[0]).toHaveProperty('y')
    })
  })

  describe('applyDimensionalityReduction', () => {
    it('should apply PCA method', async () => {
      const libs = await loadDimReductionLibs()
      const vectors = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
      
      const result = await applyDimensionalityReduction(vectors, 'pca', libs)
      
      expect(result).toHaveLength(3)
      result.forEach(point => {
        expect(point).toHaveProperty('x')
        expect(point).toHaveProperty('y')
      })
    })

    it('should add jitter for t-SNE method', async () => {
      const libs = await loadDimReductionLibs()
      const vectors = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ]
      
      const pcaResult = await applyDimensionalityReduction(vectors, 'pca', libs)
      const tsneResult = await applyDimensionalityReduction(vectors, 'tsne', libs)
      
      // Both should return valid results
      expect(pcaResult).toHaveLength(3)
      expect(tsneResult).toHaveLength(3)
      
      // All points should have valid coordinates
      pcaResult.forEach(point => {
        expect(isFinite(point.x)).toBe(true)
        expect(isFinite(point.y)).toBe(true)
      })
      
      tsneResult.forEach(point => {
        expect(isFinite(point.x)).toBe(true)
        expect(isFinite(point.y)).toBe(true)
      })
    })

    it('should add different jitter for UMAP method', async () => {
      const libs = await loadDimReductionLibs()
      const vectors = [[1, 2, 3], [4, 5, 6]]
      
      const result = await applyDimensionalityReduction(vectors, 'umap', libs)
      
      expect(result).toHaveLength(2)
      result.forEach(point => {
        expect(point).toHaveProperty('x')
        expect(point).toHaveProperty('y')
        expect(isFinite(point.x)).toBe(true)
        expect(isFinite(point.y)).toBe(true)
      })
    })

    it('should return empty array if libs not loaded', async () => {
      const result = await applyDimensionalityReduction([], 'pca', null)
      expect(result).toEqual([])
      
      const result2 = await applyDimensionalityReduction([], 'pca', { loaded: false })
      expect(result2).toEqual([])
    })

    it('should handle errors gracefully', async () => {
      const libs = {
        pca: () => { throw new Error('Test error') },
        loaded: true
      }
      
      const result = await applyDimensionalityReduction([[1, 2]], 'pca', libs)
      expect(result).toEqual([])
    })
  })
})
