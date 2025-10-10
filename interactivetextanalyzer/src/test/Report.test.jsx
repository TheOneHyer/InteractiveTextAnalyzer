import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Report from '../components/Report'

describe('Report Component', () => {
  it('should render empty state when no data provided', () => {
    render(<Report reportData={{ hasData: false }} />)
    expect(screen.getByText('No Data Available')).toBeTruthy()
  })

  it('should render report header with title', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      sentiment: {
        distribution: [
          { name: 'Positive', value: 5 },
          { name: 'Negative', value: 2 },
          { name: 'Neutral', value: 3 }
        ],
        positiveCount: 5,
        negativeCount: 2,
        neutralCount: 3,
        negativePercentage: 20,
        averageScore: 0.3,
        overall: 'Positive'
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Comprehensive Text Analysis Report')).toBeTruthy()
  })

  it('should render statistics bar with document count', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Documents')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
  })

  it('should render executive summary section', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      sentiment: {
        distribution: [
          { name: 'Positive', value: 5 },
          { name: 'Negative', value: 2 },
          { name: 'Neutral', value: 3 }
        ],
        positiveCount: 5,
        negativeCount: 2,
        neutralCount: 3,
        negativePercentage: 20,
        averageScore: 0.3,
        overall: 'Positive'
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('📊 Executive Summary')).toBeTruthy()
  })

  it('should render content analysis section', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('📝 Content Analysis')).toBeTruthy()
  })

  it('should render comparative analysis section', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('📈 Comparative Analysis')).toBeTruthy()
  })

  it('should render actionable insights section', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('💡 Actionable Insights')).toBeTruthy()
  })

  it('should render export options section', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('📥 Export Options')).toBeTruthy()
    expect(screen.getByText('Print Report')).toBeTruthy()
  })

  it('should display sentiment distribution when sentiment data is provided', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      sentiment: {
        distribution: [
          { name: 'Positive', value: 5 },
          { name: 'Negative', value: 2 },
          { name: 'Neutral', value: 3 }
        ],
        positiveCount: 5,
        negativeCount: 2,
        neutralCount: 3,
        negativePercentage: 20,
        averageScore: 0.3,
        overall: 'Positive'
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Sentiment Distribution')).toBeTruthy()
    expect(screen.getByText(/Overall Sentiment:/)).toBeTruthy()
  })

  it('should display topics when topic data is provided', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      topics: [
        {
          label: 'Topic 1: Technology',
          terms: [
            { term: 'computer', score: 0.9 },
            { term: 'software', score: 0.8 }
          ]
        }
      ]
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Key Topics & Themes')).toBeTruthy()
  })

  it('should display readability metrics when provided', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      readability: {
        flesch: 65.5,
        fleschKincaid: 8.2,
        colemanLiau: 9.1,
        gunningFog: 10.3,
        smog: 9.7,
        ari: 8.9,
        avgWords: 50,
        interpretation: {
          flesch: 'Standard (8th-9th grade)',
          fleschKincaid: 'Middle School'
        }
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Readability Metrics')).toBeTruthy()
    expect(screen.getByText('Flesch Reading Ease')).toBeTruthy()
  })

  it('should display word frequency when provided', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      wordFrequency: [
        { term: 'test', score: 10.5 },
        { term: 'data', score: 8.3 }
      ]
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Top Keywords')).toBeTruthy()
  })

  it('should display negative sentiment warning in insights', () => {
    const mockReportData = {
      hasData: true,
      statistics: {
        documentCount: 10,
        totalTokens: 500,
        uniqueTerms: 200
      },
      sentiment: {
        distribution: [
          { name: 'Positive', value: 2 },
          { name: 'Negative', value: 5 },
          { name: 'Neutral', value: 3 }
        ],
        positiveCount: 2,
        negativeCount: 5,
        neutralCount: 3,
        negativePercentage: 50,
        averageScore: -0.3,
        overall: 'Negative'
      }
    }
    
    render(<Report reportData={mockReportData} />)
    expect(screen.getByText('Sentiment Concerns')).toBeTruthy()
    expect(screen.getByText(/5 documents.*show negative sentiment/)).toBeTruthy()
  })
})
