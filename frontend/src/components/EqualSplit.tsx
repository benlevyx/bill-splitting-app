import { useState } from 'react'
import type { BillItem, SplitResult } from '../types'

interface EqualSplitProps {
  items: BillItem[]
  tax: number
  peopleCount: number
  setPeopleCount: (count: number) => void
  onComplete: (result: SplitResult) => void
  onBack: () => void
}

const EqualSplit = ({ 
  items, 
  tax, 
  peopleCount, 
  setPeopleCount, 
  onComplete,
  onBack 
}: EqualSplitProps) => {
  const [isCalculating, setIsCalculating] = useState(false)
  const [tipPercentage, setTipPercentage] = useState(18)

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tipAmount = (subtotal + tax) * (tipPercentage / 100)
  const total = subtotal + tax + tipAmount

  const handleCalculate = async () => {
    setIsCalculating(true)
    
    try {
      const response = await fetch('http://localhost:8000/split-equal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          tax,
          tip: tipAmount,
          people_count: peopleCount,
          split_type: 'equal'
        })
      })
      
      if (!response.ok) throw new Error('Failed to calculate split')
      
      const result = await response.json()
      onComplete(result)
    } catch (error) {
      console.error('Error calculating split:', error)
      alert('Error calculating split. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="equal-split">
      <div className="split-header">
        <button onClick={onBack} className="back-btn">
          ←
        </button>
        <h2>Equal Split</h2>
      </div>
      
      <div className="split-form">
        <div className="form-group">
          <label>Number of People:</label>
          <input
            type="number"
            value={peopleCount}
            onChange={(e) => setPeopleCount(parseInt(e.target.value) || 2)}
          />
        </div>
        
        <div className="form-group">
          <label>Tip Percentage:</label>
          <div className="tip-input-group">
            <input
              type="number"
              value={tipPercentage}
              onChange={(e) => setTipPercentage(parseFloat(e.target.value) || 0)}
              step="0.1"
            />
            <span className="percentage-symbol">%</span>
          </div>
        </div>

        <div className="preview">
          <div className="preview-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="preview-row">
            <span>Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="preview-row">
            <span>Tip ({tipPercentage}%):</span>
            <span>${tipAmount.toFixed(2)}</span>
          </div>
          <div className="preview-row total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="preview-row per-person">
            <span>Per Person:</span>
            <span>${(total / peopleCount).toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={handleCalculate}
          disabled={isCalculating || peopleCount < 2}
          className="calculate-btn"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Split'}
        </button>
      </div>
    </div>
  )
}

export default EqualSplit