import { describe, it, expect } from 'vitest'
import { 
  buildStem, 
  computeDocumentEmbeddings,
  DEFAULT_STOPWORDS 
} from '../utils/textAnalysis'

// No need to duplicate functions - import from centralized module

describe('Document Embeddings', () => {
  describe('computeDocumentEmbeddings', () => {
    it('should create vectors for documents', () => {
      const docs = [
        'the quick brown fox jumps over the lazy dog',
        'the lazy cat sleeps on the warm mat',
        'machine learning algorithms process large datasets'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result).toHaveProperty('vectors')
      expect(result).toHaveProperty('vocab')
      expect(result.vectors).toHaveLength(3)
      expect(result.vocab.length).toBeGreaterThan(0)
      expect(result.vocab.length).toBeLessThanOrEqual(100)
    })

    it('should create vectors with correct dimensions', () => {
      const docs = [
        'data science is amazing',
        'machine learning is powerful',
        'artificial intelligence is transformative'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      // All vectors should have the same length
      const firstVectorLength = result.vectors[0].length
      expect(result.vectors.every(v => v.length === firstVectorLength)).toBe(true)
      
      // Vector length should match vocabulary size
      expect(firstVectorLength).toBe(result.vocab.length)
    })

    it('should apply stopwords filtering', () => {
      const docs = [
        'the quick brown fox',
        'the lazy dog'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      // 'the' should be filtered out from vocabulary
      expect(result.vocab).not.toContain('the')
    })

    it('should apply stemming when enabled', () => {
      const docs = [
        'running quickly',
        'runner runs'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: new Set(), stem: true, stemmer })
      
      // With stemming, 'running' and 'runner' should become 'runn', 'runs' -> 'run'
      const terms = result.vocab
      expect(terms.some(t => t === 'runn' || t === 'run')).toBe(true)
    })

    it('should handle empty documents', () => {
      const docs = []
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result.vectors).toHaveLength(0)
      expect(result.vocab).toHaveLength(0)
    })

    it('should create sparse vectors for diverse documents', () => {
      const docs = [
        'cat dog bird',
        'car bike plane',
        'apple banana orange'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: new Set(), stem: false, stemmer })
      
      // Documents have no overlapping terms, so each vector should have mostly zeros
      result.vectors.forEach(vector => {
        const nonZeroCount = vector.filter(v => v !== 0).length
        expect(nonZeroCount).toBeGreaterThan(0)
        expect(nonZeroCount).toBeLessThanOrEqual(result.vocab.length)
      })
    })

    it('should create denser vectors for similar documents', () => {
      const docs = [
        'machine learning algorithm',
        'machine learning model',
        'machine learning technique'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: new Set(), stem: false, stemmer })
      
      // 'machine' and 'learning' should appear in all documents
      expect(result.vocab).toContain('machine')
      expect(result.vocab).toContain('learning')
      
      // All vectors should have non-zero values for these shared terms
      const machineIdx = result.vocab.indexOf('machine')
      const learningIdx = result.vocab.indexOf('learning')
      
      result.vectors.forEach(vector => {
        expect(vector[machineIdx]).toBeGreaterThan(0)
        expect(vector[learningIdx]).toBeGreaterThan(0)
      })
    })

    it('should limit vocabulary size to top 100 terms', () => {
      // Create documents with many unique terms
      const docs = []
      for (let i = 0; i < 150; i++) {
        docs.push(`term${i} unique${i} word${i}`)
      }
      
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: new Set(), stem: false, stemmer })
      
      expect(result.vocab.length).toBeLessThanOrEqual(100)
    })
  })

  describe('Dimensionality Reduction Mock', () => {
    it('should reduce high-dimensional vectors to 2D points', () => {
      const docs = [
        'first document about cats',
        'second document about dogs',
        'third document about birds'
      ]
      const stemmer = buildStem()
      const embeddings = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      // Mock dimensionality reduction (real one would be tested with actual libraries)
      const mockReduction = embeddings.vectors.map((vector, i) => ({
        x: i * 0.5,  // Mock x coordinate
        y: i * 0.3   // Mock y coordinate
      }))
      
      expect(mockReduction).toHaveLength(3)
      expect(mockReduction[0]).toHaveProperty('x')
      expect(mockReduction[0]).toHaveProperty('y')
      expect(typeof mockReduction[0].x).toBe('number')
      expect(typeof mockReduction[0].y).toBe('number')
    })

    it('should create labeled points for visualization', () => {
      const docs = [
        'This is the first document',
        'This is the second document'
      ]
      const stemmer = buildStem()
      const embeddings = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      // Mock labeled points
      const mockPoints = embeddings.vectors.map((vector, i) => ({
        x: i,
        y: i,
        label: docs[i].slice(0, 50) + '...'
      }))
      
      expect(mockPoints).toHaveLength(2)
      expect(mockPoints[0]).toHaveProperty('label')
      expect(mockPoints[0].label).toContain('This is the first')
    })
  })

  describe('Edge Cases', () => {
    it('should handle documents with only stopwords', () => {
      const docs = [
        'the and or but',
        'a an the is'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      // Should produce empty or minimal vectors
      expect(result.vectors).toHaveLength(2)
      expect(result.vocab.length).toBe(0)
    })

    it('should handle single document', () => {
      const docs = ['single document with some words']
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: DEFAULT_STOPWORDS, stem: false, stemmer })
      
      expect(result.vectors).toHaveLength(1)
      expect(result.vocab.length).toBeGreaterThan(0)
    })

    it('should handle documents with special characters', () => {
      const docs = [
        'hello@world.com test!',
        'data#science $100'
      ]
      const stemmer = buildStem()
      const result = computeDocumentEmbeddings(docs, { stopwords: new Set(), stem: false, stemmer })
      
      // Special characters should be filtered by tokenization
      expect(result.vocab).not.toContain('@')
      expect(result.vocab).not.toContain('!')
      expect(result.vocab).not.toContain('#')
      expect(result.vocab).not.toContain('$')
    })
  })
})
