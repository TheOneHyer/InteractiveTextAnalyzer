import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('File Upload Functionality', () => {
  it('should have a file input for uploading files', () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
    expect(fileInput).toHaveAttribute('accept', '.xlsx,.xls,.csv')
  })

  it('should trigger handleFile when a CSV file is selected', async () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    // Create a mock CSV file
    const csvContent = 'Name,Age,City\nJohn,30,NYC\nJane,25,LA'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(function() {
        this.onload({ target: { result: csvContent } })
      }),
      readAsArrayBuffer: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    // Upload the file
    await userEvent.upload(fileInput, file)
    
    // Wait for the file to be processed
    await waitFor(() => {
      // After upload, the workbook should have data
      // We can't directly test state, but we can check if the UI updates
      expect(mockFileReader.readAsText).toHaveBeenCalled()
    })
  })

  it('should handle file upload errors gracefully', async () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    // Mock alert
    const mockAlert = vi.fn()
    global.alert = mockAlert
    
    // Create a mock file
    const file = new File(['invalid'], 'test.csv', { type: 'text/csv' })
    
    // Mock FileReader with error
    const mockFileReader = {
      readAsText: vi.fn(function() {
        this.onerror()
      }),
      readAsArrayBuffer: vi.fn(),
      onerror: null,
      onload: null,
      error: new Error('Failed to read file')
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    // Upload the file
    await userEvent.upload(fileInput, file)
    
    // Wait for error handling
    await waitFor(() => {
      expect(mockFileReader.onerror).toBeTruthy()
    })
  })

  it('should reset file input value after upload', async () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    // Create a mock CSV file
    const csvContent = 'Name,Age\nJohn,30'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(function() {
        this.onload({ target: { result: csvContent } })
      }),
      readAsArrayBuffer: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    // Upload the file
    await userEvent.upload(fileInput, file)
    
    // The input value should be empty after upload to allow re-selection
    await waitFor(() => {
      expect(fileInput.value).toBe('')
    })
  })

  it('should accept Excel files (.xlsx)', async () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    // Create a mock Excel file
    const file = new File(['mock excel data'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      readAsArrayBuffer: vi.fn(function() {
        // Simulate successful read
        this.onload({ target: { result: new ArrayBuffer(8) } })
      }),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    // Upload the file
    await userEvent.upload(fileInput, file)
    
    // Wait for the file to be processed
    await waitFor(() => {
      expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalled()
    })
  })

  it('should handle multiple file selection attempts', async () => {
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    const csvContent = 'Name\nJohn'
    const file1 = new File([csvContent], 'test1.csv', { type: 'text/csv' })
    const file2 = new File([csvContent], 'test2.csv', { type: 'text/csv' })
    
    // Mock FileReader
    let callCount = 0
    const mockFileReader = {
      readAsText: vi.fn(function() {
        callCount++
        this.onload({ target: { result: csvContent } })
      }),
      readAsArrayBuffer: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    // Upload first file
    await userEvent.upload(fileInput, file1)
    await waitFor(() => expect(callCount).toBe(1))
    
    // Upload second file - should work because value is reset
    await userEvent.upload(fileInput, file2)
    await waitFor(() => expect(callCount).toBe(2))
  })
})
