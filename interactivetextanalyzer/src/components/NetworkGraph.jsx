import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

// nodes: [{id, value}] edges: [{source, target, value}]
export default function NetworkGraph({ nodes=[], edges=[], width=600, height=400, weightedLines=false }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    el.textContent = ''
    if(!nodes.length) return
    const svg = d3.select(el).append('svg').attr('width', width).attr('height', height)
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d=>d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide().radius(30))

    const link = svg.append('g').selectAll('line').data(edges).enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => weightedLines ? Math.sqrt(d.value || 1) : 1.5)

    const node = svg.append('g').selectAll('circle').data(nodes).enter().append('circle')
      .attr('r', d => 6 + Math.log(d.value || 1))
      .attr('fill', d => color(d.id))
      .call(d3.drag()
        .on('start', (event, d) => { if(!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => { if(!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }))

    const labels = svg.append('g').selectAll('text').data(nodes).enter().append('text')
      .text(d=>d.id)
      .attr('font-size', 10)
      .attr('text-anchor','middle')
      .attr('fill','#1e293b')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .attr('paint-order', 'stroke')

    simulation.on('tick', () => {
      link.attr('x1', d=>d.source.x).attr('y1', d=>d.source.y).attr('x2', d=>d.target.x).attr('y2', d=>d.target.y)
      node.attr('cx', d=>d.x).attr('cy', d=>d.y)
      labels.attr('x', d=>d.x).attr('y', d=>d.y - 10)
    })
  }, [nodes, edges, width, height, weightedLines])
  return <div ref={ref} />
}
