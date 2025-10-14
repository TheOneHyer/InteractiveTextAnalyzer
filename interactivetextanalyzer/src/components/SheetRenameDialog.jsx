import { useState, useEffect, useRef } from 'react'

/**
 * SheetRenameDialog - Modal dialog for handling duplicate sheet names
 * 
 * Displays when importing a file with duplicate sheet names and requires
 * the user to rename one of the conflicting sheets before proceeding.
 * 
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {function} onClose - Callback to close the dialog without action
 * @param {function} onRename - Callback when user confirms the new name
 * @param {string} conflictingName - The original conflicting sheet name
 * @param {string} suggestedName - The suggested new name (with suffix)
 */
export default function SheetRenameDialog({ 
  isOpen, 
  onClose, 
  onRename, 
  conflictingName, 
  suggestedName 
}) {
  const [newName, setNewName] = useState(suggestedName)
  const inputRef = useRef(null)

  // Update newName when suggestedName changes
  useEffect(() => {
    setNewName(suggestedName)
  }, [suggestedName])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

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

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = newName.trim()
    if (trimmedName && trimmedName !== conflictingName) {
      onRename(trimmedName)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div 
        className='modal-content' 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        <div className='modal-header'>
          <h2>Duplicate Sheet Name</h2>
          <button className='modal-close' onClick={onClose}>×</button>
        </div>
        <div className='modal-body'>
          <p style={{ fontSize: 14, color: 'var(--c-text)', marginBottom: 16 }}>
            A sheet named <strong>"{conflictingName}"</strong> already exists in this file.
            Please rename one of the sheets to continue importing.
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label 
                htmlFor='sheet-rename-input' 
                style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 13, 
                  fontWeight: 500,
                  color: 'var(--c-text)'
                }}
              >
                New Sheet Name:
              </label>
              <input
                ref={inputRef}
                id='sheet-rename-input'
                type='text'
                className='column-mgmt-input'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 14,
                  border: '1px solid var(--c-border)',
                  borderRadius: '4px',
                  background: 'var(--c-surface)',
                  color: 'var(--c-text)'
                }}
                placeholder='Enter new sheet name...'
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button 
                type='button'
                className='btn secondary' 
                onClick={onClose}
                style={{ padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button 
                type='submit'
                className='btn accent' 
                disabled={!newName.trim() || newName.trim() === conflictingName}
                style={{ padding: '8px 16px' }}
              >
                Rename and Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
