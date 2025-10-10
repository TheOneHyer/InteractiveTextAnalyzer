import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Wiki from '../components/Wiki'

describe('Wiki Component', () => {
  it('should render wiki title', () => {
    render(<Wiki />)
    expect(screen.getByText('Interactive Text Analyzer Wiki')).toBeTruthy()
  })

  it('should render statistical terms section', () => {
    render(<Wiki />)
    expect(screen.getByText('📊 Statistical Terms')).toBeTruthy()
  })

  it('should render all algorithm sections', () => {
    render(<Wiki />)
    expect(screen.getByText('TF-IDF (Term Frequency-Inverse Document Frequency)')).toBeTruthy()
    expect(screen.getByText('N-Gram Analysis')).toBeTruthy()
    expect(screen.getByText('Association Rules Mining')).toBeTruthy()
    expect(screen.getByText('NER (Named Entity Recognition)')).toBeTruthy()
    const dependencySections = screen.getAllByText('Dependency Parsing')
    expect(dependencySections.length).toBeGreaterThan(0)
    expect(screen.getByText('Readability Statistics')).toBeTruthy()
  })

  it('should render settings section', () => {
    render(<Wiki />)
    expect(screen.getByText('⚙️ Settings & Options')).toBeTruthy()
  })

  it('should render visualizations section', () => {
    render(<Wiki />)
    expect(screen.getByText('📈 Visualizations')).toBeTruthy()
  })

  it('should render tips section', () => {
    render(<Wiki />)
    expect(screen.getByText('💡 Tips & Best Practices')).toBeTruthy()
  })
})
