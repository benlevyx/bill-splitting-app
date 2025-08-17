interface SplitSelectorProps {
  onSplitTypeSelected: (type: 'equal' | 'item') => void
  onBack: () => void
}

const SplitSelector = ({ onSplitTypeSelected, onBack }: SplitSelectorProps) => {
  return (
    <div className="split-selector">
      <div className="split-header">
        <button onClick={onBack} className="back-btn">
          ←
        </button>
        <h2>How would you like to split the bill?</h2>
      </div>
      
      <div className="split-options">
        <button 
          onClick={() => onSplitTypeSelected('equal')}
          className="split-option equal"
        >
          <h3>Split Equally</h3>
          <p>Divide the total bill equally among all people</p>
        </button>
        
        <button 
          onClick={() => onSplitTypeSelected('item')}
          className="split-option item"
        >
          <h3>Split by Item</h3>
          <p>Assign specific items to specific people</p>
        </button>
      </div>
    </div>
  )
}

export default SplitSelector