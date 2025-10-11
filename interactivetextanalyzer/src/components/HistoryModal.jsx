/**
 * HistoryModal Component
 * 
 * Displays a modal showing the version history of data transformations
 * Allows users to jump to any previous version
 */
export default function HistoryModal({ isOpen, onClose, versionManager, onJumpToVersion }) {
  if (!isOpen) {
    return null
  }
  
  const historyItems = versionManager.getHistoryWithSummaries()
  
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Version History</h2>
          <button className='modal-close' onClick={onClose}>×</button>
        </div>
        <div className='modal-body'>
          <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 16 }}>
            Click on any version to jump to that point in history. Current version is highlighted.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historyItems.map((item) => {
              const isCurrentVersion = item.isCurrent
              
              return (
                <button
                  key={item.index}
                  className='btn'
                  onClick={() => onJumpToVersion(item.index)}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: isCurrentVersion ? 'var(--c-accent)' : 'var(--c-surface)',
                    border: isCurrentVersion ? '2px solid var(--c-accent)' : '1px solid var(--c-border)',
                    color: isCurrentVersion ? '#111' : 'var(--c-text)',
                    fontWeight: isCurrentVersion ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      <strong>Version {item.index + 1}</strong>
                      {isCurrentVersion && ' (Current)'}
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      {item.index === 0 ? 'Original' : `${historyItems.length - item.index - 1} steps ago`}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>
                    {item.summary}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
