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
  const svgRef = useRef(null)
  const minimapRef = useRef(null)
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

    // Create SVG with zoom capability
    const svg = d3.select(el)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid #e0e0e0')
      .style('background', '#fafafa')
    
    // Create a group for all graph elements (this will be zoomed/panned)
    const mainG = svg.append('g')
    
    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        mainG.attr('transform', event.transform)
      })
    
    svg.call(zoom)
    
    // Store zoom behavior for control buttons
    svg.node().zoomBehavior = zoom

    // Create arrow marker for directed edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .enter().append('marker')
      .attr('id', `arrowhead-${selectedSentenceIdx}`)
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
    const link = mainG.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', d => d.color || '#999')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.7)
      .attr('marker-end', `url(#arrowhead-${selectedSentenceIdx})`)

    // Create edge labels
    const edgeLabels = mainG.append('g')
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
    const node = mainG.append('g')
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
    
    // Store SVG ref for control buttons
    svgRef.current = svg.node()
    
    // Create minimap
    const minimapContainer = minimapRef.current
    if (minimapContainer) {
      minimapContainer.innerHTML = ''
      
      const minimapWidth = 150
      const minimapHeight = 100
      const minimapScale = Math.min(minimapWidth / width, minimapHeight / height)
      
      const minimapSvg = d3.select(minimapContainer)
        .append('svg')
        .attr('width', minimapWidth)
        .attr('height', minimapHeight)
        .style('border', '1px solid #999')
        .style('background', '#f0f0f0')
      
      const minimapG = minimapSvg.append('g')
        .attr('transform', `scale(${minimapScale})`)
      
      // Minimap links
      const minimapLinks = minimapG.append('g')
        .selectAll('line')
        .data(edges)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3)
      
      // Minimap nodes
      const minimapNodes = minimapG.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('fill', '#74B9FF')
      
      // Viewport indicator on minimap
      const viewportRect = minimapSvg.append('rect')
        .attr('fill', 'none')
        .attr('stroke', '#2196F3')
        .attr('stroke-width', 2)
        .attr('rx', 2)
      
      // Update minimap on zoom
      zoom.on('zoom.minimap', (event) => {
        const transform = event.transform
        const scale = transform.k
        const x = -transform.x / scale
        const y = -transform.y / scale
        
        viewportRect
          .attr('x', x * minimapScale)
          .attr('y', y * minimapScale)
          .attr('width', (width / scale) * minimapScale)
          .attr('height', (height / scale) * minimapScale)
      })
      
      // Update minimap positions on simulation tick
      simulation.on('tick.minimap', () => {
        minimapLinks
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        
        minimapNodes
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
      })
      
      // Initialize minimap viewport
      viewportRect
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width * minimapScale)
        .attr('height', height * minimapScale)
      
      // Minimap click to navigate
      minimapSvg.on('click', function(event) {
        const [mx, my] = d3.pointer(event)
        const transform = d3.zoomTransform(svg.node())
        const scale = transform.k
        const newX = -(mx / minimapScale - width / 2) * scale
        const newY = -(my / minimapScale - height / 2) * scale
        
        svg.transition()
          .duration(300)
          .call(zoom.transform, d3.zoomIdentity.translate(newX, newY).scale(scale))
      })
    }

  }, [selectedSentence, width, height])

  // Handle sentence selection
  const handleSentenceChange = (event) => {
    setSelectedSentenceIdx(parseInt(event.target.value, 10))
  }
  
  // Control button handlers
  const handleZoomIn = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    if (svg.node().zoomBehavior) {
      svg.transition().duration(300).call(svg.node().zoomBehavior.scaleBy, 1.3)
    }
  }
  
  const handleZoomOut = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    if (svg.node().zoomBehavior) {
      svg.transition().duration(300).call(svg.node().zoomBehavior.scaleBy, 0.7)
    }
  }
  
  const handleReset = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    if (svg.node().zoomBehavior) {
      svg.transition().duration(300).call(svg.node().zoomBehavior.transform, d3.zoomIdentity)
    }
  }
  
  const handleFitView = () => {
    if (!svgRef.current || !selectedSentence) return
    
    const nodes = selectedSentence.nodes || []
    if (nodes.length === 0) return
    
    // Calculate bounding box of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach(d => {
      if (d.x && d.y) {
        if (d.x < minX) minX = d.x
        if (d.x > maxX) maxX = d.x
        if (d.y < minY) minY = d.y
        if (d.y > maxY) maxY = d.y
      }
    })
    
    if (minX === Infinity) return
    
    const padding = 50
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    
    const scale = Math.min(width / contentWidth, height / contentHeight, 1)
    const translateX = width / 2 - centerX * scale
    const translateY = height / 2 - centerY * scale
    
    const svg = d3.select(svgRef.current)
    if (svg.node().zoomBehavior) {
      svg.transition()
        .duration(500)
        .call(svg.node().zoomBehavior.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale))
    }
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
      
      <div className="dependency-tree-zoom-controls">
        <button onClick={handleZoomIn} className="control-btn" title="Zoom In">
          <span>+</span>
        </button>
        <button onClick={handleZoomOut} className="control-btn" title="Zoom Out">
          <span>−</span>
        </button>
        <button onClick={handleReset} className="control-btn" title="Reset View">
          <span>⟲</span>
        </button>
        <button onClick={handleFitView} className="control-btn" title="Fit to View">
          <span>⛶</span>
        </button>
      </div>

      <div className="dependency-tree-viz-wrapper">
        <div ref={ref} className="dependency-tree-viz" />
        <div className="dependency-tree-minimap">
          <div className="minimap-label">Minimap</div>
          <div ref={minimapRef} />
        </div>

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
