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

  it('should display statistics for the current sheet', () => {
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
    
    // Check that statistics are displayed
    expect(screen.getByText(/Rows:/)).toBeInTheDocument()
    expect(screen.getByText(/Cols:/)).toBeInTheDocument()
    expect(screen.getByText(/Chars:/)).toBeInTheDocument()
  })

  it('should allow toggling row ignore status', async () => {
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
    
    // Find all checkboxes in the preview table (row ignore checkboxes)
    const checkboxes = screen.getAllByRole('checkbox')
    const rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
    
    expect(rowCheckboxes.length).toBeGreaterThan(0)
    
    // Toggle first row to ignore
    fireEvent.click(rowCheckboxes[0])
    
    await waitFor(() => {
      expect(rowCheckboxes[0]).toBeChecked()
    })
  })

  it('should protect header row from skip first rows option', async () => {
    const dataWithHeader = {
      'Sheet1': {
        rows: [
          { name: 'Name', age: 'Age', email: 'Email' }, // Header row
          { name: 'John', age: '30', email: 'john@example.com' },
          { name: 'Jane', age: '25', email: 'jane@example.com' },
        ],
        columns: ['name', 'age', 'email']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithHeader}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Set skip first rows to 1
    const skipInput = screen.getByDisplayValue('0')
    fireEvent.change(skipInput, { target: { value: '1' } })
    
    await waitFor(() => {
      expect(skipInput.value).toBe('1')
    })
    
    // Header row should still be present (Name/Age/Email)
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('should have entire visibility button clickable', () => {
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
    
    // Find visibility buttons (they should be actual button elements)
    const visibilityButtons = document.querySelectorAll('.visibility-btn')
    expect(visibilityButtons.length).toBeGreaterThan(0)
    
    // Check that they are buttons (clickable)
    visibilityButtons.forEach(btn => {
      expect(btn.tagName).toBe('BUTTON')
    })
  })

  it('should toggle removeAfterIncomplete option', async () => {
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
    
    const incompleteCheckbox = screen.getByLabelText('Remove rows after first incomplete row')
    expect(incompleteCheckbox).not.toBeChecked()
    
    fireEvent.click(incompleteCheckbox)
    await waitFor(() => {
      expect(incompleteCheckbox).toBeChecked()
    })
  })

  it('should remove rows after first incomplete row when option is enabled', async () => {
    const dataWithIncomplete = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30', email: 'john@example.com' },
          { name: 'Jane', age: '25', email: 'jane@example.com' },
          { name: 'Bob', age: '', email: 'bob@example.com' }, // Incomplete
          { name: 'Alice', age: '28', email: 'alice@example.com' }, // Should be removed
        ],
        columns: ['name', 'age', 'email']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithIncomplete}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Enable removeAfterIncomplete
    const incompleteCheckbox = screen.getByLabelText('Remove rows after first incomplete row')
    fireEvent.click(incompleteCheckbox)
    
    await waitFor(() => {
      expect(incompleteCheckbox).toBeChecked()
    })
    
    // Alice should not be in the preview
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('should pass ignoredRows and removeAfterIncomplete to onConfirm', async () => {
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
    
    // Enable removeAfterIncomplete
    const incompleteCheckbox = screen.getByLabelText('Remove rows after first incomplete row')
    fireEvent.click(incompleteCheckbox)
    
    await waitFor(() => {
      expect(incompleteCheckbox).toBeChecked()
    })
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        ignoredRows: expect.any(Array),
        removeAfterIncomplete: true
      })
    )
  })
  
  it('should fix row selection to work individually', async () => {
    const dataWithMultipleRows = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30' },
          { name: 'Jane', age: '25' },
          { name: 'Bob', age: '35' },
          { name: 'Alice', age: '28' },
        ],
        columns: ['name', 'age']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithMultipleRows}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Wait for initial render
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      const rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
      expect(rowCheckboxes.length).toBe(4)
    })
    
    // Get initial state - all should be unchecked
    let checkboxes = screen.getAllByRole('checkbox')
    let rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
    expect(rowCheckboxes[0]).not.toBeChecked()
    expect(rowCheckboxes[1]).not.toBeChecked()
    expect(rowCheckboxes[2]).not.toBeChecked()
    expect(rowCheckboxes[3]).not.toBeChecked()
    
    // Select first row only
    fireEvent.click(rowCheckboxes[0])
    
    // Wait for state to update
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      const rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
      expect(rowCheckboxes[0]).toBeChecked()
    })
    
    // Verify only first row is checked
    checkboxes = screen.getAllByRole('checkbox')
    rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
    expect(rowCheckboxes[0]).toBeChecked()
    expect(rowCheckboxes[1]).not.toBeChecked()
    expect(rowCheckboxes[2]).not.toBeChecked()
    expect(rowCheckboxes[3]).not.toBeChecked()
  })
  
  it('should remove blank columns when option is enabled', async () => {
    const dataWithBlankColumn = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30', empty: '', email: 'john@example.com' },
          { name: 'Jane', age: '25', empty: '', email: 'jane@example.com' },
          { name: 'Bob', age: '35', empty: '', email: 'bob@example.com' },
        ],
        columns: ['name', 'age', 'empty', 'email']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithBlankColumn}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Initially, all 4 columns should be visible
    let previewText = screen.getByText(/showing .* columns/)
    expect(previewText.textContent).toMatch(/4 of 4 columns/)
    
    // Enable removeBlankColumns
    const blankColumnsCheckbox = screen.getByLabelText('Remove blank columns (all rows empty)')
    fireEvent.click(blankColumnsCheckbox)
    
    await waitFor(() => {
      expect(blankColumnsCheckbox).toBeChecked()
    })
    
    // Now should show 3 of 4 columns (empty column removed)
    previewText = screen.getByText(/showing .* columns/)
    expect(previewText.textContent).toMatch(/3 of 4 columns/)
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        removeBlankColumns: true
      })
    )
  })
  
  it('should keep columns with at least one non-blank value', async () => {
    const dataWithSparseColumn = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30', notes: '' },
          { name: 'Jane', age: '25', notes: 'Has comment' },
          { name: 'Bob', age: '35', notes: '' },
        ],
        columns: ['name', 'age', 'notes']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithSparseColumn}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Enable removeBlankColumns
    const blankColumnsCheckbox = screen.getByLabelText('Remove blank columns (all rows empty)')
    fireEvent.click(blankColumnsCheckbox)
    
    await waitFor(() => {
      expect(blankColumnsCheckbox).toBeChecked()
    })
    
    // All 3 columns should still be visible (notes has one non-blank value)
    const previewText = screen.getByText(/showing .* columns/)
    expect(previewText.textContent).toMatch(/3 of 3 columns/)
  })
  
  it('should auto-detect numeric column types', async () => {
    const dataWithNumbers = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30', score: '95.5' },
          { name: 'Jane', age: '25', score: '87.3' },
          { name: 'Bob', age: '35', score: '92.1' },
        ],
        columns: ['name', 'age', 'score']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithNumbers}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Wait for auto-detection to complete
    await waitFor(() => {
      const typeSelects = screen.getAllByRole('combobox')
      const columnTypeSelects = typeSelects.filter(select => 
        select.className.includes('column-type-select')
      )
      // age and score columns should be detected as numbers
      expect(columnTypeSelects.length).toBeGreaterThan(0)
    })
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        columnTypes: expect.objectContaining({
          age: 'number',
          score: 'number'
        })
      })
    )
  })
  
  it('should auto-detect boolean column types', async () => {
    const dataWithBooleans = {
      'Sheet1': {
        rows: [
          { name: 'John', active: 'true', verified: 'yes' },
          { name: 'Jane', active: 'false', verified: 'no' },
          { name: 'Bob', active: 'true', verified: 'yes' },
        ],
        columns: ['name', 'active', 'verified']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithBooleans}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Wait for auto-detection
    await waitFor(() => {
      const typeSelects = screen.getAllByRole('combobox')
      expect(typeSelects.length).toBeGreaterThan(0)
    })
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        columnTypes: expect.objectContaining({
          active: 'boolean',
          verified: 'boolean'
        })
      })
    )
  })
  
  it('should auto-detect date column types', async () => {
    const dataWithDates = {
      'Sheet1': {
        rows: [
          { name: 'John', birthdate: '2000-01-15', registered: '01/15/2020' },
          { name: 'Jane', birthdate: '1995-05-20', registered: '05/20/2019' },
          { name: 'Bob', birthdate: '1988-12-10', registered: '12/10/2018' },
        ],
        columns: ['name', 'birthdate', 'registered']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithDates}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Wait for auto-detection
    await waitFor(() => {
      const typeSelects = screen.getAllByRole('combobox')
      expect(typeSelects.length).toBeGreaterThan(0)
    })
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        columnTypes: expect.objectContaining({
          birthdate: 'date',
          registered: 'date'
        })
      })
    )
  })
  
  it('should default to text type for mixed content', async () => {
    const dataWithMixed = {
      'Sheet1': {
        rows: [
          { name: 'John', value: '123' },
          { name: 'Jane', value: 'abc' },
          { name: 'Bob', value: '456' },
        ],
        columns: ['name', 'value']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithMixed}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Wait for auto-detection
    await waitFor(() => {
      const typeSelects = screen.getAllByRole('combobox')
      expect(typeSelects.length).toBeGreaterThan(0)
    })
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        columnTypes: expect.objectContaining({
          value: 'text'
        })
      })
    )
  })
  
  it('should allow manual override of auto-detected column types', async () => {
    const dataWithNumbers = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30' },
          { name: 'Jane', age: '25' },
        ],
        columns: ['name', 'age']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithNumbers}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Wait for auto-detection
    await waitFor(() => {
      const typeSelects = screen.getAllByRole('combobox')
      expect(typeSelects.length).toBeGreaterThan(0)
    })
    
    // Find the age column type select and change it to text
    const typeSelects = screen.getAllByRole('combobox')
    const columnTypeSelects = typeSelects.filter(select => 
      select.className.includes('column-type-select')
    )
    
    // Change the second column (age) from number to text
    fireEvent.change(columnTypeSelects[1], { target: { value: 'text' } })
    
    await waitFor(() => {
      expect(columnTypeSelects[1].value).toBe('text')
    })
    
    const importButton = screen.getByText('Import Data')
    fireEvent.click(importButton)
    
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        columnTypes: expect.objectContaining({
          age: 'text'
        })
      })
    )
  })
  
  it('should handle row selection after empty row removal', async () => {
    const dataWithEmpty = {
      'Sheet1': {
        rows: [
          { name: 'John', age: '30' },
          { name: '', age: '' }, // Empty row
          { name: 'Jane', age: '25' },
        ],
        columns: ['name', 'age']
      }
    }
    
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    
    render(
      <ImportPreviewModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        workbookData={dataWithEmpty}
        fileName="test.xlsx"
        detectedFileType="xlsx"
      />
    )
    
    // Empty row is removed by default, so we should only see John and Jane
    let checkboxes = screen.getAllByRole('checkbox')
    let rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
    
    // We should have 2 row checkboxes (empty row removed)
    expect(rowCheckboxes.length).toBe(2)
    
    // Select Jane's row (second visible row)
    fireEvent.click(rowCheckboxes[1])
    
    await waitFor(() => {
      checkboxes = screen.getAllByRole('checkbox')
      rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
      expect(rowCheckboxes[1]).toBeChecked()
    })
    
    // Get fresh checkboxes and verify John's row is not checked
    checkboxes = screen.getAllByRole('checkbox')
    rowCheckboxes = checkboxes.filter(cb => cb.getAttribute('title') === 'Ignore this row')
    expect(rowCheckboxes[0]).not.toBeChecked()
  })
})
