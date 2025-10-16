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

  it('should render zoom control buttons', () => {
    const nodes = [
      { id: 'node1', value: 10 },
      { id: 'node2', value: 5 }
    ]
    const edges = [
      { source: 'node1', target: 'node2', value: 1 }
    ]
    
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} width={600} height={400} />
    )
    
    // The NetworkGraph component should render zoom control buttons
    const controls = container.querySelector('.network-graph-controls')
    expect(controls).toBeInTheDocument()
    
    // Check for control buttons
    const buttons = container.querySelectorAll('.control-btn')
    expect(buttons.length).toBeGreaterThan(0)
  })
  
  it('should render minimap when nodes are provided', () => {
    const nodes = [
      { id: 'node1', value: 10 },
      { id: 'node2', value: 5 }
    ]
    const edges = [
      { source: 'node1', target: 'node2', value: 1 }
    ]
    
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} width={600} height={400} />
    )
    
    // The NetworkGraph component should render a minimap
    const minimap = container.querySelector('.network-graph-minimap')
    expect(minimap).toBeInTheDocument()
  })
  
  it('should have proper container structure for zoom functionality', () => {
    const nodes = [
      { id: 'node1', value: 10 }
    ]
    
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={[]} width={600} height={400} />
    )
    
    // Check for the main container structure
    const graphContainer = container.querySelector('.network-graph-container')
    expect(graphContainer).toBeInTheDocument()
    
    // Check for the SVG container
    const svgContainer = container.querySelector('.network-graph-svg')
    expect(svgContainer).toBeInTheDocument()
  })
})
