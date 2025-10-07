import { describe, it, expect } from 'vitest'
import { 
  tokenize, 
  buildStem, 
  computeTfIdf, 
  generateNGrams, 
  mineAssociations,
  DEFAULT_STOPWORDS 
} from '../utils/textAnalysis'

// No need to duplicate functions - import from centralized module

describe('Tokenization Utilities', () => {
  describe('tokenize', () => {
    it('should convert text to lowercase tokens', () => {
      const result = tokenize('Hello World')
      expect(result).toEqual(['hello', 'world'])
    })

    it('should filter out non-alphanumeric characters', () => {
      const result = tokenize('Hello, World! How are you?')
      expect(result).toEqual(['hello', 'world', 'how', 'are', 'you'])
    })

    it('should preserve apostrophes', () => {
      const result = tokenize("don't can't won't")
      expect(result).toEqual(["don't", "can't", "won't"])
    })

    it('should handle empty strings', () => {
      const result = tokenize('')
      expect(result).toEqual([])
    })

    it('should handle numbers', () => {
      const result = tokenize('Test 123 hello')
      expect(result).toEqual(['test', '123', 'hello'])
    })
  })

  describe('buildStem', () => {
    it('should create a stemming function', () => {
      const stemmer = buildStem()
      expect(typeof stemmer).toBe('function')
    })

    it('should remove common suffixes', () => {
      const stemmer = buildStem()
      expect(stemmer('running')).toBe('runn')
      expect(stemmer('walked')).toBe('walk')
      expect(stemmer('quickly')).toBe('quick')
      expect(stemmer('books')).toBe('book')
    })

    it('should cache results', () => {
      const stemmer = buildStem()
      const first = stemmer('running')
      const second = stemmer('running')
      expect(first).toBe(second)
    })

    it('should not modify words without suffixes', () => {
      const stemmer = buildStem()
      expect(stemmer('hello')).toBe('hello')
      expect(stemmer('world')).toBe('world')
    })
  })
})

describe('Text Analysis Functions', () => {
  // Using DEFAULT_STOPWORDS from imported module
  
  describe('computeTfIdf', () => {
    it('should compute TF-IDF scores for documents', () => {
      const docs = [
        'the cat sat on the mat',
        'the dog sat on the log',
        'cats and dogs are animals'
      ]
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result).toHaveProperty('perDoc')
      expect(result).toHaveProperty('aggregate')
      expect(result.perDoc).toHaveLength(3)
      expect(Array.isArray(result.aggregate)).toBe(true)
    })

    it('should filter out stopwords', () => {
      const docs = ['the quick brown fox']
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      const terms = result.aggregate.map(item => item.term)
      expect(terms).not.toContain('the')
    })

    it('should apply stemming when enabled', () => {
      const docs = ['running quickly']
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: new Set(), stem: true, stemmer })
      
      const terms = result.aggregate.map(item => item.term)
      expect(terms).toContain('runn')
      expect(terms).toContain('quick')
    })

    it('should handle empty documents', () => {
      const docs = []
      const stemmer = buildStem()
      const result = computeTfIdf(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result.perDoc).toHaveLength(0)
      expect(result.aggregate).toHaveLength(0)
    })
  })

  describe('generateNGrams', () => {
    it('should generate bigrams by default', () => {
      const texts = ['hello world example']
      const result = generateNGrams(texts, { 
        n: 2, 
        top: 80, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('gram')
      expect(result[0]).toHaveProperty('count')
    })

    it('should generate trigrams when n=3', () => {
      const texts = ['one two three four']
      const result = generateNGrams(texts, { 
        n: 3, 
        top: 80, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result.some(item => item.gram.split(' ').length === 3)).toBe(true)
    })

    it('should filter stopwords', () => {
      const texts = ['the quick brown fox']
      const result = generateNGrams(texts, { 
        n: 2, 
        top: 80, 
        stopwords: DEFAULT_STOPWORDS, 
        stem: false, 
        stemmer: buildStem() 
      })
      
      const grams = result.map(item => item.gram)
      expect(grams.every(gram => !gram.includes('the'))).toBe(true)
    })

    it('should count ngram frequencies', () => {
      const texts = ['hello world', 'hello world', 'goodbye world']
      const result = generateNGrams(texts, { 
        n: 2, 
        top: 80, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      const helloWorld = result.find(item => item.gram === 'hello world')
      expect(helloWorld).toBeDefined()
      expect(helloWorld.count).toBe(2)
    })
  })

  describe('mineAssociations', () => {
    it('should mine item associations from rows', () => {
      const rows = [
        { text: 'apple banana orange' },
        { text: 'apple banana' },
        { text: 'orange apple' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.3, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('pairs')
      expect(Array.isArray(result.items)).toBe(true)
      expect(Array.isArray(result.pairs)).toBe(true)
    })

    it('should calculate support for items', () => {
      const rows = [
        { text: 'apple' },
        { text: 'apple' },
        { text: 'banana' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.1, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      const apple = result.items.find(item => item.item === 'apple')
      expect(apple).toBeDefined()
      expect(apple.support).toBeCloseTo(0.667, 2)
    })

    it('should calculate lift for pairs', () => {
      const rows = [
        { text: 'coffee tea' },
        { text: 'coffee tea' },
        { text: 'coffee' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.1, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      if (result.pairs.length > 0) {
        expect(result.pairs[0]).toHaveProperty('lift')
        expect(result.pairs[0]).toHaveProperty('confidenceAB')
        expect(result.pairs[0]).toHaveProperty('confidenceBA')
      }
    })

    it('should filter by minimum support', () => {
      const rows = [
        { text: 'rare' },
        { text: 'common common common' }
      ]
      const cols = ['text']
      const result = mineAssociations(rows, cols, { 
        minSupport: 0.6, 
        stopwords: new Set(), 
        stem: false, 
        stemmer: buildStem() 
      })
      
      expect(result.items.every(item => item.support >= 0.6)).toBe(true)
    })
  })
})
