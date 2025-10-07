import { describe, it, expect, beforeAll } from 'vitest'
import { 
  eisnerAlgorithm, 
  chuLiuEdmondsAlgorithm, 
  arcStandardSystem 
} from '../utils/dependencyParsing'

describe('Dependency Parsing Algorithms', () => {
  let sampleTokens
  
  beforeAll(() => {
    // Simple test sentence: "The cat sleeps"
    sampleTokens = [
      { text: 'The', pos: 'Determiner' },
      { text: 'cat', pos: 'Noun' },
      { text: 'sleeps', pos: 'Verb' }
    ]
  })
  
  describe('Eisner Algorithm', () => {
    it('should return empty result for empty input', () => {
      const result = eisnerAlgorithm([])
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })
    
    it('should return empty result for null input', () => {
      const result = eisnerAlgorithm(null)
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })
    
    it('should parse simple sentence correctly', () => {
      const result = eisnerAlgorithm(sampleTokens)
      
      // Should have ROOT + 3 tokens = 4 nodes
      expect(result.nodes.length).toBe(4)
      
      // Should have ROOT node
      expect(result.nodes[0].label).toBe('ROOT')
      
      // Should have at least one edge (tree structure)
      expect(result.edges.length).toBeGreaterThan(0)
      
      // All edges should have source and target
      result.edges.forEach(edge => {
        expect(edge).toHaveProperty('source')
        expect(edge).toHaveProperty('target')
        expect(edge).toHaveProperty('value')
      })
    })
    
    it('should create tree structure with n edges for n tokens', () => {
      const result = eisnerAlgorithm(sampleTokens)
      // Tree should have exactly n edges (including ROOT)
      expect(result.edges.length).toBe(sampleTokens.length)
    })
    
    it('should handle single token', () => {
      const tokens = [{ text: 'Hello', pos: 'Noun' }]
      const result = eisnerAlgorithm(tokens)
      
      expect(result.nodes.length).toBe(2) // ROOT + 1 token
      expect(result.edges.length).toBe(1) // Single edge from ROOT
    })
    
    it('should handle longer sentences', () => {
      const tokens = [
        { text: 'The', pos: 'Determiner' },
        { text: 'quick', pos: 'Adjective' },
        { text: 'brown', pos: 'Adjective' },
        { text: 'fox', pos: 'Noun' },
        { text: 'jumps', pos: 'Verb' }
      ]
      const result = eisnerAlgorithm(tokens)
      
      expect(result.nodes.length).toBe(6) // ROOT + 5 tokens
      expect(result.edges.length).toBe(5) // Tree with 5 edges
    })
    
    it('should maintain node structure with required fields', () => {
      const result = eisnerAlgorithm(sampleTokens)
      
      result.nodes.forEach(node => {
        expect(node).toHaveProperty('id')
        expect(node).toHaveProperty('label')
        expect(node).toHaveProperty('pos')
        expect(node).toHaveProperty('value')
      })
    })
  })
  
  describe('Chu-Liu/Edmonds Algorithm', () => {
    it('should return empty result for empty input', () => {
      const result = chuLiuEdmondsAlgorithm([])
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })
    
    it('should return empty result for null input', () => {
      const result = chuLiuEdmondsAlgorithm(null)
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })
    
    it('should parse simple sentence correctly', () => {
      const result = chuLiuEdmondsAlgorithm(sampleTokens)
      
      // Should have ROOT + 3 tokens = 4 nodes
      expect(result.nodes.length).toBe(4)
      
      // Should have ROOT node
      expect(result.nodes[0].label).toBe('ROOT')
      
      // Should have edges
      expect(result.edges.length).toBeGreaterThan(0)
      
      // All edges should have source and target
      result.edges.forEach(edge => {
        expect(edge).toHaveProperty('source')
        expect(edge).toHaveProperty('target')
        expect(edge).toHaveProperty('value')
        expect(edge.value).toBeGreaterThanOrEqual(0)
      })
    })
    
    it('should create tree structure with n edges for n tokens', () => {
      const result = chuLiuEdmondsAlgorithm(sampleTokens)
      // Tree should have exactly n edges
      expect(result.edges.length).toBe(sampleTokens.length)
    })
    
    it('should handle single token', () => {
      const tokens = [{ text: 'Hello', pos: 'Noun' }]
      const result = chuLiuEdmondsAlgorithm(tokens)
      
      expect(result.nodes.length).toBe(2) // ROOT + 1 token
      expect(result.edges.length).toBe(1) // Single edge from ROOT
    })
    
    it('should handle longer sentences', () => {
      const tokens = [
        { text: 'The', pos: 'Determiner' },
        { text: 'quick', pos: 'Adjective' },
        { text: 'brown', pos: 'Adjective' },
        { text: 'fox', pos: 'Noun' },
        { text: 'jumps', pos: 'Verb' }
      ]
      const result = chuLiuEdmondsAlgorithm(tokens)
      
      expect(result.nodes.length).toBe(6) // ROOT + 5 tokens
      expect(result.edges.length).toBe(5) // Tree with 5 edges
    })
    
    it('should maintain node structure with required fields', () => {
      const result = chuLiuEdmondsAlgorithm(sampleTokens)
      
      result.nodes.forEach(node => {
        expect(node).toHaveProperty('id')
        expect(node).toHaveProperty('label')
        expect(node).toHaveProperty('pos')
        expect(node).toHaveProperty('value')
      })
    })
    
    it('should assign weights to edges based on scoring', () => {
      const result = chuLiuEdmondsAlgorithm(sampleTokens)
      
      // Edges should have positive values (scores)
      result.edges.forEach(edge => {
        expect(typeof edge.value).toBe('number')
        expect(edge.value).toBeGreaterThanOrEqual(0)
      })
    })
  })
  
  describe('Arc-Standard System', () => {
    it('should return empty result for empty input', () => {
      const result = arcStandardSystem([])
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })
    
    it('should return empty result for null input', () => {
      const result = arcStandardSystem(null)
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })
    
    it('should parse simple sentence correctly', () => {
      const result = arcStandardSystem(sampleTokens)
      
      // Should have ROOT + 3 tokens = 4 nodes
      expect(result.nodes.length).toBe(4)
      
      // Should have ROOT node
      expect(result.nodes[0].label).toBe('ROOT')
      
      // Should have edges
      expect(result.edges.length).toBeGreaterThan(0)
      
      // All edges should have source and target
      result.edges.forEach(edge => {
        expect(edge).toHaveProperty('source')
        expect(edge).toHaveProperty('target')
        expect(edge).toHaveProperty('value')
      })
    })
    
    it('should create tree structure', () => {
      const result = arcStandardSystem(sampleTokens)
      // Should have edges forming a tree
      expect(result.edges.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeLessThanOrEqual(sampleTokens.length)
    })
    
    it('should handle single token', () => {
      const tokens = [{ text: 'Hello', pos: 'Noun' }]
      const result = arcStandardSystem(tokens)
      
      expect(result.nodes.length).toBe(2) // ROOT + 1 token
      expect(result.edges.length).toBeGreaterThan(0)
    })
    
    it('should handle longer sentences', () => {
      const tokens = [
        { text: 'The', pos: 'Determiner' },
        { text: 'quick', pos: 'Adjective' },
        { text: 'brown', pos: 'Adjective' },
        { text: 'fox', pos: 'Noun' },
        { text: 'jumps', pos: 'Verb' }
      ]
      const result = arcStandardSystem(tokens)
      
      expect(result.nodes.length).toBe(6) // ROOT + 5 tokens
      expect(result.edges.length).toBeGreaterThan(0) // Should have edges
    })
    
    it('should maintain node structure with required fields', () => {
      const result = arcStandardSystem(sampleTokens)
      
      result.nodes.forEach(node => {
        expect(node).toHaveProperty('id')
        expect(node).toHaveProperty('label')
        expect(node).toHaveProperty('pos')
        expect(node).toHaveProperty('value')
      })
    })
  })
  
  describe('Algorithm Comparison', () => {
    it('all algorithms should produce valid tree structures', () => {
      const eisner = eisnerAlgorithm(sampleTokens)
      const chuLiu = chuLiuEdmondsAlgorithm(sampleTokens)
      const arcStandard = arcStandardSystem(sampleTokens)
      
      // All should have same number of nodes
      expect(eisner.nodes.length).toBe(4)
      expect(chuLiu.nodes.length).toBe(4)
      expect(arcStandard.nodes.length).toBe(4)
      
      // All should have edges
      expect(eisner.edges.length).toBeGreaterThan(0)
      expect(chuLiu.edges.length).toBeGreaterThan(0)
      expect(arcStandard.edges.length).toBeGreaterThan(0)
    })
    
    it('all algorithms should include ROOT node', () => {
      const eisner = eisnerAlgorithm(sampleTokens)
      const chuLiu = chuLiuEdmondsAlgorithm(sampleTokens)
      const arcStandard = arcStandardSystem(sampleTokens)
      
      expect(eisner.nodes[0].label).toBe('ROOT')
      expect(chuLiu.nodes[0].label).toBe('ROOT')
      expect(arcStandard.nodes[0].label).toBe('ROOT')
    })
    
    it('all algorithms should handle complex POS patterns', () => {
      const tokens = [
        { text: 'Colorless', pos: 'Adjective' },
        { text: 'green', pos: 'Adjective' },
        { text: 'ideas', pos: 'Noun' },
        { text: 'sleep', pos: 'Verb' },
        { text: 'furiously', pos: 'Adverb' }
      ]
      
      const eisner = eisnerAlgorithm(tokens)
      const chuLiu = chuLiuEdmondsAlgorithm(tokens)
      const arcStandard = arcStandardSystem(tokens)
      
      expect(eisner.nodes.length).toBe(6)
      expect(chuLiu.nodes.length).toBe(6)
      expect(arcStandard.nodes.length).toBe(6)
      
      expect(eisner.edges.length).toBeGreaterThan(0)
      expect(chuLiu.edges.length).toBeGreaterThan(0)
      expect(arcStandard.edges.length).toBeGreaterThan(0)
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle tokens with special characters', () => {
      const tokens = [
        { text: "don't", pos: 'Verb' },
        { text: 'worry', pos: 'Verb' }
      ]
      
      const result = eisnerAlgorithm(tokens)
      expect(result.nodes.length).toBe(3) // ROOT + 2
      expect(result.edges.length).toBe(2)
    })
    
    it('should handle all same POS tags', () => {
      const tokens = [
        { text: 'dog', pos: 'Noun' },
        { text: 'cat', pos: 'Noun' },
        { text: 'bird', pos: 'Noun' }
      ]
      
      const eisner = eisnerAlgorithm(tokens)
      const chuLiu = chuLiuEdmondsAlgorithm(tokens)
      const arcStandard = arcStandardSystem(tokens)
      
      expect(eisner.nodes.length).toBe(4)
      expect(chuLiu.nodes.length).toBe(4)
      expect(arcStandard.nodes.length).toBe(4)
    })
    
    it('should handle unknown POS tags gracefully', () => {
      const tokens = [
        { text: 'word1', pos: 'Unknown' },
        { text: 'word2', pos: 'Unknown' }
      ]
      
      const result = eisnerAlgorithm(tokens)
      expect(result.nodes.length).toBe(3)
      expect(result.edges.length).toBeGreaterThan(0)
    })
  })
  
  describe('Performance and Scalability', () => {
    it('should handle sentences up to 10 words efficiently', () => {
      const tokens = Array.from({ length: 10 }, (_, i) => ({
        text: `word${i}`,
        pos: ['Noun', 'Verb', 'Adjective'][i % 3]
      }))
      
      const start = Date.now()
      const result = eisnerAlgorithm(tokens)
      const duration = Date.now() - start
      
      expect(result.nodes.length).toBe(11) // ROOT + 10
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })
  })
})
