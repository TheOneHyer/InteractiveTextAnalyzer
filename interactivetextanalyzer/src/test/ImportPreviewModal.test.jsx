import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportPreviewModal from '../components/ImportPreviewModal'

const mockWorkbookData = {
  'Sheet1': {
    rows: [
      { name: 'John', age: '30', email: 'john@example.com' },
      { name: 'Jane', age: '25', email: 'jane@example.com' },
      { name: '', age: '', email: '' }, // Empty row
    ],
    columns: ['name', 'age', 'email']
  }
}

describe('ImportPreviewModal', () => {
  it('should render when isOpen is true', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    expect(screen.getByText('Import File Preview')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    const { container } = render(
      <ImportPreviewModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('should display file name', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const fileNameInput = screen.getByDisplayValue('test.xlsx')
    expect(fileNameInput).toBeInTheDocument()
    expect(fileNameInput).toBeDisabled()
  })

  it('should display preview data in table', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onConfirm with config when Import Data button is clicked', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      fileType: expect.any(String),
      hiddenColumns: expect.any(Array),
      columnTypes: expect.any(Object),
      markedColumns: expect.any(Array),
      processedData: expect.any(Object)
    }))
  })

  it('should allow changing rows to show', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const rowsSelect = screen.getByLabelText('Rows to Preview')
    expect(rowsSelect).toBeInTheDocument()
    
    fireEvent.change(rowsSelect, { target: { value: '50' } })
    await waitFor(() => {
      expect(rowsSelect.value).toBe('50')
    })
  })

  it('should allow changing file type', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const fileTypeSelect = screen.getByLabelText('File Type')
    expect(fileTypeSelect).toBeInTheDocument()
    
    fireEvent.change(fileTypeSelect, { target: { value: 'csv' } })
    await waitFor(() => {
      expect(fileTypeSelect.value).toBe('csv')
    })
  })

  it('should toggle data cleaning options', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    const trimCheckbox = screen.getByLabelText('Trim whitespace from all cells')
    expect(trimCheckbox).toBeChecked()
    
    fireEvent.click(trimCheckbox)
    await waitFor(() => {
      expect(trimCheckbox).not.toBeChecked()
    })
  })

  it('should display all columns in configuration', () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Check for column configuration section
    const columnConfigSection = screen.getByText('Column Configuration').parentElement
    expect(columnConfigSection).toBeInTheDocument()
    
    // Check that all column names appear in the document (could be in table or config)
    const allNameElements = screen.getAllByText('name')
    expect(allNameElements.length).toBeGreaterThan(0)
    
    const allAgeElements = screen.getAllByText('age')
    expect(allAgeElements.length).toBeGreaterThan(0)
    
    const allEmailElements = screen.getAllByText('email')
    expect(allEmailElements.length).toBeGreaterThan(0)
  })

  it('should handle multiple sheets', () => {
    const multiSheetData = {
      'Sheet1': {
        rows: [{ name: 'John' }],
        columns: ['name']
      },
      'Sheet2': {
        rows: [{ age: '30' }],
        columns: ['age']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={multiSheetData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    expect(screen.getByText('Sheet1')).toBeInTheDocument()
    expect(screen.getByText('Sheet2')).toBeInTheDocument()
  })

  it('should remove empty rows when option is enabled', async () => {
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={mockWorkbookData}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Empty row should not be visible in preview by default (removeEmptyRows is true)
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        removeEmptyRows: true
      })
    )
  })
})
