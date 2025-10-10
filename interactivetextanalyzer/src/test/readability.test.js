import { describe, it, expect } from 'vitest'
import { analyzeReadability } from '../utils/textAnalysis'

describe('Readability Analysis', () => {
  describe('Basic Functionality', () => {
    it('should handle empty array', () => {
      const result = analyzeReadability([])
      expect(result.results).toEqual([])
      expect(result.aggregate).toBeDefined()
      expect(result.interpretation).toBeDefined()
      expect(result.algorithms).toHaveLength(6)
    })
    
    it('should handle empty strings', () => {
      const result = analyzeReadability(['', '  ', '\n'])
      expect(result.results).toHaveLength(3)
      result.results.forEach(r => {
        expect(r.words).toBe(0)
        expect(r.sentences).toBe(0)
      })
    })
    
    it('should return all six readability algorithms', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.algorithms).toEqual([
        'Flesch Reading Ease',
        'Flesch-Kincaid Grade Level',
        'Coleman-Liau Index',
        'Gunning Fog Index',
        'SMOG Index',
        'Automated Readability Index (ARI)'
      ])
    })
  })
  
  describe('Simple Text Analysis', () => {
    it('should analyze simple sentence correctly', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.results).toHaveLength(1)
      const r = result.results[0]
      
      expect(r.words).toBe(6)
      expect(r.sentences).toBe(1)
      expect(r.syllables).toBeGreaterThan(0)
      expect(r.characters).toBeGreaterThan(0)
      
      // Simple text should have high Flesch score (easy to read)
      expect(result.aggregate.flesch).toBeGreaterThan(70)
      
      // Simple text should have low grade levels
      expect(result.aggregate.fleschKincaid).toBeLessThan(5)
    })
    
    it('should count words correctly', () => {
      const texts = ['The quick brown fox jumps over the lazy dog.']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].words).toBe(9)
      expect(result.aggregate.totalWords).toBe(9)
    })
    
    it('should count sentences correctly', () => {
      const texts = ['First sentence. Second sentence! Third sentence?']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].sentences).toBe(3)
    })
  })
  
  describe('Complex Text Analysis', () => {
    it('should rate complex text as more difficult', () => {
      const simpleText = ['The cat sat. The dog ran. The bird flew.']
      const complexText = ['Photosynthesis is the biochemical process whereby plants synthesize carbohydrates from atmospheric carbon dioxide.']
      
      const simpleResult = analyzeReadability(simpleText)
      const complexResult = analyzeReadability(complexText)
      
      // Complex text should have lower Flesch score (harder to read)
      expect(complexResult.aggregate.flesch).toBeLessThan(simpleResult.aggregate.flesch)
      
      // Complex text should have higher grade levels
      expect(complexResult.aggregate.fleschKincaid).toBeGreaterThan(simpleResult.aggregate.fleschKincaid)
      expect(complexResult.aggregate.gunningFog).toBeGreaterThan(simpleResult.aggregate.gunningFog)
    })
    
    it('should count complex words (3+ syllables)', () => {
      const texts = ['The magnificent elephant demonstrated incredible intelligence.']
      const result = analyzeReadability(texts)
      
      // magnificent (4), elephant (3), demonstrated (4), incredible (4), intelligence (4)
      expect(result.results[0].complexWords).toBeGreaterThan(3)
    })
  })
  
  describe('Multiple Documents', () => {
    it('should analyze multiple documents and compute aggregate', () => {
      const texts = [
        'The cat sat on the mat.',
        'A quick brown fox jumped over the lazy dog.',
        'Programming requires analytical thinking.'
      ]
      const result = analyzeReadability(texts)
      
      expect(result.results).toHaveLength(3)
      
      // Check aggregate statistics
      expect(result.aggregate.totalWords).toBeGreaterThan(0)
      expect(result.aggregate.totalSentences).toBe(3)
      expect(result.aggregate.avgWords).toBeGreaterThan(0)
      
      // All algorithms should have aggregate scores
      expect(result.aggregate.flesch).toBeDefined()
      expect(result.aggregate.fleschKincaid).toBeDefined()
      expect(result.aggregate.colemanLiau).toBeDefined()
      expect(result.aggregate.gunningFog).toBeDefined()
      expect(result.aggregate.smog).toBeDefined()
      expect(result.aggregate.ari).toBeDefined()
    })
    
    it('should compute correct averages across documents', () => {
      const texts = [
        'Cat.',  // Very simple
        'The sophisticated algorithm demonstrates exceptional computational efficiency.'  // Complex
      ]
      const result = analyzeReadability(texts)
      
      // Average should be between the two extremes
      const doc1Flesch = result.results[0].flesch
      const doc2Flesch = result.results[1].flesch
      const avgFlesch = result.aggregate.flesch
      
      expect(avgFlesch).toBeGreaterThan(Math.min(doc1Flesch, doc2Flesch))
      expect(avgFlesch).toBeLessThan(Math.max(doc1Flesch, doc2Flesch))
    })
  })
  
  describe('Readability Scores', () => {
    it('should calculate Flesch Reading Ease score', () => {
      const texts = ['The cat sat on the mat and looked around carefully.']
      const result = analyzeReadability(texts)
      
      // Flesch score should be between 0-100
      expect(result.aggregate.flesch).toBeGreaterThanOrEqual(0)
      expect(result.aggregate.flesch).toBeLessThanOrEqual(120) // Can exceed 100 for very simple text
    })
    
    it('should calculate Flesch-Kincaid Grade Level', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      // Grade level should be non-negative
      expect(result.aggregate.fleschKincaid).toBeGreaterThanOrEqual(0)
    })
    
    it('should calculate Coleman-Liau Index', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.aggregate.colemanLiau).toBeGreaterThanOrEqual(0)
    })
    
    it('should calculate Gunning Fog Index', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.aggregate.gunningFog).toBeGreaterThanOrEqual(0)
    })
    
    it('should calculate SMOG Index', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.aggregate.smog).toBeGreaterThanOrEqual(0)
    })
    
    it('should calculate Automated Readability Index', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.aggregate.ari).toBeGreaterThanOrEqual(0)
    })
  })
  
  describe('Interpretations', () => {
    it('should provide interpretation for Flesch Reading Ease', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.interpretation.flesch).toBeDefined()
      expect(typeof result.interpretation.flesch).toBe('string')
      expect(result.interpretation.flesch.length).toBeGreaterThan(0)
    })
    
    it('should provide grade level interpretations', () => {
      const texts = ['The cat sat on the mat.']
      const result = analyzeReadability(texts)
      
      expect(result.interpretation.fleschKincaid).toBeDefined()
      expect(result.interpretation.colemanLiau).toBeDefined()
      expect(result.interpretation.gunningFog).toBeDefined()
      expect(result.interpretation.smog).toBeDefined()
      expect(result.interpretation.ari).toBeDefined()
      
      // All interpretations should be strings
      Object.values(result.interpretation).forEach(interp => {
        expect(typeof interp).toBe('string')
      })
    })
    
    it('should classify very easy text correctly', () => {
      const texts = ['Cat. Dog. Run. Jump.']
      const result = analyzeReadability(texts)
      
      // Very simple text should have high Flesch score
      expect(result.aggregate.flesch).toBeGreaterThan(70)
      expect(result.interpretation.flesch).toContain('Easy')
    })
    
    it('should classify difficult text correctly', () => {
      const texts = [
        'The implementation of sophisticated algorithmic methodologies necessitates comprehensive understanding of computational complexity theory and optimization techniques.'
      ]
      const result = analyzeReadability(texts)
      
      // Complex text should have low Flesch score
      expect(result.aggregate.flesch).toBeLessThan(50)
      expect(result.interpretation.fleschKincaid).toMatch(/College|Graduate/)
    })
  })
  
  describe('Per-Document Option', () => {
    it('should return per-document results when perDocument is true', () => {
      const texts = ['Text one.', 'Text two.', 'Text three.']
      const result = analyzeReadability(texts, { perDocument: true })
      
      expect(result.results).toHaveLength(3)
      result.results.forEach((r, i) => {
        expect(r.index).toBe(i)
        expect(r.text).toBeDefined()
        expect(r.flesch).toBeDefined()
      })
    })
    
    it('should return empty results when perDocument is false', () => {
      const texts = ['Text one.', 'Text two.']
      const result = analyzeReadability(texts, { perDocument: false })
      
      expect(result.results).toEqual([])
      expect(result.aggregate).toBeDefined()
    })
  })
  
  describe('Syllable Counting', () => {
    it('should count syllables in simple words', () => {
      const texts = ['cat dog run']
      const result = analyzeReadability(texts)
      
      // 'cat' (1), 'dog' (1), 'run' (1) = 3 syllables
      expect(result.results[0].syllables).toBe(3)
    })
    
    it('should count syllables in multi-syllable words', () => {
      const texts = ['elephant beautiful running']
      const result = analyzeReadability(texts)
      
      // 'elephant' (3), 'beautiful' (3), 'running' (2) = 8 syllables
      expect(result.results[0].syllables).toBeGreaterThan(6)
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle single word', () => {
      const texts = ['Hello']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].words).toBe(1)
      expect(result.results[0].sentences).toBe(1) // Counted as at least 1
    })
    
    it('should handle text with no punctuation', () => {
      const texts = ['the quick brown fox jumps over the lazy dog']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].words).toBe(9)
      expect(result.results[0].sentences).toBeGreaterThanOrEqual(1)
    })
    
    it('should handle text with multiple punctuation', () => {
      const texts = ['Hello!!! How are you??? Great!!!']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].sentences).toBe(3)
    })
    
    it('should handle text with numbers', () => {
      const texts = ['There are 123 items in the box.']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].words).toBeGreaterThan(0)
    })
    
    it('should truncate long text in results', () => {
      const longText = 'a '.repeat(100) + 'end'
      const result = analyzeReadability([longText])
      
      expect(result.results[0].text.length).toBeLessThanOrEqual(103) // 100 + '...'
      expect(result.results[0].text).toContain('...')
    })
  })
  
  describe('Statistical Validity', () => {
    it('should have consistent results for identical texts', () => {
      const texts = ['The same text repeated.', 'The same text repeated.']
      const result = analyzeReadability(texts)
      
      expect(result.results[0].flesch).toBe(result.results[1].flesch)
      expect(result.results[0].fleschKincaid).toBe(result.results[1].fleschKincaid)
      expect(result.results[0].words).toBe(result.results[1].words)
    })
    
    it('should produce reasonable average for varied texts', () => {
      const texts = [
        'Cat.',
        'The quick brown fox.',
        'An extraordinarily sophisticated implementation.'
      ]
      const result = analyzeReadability(texts)
      
      // Average words should be reasonable
      expect(result.aggregate.avgWords).toBeGreaterThan(0)
      expect(result.aggregate.avgWords).toBeLessThan(20)
      
      // Total should equal sum of individual
      const totalWords = result.results.reduce((sum, r) => sum + r.words, 0)
      expect(result.aggregate.totalWords).toBe(totalWords)
    })
  })
  
  describe('Real-World Examples', () => {
    it('should analyze children\'s book text as easy', () => {
      const texts = [
        'The cat sat on the mat. The dog ran in the sun. The bird sang a song.'
      ]
      const result = analyzeReadability(texts)
      
      expect(result.aggregate.flesch).toBeGreaterThan(70)
      expect(result.aggregate.fleschKincaid).toBeLessThan(6)
    })
    
    it('should analyze academic text as difficult', () => {
      const texts = [
        'The methodology encompasses a comprehensive analysis of multifaceted variables incorporating sophisticated statistical techniques and quantitative methodologies.'
      ]
      const result = analyzeReadability(texts)
      
      expect(result.aggregate.flesch).toBeLessThan(40)
      expect(result.aggregate.fleschKincaid).toBeGreaterThan(10)
    })
    
    it('should analyze news article text as moderate', () => {
      const texts = [
        'The government announced new policies today. These changes will affect many citizens. Officials expect implementation next month.'
      ]
      const result = analyzeReadability(texts)
      
      // News articles typically target 8th-10th grade level
      expect(result.aggregate.fleschKincaid).toBeGreaterThan(5)
      expect(result.aggregate.fleschKincaid).toBeLessThan(15)
    })
  })
})
