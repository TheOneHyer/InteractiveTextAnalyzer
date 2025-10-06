import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScatterPlot from '../components/ScatterPlot'

describe('ScatterPlot Component', () => {
  const mockData = [
    { x: 0.5, y: 0.5, label: 'Document 1' },
    { x: 1.5, y: 1.2, label: 'Document 2' },
    { x: 2.0, y: 0.8, label: 'Document 3' }
  ]

  it('should render without crashing', () => {
    render(<ScatterPlot data={[]} />)
    expect(screen.getByText('No data to display')).toBeTruthy()
  })

  it('should display "No data to display" when data is empty', () => {
    render(<ScatterPlot data={[]} />)
    expect(screen.getByText('No data to display')).toBeTruthy()
  })

  it('should render SVG element when data is provided', () => {
    const { container } = render(<ScatterPlot data={mockData} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should render correct number of data points', () => {
    const { container } = render(<ScatterPlot data={mockData} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(mockData.length)
  })

  it('should render axis labels', () => {
    const { container } = render(
      <ScatterPlot 
        data={mockData} 
        xLabel="X Axis" 
        yLabel="Y Axis" 
      />
    )
    const texts = container.querySelectorAll('text')
    const textContents = Array.from(texts).map(t => t.textContent)
    expect(textContents).toContain('X Axis')
    expect(textContents).toContain('Y Axis')
  })

  it('should use default axis labels', () => {
    const { container } = render(<ScatterPlot data={mockData} />)
    const texts = container.querySelectorAll('text')
    const textContents = Array.from(texts).map(t => t.textContent)
    expect(textContents).toContain('Dimension 1')
    expect(textContents).toContain('Dimension 2')
  })

  it('should handle single data point', () => {
    const singlePoint = [{ x: 1.0, y: 1.0, label: 'Single Doc' }]
    const { container } = render(<ScatterPlot data={singlePoint} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(1)
  })

  it('should render axes lines', () => {
    const { container } = render(<ScatterPlot data={mockData} />)
    const lines = container.querySelectorAll('line')
    // Should have at least 2 lines for x and y axes
    expect(lines.length).toBeGreaterThanOrEqual(2)
  })

  it('should scale points within SVG dimensions', () => {
    const { container } = render(<ScatterPlot data={mockData} />)
    const circles = container.querySelectorAll('circle')
    
    circles.forEach(circle => {
      const cx = parseFloat(circle.getAttribute('cx'))
      const cy = parseFloat(circle.getAttribute('cy'))
      
      // Points should be within SVG bounds (with padding)
      expect(cx).toBeGreaterThanOrEqual(0)
      expect(cx).toBeLessThanOrEqual(500)
      expect(cy).toBeGreaterThanOrEqual(0)
      expect(cy).toBeLessThanOrEqual(400)
    })
  })

  it('should handle negative coordinates', () => {
    const negativeData = [
      { x: -1.0, y: -1.0, label: 'Doc 1' },
      { x: 1.0, y: 1.0, label: 'Doc 2' }
    ]
    const { container } = render(<ScatterPlot data={negativeData} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
  })

  it('should handle identical points', () => {
    const identicalData = [
      { x: 1.0, y: 1.0, label: 'Doc 1' },
      { x: 1.0, y: 1.0, label: 'Doc 2' }
    ]
    const { container } = render(<ScatterPlot data={identicalData} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
  })

  it('should render with large number of points', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      x: Math.random() * 10,
      y: Math.random() * 10,
      label: `Doc ${i + 1}`
    }))
    const { container } = render(<ScatterPlot data={largeData} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(100)
  })

  it('should handle extreme coordinate values', () => {
    const extremeData = [
      { x: -1000, y: -1000, label: 'Doc 1' },
      { x: 1000, y: 1000, label: 'Doc 2' }
    ]
    const { container } = render(<ScatterPlot data={extremeData} />)
    const circles = container.querySelectorAll('circle')
    expect(circles.length).toBe(2)
    
    // Points should still be within SVG bounds
    circles.forEach(circle => {
      const cx = parseFloat(circle.getAttribute('cx'))
      const cy = parseFloat(circle.getAttribute('cy'))
      expect(cx).toBeGreaterThanOrEqual(0)
      expect(cx).toBeLessThanOrEqual(500)
      expect(cy).toBeGreaterThanOrEqual(0)
      expect(cy).toBeLessThanOrEqual(400)
    })
  })
})
