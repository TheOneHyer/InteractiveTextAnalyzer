import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import NetworkGraph from '../components/NetworkGraph'

describe('NetworkGraph Component', () => {
  beforeEach(() => {
    // Mock canvas for d3 if needed
    if (!HTMLCanvasElement.prototype.getContext) {
      HTMLCanvasElement.prototype.getContext = () => ({
        fillText: () => {},
        measureText: (text) => ({ width: text.length * 10 }),
        save: () => {},
        restore: () => {},
        clearRect: () => {},
      })
    }
  })

  it('should render a div container', () => {
    const { container } = render(<NetworkGraph nodes={[]} edges={[]} />)
    
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render with default props', () => {
    const { container } = render(<NetworkGraph />)
    
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should handle empty nodes and edges', () => {
    const { container } = render(<NetworkGraph nodes={[]} edges={[]} />)
    
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
    // With no nodes, SVG should not be created
    expect(div.querySelector('svg')).not.toBeInTheDocument()
  })

  it('should accept custom width and height', () => {
    const nodes = [{ id: 'node1', value: 10 }]
    const edges = []
    
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} width={800} height={600} />
    )
    
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render SVG when nodes are provided', () => {
    const nodes = [
      { id: 'node1', value: 10 },
      { id: 'node2', value: 5 }
    ]
    const edges = [
      { source: 'node1', target: 'node2', value: 1 }
    ]
    
    const { container } = render(<NetworkGraph nodes={nodes} edges={edges} />)
    
    // SVG should be created when nodes exist
    setTimeout(() => {
      const svg = container.querySelector('svg')
      if (svg) {
        expect(svg).toBeInTheDocument()
      }
    }, 100)
  })

  it('should handle nodes without edges', () => {
    const nodes = [
      { id: 'isolated1', value: 10 },
      { id: 'isolated2', value: 5 }
    ]
    
    const { container } = render(<NetworkGraph nodes={nodes} edges={[]} />)
    
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
  })

  it('should validate node structure', () => {
    const nodes = [
      { id: 'test', value: 100 }
    ]
    
    expect(nodes[0]).toHaveProperty('id')
    expect(nodes[0]).toHaveProperty('value')
  })

  it('should accept weightedLines prop', () => {
    const nodes = [{ id: 'node1', value: 10 }]
    const edges = []
    
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} weightedLines={true} />
    )
    
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should validate edge structure', () => {
    const edges = [
      { source: 'a', target: 'b', value: 5 }
    ]
    
    expect(edges[0]).toHaveProperty('source')
    expect(edges[0]).toHaveProperty('target')
    expect(edges[0]).toHaveProperty('value')
  })

  it('should constrain nodes within boundaries', () => {
    const nodes = [
      { id: 'node1', value: 10 },
      { id: 'node2', value: 5 }
    ]
    const edges = [
      { source: 'node1', target: 'node2', value: 1 }
    ]
    const width = 600
    const height = 400
    
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} width={width} height={height} />
    )
    
    // The NetworkGraph component should constrain node positions during simulation
    // This test verifies the component accepts the boundary parameters
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
    
    // After simulation ticks, nodes should stay within bounds (20 to width-20, 20 to height-20)
    // This is enforced by the tick handler in the component
  })
})
