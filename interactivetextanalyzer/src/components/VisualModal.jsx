import { useEffect, useRef } from 'react'
import './VisualModal.css'

/**
 * VisualModal - A modal component for displaying maximized visualizations
 * with export options (PNG, SVG, PDF)
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback to close the modal
 * @param {string} title - Title of the visualization
 * @param {React.ReactNode} children - The visualization component(s) to display
 * @param {string} layout - Layout type: 'single', 'side-by-side', or 'grid'
 */
export default function VisualModal({ isOpen, onClose, title, children, layout = 'single' }) {
  const modalRef = useRef(null)
  const contentRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const exportAsPNG = async () => {
    try {
      const content = contentRef.current
      if (!content) return

      // Use html2canvas for PNG export
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(content, {
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--c-surface').trim() || '#ffffff',
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = `${title.replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('PNG export failed:', error)
      alert('PNG export failed. Please try again.')
    }
  }

  const exportAsSVG = async () => {
    try {
      const content = contentRef.current
      if (!content) return

      // Find all SVG elements in the content
      const svgs = content.querySelectorAll('svg')
      if (svgs.length === 0) {
        alert('No SVG elements found to export.')
        return
      }

      // If multiple SVGs, combine them
      if (svgs.length === 1) {
        downloadSVG(svgs[0], `${title.replace(/\s+/g, '_')}.svg`)
      } else {
        // Create a wrapper SVG that contains all individual SVGs
        const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const width = content.offsetWidth
        const height = content.offsetHeight
        wrapper.setAttribute('width', width)
        wrapper.setAttribute('height', height)
        wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        svgs.forEach((svg) => {
          const clone = svg.cloneNode(true)
          const rect = svg.getBoundingClientRect()
          const contentRect = content.getBoundingClientRect()
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
          g.setAttribute('transform', `translate(${rect.left - contentRect.left}, ${rect.top - contentRect.top})`)
          g.appendChild(clone)
          wrapper.appendChild(g)
        })

        downloadSVG(wrapper, `${title.replace(/\s+/g, '_')}.svg`)
      }
    } catch (error) {
      console.error('SVG export failed:', error)
      alert('SVG export failed. Please try again.')
    }
  }

  const downloadSVG = (svgElement, filename) => {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsPDF = async () => {
    try {
      const content = contentRef.current
      if (!content) return

      // Use jsPDF and html2canvas for PDF export
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ])

      const canvas = await html2canvas(content, {
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--c-surface').trim() || '#ffffff',
        scale: 2
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="visual-modal-overlay" onClick={onClose}>
      <div 
        className="visual-modal" 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="visual-modal-header">
          <h2>{title}</h2>
          <div className="visual-modal-actions">
            <button 
              className="export-btn" 
              onClick={exportAsPNG}
              title="Export as PNG"
            >
              PNG
            </button>
            <button 
              className="export-btn" 
              onClick={exportAsSVG}
              title="Export as SVG"
            >
              SVG
            </button>
            <button 
              className="export-btn" 
              onClick={exportAsPDF}
              title="Export as PDF"
            >
              PDF
            </button>
            <button 
              className="close-btn" 
              onClick={onClose}
              title="Close (Esc)"
            >
              ×
            </button>
          </div>
        </div>
        <div className="visual-modal-body">
          <div 
            className={`visual-modal-content layout-${layout}`}
            ref={contentRef}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
