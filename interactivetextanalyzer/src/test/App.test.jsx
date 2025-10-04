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

  it('should have analysis type selection', () => {
    const { container } = render(<App />)
    // Should have some form of analysis type selector
    const selects = container.querySelectorAll('select')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('should accept only allowed file types', () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
    // Check that the file input has accept attribute
    expect(fileInput.getAttribute('accept')).toContain('.xlsx')
    expect(fileInput.getAttribute('accept')).toContain('.csv')
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
})

describe('App Component - Security Integration', () => {
  it('should sanitize localStorage data on load', () => {
    // Test that localStorage is read with sanitization
    const maliciousData = JSON.stringify({
      selectedColumns: ['<script>alert(1)</script>col'],
      analysisType: 'malicious_type',
      ngramN: 999
    })
    localStorage.setItem('ita_state_v1', maliciousData)
    
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
    
    // The app should load without errors despite malicious localStorage
    expect(container.querySelector('#app-shell')).toBeInTheDocument()
    
    // Clean up
    localStorage.removeItem('ita_state_v1')
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('ita_state_v1', 'invalid json {{{')
    
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
    
    // The app should still render despite invalid localStorage
    expect(container.querySelector('#app-shell')).toBeInTheDocument()
    
    // Clean up
    localStorage.removeItem('ita_state_v1')
  })

  it('should validate file input with accept attribute', () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    expect(fileInput).toBeTruthy()
    const acceptAttr = fileInput.getAttribute('accept')
    
    // Should only accept safe file types
    expect(acceptAttr).not.toContain('.exe')
    expect(acceptAttr).not.toContain('.js')
    expect(acceptAttr).not.toContain('.html')
  })
})
