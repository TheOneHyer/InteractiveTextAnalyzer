import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Heatmap from '../components/Heatmap'

describe('Heatmap Component', () => {
  it('should render a table with heatmap data', () => {
    const matrix = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]
    const xLabels = ['Col A', 'Col B', 'Col C']
    const yLabels = ['Row 1', 'Row 2', 'Row 3']
    
    render(<Heatmap matrix={matrix} xLabels={xLabels} yLabels={yLabels} />)
    
    // Check that table is rendered
    const table = document.querySelector('table')
    expect(table).toBeInTheDocument()
  })

  it('should render column headers', () => {
    const matrix = [[1, 2]]
    const xLabels = ['Column 1', 'Column 2']
    const yLabels = ['Row 1']
    
    render(<Heatmap matrix={matrix} xLabels={xLabels} yLabels={yLabels} />)
    
    expect(screen.getByText('Column 1')).toBeInTheDocument()
    expect(screen.getByText('Column 2')).toBeInTheDocument()
  })

  it('should render row headers', () => {
    const matrix = [[1, 2]]
    const xLabels = ['Column 1', 'Column 2']
    const yLabels = ['Row Label']
    
    render(<Heatmap matrix={matrix} xLabels={xLabels} yLabels={yLabels} />)
    
    expect(screen.getByText('Row Label')).toBeInTheDocument()
  })

  it('should render cell values', () => {
    const matrix = [[42, 99]]
    const xLabels = ['A', 'B']
    const yLabels = ['1']
    
    const { container } = render(<Heatmap matrix={matrix} xLabels={xLabels} yLabels={yLabels} />)
    
    // Values are in tooltips by default (title attributes)
    const cells = container.querySelectorAll('tbody td')
    expect(cells[0].getAttribute('title')).toContain('42')
    expect(cells[1].getAttribute('title')).toContain('99')
  })

  it('should handle empty data gracefully', () => {
    render(<Heatmap matrix={[]} xLabels={[]} yLabels={[]} />)
    
    const table = document.querySelector('table')
    expect(table).toBeInTheDocument()
  })

  it('should render with default props', () => {
    const { container } = render(<Heatmap />)
    
    const table = container.querySelector('table')
    expect(table).toBeInTheDocument()
  })

  it('should apply color intensity based on values', () => {
    const matrix = [[1, 10]]
    const xLabels = ['Low', 'High']
    const yLabels = ['Values']
    
    const { container } = render(<Heatmap matrix={matrix} xLabels={xLabels} yLabels={yLabels} />)
    
    const cells = container.querySelectorAll('tbody td')
    expect(cells).toHaveLength(2)
    
    // Both cells should have background color (note: browser may convert rgba to rgb)
    expect(cells[0].style.background).toBeTruthy()
    expect(cells[1].style.background).toBeTruthy()
  })

  it('should toggle values visibility when checkbox is clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const matrix = [[42, 99]]
    const xLabels = ['A', 'B']
    const yLabels = ['1']
    
    render(<Heatmap matrix={matrix} xLabels={xLabels} yLabels={yLabels} />)
    
    // Initially, values should not be visible
    expect(screen.queryByText('42')).not.toBeInTheDocument()
    
    // Click the checkbox
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    
    // Now values should be visible
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})
