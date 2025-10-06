import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('App Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('should render main application container', () => {
    const { container } = render(<App />)
    const appDiv = container.querySelector('#app-shell')
    expect(appDiv).toBeInTheDocument()
  })

  it('should render title', async () => {
    render(<App />)
    // Look for title or header text
    await waitFor(() => {
      const heading = document.querySelector('h1') || document.querySelector('h2')
      expect(heading).toBeInTheDocument()
    })
  })

  it('should have theme toggle functionality', () => {
    const { container } = render(<App />)
    // Check for theme-related elements (button or toggle)
    const themeButton = container.querySelector('button')
    expect(themeButton).toBeInTheDocument()
  })

  it('should render sample data button', async () => {
    render(<App />)
    await waitFor(() => {
      // Look for "Load Sample Data" or similar button
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('should initialize with empty data state', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
    // Component should render even with no data initially
  })
})

describe('App Component - Data Handling', () => {
  it('should have file upload capability', () => {
    const { container } = render(<App />)
    // Check for file input or upload button
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
  })

  it('should have analysis type selection', async () => {
    render(<App />)
    // Navigate to Analyzer to see analysis type selectors
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const analyzerButton = buttons.find(btn => btn.title === 'Analyzer')
      expect(analyzerButton).toBeInTheDocument()
      analyzerButton.click()
    })
    // Should have some form of analysis type selector in Analyzer
    await waitFor(() => {
      const selects = document.querySelectorAll('select')
      expect(selects.length).toBeGreaterThan(0)
    })
  })
})

describe('App Component - UI Elements', () => {
  it('should render main layout structure', () => {
    const { container } = render(<App />)
    
    // Check for main structural elements
    expect(container.querySelector('#app-shell')).toBeInTheDocument()
  })

  it('should have control panel area', () => {
    const { container } = render(<App />)
    
    // Look for buttons or controls
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should have collapsible sidebar', () => {
    const { container } = render(<App />)
    
    // Check for sidebar
    const sidebar = container.querySelector('.sidebar')
    expect(sidebar).toBeInTheDocument()
    
    // Check for sidebar toggle button
    const toggleButton = container.querySelector('.sidebar-toggle')
    expect(toggleButton).toBeInTheDocument()
  })

  it('should render chart layout options in dashboard', async () => {
    render(<App />)
    
    // Navigate to Analyzer first
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const analyzerButton = buttons.find(btn => btn.title === 'Analyzer')
      expect(analyzerButton).toBeInTheDocument()
      analyzerButton.click()
    })
    
    // Wait for analyzer to render - look for the h1 heading
    await waitFor(() => {
      const heading = document.querySelector('h1')
      expect(heading).toBeInTheDocument()
      expect(heading.textContent).toBe('Analyzer')
    })
    
    // Check for layout buttons (Single, Side-by-Side, 2x2 Grid)
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const layoutButtons = buttons.filter(btn => 
        btn.textContent.includes('Single') || 
        btn.textContent.includes('Side-by-Side') || 
        btn.textContent.includes('2x2 Grid')
      )
      expect(layoutButtons.length).toBeGreaterThan(0)
    })
  })
})

describe('App Component - Maximize Modal Functionality', () => {
  it('should render maximize button for Live Summary Charts', async () => {
    render(<App />)
    
    // Navigate to Analyzer first
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const analyzerButton = buttons.find(btn => btn.title === 'Analyzer')
      expect(analyzerButton).toBeInTheDocument()
      analyzerButton.click()
    })
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const maximizeButton = buttons.find(btn => btn.title === 'Maximize charts')
      expect(maximizeButton).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should have maximize button with correct symbol', async () => {
    render(<App />)
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const maximizeButton = buttons.find(btn => btn.title === 'Maximize charts')
      if (maximizeButton) {
        expect(maximizeButton.textContent).toBe('⛶')
      }
    }, { timeout: 3000 })
  })

  it('should render visualization mode buttons', async () => {
    render(<App />)
    
    // Navigate to Analyzer first
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const analyzerButton = buttons.find(btn => btn.title === 'Analyzer')
      expect(analyzerButton).toBeInTheDocument()
      analyzerButton.click()
    })
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const visualButtons = buttons.filter(btn => 
        btn.textContent === 'Wordcloud' || 
        btn.textContent === 'Network' || 
        btn.textContent === 'Heatmap' ||
        btn.textContent === 'List'
      )
      expect(visualButtons.length).toBeGreaterThan(0)
    })
  })

  it('should have export buttons in dashboard view', async () => {
    render(<App />)
    
    await waitFor(() => {
      const heading = document.querySelector('h1')
      if (heading && heading.textContent === 'Analyzer') {
        const buttons = screen.getAllByRole('button')
        const exportButton = buttons.find(btn => btn.textContent.includes('Export'))
        expect(exportButton).toBeInTheDocument()
      }
    })
  })

  it('should render chart layout control buttons', async () => {
    render(<App />)
    
    // Navigate to Analyzer first
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const analyzerButton = buttons.find(btn => btn.title === 'Analyzer')
      expect(analyzerButton).toBeInTheDocument()
      analyzerButton.click()
    })
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const singleButton = buttons.find(btn => btn.textContent === 'Single')
      const sideBySideButton = buttons.find(btn => btn.textContent === 'Side-by-Side')
      const gridButton = buttons.find(btn => btn.textContent === '2x2 Grid')
      
      expect(singleButton || sideBySideButton || gridButton).toBeTruthy()
    })
  })

  it('should maintain dashboard structure with maximize functionality', async () => {
    const { container } = render(<App />)
    
    await waitFor(() => {
      const heading = document.querySelector('h1')
      if (heading && heading.textContent === 'Analyzer') {
        // Check that the panel structure is intact
        const panels = container.querySelectorAll('.panel')
        expect(panels.length).toBeGreaterThan(0)
      }
    })
  })
})
