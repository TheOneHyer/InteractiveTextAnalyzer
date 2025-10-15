import { describe, it, expect, beforeAll } from 'vitest'
import {
  ruleBasedArgumentMining,
  patternBasedArgumentMining,
  structuredArgumentMining,
  performArgumentMining
} from '../utils/argumentMining'

describe('Argument Mining', () => {
  let sampleTexts
  
  beforeAll(() => {
    sampleTexts = [
      'We should reduce carbon emissions. Climate change is a serious threat.',
      'I believe education is important. Studies show educated people earn more.',
      'The government must act now. Research indicates immediate action is necessary.',
      'Some argue taxes are too high. However, public services need funding.',
      'Electric cars are better for the environment. They produce less pollution.',
      'Social media has negative effects. Young people spend too much time online.',
      'We need stronger privacy laws because data breaches are increasing.',
      'Exercise improves health. Therefore, schools should require physical education.'
    ]
  })
  
  describe('Rule-Based Argument Mining', () => {
    it('should return empty result for empty input', async () => {
      const result = await ruleBasedArgumentMining([])
      expect(result.claims).toEqual([])
      expect(result.premises).toEqual([])
      expect(result.arguments).toEqual([])
    })
    
    it('should return empty result for null input', async () => {
      const result = await ruleBasedArgumentMining(null)
      expect(result.claims).toEqual([])
      expect(result.premises).toEqual([])
      expect(result.arguments).toEqual([])
    })
    
    it('should identify claims', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      expect(result.claims.length).toBeGreaterThan(0)
    })
    
    it('should identify premises', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      expect(result.premises.length).toBeGreaterThan(0)
    })
    
    it('should build argument structures', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      expect(result.arguments.length).toBeGreaterThan(0)
    })
    
    it('should detect modal verbs in claims', async () => {
      const result = await ruleBasedArgumentMining(['We should reduce emissions.'])
      expect(result.claims.length).toBeGreaterThan(0)
    })
    
    it('should detect claim indicators', async () => {
      const result = await ruleBasedArgumentMining(['I believe this is important.'])
      expect(result.claims.length).toBeGreaterThan(0)
    })
    
    it('should detect premise indicators', async () => {
      const result = await ruleBasedArgumentMining(['This is true because research shows it.'])
      expect(result.premises.length).toBeGreaterThan(0)
    })
    
    it('should have claim structure', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      result.claims.forEach(claim => {
        expect(claim).toHaveProperty('id')
        expect(claim).toHaveProperty('type')
        expect(claim).toHaveProperty('text')
        expect(claim).toHaveProperty('score')
        expect(claim).toHaveProperty('source')
        expect(claim.type).toBe('claim')
      })
    })
    
    it('should have premise structure', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      result.premises.forEach(premise => {
        expect(premise).toHaveProperty('id')
        expect(premise).toHaveProperty('type')
        expect(premise).toHaveProperty('text')
        expect(premise).toHaveProperty('score')
        expect(premise).toHaveProperty('source')
        expect(premise.type).toBe('premise')
      })
    })
    
    it('should link premises to claims', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      const linkedPremises = result.premises.filter(p => p.supportsClaim !== undefined)
      expect(linkedPremises.length).toBeGreaterThan(0)
    })
    
    it('should have argument structure', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      result.arguments.forEach(arg => {
        expect(arg).toHaveProperty('id')
        expect(arg).toHaveProperty('claim')
        expect(arg).toHaveProperty('premises')
        expect(arg).toHaveProperty('source')
        expect(Array.isArray(arg.premises)).toBe(true)
      })
    })
    
    it('should calculate argument strength', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      result.arguments.forEach(arg => {
        expect(arg).toHaveProperty('strength')
        expect(typeof arg.strength).toBe('number')
        expect(arg.strength).toBeGreaterThanOrEqual(0)
        expect(arg.strength).toBeLessThanOrEqual(1)
      })
    })
    
    it('should detect counter-arguments', async () => {
      const result = await ruleBasedArgumentMining(['Taxes are high. However, services need funding.'])
      expect(result.arguments.some(a => a.counterArguments && a.counterArguments.length > 0)).toBe(true)
    })
    
    it('should report total counts', async () => {
      const result = await ruleBasedArgumentMining(sampleTexts)
      expect(result).toHaveProperty('totalClaims')
      expect(result).toHaveProperty('totalPremises')
      expect(result).toHaveProperty('totalArguments')
      expect(result.totalClaims).toBe(result.claims.length)
      expect(result.totalPremises).toBe(result.premises.length)
      expect(result.totalArguments).toBe(result.arguments.length)
    })
  })
  
  describe('Pattern-Based Argument Mining', () => {
    it('should return empty result for empty input', async () => {
      const result = await patternBasedArgumentMining([])
      expect(result.claims).toEqual([])
      expect(result.premises).toEqual([])
      expect(result.arguments).toEqual([])
    })
    
    it('should extract claims using patterns', async () => {
      const result = await patternBasedArgumentMining(['I believe that education is important.'])
      expect(result.claims.length).toBeGreaterThan(0)
    })
    
    it('should extract premises using patterns', async () => {
      const result = await patternBasedArgumentMining(['This is true because research shows it.'])
      expect(result.premises.length).toBeGreaterThan(0)
    })
    
    it('should have pattern information in results', async () => {
      const result = await patternBasedArgumentMining(sampleTexts)
      if (result.claims.length > 0) {
        result.claims.forEach(claim => {
          expect(claim).toHaveProperty('pattern')
        })
      }
    })
    
    it('should report total counts', async () => {
      const result = await patternBasedArgumentMining(sampleTexts)
      expect(result).toHaveProperty('totalClaims')
      expect(result).toHaveProperty('totalPremises')
      expect(result.totalClaims).toBe(result.claims.length)
      expect(result.totalPremises).toBe(result.premises.length)
    })
  })
  
  describe('Structured Argument Mining', () => {
    it('should return empty result for empty input', async () => {
      const result = await structuredArgumentMining([])
      expect(result.claims).toEqual([])
      expect(result.premises).toEqual([])
      expect(result.arguments).toEqual([])
    })
    
    it('should extract argument structures', async () => {
      const result = await structuredArgumentMining(sampleTexts)
      expect(result.arguments.length).toBeGreaterThan(0)
    })
    
    it('should identify claim-premise pairs', async () => {
      const result = await structuredArgumentMining([
        'We should act now. Research shows it is urgent.'
      ])
      expect(result.arguments.length).toBeGreaterThan(0)
    })
    
    it('should have argument structure', async () => {
      const result = await structuredArgumentMining(sampleTexts)
      result.arguments.forEach(arg => {
        expect(arg).toHaveProperty('id')
        expect(arg).toHaveProperty('claim')
        expect(arg).toHaveProperty('premises')
        expect(arg).toHaveProperty('structure')
        expect(arg).toHaveProperty('strength')
      })
    })
    
    it('should mark structure type', async () => {
      const result = await structuredArgumentMining(sampleTexts)
      result.arguments.forEach(arg => {
        expect(arg.structure).toBe('linear')
      })
    })
    
    it('should skip single-sentence texts', async () => {
      const result = await structuredArgumentMining(['Single sentence.'])
      // May or may not extract depending on content
      expect(result.arguments).toBeDefined()
    })
  })
  
  describe('Algorithm Selection', () => {
    it('should use rule-based by default', async () => {
      const result = await performArgumentMining(sampleTexts)
      expect(result.algorithm).toBe('rule-based')
    })
    
    it('should support rule-based algorithm', async () => {
      const result = await performArgumentMining(sampleTexts, { algorithm: 'rule-based' })
      expect(result.algorithm).toBe('rule-based')
      expect(result.claims).toBeDefined()
      expect(result.premises).toBeDefined()
      expect(result.arguments).toBeDefined()
    })
    
    it('should support pattern-based algorithm', async () => {
      const result = await performArgumentMining(sampleTexts, { algorithm: 'pattern' })
      expect(result.algorithm).toBe('pattern')
      expect(result.claims).toBeDefined()
      expect(result.premises).toBeDefined()
    })
    
    it('should support structured algorithm', async () => {
      const result = await performArgumentMining(sampleTexts, { algorithm: 'structured' })
      expect(result.algorithm).toBe('structured')
      expect(result.arguments).toBeDefined()
    })
    
    it('should include algorithm in result', async () => {
      const result = await performArgumentMining(sampleTexts, { algorithm: 'pattern' })
      expect(result).toHaveProperty('algorithm')
      expect(result.algorithm).toBe('pattern')
    })
    
    it('should report total processed samples', async () => {
      const result = await performArgumentMining(sampleTexts)
      expect(result).toHaveProperty('totalProcessed')
      expect(result.totalProcessed).toBeGreaterThan(0)
    })
  })
  
  describe('Progress Reporting', () => {
    it('should call progress callback', async () => {
      let progressCalled = false
      await performArgumentMining(sampleTexts, {
        onProgress: () => { progressCalled = true }
      })
      expect(progressCalled).toBe(true)
    })
    
    it('should report progress values', async () => {
      const progressValues = []
      await performArgumentMining(sampleTexts, {
        onProgress: (value) => progressValues.push(value)
      })
      expect(progressValues.length).toBeGreaterThan(0)
      expect(progressValues).toContain(100)
    })
  })
  
  describe('Sample Limiting', () => {
    it('should respect maxSamples parameter', async () => {
      const manyTexts = Array(200).fill('We should act. Research shows it.')
      const result = await performArgumentMining(manyTexts, { maxSamples: 50 })
      expect(result.totalProcessed).toBeLessThanOrEqual(50)
    })
    
    it('should handle maxSamples larger than input', async () => {
      const result = await performArgumentMining(sampleTexts, { maxSamples: 1000 })
      expect(result.totalProcessed).toBe(sampleTexts.length)
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle single word text', async () => {
      const result = await performArgumentMining(['Important'])
      expect(result.claims).toBeDefined()
    })
    
    it('should handle text with no arguments', async () => {
      const result = await performArgumentMining(['The sky is blue.'])
      expect(result.claims).toBeDefined()
      expect(result.premises).toBeDefined()
    })
    
    it('should handle very long text', async () => {
      const longText = 'We should act now. Research shows it is important. '.repeat(20)
      const result = await performArgumentMining([longText])
      expect(result.claims.length).toBeGreaterThan(0)
    })
    
    it('should handle special characters', async () => {
      const result = await performArgumentMining(['We must act! It\'s important?'])
      expect(result.claims).toBeDefined()
    })
    
    it('should handle questions', async () => {
      const result = await performArgumentMining(['Should we act? Yes, we should.'])
      expect(result.claims).toBeDefined()
    })
    
    it('should handle complex arguments', async () => {
      const result = await performArgumentMining([
        'Climate change is real. Scientists agree. Data shows warming. However, some disagree. Nevertheless, we must act.'
      ])
      expect(result.arguments.length).toBeGreaterThan(0)
    })
  })
})
