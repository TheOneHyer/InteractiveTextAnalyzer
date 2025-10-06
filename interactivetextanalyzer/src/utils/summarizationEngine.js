/**
 * Summarization Engine using DistilBART-CNN via Transformers.js
 * 
 * This module provides text summarization capabilities using the DistilBART-CNN model
 * running locally in the browser. The model automatically uses GPU acceleration via
 * WebGL when available.
 * 
 * Features:
 * - Local inference (no API calls)
 * - Automatic GPU acceleration via WebGL
 * - Configurable generation parameters
 * - Progress tracking
 */

let pipelineInstance = null
let isModelLoading = false
let modelLoadPromise = null

/**
 * Initialize the summarization pipeline
 * @returns {Promise<Object>} The pipeline instance
 */
export async function initializeSummarizationPipeline() {
  // Return existing instance if already loaded
  if (pipelineInstance) {
    return pipelineInstance
  }

  // Wait for existing load if in progress
  if (isModelLoading && modelLoadPromise) {
    return modelLoadPromise
  }

  isModelLoading = true
  
  modelLoadPromise = (async () => {
    try {
      // Dynamic import to enable code splitting
      const { pipeline } = await import('@xenova/transformers')
      
      // Initialize the summarization pipeline with DistilBART-CNN
      // The model will automatically download and cache on first use
      pipelineInstance = await pipeline(
        'summarization',
        'Xenova/distilbart-cnn-6-6',
        {
          // Progress callback for tracking download/initialization
          progress_callback: (progress) => {
            if (progress.status === 'progress') {
              console.log(`Model loading: ${progress.name} - ${progress.progress.toFixed(1)}%`)
            } else if (progress.status === 'done') {
              console.log(`Model loading: ${progress.name} - Complete`)
            }
          }
        }
      )
      
      console.log('DistilBART-CNN summarization model loaded successfully')
      return pipelineInstance
    } catch (error) {
      console.error('Failed to initialize summarization pipeline:', error)
      pipelineInstance = null
      throw error
    } finally {
      isModelLoading = false
    }
  })()

  return modelLoadPromise
}

/**
 * Generate summary for given text
 * @param {string} text - The text to summarize
 * @param {Object} options - Generation options
 * @param {number} options.maxLength - Maximum length of summary (default: 130)
 * @param {number} options.minLength - Minimum length of summary (default: 30)
 * @param {boolean} options.doSample - Whether to use sampling (default: false)
 * @param {number} options.temperature - Sampling temperature (default: 1.0, only used if doSample=true)
 * @param {number} options.topK - Top-k sampling (default: 50)
 * @param {number} options.topP - Top-p (nucleus) sampling (default: 1.0)
 * @returns {Promise<Object>} Summary result with text and metadata
 */
export async function generateSummary(text, options = {}) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid input: text must be a non-empty string')
  }

  // Ensure pipeline is initialized
  const pipeline = await initializeSummarizationPipeline()

  // Default options
  const {
    maxLength = 130,
    minLength = 30,
    doSample = false,
    temperature = 1.0,
    topK = 50,
    topP = 1.0
  } = options

  const startTime = performance.now()

  try {
    // Generate summary
    const result = await pipeline(text, {
      max_length: maxLength,
      min_length: minLength,
      do_sample: doSample,
      temperature: temperature,
      top_k: topK,
      top_p: topP
    })

    const endTime = performance.now()
    const executionTime = endTime - startTime

    return {
      summaryText: result[0].summary_text,
      inputLength: text.length,
      inputWords: text.split(/\s+/).length,
      outputLength: result[0].summary_text.length,
      outputWords: result[0].summary_text.split(/\s+/).length,
      executionTime: Math.round(executionTime),
      model: 'distilbart-cnn-6-6',
      parameters: {
        maxLength,
        minLength,
        doSample,
        temperature: doSample ? temperature : null,
        topK: doSample ? topK : null,
        topP: doSample ? topP : null
      }
    }
  } catch (error) {
    console.error('Summarization failed:', error)
    throw new Error(`Summarization failed: ${error.message}`)
  }
}

/**
 * Summarize multiple text samples
 * @param {string[]} textSamples - Array of text strings to summarize
 * @param {Object} options - Generation options (same as generateSummary)
 * @returns {Promise<Object>} Combined summary result
 */
export async function summarizeMultipleTexts(textSamples, options = {}) {
  if (!Array.isArray(textSamples) || textSamples.length === 0) {
    throw new Error('Invalid input: textSamples must be a non-empty array')
  }

  // Filter out empty texts
  const validTexts = textSamples.filter(t => t && typeof t === 'string' && t.trim().length > 0)
  
  if (validTexts.length === 0) {
    throw new Error('No valid text samples found')
  }

  // Combine all texts with clear separation
  const combinedText = validTexts.join(' ')

  // Generate summary for combined text
  const result = await generateSummary(combinedText, options)

  return {
    ...result,
    documentCount: validTexts.length,
    totalInputLength: combinedText.length,
    totalInputWords: combinedText.split(/\s+/).length
  }
}

/**
 * Check if the summarization model is loaded
 * @returns {boolean} True if model is loaded
 */
export function isModelLoaded() {
  return pipelineInstance !== null
}

/**
 * Check if the model is currently loading
 * @returns {boolean} True if model is loading
 */
export function isModelLoadingNow() {
  return isModelLoading
}

/**
 * Get model information
 * @returns {Object|null} Model metadata or null if not loaded
 */
export function getModelInfo() {
  if (!pipelineInstance) {
    return null
  }

  return {
    name: 'DistilBART-CNN',
    fullName: 'distilbart-cnn-6-6',
    source: 'Xenova/distilbart-cnn-6-6',
    description: 'Distilled version of BART fine-tuned on CNN/DailyMail for summarization',
    type: 'Sequence-to-sequence',
    framework: 'Transformers.js',
    acceleration: 'WebGL (GPU) when available',
    loaded: true
  }
}

/**
 * Dispose of the model and free resources
 */
export async function disposeSummarizationPipeline() {
  if (pipelineInstance && typeof pipelineInstance.dispose === 'function') {
    await pipelineInstance.dispose()
  }
  pipelineInstance = null
  isModelLoading = false
  modelLoadPromise = null
}
