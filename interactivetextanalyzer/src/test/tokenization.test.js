import { describe, it, expect } from 'vitest'
import { analyzeTokenization } from '../utils/textAnalysis'

describe('Tokenization Analysis', () => {
  describe('analyzeTokenization', () => {
    const sampleTexts = [
      'Hello world! This is a test.',
      'Testing tokenization at different levels.'
    ]

    describe('character level', () => {
      it('should tokenize text into individual characters', () => {
        const result = analyzeTokenization(sampleTexts, { level: 'character', top: 10 })
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('token')
        expect(result[0]).toHaveProperty('count')
      })

      it('should return characters sorted by frequency', () => {
        const result = analyzeTokenization(['aaabbc'], { level: 'character', top: 5 })
        expect(result[0].token).toBe('a')
        expect(result[0].count).toBe(3)
        expect(result[1].count).toBeLessThanOrEqual(result[0].count)
      })

      it('should filter out whitespace characters', () => {
        const result = analyzeTokenization(['a b c'], { level: 'character', top: 10 })
        const whitespaceTokens = result.filter(r => r.token === ' ')
        expect(whitespaceTokens.length).toBe(0)
      })

      it('should handle empty text', () => {
        const result = analyzeTokenization([''], { level: 'character', top: 10 })
        expect(result).toEqual([])
      })
    })

    describe('word level', () => {
      it('should tokenize text into words', () => {
        const result = analyzeTokenization(sampleTexts, { level: 'word', top: 20 })
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('token')
        expect(result[0]).toHaveProperty('count')
      })

      it('should return words sorted by frequency', () => {
        const texts = ['hello hello world hello']
        const result = analyzeTokenization(texts, { level: 'word', top: 5 })
        expect(result[0].token).toBe('hello')
        expect(result[0].count).toBe(3)
        expect(result[1].token).toBe('world')
        expect(result[1].count).toBe(1)
      })

      it('should convert words to lowercase', () => {
        const texts = ['Hello HELLO hello']
        const result = analyzeTokenization(texts, { level: 'word', top: 5 })
        expect(result[0].token).toBe('hello')
        expect(result[0].count).toBe(3)
      })

      it('should filter out punctuation', () => {
        const texts = ['Hello, world!']
        const result = analyzeTokenization(texts, { level: 'word', top: 5 })
        const tokens = result.map(r => r.token)
        expect(tokens).not.toContain(',')
        expect(tokens).not.toContain('!')
      })

      it('should handle empty text', () => {
        const result = analyzeTokenization([''], { level: 'word', top: 10 })
        expect(result).toEqual([])
      })
    })

    describe('subword level', () => {
      it('should tokenize text into subword units', () => {
        const result = analyzeTokenization(sampleTexts, { level: 'subword', top: 20 })
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('token')
        expect(result[0]).toHaveProperty('count')
      })

      it('should extract character n-grams from words', () => {
        const texts = ['testing']
        const result = analyzeTokenization(texts, { level: 'subword', top: 20 })
        const tokens = result.map(r => r.token)
        expect(tokens).toContain('te')
        expect(tokens).toContain('es')
        expect(tokens).toContain('st')
      })

      it('should include full words longer than 4 characters', () => {
        const texts = ['testing']
        const result = analyzeTokenization(texts, { level: 'subword', top: 20 })
        const tokens = result.map(r => r.token)
        expect(tokens).toContain('testing')
      })

      it('should return subwords sorted by frequency', () => {
        const texts = ['test test testing']
        const result = analyzeTokenization(texts, { level: 'subword', top: 20 })
        expect(result[0].count).toBeGreaterThanOrEqual(result[1].count)
      })

      it('should handle empty text', () => {
        const result = analyzeTokenization([''], { level: 'subword', top: 10 })
        expect(result).toEqual([])
      })
    })

    describe('sentence level', () => {
      it('should tokenize text into sentences', () => {
        const texts = ['First sentence. Second sentence! Third sentence?']
        const result = analyzeTokenization(texts, { level: 'sentence', top: 10 })
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('token')
        expect(result[0]).toHaveProperty('count')
      })

      it('should split on sentence boundaries', () => {
        const texts = ['Hello world. Another sentence!']
        const result = analyzeTokenization(texts, { level: 'sentence', top: 10 })
        expect(result.length).toBeGreaterThanOrEqual(2)
      })

      it('should truncate long sentences for display', () => {
        const longSentence = 'This is a very long sentence that should be truncated to fit within the display limit of fifty characters.'
        const texts = [longSentence]
        const result = analyzeTokenization(texts, { level: 'sentence', top: 10 })
        expect(result[0].token.length).toBeLessThanOrEqual(50)
      })

      it('should count duplicate sentences', () => {
        const texts = ['Hello world. Hello world. Goodbye.']
        const result = analyzeTokenization(texts, { level: 'sentence', top: 10 })
        const helloSentence = result.find(r => r.token.includes('Hello'))
        expect(helloSentence).toBeDefined()
        expect(helloSentence.count).toBe(2)
      })

      it('should handle empty text', () => {
        const result = analyzeTokenization([''], { level: 'sentence', top: 10 })
        expect(result).toEqual([])
      })

      it('should filter out empty sentences', () => {
        const texts = ['First sentence.. .. Second sentence.']
        const result = analyzeTokenization(texts, { level: 'sentence', top: 10 })
        const emptyTokens = result.filter(r => r.token.trim().length === 0)
        expect(emptyTokens.length).toBe(0)
      })
    })

    describe('top parameter', () => {
      it('should limit results to top N tokens', () => {
        const texts = ['a b c d e f g h i j k l m n o p q r s t u v w x y z']
        const result = analyzeTokenization(texts, { level: 'word', top: 5 })
        expect(result.length).toBeLessThanOrEqual(5)
      })

      it('should default to 80 if not specified', () => {
        const longText = Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ')
        const result = analyzeTokenization([longText], { level: 'word' })
        expect(result.length).toBeLessThanOrEqual(80)
      })
    })

    describe('multiple documents', () => {
      it('should aggregate tokens across multiple documents', () => {
        const texts = ['hello world', 'hello universe']
        const result = analyzeTokenization(texts, { level: 'word', top: 10 })
        const helloToken = result.find(r => r.token === 'hello')
        expect(helloToken).toBeDefined()
        expect(helloToken.count).toBe(2)
      })

      it('should handle mixed content across documents', () => {
        const texts = [
          'Testing character analysis.',
          'Analyzing word frequencies.',
          'Exploring tokenization methods.'
        ]
        const result = analyzeTokenization(texts, { level: 'word', top: 20 })
        expect(result.length).toBeGreaterThan(0)
        expect(result.every(r => typeof r.token === 'string')).toBe(true)
        expect(result.every(r => typeof r.count === 'number')).toBe(true)
      })
    })

    describe('edge cases', () => {
      it('should handle text with only punctuation', () => {
        const texts = ['!@#$%^&*()']
        const result = analyzeTokenization(texts, { level: 'word', top: 10 })
        expect(Array.isArray(result)).toBe(true)
      })

      it('should handle text with numbers', () => {
        const texts = ['test 123 456 test']
        const result = analyzeTokenization(texts, { level: 'word', top: 10 })
        const tokens = result.map(r => r.token)
        expect(tokens).toContain('test')
        expect(tokens).toContain('123')
      })

      it('should handle mixed case consistently', () => {
        const texts = ['HELLO hello HeLLo']
        const result = analyzeTokenization(texts, { level: 'word', top: 10 })
        expect(result.length).toBe(1)
        expect(result[0].count).toBe(3)
      })

      it('should handle default level if invalid', () => {
        const texts = ['hello world']
        const result = analyzeTokenization(texts, { level: 'invalid', top: 10 })
        expect(Array.isArray(result)).toBe(true)
      })
    })
  })
})
