import { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
import './NetworkGraph.css'

// nodes: [{id, value}] edges: [{source, target, value}]
export default function NetworkGraph({ nodes=[], edges=[], width=600, height=400, weightedLines=false }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const minimapRef = useRef(null)
  const [minimapPosition, setMinimapPosition] = useState({ bottom: 15, right: 15 })
  
  useEffect(() => {
    const container = containerRef.current
    const minimapContainer = minimapRef.current
    if(!container || !nodes.length) return
    
    // Clear previous content
    container.innerHTML = ''
    if(minimapContainer) minimapContainer.innerHTML = ''
    
    const color = d3.scaleOrdinal(d3.schemeCategory10)
    
    // Create main SVG with zoom capability
    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('border', '1px solid #e0e0e0')
      .style('background', '#fafafa')
    
    svgRef.current = svg.node()
    
    // Create a group for all graph elements (this will be zoomed/panned)
    const g = svg.append('g')
    
    // Variables to hold minimap elements (will be initialized later)
    let viewportRect = null
    let minimapG = null
    
    // Update minimap viewport indicator
    function updateMinimap(transform) {
      if (!viewportRect || !minimapG) return
      
      const minimapScale = Math.min(150 / width, 100 / height)
      const scale = transform.k
      const x = -transform.x / scale
      const y = -transform.y / scale
      
      viewportRect
        .attr('x', x * minimapScale)
        .attr('y', y * minimapScale)
        .attr('width', (width / scale) * minimapScale)
        .attr('height', (height / scale) * minimapScale)
      
      // Update minimap node/link positions
      minimapG.selectAll('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
      
      minimapG.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    }
    
    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        updateMinimap(event.transform)
      })
    
    svg.call(zoom)
    
    // Store zoom behavior for control buttons (store on DOM node, not D3 selection)
    svg.node().zoomBehavior = zoom
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d=>d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide().radius(30))
    
    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => weightedLines ? Math.sqrt(d.value || 1) : 1.5)
    
    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => 6 + Math.log(d.value || 1))
      .attr('fill', d => color(d.id))
      .call(d3.drag()
        .on('start', (event, d) => { 
          if(!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y 
        })
        .on('drag', (event, d) => { 
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => { 
          if(!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null 
        }))
    
    // Create labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d=>d.id)
      .attr('font-size', 10)
      .attr('text-anchor','middle')
      .attr('fill','#1e293b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('paint-order', 'stroke')
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d=>d.source.x)
        .attr('y1', d=>d.source.y)
        .attr('x2', d=>d.target.x)
        .attr('y2', d=>d.target.y)
      
      node
        .attr('cx', d=>d.x)
        .attr('cy', d=>d.y)
      
      labels
        .attr('x', d=>d.x)
        .attr('y', d=>d.y - 10)
    })
    
    // Create minimap
    const minimapWidth = 150
    const minimapHeight = 100
    const minimapScale = Math.min(minimapWidth / width, minimapHeight / height)
    
    const minimapSvg = d3.select(minimapContainer)
      .append('svg')
      .attr('width', minimapWidth)
      .attr('height', minimapHeight)
      .style('border', '1px solid #999')
      .style('background', '#f0f0f0')
    
    // Add minimap content
    minimapG = minimapSvg.append('g')
      .attr('transform', `scale(${minimapScale})`)
    
    // Minimap links
    minimapG.append('g')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
    
    // Minimap nodes
    minimapG.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('fill', d => color(d.id))
    
    // Viewport indicator on minimap
    viewportRect = minimapSvg.append('rect')
      .attr('fill', 'none')
      .attr('stroke', '#2196F3')
      .attr('stroke-width', 2)
      .attr('rx', 2)
      .style('cursor', 'move')
    
    // Initialize minimap
    updateMinimap(d3.zoomIdentity)
    
    // Track if we're dragging to prevent click after drag
    let isDragging = false
    
    // Minimap click to navigate
    minimapSvg.on('click', function(event) {
      if (isDragging) {
        isDragging = false
        return
      }
      const [mx, my] = d3.pointer(event)
      const scale = d3.zoomTransform(svg.node()).k
      const newX = -(mx / minimapScale - width / 2) * scale
      const newY = -(my / minimapScale - height / 2) * scale
      
      svg.transition()
        .duration(300)
        .call(zoom.transform, d3.zoomIdentity.translate(newX, newY).scale(scale))
    })
    
    // Add drag behavior to viewport rectangle for click-and-drag navigation
    const viewportDrag = d3.drag()
      .on('start', function(event) {
        event.sourceEvent.stopPropagation()
        isDragging = false
      })
      .on('drag', function(event) {
        isDragging = true
        const [mx, my] = d3.pointer(event.sourceEvent, minimapSvg.node())
        const scale = d3.zoomTransform(svg.node()).k
        const newX = -(mx / minimapScale - width / 2) * scale
        const newY = -(my / minimapScale - height / 2) * scale
        
        const newTransform = d3.zoomIdentity.translate(newX, newY).scale(scale)
        g.attr('transform', newTransform)
        updateMinimap(newTransform)
      })
      .on('end', function() {
        // Clear isDragging on next event loop to prevent click event reliably
        setTimeout(() => { isDragging = false }, 0)
      })
    
    viewportRect.call(viewportDrag)
    
  }, [nodes, edges, width, height, weightedLines])
  
  // Control button handlers
  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    const zoom = svg.node()?.zoomBehavior
    if (zoom) {
      svg.transition().duration(300).call(zoom.scaleBy, 1.3)
    }
  }
  
  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    const zoom = svg.node()?.zoomBehavior
    if (zoom) {
      svg.transition().duration(300).call(zoom.scaleBy, 0.7)
    }
  }
  
  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    const zoom = svg.node()?.zoomBehavior
    if (zoom) {
      svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity)
    }
    // Reset minimap position to default
    setMinimapPosition({ bottom: 15, right: 15 })
  }
  
  const handleFitView = () => {
    // Calculate bounding box of all nodes
    if(nodes.length === 0) return
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach(d => {
      if(d.x < minX) minX = d.x
      if(d.x > maxX) maxX = d.x
      if(d.y < minY) minY = d.y
      if(d.y > maxY) maxY = d.y
    })
    
    const padding = 50
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    
    const scale = Math.min(width / contentWidth, height / contentHeight, 1)
    const translateX = width / 2 - centerX * scale
    const translateY = height / 2 - centerY * scale
    
    const svg = d3.select(svgRef.current)
    const zoom = svg.node()?.zoomBehavior
    if (zoom) {
      svg.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale))
    }
  }
  
  if(!nodes.length) {
    return <div ref={containerRef} />
  }
  
  // Handle minimap container dragging
  const handleMinimapMouseDown = (e) => {
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startBottom = minimapPosition.bottom
    const startRight = minimapPosition.right
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX
      const deltaY = moveEvent.clientY - startY
      
      setMinimapPosition({
        bottom: Math.max(10, startBottom + deltaY),
        right: Math.max(10, startRight + deltaX)
      })
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
  
  return (
    <div className="network-graph-container">
      <div className="network-graph-controls">
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
      <div ref={containerRef} className="network-graph-svg" />
      <div 
        className="network-graph-minimap"
        style={{ bottom: `${minimapPosition.bottom}px`, right: `${minimapPosition.right}px` }}
        onMouseDown={handleMinimapMouseDown}
      >
        <div className="minimap-label">Minimap</div>
        <div ref={minimapRef} />
      </div>
    </div>
  )
}
