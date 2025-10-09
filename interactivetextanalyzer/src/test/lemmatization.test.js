import { describe, it, expect } from 'vitest'
import { analyzeLemmatization } from '../utils/textAnalysis'

describe('Lemmatization Analysis', () => {
  describe('analyzeLemmatization', () => {
    const sampleTexts = [
      'The cats are running quickly in the garden.',
      'The children were playing happily with their toys.',
      'She writes better stories than her friends.'
    ]

    describe('rules-based method', () => {
      it('should lemmatize plural nouns to singular', () => {
        const texts = ['cats dogs houses']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        
        // Check that plurals are converted to singular
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('cat')
        expect(lemmas).toContain('dog')
        expect(lemmas).toContain('house')
      })

      it('should lemmatize verb forms', () => {
        const texts = ['running walked talking']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        const lemmas = result.map(r => r.lemma)
        // Rules-based should remove -ing, -ed suffixes
        expect(lemmas).toContain('run')
        expect(lemmas).toContain('walk')
        expect(lemmas).toContain('talk')
      })

      it('should lemmatize adjectives with -er/-est suffixes', () => {
        const texts = ['bigger fastest happier']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('big')
        expect(lemmas).toContain('fast')
        expect(lemmas).toContain('happi')
      })

      it('should handle words ending in -ies', () => {
        const texts = ['cities countries families']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('city')
        expect(lemmas).toContain('country')
        expect(lemmas).toContain('family')
      })

      it('should filter out stopwords', () => {
        const texts = ['the cats and dogs']
        const stopwords = new Set(['the', 'and'])
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords })
        
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).not.toContain('the')
        expect(lemmas).not.toContain('and')
      })

      it('should count lemma frequencies', () => {
        const texts = ['cats cat cats']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(result.length).toBe(1)
        expect(result[0].lemma).toBe('cat')
        expect(result[0].count).toBe(3)
      })

      it('should track original forms', () => {
        const texts = ['running runs run']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        const runLemma = result.find(r => r.lemma === 'run')
        expect(runLemma).toBeDefined()
        expect(runLemma.originals).toContain('running')
        expect(runLemma.originals).toContain('runs')
        expect(runLemma.originals).toContain('run')
        expect(typeof runLemma.originals).toBe('string')
      })

      it('should handle empty text', () => {
        const texts = ['']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(result).toEqual([])
      })

      it('should limit results to top N', () => {
        const texts = ['a b c d e f g h i j k l m n o p q r s t']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 5, stopwords: new Set() })
        
        expect(result.length).toBeLessThanOrEqual(5)
      })
    })

    describe('wordnet method', () => {
      it('should lemmatize common irregular verbs', () => {
        const texts = ['went running wrote']
        const result = analyzeLemmatization(texts, { method: 'wordnet', top: 10, stopwords: new Set() })
        
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('go')
        expect(lemmas).toContain('run')
        expect(lemmas).toContain('write')
      })

      it('should lemmatize irregular plurals', () => {
        const texts = ['children men women']
        const result = analyzeLemmatization(texts, { method: 'wordnet', top: 10, stopwords: new Set() })
        
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('child')
        expect(lemmas).toContain('man')
        expect(lemmas).toContain('woman')
      })

      it('should lemmatize comparative and superlative forms', () => {
        const texts = ['better best worse worst']
        const result = analyzeLemmatization(texts, { method: 'wordnet', top: 10, stopwords: new Set() })
        
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('good')
        expect(lemmas).toContain('bad')
      })

      it('should handle words not in WordNet map', () => {
        const texts = ['unknown mystery']
        const result = analyzeLemmatization(texts, { method: 'wordnet', top: 10, stopwords: new Set() })
        
        // Words not in map should remain as-is
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('unknown')
        expect(lemmas).toContain('mystery')
      })

      it('should aggregate across multiple documents', () => {
        const texts = ['running quickly', 'ran fast', 'runs slowly']
        const result = analyzeLemmatization(texts, { method: 'wordnet', top: 10, stopwords: new Set() })
        
        const runLemma = result.find(r => r.lemma === 'run')
        expect(runLemma).toBeDefined()
        expect(runLemma.count).toBe(3)
      })
    })

    describe('compromise method', () => {
      it('should work without NLP library (fallback to rules)', () => {
        const texts = ['cats running']
        const result = analyzeLemmatization(texts, { method: 'compromise', top: 10, nlpLib: null, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      })

      it('should return proper structure', () => {
        const texts = ['test']
        const result = analyzeLemmatization(texts, { method: 'compromise', top: 10, nlpLib: null, stopwords: new Set() })
        
        expect(result.every(r => r.hasOwnProperty('lemma'))).toBe(true)
        expect(result.every(r => r.hasOwnProperty('count'))).toBe(true)
        expect(result.every(r => r.hasOwnProperty('originals'))).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle text with punctuation', () => {
        const texts = ['Hello, world! How are you?']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      })

      it('should handle mixed case text', () => {
        const texts = ['RUNNING Running running']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(result.length).toBe(1)
        expect(result[0].count).toBe(3)
      })

      it('should handle numbers in text', () => {
        const texts = ['test123 456test']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
      })

      it('should sort results by frequency', () => {
        const texts = ['a a a b b c']
        const result = analyzeLemmatization(texts, { method: 'rules', top: 10, stopwords: new Set() })
        
        expect(result[0].count).toBeGreaterThanOrEqual(result[1].count)
        if (result.length > 2) {
          expect(result[1].count).toBeGreaterThanOrEqual(result[2].count)
        }
      })

      it('should handle multiple sentences', () => {
        const texts = [
          'The cat runs fast. The dog runs faster. The bird flies highest.'
        ]
        const result = analyzeLemmatization(texts, { method: 'rules', top: 20, stopwords: new Set() })
        
        expect(result.length).toBeGreaterThan(0)
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('run')
      })
    })

    describe('parameter validation', () => {
      it('should use default method if invalid', () => {
        const texts = ['test']
        const result = analyzeLemmatization(texts, { method: 'invalid', top: 10, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
      })

      it('should default to rules method', () => {
        const texts = ['running']
        const result = analyzeLemmatization(texts, { top: 10, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
        const lemmas = result.map(r => r.lemma)
        expect(lemmas).toContain('run')
      })

      it('should handle default top parameter', () => {
        const longText = Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ')
        const result = analyzeLemmatization([longText], { method: 'rules', stopwords: new Set() })
        
        expect(result.length).toBeLessThanOrEqual(80)
      })
    })

    describe('real-world text', () => {
      it('should lemmatize complex sentences', () => {
        const texts = [
          'The researchers are analyzing data from multiple sources.',
          'They analyzed the patterns and found interesting results.',
          'Their analysis reveals significant correlations.'
        ]
        const result = analyzeLemmatization(texts, { method: 'rules', top: 20, stopwords: new Set(['the', 'are', 'from', 'and', 'their']) })
        
        expect(result.length).toBeGreaterThan(0)
        
        // Check that related forms are lemmatized together
        const analyzeLemma = result.find(r => r.lemma === 'analyz')
        if (analyzeLemma) {
          expect(analyzeLemma.count).toBeGreaterThan(1)
        }
      })

      it('should handle text with contractions', () => {
        const texts = ["It's a beautiful day. They're playing outside."]
        const result = analyzeLemmatization(texts, { method: 'rules', top: 20, stopwords: new Set() })
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      })
    })
  })
})
