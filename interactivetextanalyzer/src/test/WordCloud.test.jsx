import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import WordCloud from '../components/WordCloud'

describe('WordCloud Component', () => {
  it('should render a div container', () => {
    const data = []
    const { container } = render(<WordCloud data={data} />)
    
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render with default props', () => {
    const { container } = render(<WordCloud />)
    
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should handle empty data array', () => {
    const { container } = render(<WordCloud data={[]} width={500} height={350} />)
    
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
    // With empty data, no SVG should be created
    expect(div.querySelector('svg')).not.toBeInTheDocument()
  })
})
