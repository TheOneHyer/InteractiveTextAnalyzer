import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  initializeSummarizationPipeline,
  generateSummary,
  summarizeMultipleTexts,
  isModelLoaded,
  isModelLoadingNow,
  getModelInfo,
  disposeSummarizationPipeline
} from '../utils/summarizationEngine'

// Mock @xenova/transformers
vi.mock('@xenova/transformers', () => ({
  pipeline: vi.fn()
}))

describe('SummarizationEngine', () => {
  let mockPipeline

  beforeEach(async () => {
    // Reset module state
    await disposeSummarizationPipeline()
    
    // Create mock pipeline function
    mockPipeline = vi.fn(async (text) => {
      // Simulate summarization
      const words = text.split(/\s+/).slice(0, 15).join(' ')
      return [{
        summary_text: `Summary: ${words}...`
      }]
    })

    // Mock the pipeline import
    const { pipeline } = await import('@xenova/transformers')
    pipeline.mockResolvedValue(mockPipeline)
  })

  afterEach(async () => {
    await disposeSummarizationPipeline()
    vi.clearAllMocks()
  })

  describe('initializeSummarizationPipeline', () => {
    it('should initialize the pipeline successfully', async () => {
      const pipeline = await initializeSummarizationPipeline()
      expect(pipeline).toBeDefined()
      expect(typeof pipeline).toBe('function')
    })

    it('should return the same instance on multiple calls', async () => {
      const pipeline1 = await initializeSummarizationPipeline()
      const pipeline2 = await initializeSummarizationPipeline()
      expect(pipeline1).toBe(pipeline2)
    })

    it('should set loading state correctly', async () => {
      expect(isModelLoadingNow()).toBe(false)
      const promise = initializeSummarizationPipeline()
      // Note: Loading state may be brief, so we just check the promise resolves
      await promise
      expect(isModelLoaded()).toBe(true)
    })

    it('should handle initialization errors', async () => {
      await disposeSummarizationPipeline()
      
      const { pipeline } = await import('@xenova/transformers')
      pipeline.mockRejectedValueOnce(new Error('Load failed'))
      
      await expect(initializeSummarizationPipeline()).rejects.toThrow('Load failed')
      expect(isModelLoaded()).toBe(false)
    })
  })

  describe('generateSummary', () => {
    it('should generate summary for valid text', async () => {
      const text = 'This is a long piece of text that needs to be summarized. It contains multiple sentences and ideas that should be condensed into a shorter form.'
      
      const result = await generateSummary(text)
      
      expect(result).toBeDefined()
      expect(result.summaryText).toBeDefined()
      expect(typeof result.summaryText).toBe('string')
      expect(result.summaryText.length).toBeGreaterThan(0)
    })

    it('should include metadata in the result', async () => {
      const text = 'Sample text for summarization.'
      
      const result = await generateSummary(text)
      
      expect(result.inputLength).toBe(text.length)
      expect(result.inputWords).toBe(text.split(/\s+/).length)
      expect(result.outputLength).toBeDefined()
      expect(result.outputWords).toBeDefined()
      expect(result.executionTime).toBeDefined()
      expect(result.model).toBe('distilbart-cnn-6-6')
      expect(result.parameters).toBeDefined()
    })

    it('should use default options when none provided', async () => {
      const text = 'Sample text.'
      
      const result = await generateSummary(text)
      
      expect(result.parameters.maxLength).toBe(130)
      expect(result.parameters.minLength).toBe(30)
      expect(result.parameters.doSample).toBe(false)
    })

    it('should accept custom options', async () => {
      const text = 'Sample text.'
      const options = {
        maxLength: 100,
        minLength: 20,
        doSample: true,
        temperature: 0.8,
        topK: 40,
        topP: 0.9
      }
      
      const result = await generateSummary(text, options)
      
      expect(result.parameters.maxLength).toBe(100)
      expect(result.parameters.minLength).toBe(20)
      expect(result.parameters.doSample).toBe(true)
      expect(result.parameters.temperature).toBe(0.8)
    })

    it('should reject empty text', async () => {
      await expect(generateSummary('')).rejects.toThrow('Invalid input')
      await expect(generateSummary('   ')).rejects.toThrow('Invalid input')
    })

    it('should reject non-string input', async () => {
      await expect(generateSummary(null)).rejects.toThrow('Invalid input')
      await expect(generateSummary(undefined)).rejects.toThrow('Invalid input')
      await expect(generateSummary(123)).rejects.toThrow('Invalid input')
    })

    it('should handle pipeline errors gracefully', async () => {
      mockPipeline.mockRejectedValueOnce(new Error('Pipeline error'))
      
      const text = 'Sample text.'
      await expect(generateSummary(text)).rejects.toThrow('Summarization failed')
    })

    it('should track execution time', async () => {
      const text = 'Sample text for timing test.'
      
      const result = await generateSummary(text)
      
      expect(result.executionTime).toBeGreaterThanOrEqual(0)
      expect(typeof result.executionTime).toBe('number')
    })
  })

  describe('summarizeMultipleTexts', () => {
    it('should summarize multiple text samples', async () => {
      const texts = [
        'First document text.',
        'Second document text.',
        'Third document text.'
      ]
      
      const result = await summarizeMultipleTexts(texts)
      
      expect(result).toBeDefined()
      expect(result.summaryText).toBeDefined()
      expect(result.documentCount).toBe(3)
    })

    it('should filter out empty texts', async () => {
      const texts = [
        'Valid text.',
        '',
        '   ',
        null,
        'Another valid text.'
      ]
      
      const result = await summarizeMultipleTexts(texts)
      
      expect(result.documentCount).toBe(2)
    })

    it('should reject empty array', async () => {
      await expect(summarizeMultipleTexts([])).rejects.toThrow('Invalid input')
    })

    it('should reject non-array input', async () => {
      await expect(summarizeMultipleTexts('not an array')).rejects.toThrow('Invalid input')
      await expect(summarizeMultipleTexts(null)).rejects.toThrow('Invalid input')
    })

    it('should reject array with no valid texts', async () => {
      const texts = ['', '   ', null, undefined]
      await expect(summarizeMultipleTexts(texts)).rejects.toThrow('No valid text samples found')
    })

    it('should include combined metadata', async () => {
      const texts = ['Text one.', 'Text two.', 'Text three.']
      
      const result = await summarizeMultipleTexts(texts)
      
      expect(result.documentCount).toBe(3)
      expect(result.totalInputLength).toBeGreaterThan(0)
      expect(result.totalInputWords).toBeGreaterThan(0)
    })

    it('should pass options to underlying generateSummary', async () => {
      const texts = ['Text one.', 'Text two.']
      const options = {
        maxLength: 80,
        minLength: 15
      }
      
      const result = await summarizeMultipleTexts(texts, options)
      
      expect(result.parameters.maxLength).toBe(80)
      expect(result.parameters.minLength).toBe(15)
    })
  })

  describe('isModelLoaded', () => {
    it('should return false initially', () => {
      expect(isModelLoaded()).toBe(false)
    })

    it('should return true after initialization', async () => {
      await initializeSummarizationPipeline()
      expect(isModelLoaded()).toBe(true)
    })

    it('should return false after disposal', async () => {
      await initializeSummarizationPipeline()
      await disposeSummarizationPipeline()
      expect(isModelLoaded()).toBe(false)
    })
  })

  describe('isModelLoadingNow', () => {
    it('should return false when not loading', () => {
      expect(isModelLoadingNow()).toBe(false)
    })

    it('should return false after loading completes', async () => {
      await initializeSummarizationPipeline()
      expect(isModelLoadingNow()).toBe(false)
    })
  })

  describe('getModelInfo', () => {
    it('should return null when model not loaded', () => {
      expect(getModelInfo()).toBeNull()
    })

    it('should return model info when loaded', async () => {
      await initializeSummarizationPipeline()
      
      const info = getModelInfo()
      
      expect(info).toBeDefined()
      expect(info.name).toBe('DistilBART-CNN')
      expect(info.fullName).toBe('distilbart-cnn-6-6')
      expect(info.source).toBe('Xenova/distilbart-cnn-6-6')
      expect(info.type).toBe('Sequence-to-sequence')
      expect(info.framework).toBe('Transformers.js')
      expect(info.loaded).toBe(true)
    })

    it('should include acceleration info', async () => {
      await initializeSummarizationPipeline()
      
      const info = getModelInfo()
      
      expect(info.acceleration).toContain('WebGL')
      expect(info.acceleration).toContain('GPU')
    })
  })

  describe('disposeSummarizationPipeline', () => {
    it('should clear the pipeline instance', async () => {
      await initializeSummarizationPipeline()
      expect(isModelLoaded()).toBe(true)
      
      await disposeSummarizationPipeline()
      expect(isModelLoaded()).toBe(false)
    })

    it('should be safe to call multiple times', async () => {
      await initializeSummarizationPipeline()
      await disposeSummarizationPipeline()
      await disposeSummarizationPipeline()
      expect(isModelLoaded()).toBe(false)
    })

    it('should call dispose on pipeline if available', async () => {
      const disposeMock = vi.fn()
      mockPipeline.dispose = disposeMock
      
      await initializeSummarizationPipeline()
      await disposeSummarizationPipeline()
      
      expect(disposeMock).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long text', async () => {
      const longText = 'word '.repeat(1000).trim()
      
      const result = await generateSummary(longText)
      
      expect(result.summaryText).toBeDefined()
      expect(result.inputWords).toBe(1000)
    })

    it('should handle text with special characters', async () => {
      const text = 'Text with special chars: @#$%^&*()_+-=[]{}|;:,.<>?'
      
      const result = await generateSummary(text)
      
      expect(result.summaryText).toBeDefined()
    })

    it('should handle single sentence text', async () => {
      const text = 'This is a single sentence.'
      
      const result = await generateSummary(text)
      
      expect(result.summaryText).toBeDefined()
    })

    it('should handle text with multiple paragraphs', async () => {
      const text = 'Paragraph one.\n\nParagraph two.\n\nParagraph three.'
      
      const result = await generateSummary(text)
      
      expect(result.summaryText).toBeDefined()
    })
  })

  describe('Parameter Validation', () => {
    it('should handle temperature parameter correctly', async () => {
      const text = 'Sample text.'
      
      // Without sampling, temperature should be null in result
      const result1 = await generateSummary(text, { doSample: false, temperature: 0.5 })
      expect(result1.parameters.temperature).toBeNull()
      
      // With sampling, temperature should be included
      const result2 = await generateSummary(text, { doSample: true, temperature: 0.5 })
      expect(result2.parameters.temperature).toBe(0.5)
    })

    it('should handle topK parameter correctly', async () => {
      const text = 'Sample text.'
      
      const result1 = await generateSummary(text, { doSample: false, topK: 30 })
      expect(result1.parameters.topK).toBeNull()
      
      const result2 = await generateSummary(text, { doSample: true, topK: 30 })
      expect(result2.parameters.topK).toBe(30)
    })

    it('should handle topP parameter correctly', async () => {
      const text = 'Sample text.'
      
      const result1 = await generateSummary(text, { doSample: false, topP: 0.8 })
      expect(result1.parameters.topP).toBeNull()
      
      const result2 = await generateSummary(text, { doSample: true, topP: 0.8 })
      expect(result2.parameters.topP).toBe(0.8)
    })
  })
})
