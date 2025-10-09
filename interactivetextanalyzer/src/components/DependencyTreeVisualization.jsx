import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import { getDependencyInfo } from '../utils/spacyDependencyParsing'
import './DependencyTreeVisualization.css'

/**
 * DependencyTreeVisualization Component
 * 
 * Displays dependency parse trees with:
 * - Sentence selector for choosing which sentence to visualize
 * - Interactive tree visualization
 * - Hover tooltips showing dependency label descriptions
 * - Color-coded edges based on dependency type
 * 
 * Props:
 * - sentences: Array of parsed sentences with nodes and edges
 * - width: Visualization width (default: 800)
 * - height: Visualization height (default: 500)
 */
export default function DependencyTreeVisualization({ sentences = [], width = 800, height = 500 }) {
  const ref = useRef(null)
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(0)
  const [hoveredLabel, setHoveredLabel] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Get the selected sentence
  const selectedSentence = sentences[selectedSentenceIdx] || null

  useEffect(() => {
    const el = ref.current
    if (!el || !selectedSentence) {
      return
    }

    // Clear previous visualization
    el.textContent = ''

    const nodes = selectedSentence.nodes || []
    const edges = selectedSentence.edges || []

    if (nodes.length === 0) {
      return
    }

    // Create SVG
    const svg = d3.select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // Create arrow marker for directed edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#666')

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))

    // Create links (edges)
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', d => d.color || '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.7)
      .attr('marker-end', 'url(#arrowhead)')

    // Create edge labels
    const edgeLabels = svg.append('g')
      .attr('class', 'edge-labels')
      .selectAll('text')
      .data(edges)
      .enter().append('text')
      .attr('class', 'edge-label')
      .attr('font-size', 10)
      .attr('fill', '#555')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text(d => d.label || '')
      .style('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        setHoveredLabel(d.label)
        const rect = el.getBoundingClientRect()
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        })
      })
      .on('mouseleave', function() {
        setHoveredLabel(null)
      })

    // Create nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart()
          }
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) {
            simulation.alphaTarget(0)
          }
          d.fx = null
          d.fy = null
        }))

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => {
        if (d.id === 'ROOT') {
          return 12
        }
        return 8
      })
      .attr('fill', d => {
        if (d.id === 'ROOT') {
          return '#2D3436'
        }
        return '#74B9FF'
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Add text labels to nodes
    node.append('text')
      .attr('dy', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#1e293b')
      .attr('font-weight', d => {
        if (d.id === 'ROOT') {
          return 'bold'
        }
        return 'normal'
      })
      .text(d => d.label)

    // Add POS tag labels
    node.append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('fill', '#666')
      .attr('font-style', 'italic')
      .text(d => {
        if (d.pos !== 'ROOT') {
          return d.pos
        }
        return ''
      })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      edgeLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Stop simulation after a while to save CPU
    setTimeout(() => {
      simulation.stop()
    }, 5000)

  }, [selectedSentence, width, height])

  // Handle sentence selection
  const handleSentenceChange = (event) => {
    setSelectedSentenceIdx(parseInt(event.target.value, 10))
  }

  // Get dependency info for tooltip
  let tooltipInfo = null
  if (hoveredLabel) {
    tooltipInfo = getDependencyInfo(hoveredLabel)
  }

  if (sentences.length === 0) {
    return (
      <div className="dependency-tree-empty">
        <p>No dependency parse data available. Please run the analysis first.</p>
      </div>
    )
  }

  return (
    <div className="dependency-tree-container">
      <div className="dependency-tree-controls">
        <label htmlFor="sentence-selector">
          Select Sentence to Visualize:
          <select
            id="sentence-selector"
            value={selectedSentenceIdx}
            onChange={handleSentenceChange}
            className="sentence-selector"
          >
            {sentences.map((sent, idx) => {
              let truncated = sent.sentence.substring(0, 60)
              let ellipsis = ''
              if (sent.sentence.length > 60) {
                ellipsis = '...'
              }
              
              return (
                <option key={idx} value={idx}>
                  {idx + 1}. {truncated}{ellipsis}
                </option>
              )
            })}
          </select>
        </label>
        <div className="sentence-info">
          Showing sentence {selectedSentenceIdx + 1} of {sentences.length}
        </div>
      </div>

      <div className="dependency-tree-viz-wrapper">
        <div ref={ref} className="dependency-tree-viz" />

        {hoveredLabel && tooltipInfo && (
          <div
            className="dependency-tooltip"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y + 10
            }}
          >
            <div className="tooltip-header">
              <strong>{tooltipInfo.label}</strong>
              <span className="tooltip-tag">({hoveredLabel})</span>
            </div>
            <div className="tooltip-description">
              {tooltipInfo.description}
            </div>
            <div className="tooltip-example">
              <em>Example:</em> {tooltipInfo.example}
            </div>
          </div>
        )}
      </div>

      {selectedSentence && (
        <div className="sentence-display">
          <strong>Current Sentence:</strong> {selectedSentence.sentence}
        </div>
      )}

      <div className="dependency-legend">
        <h4>Common Dependency Relations:</h4>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FF6B6B' }}></span>
            <span><strong>nsubj:</strong> Nominal Subject</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#4ECDC4' }}></span>
            <span><strong>obj:</strong> Direct Object</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FEA47F' }}></span>
            <span><strong>amod:</strong> Adjectival Modifier</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#F8B195' }}></span>
            <span><strong>det:</strong> Determiner</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#FDCB6E' }}></span>
            <span><strong>advmod:</strong> Adverbial Modifier</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#74B9FF' }}></span>
            <span><strong>aux:</strong> Auxiliary</span>
          </div>
        </div>
        <p className="legend-note">
          <em>Hover over edge labels in the visualization for detailed descriptions of each dependency type.</em>
        </p>
      </div>
    </div>
  )
}
