import { useRef, useEffect } from 'react'
import * as d3 from 'd3'
import cloud from 'd3-cloud'

// data: array of { text, value }
export default function WordCloud({ data = [], width = 500, height = 350 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!data.length) return
    const el = ref.current
    el.textContent = ''
    const max = d3.max(data, d => d.value) || 1
    const scale = d3.scaleLinear().domain([0, max]).range([12, 64])
    const layout = cloud()
      .size([width, height])
      .words(data.map(d => ({ text: d.text, size: scale(d.value) })))
      .padding(3)
      .rotate(() => 0)
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', words => {
        const svg = d3.select(el)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
        const g = svg.append('g')
          .attr('transform', `translate(${width / 2},${height / 2})`)
        g.selectAll('text')
          .data(words)
          .enter().append('text')
          .style('font-family', 'Impact')
          .style('fill', (_, i) => d3.schemeCategory10[i % 10])
          .attr('text-anchor', 'middle')
          .attr('font-size', d => d.size)
          .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
          .text(d => d.text)
      })
    layout.start()
  }, [data, width, height])
  return <div ref={ref} />
}
