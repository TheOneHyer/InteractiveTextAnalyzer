import { describe, it, expect } from 'vitest'
import { generateReport } from '../utils/textAnalysis'

describe('generateReport', () => {
  it('should return hasData: false when no data provided', () => {
    const result = generateReport(null, [])
    expect(result.hasData).toBe(false)
  })

  it('should return hasData: false when texts array is empty', () => {
    const result = generateReport({}, [])
    expect(result.hasData).toBe(false)
  })

  it('should generate report with basic statistics', () => {
    const texts = ['This is a test.', 'Another test document.']
    const analysisResults = {}
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.hasData).toBe(true)
    expect(result.statistics).toBeDefined()
    expect(result.statistics.documentCount).toBe(2)
    expect(result.statistics.totalTokens).toBeGreaterThan(0)
  })

  it('should process sentiment data correctly', () => {
    const texts = ['This is great!', 'This is bad.']
    const analysisResults = {
      sentiment: {
        summary: {
          positive: 5,
          negative: 2,
          neutral: 3,
          avgScore: 0.3
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.sentiment).toBeDefined()
    expect(result.sentiment.distribution).toHaveLength(3)
    expect(result.sentiment.positiveCount).toBe(5)
    expect(result.sentiment.negativeCount).toBe(2)
    expect(result.sentiment.overall).toBe('Positive')
  })

  it('should determine overall sentiment as Positive when positive > negative', () => {
    const texts = ['Test']
    const analysisResults = {
      sentiment: {
        summary: {
          positive: 7,
          negative: 2,
          neutral: 1,
          avgScore: 0.5
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    expect(result.sentiment.overall).toBe('Positive')
  })

  it('should determine overall sentiment as Negative when negative > positive', () => {
    const texts = ['Test']
    const analysisResults = {
      sentiment: {
        summary: {
          positive: 2,
          negative: 7,
          neutral: 1,
          avgScore: -0.5
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    expect(result.sentiment.overall).toBe('Negative')
  })

  it('should determine overall sentiment as Neutral when neutral is highest', () => {
    const texts = ['Test']
    const analysisResults = {
      sentiment: {
        summary: {
          positive: 2,
          negative: 2,
          neutral: 6,
          avgScore: 0.0
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    expect(result.sentiment.overall).toBe('Neutral')
  })

  it('should calculate negative percentage correctly', () => {
    const texts = ['Test']
    const analysisResults = {
      sentiment: {
        summary: {
          positive: 6,
          negative: 2,
          neutral: 2,
          avgScore: 0.3
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    expect(result.sentiment.negativePercentage).toBe(20)
  })

  it('should process topic modeling data', () => {
    const texts = ['Test document']
    const analysisResults = {
      topics: {
        topics: [
          {
            label: 'Topic 1',
            terms: [
              { term: 'test', score: 0.9 },
              { term: 'document', score: 0.8 }
            ]
          }
        ]
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.topics).toBeDefined()
    expect(result.topics).toHaveLength(1)
    expect(result.topics[0].label).toBe('Topic 1')
    expect(result.topics[0].terms).toHaveLength(2)
  })

  it('should process readability data', () => {
    const texts = ['Test document']
    const analysisResults = {
      readability: {
        aggregate: {
          flesch: 65.5,
          fleschKincaid: 8.2,
          colemanLiau: 9.1,
          gunningFog: 10.3,
          smog: 9.7,
          ari: 8.9,
          avgWords: 50
        },
        interpretation: {
          flesch: 'Standard',
          fleschKincaid: 'Middle School'
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.readability).toBeDefined()
    expect(result.readability.flesch).toBe(65.5)
    expect(result.readability.interpretation).toBeDefined()
  })

  it('should process TF-IDF word frequency data', () => {
    const texts = ['Test document with words']
    const analysisResults = {
      tfidf: {
        aggregate: [
          { term: 'test', score: 10.567 },
          { term: 'document', score: 8.345 }
        ]
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.wordFrequency).toBeDefined()
    expect(result.wordFrequency).toHaveLength(2)
    expect(result.wordFrequency[0].term).toBe('test')
    expect(result.wordFrequency[0].score).toBe(10.57) // Rounded
  })

  it('should calculate unique terms from word frequency', () => {
    const texts = ['Test']
    const analysisResults = {
      tfidf: {
        aggregate: [
          { term: 'term1', score: 5 },
          { term: 'term2', score: 4 },
          { term: 'term3', score: 3 }
        ]
      }
    }
    
    const result = generateReport(analysisResults, texts)
    expect(result.statistics.uniqueTerms).toBe(3)
  })

  it('should process parts of speech data', () => {
    const texts = ['Test document']
    const analysisResults = {
      pos: {
        distribution: {
          noun: 10,
          verb: 5,
          adjective: 3
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.pos).toBeDefined()
    expect(result.pos).toHaveLength(3)
    expect(result.pos[0].pos).toBe('noun')
    expect(result.pos[0].count).toBe(10)
  })

  it('should sort POS data by count in descending order', () => {
    const texts = ['Test']
    const analysisResults = {
      pos: {
        distribution: {
          adjective: 3,
          noun: 10,
          verb: 5
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.pos[0].count).toBe(10)
    expect(result.pos[1].count).toBe(5)
    expect(result.pos[2].count).toBe(3)
  })

  it('should process named entities data', () => {
    const texts = ['Test document']
    const analysisResults = {
      entities: {
        byType: {
          Person: [
            { text: 'John', count: 3 },
            { text: 'Mary', count: 2 }
          ],
          Organization: [
            { text: 'Google', count: 5 }
          ]
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.entities).toBeDefined()
    expect(result.entities.Person).toHaveLength(2)
    expect(result.entities.Organization).toHaveLength(1)
  })

  it('should skip empty entity types', () => {
    const texts = ['Test']
    const analysisResults = {
      entities: {
        byType: {
          Person: [{ text: 'John', count: 1 }],
          Location: []
        }
      }
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.entities.Person).toBeDefined()
    expect(result.entities.Location).toBeUndefined()
  })

  it('should calculate total tokens from texts', () => {
    const texts = [
      'This is a test document.',
      'Another test with more words here.'
    ]
    const analysisResults = {}
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.statistics.totalTokens).toBeGreaterThan(0)
    expect(result.statistics.documentCount).toBe(2)
  })

  it('should handle missing analysis results gracefully', () => {
    const texts = ['Test document']
    const analysisResults = {
      // Only some analyses present
      sentiment: {
        summary: { positive: 1, negative: 0, neutral: 0, avgScore: 1 }
      }
      // No topics, readability, etc.
    }
    
    const result = generateReport(analysisResults, texts)
    
    expect(result.hasData).toBe(true)
    expect(result.sentiment).toBeDefined()
    expect(result.topics).toBeUndefined()
    expect(result.readability).toBeUndefined()
  })
})
