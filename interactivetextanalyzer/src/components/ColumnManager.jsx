/**
 * ColumnManager Component
 * 
 * Provides UI for managing columns: renaming, hiding, and selecting for text analysis
 */
export default function ColumnManager({
  columns,
  hiddenColumns,
  renames,
  toggleHide,
  setRename,
  selectColumnForText,
  selectedTextColumns
}) {
  return (
    <div className='column-editor'>
      {columns.map(col => {
        const isHidden = hiddenColumns.includes(col)
        const isSelected = selectedTextColumns.includes(col)
        
        return (
          <div className='column-row' key={col}>
            <input
              value={renames[col] || ''}
              placeholder={col}
              onChange={e => setRename(col, e.target.value)}
            />
            <div className='col-buttons'>
              <button
                className={`tag-btn ${isSelected ? 'active' : ''}`}
                onClick={() => selectColumnForText(col)}
              >
                TXT
              </button>
              <button
                className={`hide-btn ${isHidden ? 'hidden' : ''}`}
                onClick={() => toggleHide(col)}
              >
                {isHidden ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
