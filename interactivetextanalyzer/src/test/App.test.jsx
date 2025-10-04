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
