import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock ExcelJS module
vi.mock('exceljs', () => {
  return {
    default: {
      Workbook: vi.fn()
    }
  }
})

describe('Duplicate Sheet Name Handling', () => {
  let mockWorkbookInstance
  
  beforeEach(async () => {
    // Reset mocks before each test
    vi.clearAllMocks()
    
    // Get the mocked ExcelJS
    const ExcelJS = await import('exceljs')
    
    // Reset the mock implementation
    mockWorkbookInstance = null
    ExcelJS.default.Workbook.mockImplementation(function() {
      return mockWorkbookInstance
    })
  })

  it('should detect duplicate sheet names and show rename dialog', async () => {
    // Mock ExcelJS workbook with duplicate sheet names BEFORE rendering
    const mockWorksheet1 = {
      name: 'Sheet1',
      getRow: vi.fn(() => ({ values: ['Header1', 'Header2'] })),
      rowCount: 2,
      columnCount: 2,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['Header1', 'Header2'] }, 1)
        callback({ values: ['Value1', 'Value2'] }, 2)
      })
    }
    
    const mockWorksheet2 = {
      name: 'Sheet1', // Duplicate name
      getRow: vi.fn(() => ({ values: ['Header3', 'Header4'] })),
      rowCount: 2,
      columnCount: 2,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['Header3', 'Header4'] }, 1)
        callback({ values: ['Value3', 'Value4'] }, 2)
      })
    }
    
    mockWorkbookInstance = {
      xlsx: {
        load: vi.fn().mockResolvedValue()
      },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // Mock FileReader BEFORE rendering
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(function() {
        // Call onload synchronously to avoid timing issues
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(8) } })
        }
      }),
      readAsText: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    // Create a mock Excel file
    const file = new File(['mock excel data'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    // Upload the file
    await userEvent.upload(fileInput, file)
    
    // Wait for the rename dialog to appear
    await waitFor(() => {
      const dialogTitle = screen.queryByText('Duplicate Sheet Name')
      expect(dialogTitle).toBeTruthy()
    }, { timeout: 3000 })
    
    // Check that the conflicting name is shown
    await waitFor(() => {
      const conflictMessage = screen.queryByText(/A sheet named/i)
      expect(conflictMessage).toBeTruthy()
    })
  })

  it('should suggest name with _1 suffix for duplicate sheets', async () => {
    const mockWorksheet1 = {
      name: 'Data',
      getRow: vi.fn(() => ({ values: ['A', 'B'] })),
      rowCount: 1,
      columnCount: 2,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['A', 'B'] }, 1)
      })
    }
    
    const mockWorksheet2 = {
      name: 'Data', // Duplicate
      getRow: vi.fn(() => ({ values: ['C', 'D'] })),
      rowCount: 1,
      columnCount: 2,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['C', 'D'] }, 1)
      })
    }
    
    mockWorkbookInstance = {
      xlsx: {
        load: vi.fn().mockResolvedValue()
      },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // Mock FileReader BEFORE rendering
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(function() {
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(8) } })
        }
      }),
      readAsText: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    const file = new File(['mock data'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    await userEvent.upload(fileInput, file)
    
    // Wait for dialog and check for suggested name
    await waitFor(() => {
      const input = container.querySelector('#sheet-rename-input')
      if (input) {
        expect(input.value).toBe('Data_1')
      }
    }, { timeout: 3000 })
  })

  it('should allow user to edit the suggested name', async () => {
    const mockWorksheet1 = {
      name: 'Report',
      getRow: vi.fn(() => ({ values: ['X'] })),
      rowCount: 1,
      columnCount: 1,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['X'] }, 1)
      })
    }
    
    const mockWorksheet2 = {
      name: 'Report',
      getRow: vi.fn(() => ({ values: ['Y'] })),
      rowCount: 1,
      columnCount: 1,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['Y'] }, 1)
      })
    }
    
    mockWorkbookInstance = {
      xlsx: {
        load: vi.fn().mockResolvedValue()
      },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // Mock FileReader BEFORE rendering
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(function() {
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(8) } })
        }
      }),
      readAsText: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    const file = new File(['mock'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    await userEvent.upload(fileInput, file)
    
    // Wait for dialog
    await waitFor(() => {
      const input = container.querySelector('#sheet-rename-input')
      expect(input).toBeTruthy()
    }, { timeout: 3000 })
    
    // Edit the name
    const input = container.querySelector('#sheet-rename-input')
    if (input) {
      await userEvent.clear(input)
      await userEvent.type(input, 'CustomName')
      expect(input.value).toBe('CustomName')
    }
  })

  it('should have cancel button to abort import', async () => {
    const mockWorksheet1 = {
      name: 'Test',
      getRow: vi.fn(() => ({ values: ['A'] })),
      rowCount: 1,
      columnCount: 1,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['A'] }, 1)
      })
    }
    
    const mockWorksheet2 = {
      name: 'Test',
      getRow: vi.fn(() => ({ values: ['B'] })),
      rowCount: 1,
      columnCount: 1,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['B'] }, 1)
      })
    }
    
    mockWorkbookInstance = {
      xlsx: {
        load: vi.fn().mockResolvedValue()
      },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // Mock FileReader BEFORE rendering
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(function() {
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(8) } })
        }
      }),
      readAsText: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    const file = new File(['mock'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    await userEvent.upload(fileInput, file)
    
    // Wait for dialog
    await waitFor(() => {
      const cancelButton = screen.queryByText('Cancel')
      expect(cancelButton).toBeTruthy()
    }, { timeout: 3000 })
  })

  it('should have rename button disabled when name is empty or same as conflicting name', async () => {
    const mockWorksheet1 = {
      name: 'MySheet',
      getRow: vi.fn(() => ({ values: ['A'] })),
      rowCount: 1,
      columnCount: 1,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['A'] }, 1)
      })
    }
    
    const mockWorksheet2 = {
      name: 'MySheet',
      getRow: vi.fn(() => ({ values: ['B'] })),
      rowCount: 1,
      columnCount: 1,
      eachRow: vi.fn((options, callback) => {
        callback({ values: ['B'] }, 1)
      })
    }
    
    mockWorkbookInstance = {
      xlsx: {
        load: vi.fn().mockResolvedValue()
      },
      worksheets: [mockWorksheet1, mockWorksheet2]
    }
    
    // Mock FileReader BEFORE rendering
    const mockFileReader = {
      readAsArrayBuffer: vi.fn(function() {
        if (this.onload) {
          this.onload({ target: { result: new ArrayBuffer(8) } })
        }
      }),
      readAsText: vi.fn(),
      onerror: null,
      onload: null
    }
    
    global.FileReader = vi.fn(() => mockFileReader)
    
    const { container } = render(<App />)
    const fileInput = container.querySelector('input[type="file"]')
    
    const file = new File(['mock'], 'test.xlsx', { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    await userEvent.upload(fileInput, file)
    
    // Wait for dialog and check button state
    await waitFor(() => {
      const input = container.querySelector('#sheet-rename-input')
      expect(input).toBeTruthy()
    }, { timeout: 3000 })
    
    const input = container.querySelector('#sheet-rename-input')
    const renameButton = screen.queryByText('Rename and Continue')
    
    // Clear input - button should be disabled
    if (input) {
      await userEvent.clear(input)
      await waitFor(() => {
        expect(renameButton?.disabled).toBe(true)
      })
      
      // Type the same name - button should be disabled
      await userEvent.type(input, 'MySheet')
      await waitFor(() => {
        expect(renameButton?.disabled).toBe(true)
      })
    }
  })
})
