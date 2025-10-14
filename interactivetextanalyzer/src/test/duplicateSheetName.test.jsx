import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SheetRenameDialog from '../components/SheetRenameDialog'

describe('SheetRenameDialog Component', () => {
  const mockOnClose = vi.fn()
  const mockOnRename = vi.fn()
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onRename: mockOnRename,
    conflictingName: 'Sheet1',
    suggestedName: 'Sheet1_1'
  }

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnRename.mockClear()
  })

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <SheetRenameDialog {...defaultProps} isOpen={false} />
    )
    
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    expect(screen.getByText('Duplicate Sheet Name')).toBeInTheDocument()
    expect(screen.getByText(/A sheet named/i)).toBeInTheDocument()
  })

  it('should display the conflicting sheet name in the message', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    expect(screen.getByText(/"Sheet1"/)).toBeInTheDocument()
    expect(screen.getByText(/already exists in this file/i)).toBeInTheDocument()
  })

  it('should pre-fill input with suggested name', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    expect(input).toHaveValue('Sheet1_1')
  })

  it('should have a cancel button', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    expect(cancelButton).toBeInTheDocument()
  })

  it('should have a rename button', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    expect(renameButton).toBeInTheDocument()
  })

  it('should call onClose when cancel button is clicked', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when close X button is clicked', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const closeButton = screen.getByText('×')
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(<SheetRenameDialog {...defaultProps} />)
    
    const overlay = container.querySelector('.modal-overlay')
    fireEvent.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when modal content is clicked', () => {
    const { container } = render(<SheetRenameDialog {...defaultProps} />)
    
    const modalContent = container.querySelector('.modal-content')
    fireEvent.click(modalContent)
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should call onRename with the new name when form is submitted', async () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    fireEvent.click(renameButton)
    
    expect(mockOnRename).toHaveBeenCalledTimes(1)
    expect(mockOnRename).toHaveBeenCalledWith('Sheet1_1')
  })

  it('should allow user to edit the suggested name', async () => {
    const user = userEvent.setup()
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    
    await user.clear(input)
    await user.type(input, 'CustomName')
    
    expect(input).toHaveValue('CustomName')
  })

  it('should call onRename with edited name when submitted', async () => {
    const user = userEvent.setup()
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    await user.clear(input)
    await user.type(input, 'MyCustomSheet')
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    fireEvent.click(renameButton)
    
    expect(mockOnRename).toHaveBeenCalledWith('MyCustomSheet')
  })

  it('should disable rename button when name is empty', async () => {
    const user = userEvent.setup()
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    await user.clear(input)
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    expect(renameButton).toBeDisabled()
  })

  it('should disable rename button when name is same as conflicting name', async () => {
    const user = userEvent.setup()
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    await user.clear(input)
    await user.type(input, 'Sheet1')
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    expect(renameButton).toBeDisabled()
  })

  it('should enable rename button when name is valid', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    expect(renameButton).not.toBeDisabled()
  })

  it('should call onClose when Escape key is pressed', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when other keys are pressed', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'a' })
    
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should auto-focus the input field when opened', async () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    
    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })

  it('should prevent body scroll when open', async () => {
    const { unmount } = render(<SheetRenameDialog {...defaultProps} />)
    
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })
    
    unmount()
    
    expect(document.body.style.overflow).toBe('')
  })

  it('should update input value when suggestedName prop changes', () => {
    const { rerender } = render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    expect(input).toHaveValue('Sheet1_1')
    
    rerender(<SheetRenameDialog {...defaultProps} suggestedName="Sheet1_2" />)
    
    expect(input).toHaveValue('Sheet1_2')
  })

  it('should handle form submission with Enter key', () => {
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    fireEvent.submit(input.closest('form'))
    
    expect(mockOnRename).toHaveBeenCalledWith('Sheet1_1')
  })

  it('should trim whitespace from input value', async () => {
    const user = userEvent.setup()
    render(<SheetRenameDialog {...defaultProps} />)
    
    const input = screen.getByLabelText(/New Sheet Name/i)
    await user.clear(input)
    await user.type(input, '  SpacedName  ')
    
    const renameButton = screen.getByRole('button', { name: /Rename and Continue/i })
    fireEvent.click(renameButton)
    
    expect(mockOnRename).toHaveBeenCalledWith('SpacedName')
  })

  it('should have correct structure with modal elements', () => {
    const { container } = render(<SheetRenameDialog {...defaultProps} />)
    
    expect(container.querySelector('.modal-overlay')).toBeInTheDocument()
    expect(container.querySelector('.modal-content')).toBeInTheDocument()
    expect(container.querySelector('.modal-header')).toBeInTheDocument()
    expect(container.querySelector('.modal-body')).toBeInTheDocument()
  })
})

