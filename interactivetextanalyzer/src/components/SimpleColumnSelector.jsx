/**
 * SimpleColumnSelector Component
 * 
 * Displays a simpler column selector with just activate/deactivate functionality
 */
export default function SimpleColumnSelector({ columns, selectedColumns, toggleColumn }) {
  return (
    <div className='column-editor'>
      {columns.map(col => {
        const isSelected = selectedColumns.includes(col)
        
        return (
          <div className='column-row' key={col} style={{ padding: '8px 10px' }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{col}</span>
            <button
              className={`tag-btn ${isSelected ? 'active' : ''}`}
              onClick={() => toggleColumn(col)}
            >
              {isSelected ? '✓ Active' : 'Inactive'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
