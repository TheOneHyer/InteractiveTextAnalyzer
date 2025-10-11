/**
 * SheetSelector Component
 * 
 * Displays a list of sheet tabs to switch between sheets
 */
export default function SheetSelector({ sheets, activeSheet, setActiveSheet }) {
  return (
    <div className='flex-row'>
      {sheets.map(sheetName => {
        const isActive = sheetName === activeSheet
        return (
          <button
            key={sheetName}
            className='btn secondary'
            style={{
              background: isActive ? 'var(--c-accent)' : '#e2e8f0',
              color: isActive ? '#111' : '#1e293b'
            }}
            onClick={() => setActiveSheet(sheetName)}
          >
            {sheetName}
          </button>
        )
      })}
      <button
        className='btn secondary'
        style={{
          background: activeSheet === '__ALL__' ? 'var(--c-accent)' : '#e2e8f0',
          color: activeSheet === '__ALL__' ? '#111' : '#1e293b'
        }}
        onClick={() => setActiveSheet('__ALL__')}
      >
        All Sheets
      </button>
    </div>
  )
}
