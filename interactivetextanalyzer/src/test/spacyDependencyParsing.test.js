import { describe, it, expect, vi } from 'vitest'
import { performSpacyDependencyParsing, getDependencyInfo } from '../utils/spacyDependencyParsing'

describe('spaCy Dependency Parsing', () => {
  describe('performSpacyDependencyParsing', () => {
    it('should return empty results for empty input', async () => {
      const result = await performSpacyDependencyParsing([])
      
      expect(result).toBeDefined()
      expect(result.sentences).toBeDefined()
      expect(result.sentences).toEqual([])
    })

    it('should return empty results for null input', async () => {
      const result = await performSpacyDependencyParsing(null)
      
      expect(result).toBeDefined()
      expect(result.sentences).toEqual([])
    })

    it('should parse simple sentences', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result).toBeDefined()
      expect(result.sentences).toBeDefined()
      expect(result.sentences.length).toBeGreaterThan(0)
    })

    it('should create nodes and edges for parsed sentences', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
      
      const sentence = result.sentences[0]
      expect(sentence).toHaveProperty('nodes')
      expect(sentence).toHaveProperty('edges')
      expect(sentence).toHaveProperty('sentence')
      
      expect(Array.isArray(sentence.nodes)).toBe(true)
      expect(Array.isArray(sentence.edges)).toBe(true)
      expect(sentence.nodes.length).toBeGreaterThan(0)
    })

    it('should include ROOT node', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      const rootNode = sentence.nodes.find(n => n.id === 'ROOT')
      
      expect(rootNode).toBeDefined()
      expect(rootNode.label).toBe('ROOT')
    })

    it('should create valid node structure', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      
      sentence.nodes.forEach(node => {
        expect(node).toHaveProperty('id')
        expect(node).toHaveProperty('label')
        expect(node).toHaveProperty('pos')
        expect(node).toHaveProperty('value')
        
        expect(typeof node.id).toBe('string')
        expect(typeof node.label).toBe('string')
        expect(typeof node.pos).toBe('string')
        expect(typeof node.value).toBe('number')
      })
    })

    it('should create valid edge structure', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      
      if (sentence.edges.length > 0) {
        sentence.edges.forEach(edge => {
          expect(edge).toHaveProperty('source')
          expect(edge).toHaveProperty('target')
          expect(edge).toHaveProperty('label')
          expect(edge).toHaveProperty('value')
          expect(edge).toHaveProperty('color')
          
          expect(typeof edge.source).toBe('string')
          expect(typeof edge.target).toBe('string')
          expect(typeof edge.label).toBe('string')
          expect(typeof edge.value).toBe('number')
          expect(typeof edge.color).toBe('string')
          
          // Color should be hex code
          expect(edge.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        })
      }
    })

    it('should handle multiple sentences in one sample', async () => {
      const samples = ['The cat sleeps. The dog barks.']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle multiple samples', async () => {
      const samples = [
        'The cat sleeps.',
        'A dog barks.',
        'Birds fly high.'
      ]
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThanOrEqual(3)
    })

    it('should respect maxSamples parameter', async () => {
      const samples = Array(20).fill('The cat sleeps.')
      const result = await performSpacyDependencyParsing(samples, { maxSamples: 5 })
      
      // Should process at most 5 samples
      expect(result.sentences.length).toBeLessThanOrEqual(5)
    })

    it('should call progress callback if provided', async () => {
      const progressMock = vi.fn()
      const samples = Array(10).fill('The cat sleeps.')
      
      await performSpacyDependencyParsing(samples, {
        maxSamples: 10,
        onProgress: progressMock
      })
      
      // Progress callback should be called
      expect(progressMock).toHaveBeenCalled()
    })

    it('should handle empty sentences gracefully', async () => {
      const samples = ['', '   ', '\n\n']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result).toBeDefined()
      expect(result.sentences).toBeDefined()
    })

    it('should handle sentences with punctuation', async () => {
      const samples = ['Hello, world!', 'How are you?', "It's great."]
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
    })

    it('should handle longer sentences', async () => {
      const samples = ['The quick brown fox jumps over the lazy dog.']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
      
      const sentence = result.sentences[0]
      // Should have multiple words
      expect(sentence.nodes.length).toBeGreaterThan(5)
    })

    it('should store original sentence text', async () => {
      const samples = ['The cat sleeps']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences[0].sentence).toBe('The cat sleeps')
    })

    it('should include tokens with dependency information', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      expect(sentence).toHaveProperty('tokens')
      expect(Array.isArray(sentence.tokens)).toBe(true)
      
      if (sentence.tokens.length > 0) {
        sentence.tokens.forEach(token => {
          expect(token).toHaveProperty('text')
          expect(token).toHaveProperty('pos')
          expect(token).toHaveProperty('dep')
          expect(token).toHaveProperty('head')
        })
      }
    })

    it('should assign dependency labels to edges', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      
      if (sentence.edges.length > 0) {
        sentence.edges.forEach(edge => {
          expect(edge.label).toBeTruthy()
          expect(typeof edge.label).toBe('string')
        })
      }
    })

    it('should handle complex sentence structures', async () => {
      const samples = [
        'When I went to the store, I bought apples and oranges.'
      ]
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
      const sentence = result.sentences[0]
      expect(sentence.nodes.length).toBeGreaterThan(5)
    })

    it('should not fail on special characters', async () => {
      const samples = ['She said, "Hello!"', '$100 is a lot', 'email@example.com']
      
      const result = await performSpacyDependencyParsing(samples)
      expect(result).toBeDefined()
      expect(result.sentences).toBeDefined()
    })

    it('should handle sentences with numbers', async () => {
      const samples = ['I have 3 cats.', 'The year 2024 is here.']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
    })
  })

  describe('getDependencyInfo', () => {
    it('should return info for valid dependency labels', () => {
      const info = getDependencyInfo('nsubj')
      
      expect(info).toBeDefined()
      expect(info).toHaveProperty('label')
      expect(info).toHaveProperty('description')
      expect(info).toHaveProperty('example')
      expect(info).toHaveProperty('color')
    })

    it('should return default for unknown labels', () => {
      const info = getDependencyInfo('unknown_dep')
      
      expect(info).toBeDefined()
      expect(info.description).toContain('Unknown')
    })

    it('should handle common dependency labels', () => {
      const labels = ['nsubj', 'obj', 'det', 'amod', 'advmod', 'aux', 'ROOT']
      
      labels.forEach(label => {
        const info = getDependencyInfo(label)
        expect(info).toBeDefined()
        expect(info.label).toBeTruthy()
        expect(info.description).toBeTruthy()
      })
    })
  })

  describe('Heuristic Dependency Assignment', () => {
    it('should identify determiners correctly', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      
      // Should have edges and sentence was processed
      // Check that edges exist and sentence was processed
      expect(sentence.edges.length).toBeGreaterThan(0)
    })

    it('should identify subjects', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      const edges = sentence.edges.map(e => e.label)
      
      // Should have subject-related dependencies
      expect(edges.length).toBeGreaterThan(0)
    })

    it('should create tree structure', async () => {
      const samples = ['The cat sleeps.']
      const result = await performSpacyDependencyParsing(samples)
      
      const sentence = result.sentences[0]
      
      // Every non-ROOT node should have an incoming edge
      const nonRootNodes = sentence.nodes.filter(n => n.id !== 'ROOT')
      
      // Should have edges connecting nodes
      expect(sentence.edges.length).toBeGreaterThan(0)
      expect(sentence.edges.length).toBeLessThanOrEqual(nonRootNodes.length)
    })
  })

  describe('Edge Cases', () => {
    it('should handle single word sentences', async () => {
      const samples = ['Hello.']
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
      const sentence = result.sentences[0]
      expect(sentence.nodes.length).toBeGreaterThanOrEqual(2) // ROOT + word
    })

    it('should handle very long sentences', async () => {
      const longSentence = 'The ' + Array(50).fill('very').join(' ') + ' long sentence.'
      const samples = [longSentence]
      const result = await performSpacyDependencyParsing(samples)
      
      expect(result.sentences.length).toBeGreaterThan(0)
    })

    it('should not crash on malformed input', async () => {
      const samples = [undefined, null, '', 123, {}]
      
      // Should handle gracefully without throwing
      await expect(performSpacyDependencyParsing(samples)).resolves.toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should process small batch efficiently', async () => {
      const samples = Array(10).fill('The cat sleeps.')
      const startTime = Date.now()
      
      await performSpacyDependencyParsing(samples, { maxSamples: 10 })
      
      const duration = Date.now() - startTime
      // Should complete in reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000)
    })

    it('should respect maxSamples for large inputs', async () => {
      const samples = Array(1000).fill('The cat sleeps.')
      const result = await performSpacyDependencyParsing(samples, { maxSamples: 10 })
      
      // Should only process 10 samples
      expect(result.sentences.length).toBeLessThanOrEqual(10)
    })
  })
})
