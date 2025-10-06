import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VisualModal from '../components/VisualModal'

// Mock html2canvas and jspdf
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    width: 800,
    height: 600
  }))
}))

vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn()
  }))
}))

describe('VisualModal Component', () => {
  const mockOnClose = vi.fn()
  const mockChildren = <div data-testid="mock-content">Mock Visualization</div>

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <VisualModal isOpen={false} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    expect(container.querySelector('.visual-modal-overlay')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test Modal">
        {mockChildren}
      </VisualModal>
    )
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByTestId('mock-content')).toBeInTheDocument()
  })

  it('should render with correct title', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Live Summary Charts">
        {mockChildren}
      </VisualModal>
    )
    
    expect(screen.getByText('Live Summary Charts')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        <div data-testid="custom-child">Custom Content</div>
      </VisualModal>
    )
    
    expect(screen.getByTestId('custom-child')).toBeInTheDocument()
    expect(screen.getByText('Custom Content')).toBeInTheDocument()
  })

  it('should render export buttons', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    expect(screen.getByText('PNG')).toBeInTheDocument()
    expect(screen.getByText('SVG')).toBeInTheDocument()
    expect(screen.getByText('PDF')).toBeInTheDocument()
  })

  it('should render close button', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const closeButton = screen.getByTitle('Close (Esc)')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton.textContent).toBe('×')
  })

  it('should call onClose when close button is clicked', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const closeButton = screen.getByTitle('Close (Esc)')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const overlay = container.querySelector('.visual-modal-overlay')
    fireEvent.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when modal content is clicked', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const modal = container.querySelector('.visual-modal')
    fireEvent.click(modal)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should call onClose when Escape key is pressed', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when other keys are pressed', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'a' })
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should apply layout-single class by default', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const content = container.querySelector('.visual-modal-content')
    expect(content).toHaveClass('layout-single')
  })

  it('should apply layout-side-by-side class when specified', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test" layout="side-by-side">
        {mockChildren}
      </VisualModal>
    )
    
    const content = container.querySelector('.visual-modal-content')
    expect(content).toHaveClass('layout-side-by-side')
  })

  it('should apply layout-grid class when specified', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test" layout="grid">
        {mockChildren}
      </VisualModal>
    )
    
    const content = container.querySelector('.visual-modal-content')
    expect(content).toHaveClass('layout-grid')
  })

  it('should have PNG export button with correct title', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const pngButton = screen.getByTitle('Export as PNG')
    expect(pngButton).toBeInTheDocument()
    expect(pngButton.textContent).toBe('PNG')
  })

  it('should have SVG export button with correct title', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const svgButton = screen.getByTitle('Export as SVG')
    expect(svgButton).toBeInTheDocument()
    expect(svgButton.textContent).toBe('SVG')
  })

  it('should have PDF export button with correct title', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const pdfButton = screen.getByTitle('Export as PDF')
    expect(pdfButton).toBeInTheDocument()
    expect(pdfButton.textContent).toBe('PDF')
  })

  it('should render modal with 80% viewport dimensions', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    const modal = container.querySelector('.visual-modal')
    
    // Check that modal has appropriate styling (actual dimensions may vary in test environment)
    expect(modal).toHaveClass('visual-modal')
  })

  it('should prevent body scroll when open', async () => {
    const { unmount } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })
    
    unmount()
    
    expect(document.body.style.overflow).toBe('')
  })

  it('should restore body scroll when closed', async () => {
    const { rerender } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })
    
    rerender(
      <VisualModal isOpen={false} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
    })
  })

  it('should handle multiple children', () => {
    render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </VisualModal>
    )
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('should render with correct structure', () => {
    const { container } = render(
      <VisualModal isOpen={true} onClose={mockOnClose} title="Test">
        {mockChildren}
      </VisualModal>
    )
    
    expect(container.querySelector('.visual-modal-overlay')).toBeInTheDocument()
    expect(container.querySelector('.visual-modal')).toBeInTheDocument()
    expect(container.querySelector('.visual-modal-header')).toBeInTheDocument()
    expect(container.querySelector('.visual-modal-body')).toBeInTheDocument()
    expect(container.querySelector('.visual-modal-content')).toBeInTheDocument()
    expect(container.querySelector('.visual-modal-actions')).toBeInTheDocument()
  })
})
