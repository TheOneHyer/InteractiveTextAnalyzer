import { describe, it, expect, beforeAll } from 'vitest'
import {
  ruleBasedCoreference,
  mentionPairCoreference,
  clusterBasedCoreference,
  performCoreferenceResolution
} from '../utils/coreferenceResolution'

describe('Coreference Resolution', () => {
  let sampleTexts
  
  beforeAll(() => {
    sampleTexts = [
      'John went to the store. He bought milk.',
      'Mary is a doctor. She works at the hospital.',
      'The cat sat on the mat. The animal looked happy.',
      'Apple Inc. announced new products. The company reported strong sales.',
      'Barack Obama was president. Obama served two terms.'
    ]
  })
  
  describe('Rule-Based Coreference', () => {
    it('should return empty result for empty input', async () => {
      const result = await ruleBasedCoreference([])
      expect(result.clusters).toEqual([])
      expect(result.mentions).toEqual([])
      expect(result.corefChains).toEqual([])
    })
    
    it('should return empty result for null input', async () => {
      const result = await ruleBasedCoreference(null)
      expect(result.clusters).toEqual([])
      expect(result.mentions).toEqual([])
      expect(result.corefChains).toEqual([])
    })
    
    it('should extract mentions from text', async () => {
      const result = await ruleBasedCoreference(['John went to the store.'])
      expect(result.mentions.length).toBeGreaterThan(0)
    })
    
    it('should identify coreference chains', async () => {
      const result = await ruleBasedCoreference(sampleTexts)
      expect(result.corefChains.length).toBeGreaterThan(0)
    })
    
    it('should resolve pronoun references', async () => {
      const result = await ruleBasedCoreference(['John went to the store. He bought milk.'])
      // Should link "He" to "John"
      const chain = result.corefChains.find(c => 
        c.mentions.some(m => m.toLowerCase().includes('he')) ||
        c.mentions.some(m => m.toLowerCase().includes('john'))
      )
      expect(chain).toBeDefined()
    })
    
    it('should handle multiple mentions', async () => {
      const result = await ruleBasedCoreference(sampleTexts)
      expect(result.mentions.length).toBeGreaterThan(5)
    })
    
    it('should create clusters with multiple mentions', async () => {
      const result = await ruleBasedCoreference(sampleTexts)
      const multiMentionClusters = result.corefChains.filter(c => c.count > 1)
      expect(multiMentionClusters.length).toBeGreaterThan(0)
    })
    
    it('should have representative for each cluster', async () => {
      const result = await ruleBasedCoreference(sampleTexts)
      result.corefChains.forEach(chain => {
        expect(chain).toHaveProperty('representative')
        expect(chain.representative).toBeTruthy()
      })
    })
    
    it('should handle proper nouns', async () => {
      const result = await ruleBasedCoreference(['Apple Inc. announced new products.'])
      const properNouns = result.mentions.filter(m => m.type === 'proper')
      expect(properNouns.length).toBeGreaterThan(0)
    })
    
    it('should handle noun phrases', async () => {
      const result = await ruleBasedCoreference(['The big red car drove away.'])
      const nounPhrases = result.mentions.filter(m => m.type === 'noun_phrase')
      expect(nounPhrases.length).toBeGreaterThan(0)
    })
  })
  
  describe('Mention-Pair Coreference', () => {
    it('should return empty result for empty input', async () => {
      const result = await mentionPairCoreference([])
      expect(result.clusters).toEqual([])
      expect(result.mentions).toEqual([])
      expect(result.corefChains).toEqual([])
    })
    
    it('should extract mentions', async () => {
      const result = await mentionPairCoreference(sampleTexts)
      expect(result.mentions.length).toBeGreaterThan(0)
    })
    
    it('should create coreference chains', async () => {
      const result = await mentionPairCoreference(sampleTexts)
      expect(result.corefChains.length).toBeGreaterThan(0)
    })
    
    it('should have unique mention IDs', async () => {
      const result = await mentionPairCoreference(sampleTexts)
      const ids = result.mentions.map(m => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
    
    it('should assign mentions to clusters', async () => {
      const result = await mentionPairCoreference(sampleTexts)
      const assignedMentions = result.mentions.filter(m => m.cluster !== null)
      expect(assignedMentions.length).toBe(result.mentions.length)
    })
    
    it('should handle similarity-based clustering', async () => {
      const result = await mentionPairCoreference(['The car is fast. The vehicle is quick.'])
      // "car" and "vehicle" should be clustered together
      expect(result.corefChains.length).toBeGreaterThan(0)
    })
  })
  
  describe('Cluster-Based Coreference', () => {
    it('should return empty result for empty input', async () => {
      const result = await clusterBasedCoreference([])
      expect(result.clusters).toEqual([])
      expect(result.mentions).toEqual([])
      expect(result.corefChains).toEqual([])
    })
    
    it('should extract mentions', async () => {
      const result = await clusterBasedCoreference(sampleTexts)
      expect(result.mentions.length).toBeGreaterThan(0)
    })
    
    it('should create coreference clusters', async () => {
      const result = await clusterBasedCoreference(sampleTexts)
      expect(result.corefChains.length).toBeGreaterThan(0)
    })
    
    it('should incrementally build clusters', async () => {
      const result = await clusterBasedCoreference(sampleTexts)
      expect(result.corefChains.length).toBeGreaterThan(0)
      result.corefChains.forEach(chain => {
        expect(chain.mentions.length).toBeGreaterThan(1)
      })
    })
    
    it('should have cluster IDs', async () => {
      const result = await clusterBasedCoreference(sampleTexts)
      result.corefChains.forEach(chain => {
        expect(chain).toHaveProperty('id')
        expect(typeof chain.id).toBe('number')
      })
    })
  })
  
  describe('Algorithm Selection', () => {
    it('should use rule-based by default', async () => {
      const result = await performCoreferenceResolution(sampleTexts)
      expect(result.algorithm).toBe('rule-based')
    })
    
    it('should support rule-based algorithm', async () => {
      const result = await performCoreferenceResolution(sampleTexts, { algorithm: 'rule-based' })
      expect(result.algorithm).toBe('rule-based')
      expect(result.corefChains).toBeDefined()
    })
    
    it('should support mention-pair algorithm', async () => {
      const result = await performCoreferenceResolution(sampleTexts, { algorithm: 'mention-pair' })
      expect(result.algorithm).toBe('mention-pair')
      expect(result.corefChains).toBeDefined()
    })
    
    it('should support cluster-based algorithm', async () => {
      const result = await performCoreferenceResolution(sampleTexts, { algorithm: 'cluster-based' })
      expect(result.algorithm).toBe('cluster-based')
      expect(result.corefChains).toBeDefined()
    })
    
    it('should include algorithm in result', async () => {
      const result = await performCoreferenceResolution(sampleTexts, { algorithm: 'mention-pair' })
      expect(result).toHaveProperty('algorithm')
      expect(result.algorithm).toBe('mention-pair')
    })
    
    it('should report total processed samples', async () => {
      const result = await performCoreferenceResolution(sampleTexts)
      expect(result).toHaveProperty('totalProcessed')
      expect(result.totalProcessed).toBeGreaterThan(0)
    })
  })
  
  describe('Progress Reporting', () => {
    it('should call progress callback', async () => {
      let progressCalled = false
      await performCoreferenceResolution(sampleTexts, {
        onProgress: () => { progressCalled = true }
      })
      expect(progressCalled).toBe(true)
    })
    
    it('should report progress values', async () => {
      const progressValues = []
      await performCoreferenceResolution(sampleTexts, {
        onProgress: (value) => progressValues.push(value)
      })
      expect(progressValues.length).toBeGreaterThan(0)
      expect(progressValues).toContain(100)
    })
  })
  
  describe('Sample Limiting', () => {
    it('should respect maxSamples parameter', async () => {
      const manyTexts = Array(200).fill('John went to the store.')
      const result = await performCoreferenceResolution(manyTexts, { maxSamples: 50 })
      expect(result.totalProcessed).toBeLessThanOrEqual(50)
    })
    
    it('should handle maxSamples larger than input', async () => {
      const result = await performCoreferenceResolution(sampleTexts, { maxSamples: 1000 })
      expect(result.totalProcessed).toBe(sampleTexts.length)
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle single word text', async () => {
      const result = await performCoreferenceResolution(['Hello'])
      expect(result.corefChains).toBeDefined()
    })
    
    it('should handle text with no mentions', async () => {
      const result = await performCoreferenceResolution(['...'])
      expect(result.corefChains).toEqual([])
    })
    
    it('should handle very long text', async () => {
      const longText = 'John went to the store. '.repeat(50)
      const result = await performCoreferenceResolution([longText])
      expect(result.mentions.length).toBeGreaterThan(0)
    })
    
    it('should handle special characters', async () => {
      const result = await performCoreferenceResolution(['John & Mary went to the store!'])
      expect(result.mentions.length).toBeGreaterThan(0)
    })
  })
})
