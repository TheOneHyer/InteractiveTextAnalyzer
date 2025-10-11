/**
 * InfoTooltip Component
 * 
 * Displays an info icon with tooltip on hover and click for navigation
 */
export default function InfoTooltip({ text, onNavigateToWiki }) {
  return (
    <div className='tooltip-wrapper'>
      <span
        className='info-icon'
        onClick={onNavigateToWiki}
        title="Click for more info"
      >
        ?
      </span>
      <div className='tooltip'>{text}</div>
    </div>
  )
}
