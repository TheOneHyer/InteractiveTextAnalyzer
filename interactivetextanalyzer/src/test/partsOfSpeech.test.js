import { describe, it, expect } from 'vitest'
import { analyzePartsOfSpeech } from '../utils/textAnalysis'

describe('Parts of Speech Analysis', () => {
  describe('analyzePartsOfSpeech', () => {
    it('should return empty result for empty input', () => {
      const result = analyzePartsOfSpeech([], { method: 'rules' })
      
      expect(result).toBeDefined()
      expect(result.posCounts).toBeDefined()
      expect(result.totalWords).toBe(0)
    })

    it('should analyze simple text with rules-based method', () => {
      const texts = ['The cat runs quickly']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result).toBeDefined()
      expect(result.totalWords).toBeGreaterThan(0)
      expect(result.posCounts).toBeDefined()
      
      // The = determiner, cat = noun, runs = verb, quickly = adverb
      expect(result.posCounts.determiner).toBeGreaterThan(0)
      expect(result.posCounts.noun).toBeGreaterThan(0)
      expect(result.posCounts.verb).toBeGreaterThan(0)
      expect(result.posCounts.adverb).toBeGreaterThan(0)
    })

    it('should provide percentages for POS distribution', () => {
      const texts = ['The quick brown fox jumps over the lazy dog']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.percentages).toBeDefined()
      Object.values(result.percentages).forEach(percentage => {
        expect(typeof percentage).toBe('string')
        const num = parseFloat(percentage)
        expect(num).toBeGreaterThanOrEqual(0)
        expect(num).toBeLessThanOrEqual(100)
      })
    })

    it('should include example words for each POS category when requested', () => {
      const texts = ['The cat runs quickly and the dog barks loudly']
      const result = analyzePartsOfSpeech(texts, { 
        method: 'rules', 
        stopwords: new Set(),
        includeExamples: true 
      })
      
      expect(result.posExamples).toBeDefined()
      expect(Object.keys(result.posExamples).length).toBeGreaterThan(0)
      
      // Check structure of examples
      Object.values(result.posExamples).forEach(examples => {
        if (examples.length > 0) {
          expect(examples[0]).toHaveProperty('word')
          expect(examples[0]).toHaveProperty('count')
        }
      })
    })

    it('should not include examples when includeExamples is false', () => {
      const texts = ['The cat runs quickly']
      const result = analyzePartsOfSpeech(texts, { 
        method: 'rules', 
        stopwords: new Set(),
        includeExamples: false 
      })
      
      expect(result.posExamples).toBeDefined()
      expect(Object.values(result.posExamples).flat().length).toBe(0)
    })

    it('should respect stopwords filtering', () => {
      const texts = ['The cat runs quickly']
      const stopwords = new Set(['the'])
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords })
      
      // "the" should be excluded
      expect(result.totalWords).toBe(3) // cat, runs, quickly
    })

    it('should identify determiners correctly', () => {
      const texts = ['The a an this that these those my your']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.determiner).toBeGreaterThan(5)
    })

    it('should identify pronouns correctly', () => {
      const texts = ['I you he she it we they me him her us them']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.pronoun).toBeGreaterThan(5)
    })

    it('should identify prepositions correctly', () => {
      const texts = ['in on at to for with from by about']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.preposition).toBeGreaterThan(5)
    })

    it('should identify conjunctions correctly', () => {
      const texts = ['and or but nor yet so because although']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.conjunction).toBeGreaterThan(3)
    })

    it('should identify verbs by suffix patterns', () => {
      const texts = ['running walked jumping talked playing']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.verb).toBeGreaterThan(3)
    })

    it('should identify adverbs by -ly suffix', () => {
      const texts = ['quickly slowly happily carefully beautifully']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.adverb).toBeGreaterThan(3)
    })

    it('should identify adjectives by suffix patterns', () => {
      const texts = ['beautiful helpful endless active possible']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.posCounts.adjective).toBeGreaterThan(2)
    })

    it('should handle multiple documents', () => {
      const texts = [
        'The cat runs quickly',
        'A dog barks loudly',
        'Birds fly gracefully'
      ]
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      expect(result.totalWords).toBeGreaterThan(10)
      expect(result.posCounts.noun).toBeGreaterThan(2)
      expect(result.posCounts.verb).toBeGreaterThan(2)
    })

    it('should limit example words to top parameter', () => {
      const texts = ['word ' + Array(100).fill('test').join(' ')]
      const result = analyzePartsOfSpeech(texts, { 
        method: 'rules', 
        stopwords: new Set(),
        top: 5 
      })
      
      // Check that examples are limited
      Object.values(result.posExamples).forEach(examples => {
        expect(examples.length).toBeLessThanOrEqual(5)
      })
    })

    it('should calculate percentages correctly', () => {
      const texts = ['The cat']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      // Total should be 100%
      const totalPercentage = Object.values(result.percentages)
        .map(p => parseFloat(p))
        .reduce((sum, p) => sum + p, 0)
      
      expect(totalPercentage).toBeCloseTo(100, 0)
    })

    it('should default nouns for unknown words', () => {
      const texts = ['xyzabc qwerty asdfgh']
      const result = analyzePartsOfSpeech(texts, { method: 'rules', stopwords: new Set() })
      
      // Unknown words should be classified as nouns by default
      expect(result.posCounts.noun).toBeGreaterThan(0)
    })

    it('should handle compromise method when NLP lib is not provided', () => {
      const texts = ['The cat runs quickly']
      const result = analyzePartsOfSpeech(texts, { 
        method: 'compromise', 
        stopwords: new Set(),
        nlpLib: null 
      })
      
      // Should fall back to rules-based
      expect(result).toBeDefined()
      expect(result.totalWords).toBeGreaterThan(0)
    })

    it('should handle invalid method by falling back to rules', () => {
      const texts = ['The cat runs']
      const result = analyzePartsOfSpeech(texts, { 
        method: 'invalid', 
        stopwords: new Set() 
      })
      
      expect(result).toBeDefined()
      expect(result.totalWords).toBeGreaterThan(0)
    })

    it('should count word frequencies in examples', () => {
      const texts = ['cat cat dog cat dog dog']
      const result = analyzePartsOfSpeech(texts, { 
        method: 'rules', 
        stopwords: new Set(),
        includeExamples: true 
      })
      
      // Find examples in noun category
      const nounExamples = result.posExamples.noun
      const catExample = nounExamples.find(e => e.word === 'cat')
      const dogExample = nounExamples.find(e => e.word === 'dog')
      
      expect(catExample).toBeDefined()
      expect(dogExample).toBeDefined()
      expect(catExample.count).toBe(3)
      expect(dogExample.count).toBe(3)
    })
  })
})
