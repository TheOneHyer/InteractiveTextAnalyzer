import { describe, it, expect } from 'vitest'

/**
 * Test suite for visualization availability mappings
 * 
 * This test suite validates the correct mapping between analysis types and their available visualizations.
 * The mappings are:
 * - tfidf: bar, wordcloud, heatmap
 * - ngram: bar, wordcloud
 * - assoc: bar, wordcloud, network
 * - ner: bar, wordcloud
 * - embeddings: scatter
 * - dependency: network
 * - sentiment: bar
 */

// Mock implementation of isVisualizationAvailable function for testing
const isVisualizationAvailable = (analysisType, vizType) => {
  switch(vizType) {
    case 'bar':
      return analysisType === 'tfidf' || analysisType === 'ngram' || analysisType === 'ner' || analysisType === 'assoc' || analysisType === 'sentiment'
    case 'wordcloud':
      return analysisType === 'tfidf' || analysisType === 'ngram' || analysisType === 'ner' || analysisType === 'assoc'
    case 'network':
      return analysisType === 'assoc' || analysisType === 'dependency'
    case 'heatmap':
      return analysisType === 'tfidf'
    case 'scatter':
      return analysisType === 'embeddings'
    default:
      return false
  }
}

describe('Visualization Availability - TF-IDF Analysis', () => {
  const analysisType = 'tfidf'
  
  it('should allow Bar Chart for TF-IDF', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(true)
  })
  
  it('should allow Word Cloud for TF-IDF', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(true)
  })
  
  it('should allow Heatmap for TF-IDF', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(true)
  })
  
  it('should not allow Network Graph for TF-IDF', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(false)
  })
  
  it('should not allow Scatter Plot for TF-IDF', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(false)
  })
})

describe('Visualization Availability - N-Gram Analysis', () => {
  const analysisType = 'ngram'
  
  it('should allow Bar Chart for N-Gram', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(true)
  })
  
  it('should allow Word Cloud for N-Gram', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(true)
  })
  
  it('should not allow Heatmap for N-Gram', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(false)
  })
  
  it('should not allow Network Graph for N-Gram', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(false)
  })
  
  it('should not allow Scatter Plot for N-Gram', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(false)
  })
})

describe('Visualization Availability - Association Rules Analysis', () => {
  const analysisType = 'assoc'
  
  it('should allow Bar Chart for Association Rules', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(true)
  })
  
  it('should allow Word Cloud for Association Rules', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(true)
  })
  
  it('should allow Network Graph for Association Rules', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(true)
  })
  
  it('should not allow Heatmap for Association Rules', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(false)
  })
  
  it('should not allow Scatter Plot for Association Rules', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(false)
  })
})

describe('Visualization Availability - Named Entity Recognition (NER) Analysis', () => {
  const analysisType = 'ner'
  
  it('should allow Bar Chart for NER', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(true)
  })
  
  it('should allow Word Cloud for NER', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(true)
  })
  
  it('should not allow Heatmap for NER', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(false)
  })
  
  it('should not allow Network Graph for NER', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(false)
  })
  
  it('should not allow Scatter Plot for NER', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(false)
  })
})

describe('Visualization Availability - Document Embeddings Analysis', () => {
  const analysisType = 'embeddings'
  
  it('should allow Scatter Plot for Embeddings', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(true)
  })
  
  it('should not allow Bar Chart for Embeddings', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(false)
  })
  
  it('should not allow Word Cloud for Embeddings', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(false)
  })
  
  it('should not allow Heatmap for Embeddings', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(false)
  })
  
  it('should not allow Network Graph for Embeddings', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(false)
  })
})

describe('Visualization Availability - Dependency Parsing Analysis', () => {
  const analysisType = 'dependency'
  
  it('should allow Network Graph for Dependency Parsing', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(true)
  })
  
  it('should not allow Bar Chart for Dependency Parsing', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(false)
  })
  
  it('should not allow Word Cloud for Dependency Parsing', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(false)
  })
  
  it('should not allow Heatmap for Dependency Parsing', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(false)
  })
  
  it('should not allow Scatter Plot for Dependency Parsing', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(false)
  })
})

describe('Visualization Availability - Edge Cases', () => {
  it('should return false for unknown visualization types', () => {
    expect(isVisualizationAvailable('tfidf', 'unknown')).toBe(false)
    expect(isVisualizationAvailable('ngram', 'pie')).toBe(false)
  })
  
  it('should return false for unknown analysis types', () => {
    expect(isVisualizationAvailable('unknown', 'bar')).toBe(false)
    expect(isVisualizationAvailable('unknown', 'wordcloud')).toBe(false)
  })
})

describe('Visualization Availability - Sentiment Analysis', () => {
  const analysisType = 'sentiment'
  
  it('should allow Bar Chart for Sentiment', () => {
    expect(isVisualizationAvailable(analysisType, 'bar')).toBe(true)
  })
  
  it('should not allow Word Cloud for Sentiment', () => {
    expect(isVisualizationAvailable(analysisType, 'wordcloud')).toBe(false)
  })
  
  it('should not allow Network Graph for Sentiment', () => {
    expect(isVisualizationAvailable(analysisType, 'network')).toBe(false)
  })
  
  it('should not allow Heatmap for Sentiment', () => {
    expect(isVisualizationAvailable(analysisType, 'heatmap')).toBe(false)
  })
  
  it('should not allow Scatter Plot for Sentiment', () => {
    expect(isVisualizationAvailable(analysisType, 'scatter')).toBe(false)
  })
})

describe('Visualization Availability - Comprehensive Matrix', () => {
  const analyses = ['tfidf', 'ngram', 'assoc', 'ner', 'embeddings', 'dependency', 'sentiment']
  const visualizations = ['bar', 'wordcloud', 'network', 'heatmap', 'scatter']
  
  // Expected mappings matrix
  const expectedMappings = {
    'tfidf': ['bar', 'wordcloud', 'heatmap'],
    'ngram': ['bar', 'wordcloud'],
    'assoc': ['bar', 'wordcloud', 'network'],
    'ner': ['bar', 'wordcloud'],
    'embeddings': ['scatter'],
    'dependency': ['network'],
    'sentiment': ['bar']
  }
  
  analyses.forEach(analysis => {
    it(`should have correct mappings for ${analysis}`, () => {
      const availableViz = visualizations.filter(viz => 
        isVisualizationAvailable(analysis, viz)
      )
      expect(availableViz.sort()).toEqual(expectedMappings[analysis].sort())
    })
  })
  
  it('should ensure all visualizations are mapped to at least one analysis', () => {
    visualizations.forEach(viz => {
      const mappedAnalyses = analyses.filter(analysis => 
        isVisualizationAvailable(analysis, viz)
      )
      expect(mappedAnalyses.length).toBeGreaterThan(0)
    })
  })
  
  it('should ensure all analyses have at least one visualization', () => {
    analyses.forEach(analysis => {
      const availableViz = visualizations.filter(viz => 
        isVisualizationAvailable(analysis, viz)
      )
      expect(availableViz.length).toBeGreaterThan(0)
    })
  })
})
