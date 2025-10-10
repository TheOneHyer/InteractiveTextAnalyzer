import { describe, it, expect } from 'vitest'
import { analyzeSentiment, DEFAULT_STOPWORDS } from '../utils/textAnalysis'

describe('Sentiment Analysis', () => {
  describe('Lexicon Method', () => {
    it('should identify positive sentiment in text', () => {
      const texts = ['This is a great and wonderful product']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(1)
      expect(result.results[0].sentiment).toBe('positive')
      expect(result.results[0].score).toBeGreaterThan(0)
      expect(result.summary.positive).toBe(1)
      expect(result.summary.negative).toBe(0)
    })
    
    it('should identify negative sentiment in text', () => {
      const texts = ['This is terrible and awful experience']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(1)
      expect(result.results[0].sentiment).toBe('negative')
      expect(result.results[0].score).toBeLessThan(0)
      expect(result.summary.positive).toBe(0)
      expect(result.summary.negative).toBe(1)
    })
    
    it('should identify neutral sentiment when no sentiment words present', () => {
      const texts = ['This is a book about history']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(1)
      expect(result.results[0].sentiment).toBe('neutral')
      expect(result.summary.neutral).toBe(1)
    })
    
    it('should handle mixed sentiment with positive dominant', () => {
      const texts = ['Great product but has some bad features']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(1)
      expect(result.results[0].positive).toBeGreaterThan(0)
      expect(result.results[0].negative).toBeGreaterThan(0)
    })
    
    it('should calculate confidence scores', () => {
      const texts = ['This is amazing and wonderful']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].confidence).toBeGreaterThan(0)
      expect(result.results[0].confidence).toBeLessThanOrEqual(1)
    })
    
    it('should analyze multiple texts', () => {
      const texts = [
        'Great product',
        'Terrible experience',
        'Normal item'
      ]
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(3)
      expect(result.summary.total).toBe(3)
      expect(result.summary.positive).toBe(1)
      expect(result.summary.negative).toBe(1)
      expect(result.summary.neutral).toBe(1)
    })
    
    it('should calculate summary statistics correctly', () => {
      const texts = [
        'Good', 'Great', 'Bad'
      ]
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.summary.positivePercent).toBeCloseTo(66.67, 1)
      expect(result.summary.negativePercent).toBeCloseTo(33.33, 1)
      expect(result.summary.avgScore).toBeDefined()
      expect(result.summary.avgConfidence).toBeDefined()
    })
  })
  
  describe('VADER Method', () => {
    it('should apply intensifiers to sentiment', () => {
      const texts1 = ['This is good']
      const texts2 = ['This is very good']
      
      const result1 = analyzeSentiment(texts1, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      const result2 = analyzeSentiment(texts2, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result2.results[0].score).toBeGreaterThan(result1.results[0].score)
    })
    
    it('should handle negation correctly', () => {
      const texts1 = ['This is good']
      const texts2 = ['This is not good']
      
      const result1 = analyzeSentiment(texts1, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      const result2 = analyzeSentiment(texts2, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result1.results[0].sentiment).toBe('positive')
      expect(result2.results[0].sentiment).not.toBe('positive')
    })
    
    it('should combine intensifiers with sentiment words', () => {
      const texts = ['This is extremely amazing']
      const result = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].sentiment).toBe('positive')
      expect(result.results[0].score).toBeGreaterThan(0)
    })
    
    it('should handle negation with intensifiers', () => {
      const texts = ['Not very good']
      const result = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].score).toBeLessThan(0)
    })
    
    it('should normalize scores to [-1, 1] range', () => {
      const texts = ['Great amazing wonderful excellent fantastic']
      const result = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].score).toBeGreaterThanOrEqual(-1)
      expect(result.results[0].score).toBeLessThanOrEqual(1)
    })
  })
  
  describe('Pattern Method', () => {
    it('should detect comparative patterns', () => {
      const texts = ['This is better than before']
      const result = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].sentiment).toBe('positive')
    })
    
    it('should detect superlative patterns', () => {
      const texts = ['This is the worst product ever']
      const result = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].sentiment).toBe('negative')
    })
    
    it('should handle exclamation marks as intensity markers', () => {
      const texts1 = ['This is good']
      const texts2 = ['This is good!']
      
      const result1 = analyzeSentiment(texts1, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      const result2 = analyzeSentiment(texts2, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      // Score with exclamation should be higher (more intense)
      expect(Math.abs(result2.results[0].score)).toBeGreaterThanOrEqual(Math.abs(result1.results[0].score))
    })
    
    it('should apply negation patterns', () => {
      const texts = ["Don't like this bad product"]
      const result = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].negative).toBeGreaterThan(0)
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle empty text array', () => {
      const texts = []
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(0)
    })
    
    it('should handle single word texts', () => {
      const texts = ['great', 'bad', 'okay']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results).toHaveLength(3)
      expect(result.results[0].sentiment).toBe('positive')
      expect(result.results[1].sentiment).toBe('negative')
    })
    
    it('should truncate long texts in results', () => {
      const longText = 'a'.repeat(200)
      const texts = [longText]
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].text.length).toBeLessThanOrEqual(103) // 100 + '...'
    })
    
    it('should respect stopwords parameter', () => {
      const customStopwords = new Set(['the', 'is', 'a'])
      const texts = ['This is a great product']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: customStopwords })
      
      expect(result.results).toHaveLength(1)
      expect(result.results[0].sentiment).toBe('positive')
    })
    
    it('should handle texts with only stopwords', () => {
      const texts = ['the is a an']
      const result = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].sentiment).toBe('neutral')
      expect(result.results[0].score).toBe(0)
    })
  })
  
  describe('Method Comparison', () => {
    it('should return same method in results', () => {
      const texts = ['Good product']
      
      const result1 = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      const result2 = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      const result3 = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result1.method).toBe('lexicon')
      expect(result2.method).toBe('vader')
      expect(result3.method).toBe('pattern')
    })
    
    it('should all methods identify clear positive sentiment', () => {
      const texts = ['This is absolutely amazing and wonderful']
      
      const result1 = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      const result2 = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      const result3 = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result1.results[0].sentiment).toBe('positive')
      expect(result2.results[0].sentiment).toBe('positive')
      expect(result3.results[0].sentiment).toBe('positive')
    })
    
    it('should all methods identify clear negative sentiment', () => {
      const texts = ['This is absolutely terrible and awful']
      
      const result1 = analyzeSentiment(texts, { method: 'lexicon', stopwords: DEFAULT_STOPWORDS })
      const result2 = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      const result3 = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result1.results[0].sentiment).toBe('negative')
      expect(result2.results[0].sentiment).toBe('negative')
      expect(result3.results[0].sentiment).toBe('negative')
    })
  })
  
  describe('Real-world Examples', () => {
    it('should analyze product reviews correctly', () => {
      const texts = [
        'This product exceeded my expectations! Highly recommended.',
        'Waste of money. Poor quality and terrible customer service.',
        'It works as expected. Nothing special.'
      ]
      
      const result = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.summary.total).toBe(3)
      expect(result.results[0].sentiment).toBe('positive')
      expect(result.results[1].sentiment).toBe('negative')
      expect(result.results[2].sentiment).toBe('neutral')
    })
    
    it('should handle restaurant reviews', () => {
      const texts = [
        'The food was delicious and the service was outstanding',
        'Overpriced and disappointing. Will never return.',
        'Average restaurant with standard menu options'
      ]
      
      const result = analyzeSentiment(texts, { method: 'pattern', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.results[0].sentiment).toBe('positive')
      expect(result.results[1].sentiment).toBe('negative')
    })
    
    it('should analyze social media posts', () => {
      const texts = [
        'Having an amazing day!',
        'So frustrated with this situation',
        'Just another Monday'
      ]
      
      const result = analyzeSentiment(texts, { method: 'vader', stopwords: DEFAULT_STOPWORDS })
      
      expect(result.summary.positive).toBeGreaterThanOrEqual(1)
      expect(result.summary.negative).toBeGreaterThanOrEqual(1)
      expect(result.summary.neutral).toBeGreaterThanOrEqual(1)
    })
  })
})
