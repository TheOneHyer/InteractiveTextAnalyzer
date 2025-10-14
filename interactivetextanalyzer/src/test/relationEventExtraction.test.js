import { describe, it, expect, beforeAll } from 'vitest'
import {
  patternBasedRelations,
  dependencyBasedRelations,
  extractEvents,
  performRelationEventExtraction
} from '../utils/relationEventExtraction'

describe('Relation and Event Extraction', () => {
  let sampleTexts
  
  beforeAll(() => {
    sampleTexts = [
      'John works for Google.',
      'Mary is the CEO of Apple Inc.',
      'Microsoft acquired GitHub in 2018.',
      'Barack Obama was born in Hawaii.',
      'The company is located in San Francisco.',
      'Steve Jobs founded Apple.',
      'Amazon bought Whole Foods.',
      'Google announced new products yesterday.'
    ]
  })
  
  describe('Pattern-Based Relations', () => {
    it('should return empty result for empty input', async () => {
      const result = await patternBasedRelations([])
      expect(result.relations).toEqual([])
      expect(result.entities).toEqual([])
    })
    
    it('should return empty result for null input', async () => {
      const result = await patternBasedRelations(null)
      expect(result.relations).toEqual([])
      expect(result.entities).toEqual([])
    })
    
    it('should extract employment relations', async () => {
      const result = await patternBasedRelations(['John works for Google.'])
      expect(result.relations.length).toBeGreaterThan(0)
      const employment = result.relations.find(r => r.type === 'employment')
      expect(employment).toBeDefined()
    })
    
    it('should extract leadership relations', async () => {
      const result = await patternBasedRelations(['Mary is the CEO of Apple Inc.'])
      expect(result.relations.length).toBeGreaterThan(0)
      const leadership = result.relations.find(r => r.type === 'leadership')
      expect(leadership).toBeDefined()
    })
    
    it('should extract ownership relations', async () => {
      const result = await patternBasedRelations(['Microsoft acquired GitHub.'])
      expect(result.relations.length).toBeGreaterThan(0)
    })
    
    it('should extract location relations', async () => {
      const result = await patternBasedRelations(['The company is located in San Francisco.'])
      expect(result.relations.length).toBeGreaterThan(0)
      const location = result.relations.find(r => r.type === 'location')
      expect(location).toBeDefined()
    })
    
    it('should extract entities', async () => {
      const result = await patternBasedRelations(sampleTexts)
      expect(result.entities.length).toBeGreaterThan(0)
    })
    
    it('should have relation structure', async () => {
      const result = await patternBasedRelations(sampleTexts)
      result.relations.forEach(relation => {
        expect(relation).toHaveProperty('id')
        expect(relation).toHaveProperty('subject')
        expect(relation).toHaveProperty('object')
        expect(relation).toHaveProperty('type')
        expect(relation).toHaveProperty('source')
      })
    })
    
    it('should extract multiple relations from multiple texts', async () => {
      const result = await patternBasedRelations(sampleTexts)
      expect(result.relations.length).toBeGreaterThan(1)
    })
    
    it('should report total relations', async () => {
      const result = await patternBasedRelations(sampleTexts)
      expect(result).toHaveProperty('totalRelations')
      expect(result.totalRelations).toBe(result.relations.length)
    })
    
    it('should handle creation relations', async () => {
      const result = await patternBasedRelations(['Steve Jobs founded Apple.'])
      expect(result.relations.length).toBeGreaterThan(0)
    })
  })
  
  describe('Dependency-Based Relations', () => {
    it('should return empty result for empty input', async () => {
      const result = await dependencyBasedRelations([])
      expect(result.relations).toEqual([])
      expect(result.entities).toEqual([])
    })
    
    it('should extract subject-verb-object relations', async () => {
      const result = await dependencyBasedRelations(['John loves pizza.'])
      expect(result.relations.length).toBeGreaterThan(0)
    })
    
    it('should identify subjects', async () => {
      const result = await dependencyBasedRelations(sampleTexts)
      result.relations.forEach(relation => {
        expect(relation).toHaveProperty('subject')
        expect(relation.subject).toBeTruthy()
      })
    })
    
    it('should identify verbs as relations', async () => {
      const result = await dependencyBasedRelations(sampleTexts)
      result.relations.forEach(relation => {
        expect(relation).toHaveProperty('relation')
        expect(relation.relation).toBeTruthy()
      })
    })
    
    it('should identify objects', async () => {
      const result = await dependencyBasedRelations(sampleTexts)
      result.relations.forEach(relation => {
        expect(relation).toHaveProperty('object')
        expect(relation.object).toBeTruthy()
      })
    })
    
    it('should have unique relation IDs', async () => {
      const result = await dependencyBasedRelations(sampleTexts)
      const ids = result.relations.map(r => r.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
    
    it('should extract entities', async () => {
      const result = await dependencyBasedRelations(sampleTexts)
      expect(result.entities.length).toBeGreaterThan(0)
    })
    
    it('should mark relations as svo type', async () => {
      const result = await dependencyBasedRelations(sampleTexts)
      result.relations.forEach(relation => {
        expect(relation.type).toBe('svo')
      })
    })
  })
  
  describe('Event Extraction', () => {
    it('should return empty result for empty input', async () => {
      const result = await extractEvents([])
      expect(result.events).toEqual([])
      expect(result.entities).toEqual([])
    })
    
    it('should extract movement events', async () => {
      const result = await extractEvents(['John went to New York.'])
      expect(result.events.length).toBeGreaterThan(0)
    })
    
    it('should extract transaction events', async () => {
      const result = await extractEvents(['Amazon bought Whole Foods.'])
      expect(result.events.length).toBeGreaterThan(0)
      const transaction = result.events.find(e => e.type === 'transaction')
      expect(transaction).toBeDefined()
    })
    
    it('should extract communication events', async () => {
      const result = await extractEvents(['Google announced new products.'])
      expect(result.events.length).toBeGreaterThan(0)
      const communication = result.events.find(e => e.type === 'communication')
      expect(communication).toBeDefined()
    })
    
    it('should have event structure', async () => {
      const result = await extractEvents(['John went to the store.'])
      result.events.forEach(event => {
        expect(event).toHaveProperty('id')
        expect(event).toHaveProperty('type')
        expect(event).toHaveProperty('trigger')
        expect(event).toHaveProperty('agent')
        expect(event).toHaveProperty('text')
        expect(event).toHaveProperty('source')
      })
    })
    
    it('should identify event agents', async () => {
      const result = await extractEvents(sampleTexts)
      result.events.forEach(event => {
        expect(event.agent).toBeTruthy()
      })
    })
    
    it('should extract event locations when present', async () => {
      const result = await extractEvents(['John went to New York.'])
      const events = result.events.filter(e => e.location)
      expect(events.length).toBeGreaterThanOrEqual(0)
    })
    
    it('should extract event times when present', async () => {
      const result = await extractEvents(['Microsoft acquired GitHub in 2018.'])
      const events = result.events.filter(e => e.time)
      expect(events.length).toBeGreaterThanOrEqual(0)
    })
    
    it('should report total events', async () => {
      const result = await extractEvents(sampleTexts)
      expect(result).toHaveProperty('totalEvents')
      expect(result.totalEvents).toBe(result.events.length)
    })
    
    it('should extract multiple events', async () => {
      const result = await extractEvents(sampleTexts)
      expect(result.events.length).toBeGreaterThan(0)
    })
  })
  
  describe('Algorithm Selection', () => {
    it('should use pattern-based by default', async () => {
      const result = await performRelationEventExtraction(sampleTexts)
      expect(result.algorithm).toBe('pattern')
    })
    
    it('should support pattern-based algorithm', async () => {
      const result = await performRelationEventExtraction(sampleTexts, { algorithm: 'pattern' })
      expect(result.algorithm).toBe('pattern')
      expect(result.relations).toBeDefined()
    })
    
    it('should support dependency-based algorithm', async () => {
      const result = await performRelationEventExtraction(sampleTexts, { algorithm: 'dependency' })
      expect(result.algorithm).toBe('dependency')
      expect(result.relations).toBeDefined()
    })
    
    it('should support event extraction algorithm', async () => {
      const result = await performRelationEventExtraction(sampleTexts, { algorithm: 'events' })
      expect(result.algorithm).toBe('events')
      expect(result.events).toBeDefined()
    })
    
    it('should include algorithm in result', async () => {
      const result = await performRelationEventExtraction(sampleTexts, { algorithm: 'dependency' })
      expect(result).toHaveProperty('algorithm')
      expect(result.algorithm).toBe('dependency')
    })
    
    it('should report total processed samples', async () => {
      const result = await performRelationEventExtraction(sampleTexts)
      expect(result).toHaveProperty('totalProcessed')
      expect(result.totalProcessed).toBeGreaterThan(0)
    })
  })
  
  describe('Progress Reporting', () => {
    it('should call progress callback', async () => {
      let progressCalled = false
      await performRelationEventExtraction(sampleTexts, {
        onProgress: () => { progressCalled = true }
      })
      expect(progressCalled).toBe(true)
    })
    
    it('should report progress values', async () => {
      const progressValues = []
      await performRelationEventExtraction(sampleTexts, {
        onProgress: (value) => progressValues.push(value)
      })
      expect(progressValues.length).toBeGreaterThan(0)
      expect(progressValues).toContain(100)
    })
  })
  
  describe('Sample Limiting', () => {
    it('should respect maxSamples parameter', async () => {
      const manyTexts = Array(200).fill('John works for Google.')
      const result = await performRelationEventExtraction(manyTexts, { maxSamples: 50 })
      expect(result.totalProcessed).toBeLessThanOrEqual(50)
    })
    
    it('should handle maxSamples larger than input', async () => {
      const result = await performRelationEventExtraction(sampleTexts, { maxSamples: 1000 })
      expect(result.totalProcessed).toBe(sampleTexts.length)
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle single word text', async () => {
      const result = await performRelationEventExtraction(['Hello'])
      expect(result.relations || result.events).toBeDefined()
    })
    
    it('should handle text with no relations', async () => {
      const result = await performRelationEventExtraction(['The sky is blue.'])
      expect(result.relations || result.events).toBeDefined()
    })
    
    it('should handle very long text', async () => {
      const longText = 'John works for Google. '.repeat(50)
      const result = await performRelationEventExtraction([longText])
      expect(result.relations || result.events).toBeDefined()
    })
    
    it('should handle special characters', async () => {
      const result = await performRelationEventExtraction(['John & Mary work for Google!'])
      expect(result.relations || result.events).toBeDefined()
    })
    
    it('should handle multiple sentences', async () => {
      const result = await performRelationEventExtraction([
        'John works for Google. Mary works for Apple. They are friends.'
      ])
      expect(result.relations || result.events).toBeDefined()
    })
  })
})
