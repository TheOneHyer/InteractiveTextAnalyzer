import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

// nodes: [{id, value}] edges: [{source, target, value}]
export default function NetworkGraph({ nodes = [], edges = [], width = 600, height = 400 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    el.innerHTML = ''
    if (!nodes.length) return

    const svg = d3.select(el).append('svg').attr('width', width).attr('height', height)
    const g = svg.append('g')
    const color = d3.scaleOrdinal(d3.schemeTableau10)

    // Zoom / pan (no auto zooming out after stabilization)
    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', (event) => {
      g.attr('transform', event.transform)
    })
    svg.call(zoom)

    // Copy data (d3 mutates) to avoid React state pollution
    const simNodes = nodes.map(n => ({ ...n }))
    const simEdges = edges.map(e => ({ ...e }))

    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink(simEdges).id(d => d.id).distance(80).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-90))
      .force('collide', d3.forceCollide().radius(d => 14 + Math.log((d.value || 1) * 40)))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .velocityDecay(0.3)

    const link = g.append('g').attr('stroke', '#999').attr('stroke-opacity', 0.5)
      .selectAll('line').data(simEdges).enter().append('line')
      .attr('stroke-width', d => 0.5 + Math.min(4, Math.sqrt(d.value || 1)))

    const node = g.append('g').selectAll('circle').data(simNodes).enter().append('circle')
      .attr('r', d => 6 + Math.log((d.value || 1) * 40))
      .attr('fill', d => color(d.id))
      .attr('stroke', '#111')
      .attr('stroke-width', 0.5)
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }))

    node.append('title').text(d => d.id)

    const labels = g.append('g').selectAll('text').data(simNodes).enter().append('text')
      .text(d => d.id)
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('fill', '#fff')

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('cx', d => d.x = clamp(d.x, 20, width - 20)).attr('cy', d => d.y = clamp(d.y, 20, height - 20))
      labels.attr('x', d => d.x).attr('y', d => d.y - 10)
    })

    // After stabilization recentre cluster bounding box
    simulation.on('end', () => {
      const xs = simNodes.map(n => n.x), ys = simNodes.map(n => n.y)
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
      const scale = Math.min(width / (maxX - minX + 80), height / (maxY - minY + 80), 1.2)
      const tx = (width - (minX + maxX) * scale / 2) / 2
      const ty = (height - (minY + maxY) * scale / 2) / 2
      g.attr('transform', `translate(${tx},${ty}) scale(${scale})`)
    })

    return () => simulation.stop()
  }, [nodes, edges, width, height])
  return <div ref={ref} />
}
